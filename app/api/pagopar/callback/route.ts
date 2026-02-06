// app/api/pagopar/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🔄 Webhook Pagopar recibido:", JSON.stringify(body, null, 2));

    // 1. VALIDAR ESTRUCTURA
    if (
      !body.resultado ||
      !Array.isArray(body.resultado) ||
      body.resultado.length === 0
    ) {
      console.error("Estructura inválida");
      return NextResponse.json([{ error: "Estructura inválida" }], {
        status: 400,
      });
    }

    const resultado = body.resultado[0];
    const { hash_pedido, token } = resultado;

    // 2. VALIDAR TOKEN (OBLIGATORIO según documentación)
    const privateKey = process.env.NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY;
    if (!privateKey) {
      console.error("Private key no configurada");
      return NextResponse.json([{ error: "Configuración incompleta" }], {
        status: 500,
      });
    }

    // Generar token esperado: sha1(private_key + hash_pedido)
    const tokenEsperado = crypto
      .createHash("sha1")
      .update(privateKey + hash_pedido)
      .digest("hex");

    console.log("Token recibido:", token);
    console.log("Token esperado:", tokenEsperado);

    if (token !== tokenEsperado) {
      console.error("Token no coincide - Posible ataque");
      return NextResponse.json([{ error: "Token no coincide" }], {
        status: 401,
      });
    }

    // 3. ACTUALIZAR ESTADO EN TU BASE DE DATOS
    console.log("✅ Token válido. Actualizando estado...");

    // Aquí debes buscar en tu BD por hash_pedido y actualizar
    const pedidoPagado = resultado.pagado === true;
    const pedidoCancelado = resultado.cancelado === true;

    if (pedidoPagado) {
      console.log(`✅ Pedido ${hash_pedido} PAGADO`);
      console.log("Forma pago:", resultado.forma_pago);
      console.log("Monto:", resultado.monto);
      console.log("Fecha pago:", resultado.fecha_pago);

      // TODO: Actualizar en tu base de datos
      // - Marcar como pagado
      // - Generar boleto
      // - Enviar email de confirmación
    } else if (pedidoCancelado) {
      console.log(`❌ Pedido ${hash_pedido} CANCELADO`);
      // TODO: Actualizar en tu base de datos
      // - Marcar como cancelado
      // - Liberar asientos
    } else {
      console.log(`⏳ Pedido ${hash_pedido} PENDIENTE`);
    }

    // 4. RESPONDER EXACTAMENTE como Pagopar espera
    // Devolver solo el array 'resultado'
    return NextResponse.json(body.resultado, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("💥 Error en webhook:", error);

    // Enviar error en formato que Pagopar entienda
    const errorResponse = [
      {
        pagado: false,
        ultimo_mensaje_error: error.message || "Error interno",
        // ... otros campos requeridos
      },
    ];

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
