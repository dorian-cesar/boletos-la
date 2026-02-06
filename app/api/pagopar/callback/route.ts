// app/api/pagopar/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("=== WEBHOOK PAGOPAR RECIBIDO ===");
    console.log("Body:", JSON.stringify(body, null, 2));

    // Verificar que sea una notificación de Pagopar
    if (!body.resultado || !body.resultado[0]) {
      return NextResponse.json(
        { error: "Formato de notificación inválido" },
        { status: 400 },
      );
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
    } = notification;

    // Obtener clave privada
    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
    if (!privateKey) {
      console.error("ERROR: PAGOPAR_PRIVATE_KEY no configurada");
      return NextResponse.json(
        { error: "Error de configuración" },
        { status: 500 },
      );
    }

    // VALIDAR TOKEN (CRÍTICO para seguridad)
    // Pagopar genera: sha1(private_key + hash_pedido)
    const expectedToken = crypto
      .createHash("sha1")
      .update(privateKey + hash_pedido)
      .digest("hex");

    if (token !== expectedToken) {
      console.error("ERROR: Token no coincide");
      console.error("Token recibido:", token);
      console.error("Token esperado:", expectedToken);
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    console.log("=== NOTIFICACIÓN VÁLIDA ===");
    console.log("Hash pedido:", hash_pedido);
    console.log("Pagado:", pagado);
    console.log("Cancelado:", cancelado);
    console.log("Forma de pago:", forma_pago);
    console.log("Fecha pago:", fecha_pago);
    console.log("Monto:", monto);

    // AQUÍ DEBES ACTUALIZAR TU BASE DE DATOS
    // Ejemplo:
    // - Buscar reserva por hash_pedido
    // - Actualizar estado según pagado/cancelado
    // - Enviar email de confirmación si pagado=true

    // IMPORTANTE: Guardar en tu base de datos
    // await db.booking.update({
    //   where: { pagoparHash: hash_pedido },
    //   data: {
    //     paymentStatus: pagado ? "paid" : cancelado ? "cancelled" : "pending",
    //     paymentMethod: forma_pago,
    //     paymentDate: fecha_pago ? new Date(fecha_pago) : null,
    //     paidAmount: parseFloat(monto),
    //   }
    // });

    // Enviar email de confirmación si está pagado
    if (pagado === true) {
      // await sendConfirmationEmail(hash_pedido);
      console.log("PAGO CONFIRMADO - Enviar email y actualizar DB");
    }

    // Pagopar espera que devolvamos exactamente el mismo array resultado
    return NextResponse.json(body.resultado, { status: 200 });
  } catch (error: any) {
    console.error("=== ERROR WEBHOOK ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      { error: "Error procesando notificación" },
      { status: 500 },
    );
  }
}
