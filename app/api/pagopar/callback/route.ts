// app/api/pagopar/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Webhook Pagopar recibido:", JSON.stringify(body, null, 2));

    // Verificar que sea de Pagopar
    if (!body.resultado || !Array.isArray(body.resultado)) {
      console.error("❌ Formato inválido: falta resultado array");
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 });
    }

    const notification = body.resultado[0];
    const {
      hash_pedido,
      token,
      pagado,
      cancelado,
      forma_pago,
      fecha_pago,
      monto,
      numero_pedido,
      numero_comprobante_interno,
      fecha_maxima_pago,
      forma_pago_identificador,
      documento,
      entorno,
    } = notification;

    console.log("📋 Datos recibidos:");
    console.log("- Número de pedido:", numero_pedido);
    console.log("- Hash:", hash_pedido);
    console.log("- Pagado:", pagado);
    console.log("- Monto:", monto);
    console.log("- Forma de pago:", forma_pago);
    console.log("- Comprobante interno:", numero_comprobante_interno);

    // Validar con tu clave privada (IMPORTANTE para seguridad)
    const privateKey = process.env.NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY;
    if (!privateKey) {
      console.error("❌ Clave privada no configurada");
      throw new Error("Clave privada de Pagopar no configurada");
    }

    // Verificar token - esto es crucial para seguridad
    const expectedToken = crypto
      .createHash("sha1")
      .update(privateKey + hash_pedido)
      .digest("hex");

    if (token !== expectedToken) {
      console.error("❌ Token inválido en webhook");
      console.log("Token recibido:", token);
      console.log("Token esperado:", expectedToken);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    console.log("✅ Webhook válido recibido - Token verificado");

    // AQUÍ PROCESAS EL PAGO EN TU SISTEMA
    if (pagado === true) {
      console.log("💰 PAGO CONFIRMADO - Actualizando sistema...");

      // Ejemplo: Actualizar en tu base de datos
      // await db.reservation.update({
      //   where: { pagoparHash: hash_pedido },
      //   data: {
      //     status: "paid",
      //     paymentMethod: forma_pago,
      //     paymentDate: fecha_pago ? new Date(fecha_pago) : new Date(),
      //     paymentConfirmed: true,
      //     internalReceipt: numero_comprobante_interno,
      //     updatedAt: new Date()
      //   }
      // });

      // También puedes enviar email de confirmación, notificaciones, etc.
      // await sendConfirmationEmail(numero_pedido);

      console.log("✅ Sistema actualizado para pedido:", numero_pedido);
    } else if (cancelado === true) {
      console.log("❌ PAGO CANCELADO - Actualizando sistema...");

      // await db.reservation.update({
      //   where: { pagoparHash: hash_pedido },
      //   data: {
      //     status: "cancelled",
      //     paymentConfirmed: false,
      //     updatedAt: new Date()
      //   }
      // });

      console.log("✅ Sistema actualizado (cancelado):", numero_pedido);
    } else {
      console.log("⏳ Pago pendiente o en proceso");
    }

    // PAGOPAR ESPERA ESTA RESPUESTA EXACTA:
    // Solo el array resultado, NO el objeto completo
    const responseData = body.resultado;

    console.log(
      "📤 Enviando respuesta a Pagopar:",
      JSON.stringify(responseData, null, 2),
    );

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("💥 Error en webhook Pagopar:", error);

    // En caso de error, aún así devolver algo que Pagopar pueda entender
    const errorResponse = [
      {
        pagado: false,
        numero_comprobante_interno: "ERROR",
        ultimo_mensaje_error: error.message,
        forma_pago: null,
        fecha_pago: null,
        monto: null,
        fecha_maxima_pago: null,
        hash_pedido: null,
        numero_pedido: null,
        cancelado: false,
        forma_pago_identificador: null,
        token: null,
        documento: null,
        entorno: null,
      },
    ];

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
