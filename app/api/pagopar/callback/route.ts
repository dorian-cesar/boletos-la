// app/api/pagopar/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Webhook Pagopar recibido:", body);

    // Verificar que sea de Pagopar
    if (!body.resultado || !Array.isArray(body.resultado)) {
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
    } = notification;

    // Validar con tu clave privada
    const privateKey = process.env.NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Clave privada no configurada");
    }

    // Verificar token (IMPORTANTE para seguridad)
    const expectedToken = crypto
      .createHash("sha1")
      .update(privateKey + hash_pedido)
      .digest("hex");

    if (token !== expectedToken) {
      console.error("❌ Token inválido en webhook");
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    console.log("✅ Webhook válido recibido");
    console.log(`Hash: ${hash_pedido}`);
    console.log(`Pagado: ${pagado}`);
    console.log(`Monto: ${monto}`);
    console.log(`Método: ${forma_pago}`);

    // AQUÍ GUARDAS EN TU BASE DE DATOS
    if (pagado === true) {
      // Buscar o crear la reserva en tu sistema
      // await db.reservation.create({
      //   data: {
      //     pagoparHash: hash_pedido,
      //     pagoparOrderId: numero_pedido,
      //     status: "paid",
      //     paymentMethod: forma_pago,
      //     paymentDate: new Date(fecha_pago),
      //     amount: parseFloat(monto),
      //     // ...otros datos
      //   }
      // });

      console.log("💾 Guardando pago confirmado en BD...");
    }

    // Pagopar espera que devuelvas exactamente lo mismo
    return NextResponse.json(body.resultado, { status: 200 });
  } catch (error: any) {
    console.error("💥 Error en webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
