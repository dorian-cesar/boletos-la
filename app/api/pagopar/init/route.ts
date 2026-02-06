// app/api/pagopar/init/route.ts
import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";
import crypto from "crypto";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    // 1. DESENCRIPTAR
    const secret = process.env.NEXT_PUBLIC_SECRET_ENCRYPT_DATA;
    if (!secret)
      throw new Error("NEXT_PUBLIC_SECRET_ENCRYPT_DATA no configurada");

    const decrypted = CryptoJS.AES.decrypt(data, secret);
    const serviceRequest = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));

    // 2. OBTENER CLAVES (tus claves de 32 chars están bien)
    const publicKey = process.env.NEXT_PUBLIC_PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY;

    if (!publicKey)
      throw new Error("NEXT_PUBLIC_PAGOPAR_PUBLIC_KEY no configurada");
    if (!privateKey)
      throw new Error("NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY no configurada");

    // 3. GENERAR ID ÚNICO
    const productId = `TB${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // 4. PREPARAR DATOS DEL COMPRADOR
    const nombreCompleto =
      `${serviceRequest.datosComprador.nombre} ${serviceRequest.datosComprador.apellido}`.trim();

    // Para documento/RUC
    const documento = serviceRequest.datosComprador.rut.replace(/[.-]/g, "");
    const ruc = documento;

    // Para teléfono
    let telefono = serviceRequest.datosComprador.telefono.replace(/\D/g, "");
    if (telefono.startsWith("0")) {
      telefono = "595" + telefono.substring(1);
    }

    // 5. GENERAR TOKEN - IMPORTANTE: SIN .toFixed(2)
    function generarTokenSha1(
      privada: string,
      idPedido: string,
      monto: number,
    ) {
      // PAGOPAR: sha1(privada + idPedido + strval(floatval(monto)))
      // strval(floatval(150000)) = "150000" NO "150000.00"
      const montoStr = String(parseFloat(monto.toString()));
      const texto = privada + idPedido + montoStr;

      console.log("=== GENERANDO TOKEN ===");
      console.log("Privada:", privada);
      console.log("ID:", idPedido);
      console.log("Monto str:", montoStr);
      console.log("Texto completo:", texto);

      const hash = crypto.createHash("sha1").update(texto).digest("hex");
      console.log("Token SHA1:", hash);

      return hash;
    }

    const tokenTransaccion = generarTokenSha1(
      privateKey,
      productId,
      serviceRequest.montoTotal,
    );

    // 6. FECHA MÁXIMA (15 minutos)
    const fechaMax = new Date(Date.now() + 15 * 60 * 1000);
    const fechaMaxPago = fechaMax.toISOString().slice(0, 19).replace("T", " ");

    // 7. CONSTRUIR PAYLOAD PARA PAGOPAR
    const payload = {
      token: tokenTransaccion,
      comprador: {
        ruc: ruc,
        email: serviceRequest.datosComprador.email,
        ciudad: 1,
        nombre: nombreCompleto,
        telefono: telefono ? `+${telefono}` : "",
        direccion: "",
        documento: documento,
        coordenadas: "",
        razon_social: "",
        tipo_documento: "CI",
        direccion_referencia: "",
      },
      public_key: publicKey,
      monto_total: serviceRequest.montoTotal,
      tipo_pedido: "VENTA-COMERCIO",
      compras_items: [
        {
          ciudad: "1",
          nombre: "Pasaje(s) de bus",
          cantidad: 1,
          categoria: "909",
          public_key: publicKey,
          url_imagen: "https://boletos-com.netlify.app/ticket-bus.jpg",
          descripcion: "Compra de pasajes de bus",
          id_producto: 1,
          precio_total: serviceRequest.montoTotal,
          vendedor_telefono: "",
          vendedor_direccion: "",
          vendedor_direccion_referencia: "",
          vendedor_direccion_coordenadas: "",
        },
      ],
      fecha_maxima_pago: fechaMaxPago,
      id_pedido_comercio: productId,
      descripcion_resumen: "Compra de pasajes de bus",
      forma_pago: 9,
    };

    console.log("=== ENVIANDO A PAGOPAR ===");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    // 8. LLAMAR A PAGOPAR
    const response = await axios.post(
      "https://api.pagopar.com/api/comercios/2.0/iniciar-transaccion",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log("=== RESPUESTA PAGOPAR ===");
    console.log("Respuesta:", JSON.stringify(response.data, null, 2));

    // 9. MANEJAR RESPUESTA
    if (
      response.data.respuesta === true &&
      response.data.resultado?.[0]?.data
    ) {
      const hashPedido = response.data.resultado[0].data;

      return NextResponse.json({
        success: true,
        hash: hashPedido,
        pedidoId: response.data.resultado[0].pedido,
        enlace_pago: `https://www.pagopar.com/pagos/${hashPedido}`,
      });
    } else {
      return NextResponse.json(
        {
          error: "Error de Pagopar",
          message: response.data.resultado || "Error desconocido",
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    console.error("=== ERROR ===");

    if (error.response) {
      console.error("Error de Pagopar:", error.response.data);
      console.error("Status:", error.response.status);

      return NextResponse.json(
        {
          error: "Error de Pagopar",
          message: error.response.data?.resultado || error.message,
        },
        { status: error.response.status },
      );
    }

    console.error("Error general:", error.message);

    return NextResponse.json(
      {
        error: "Error interno",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
