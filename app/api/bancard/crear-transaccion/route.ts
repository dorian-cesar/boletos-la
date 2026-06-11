import { NextResponse } from "next/server";
import crypto from "crypto";

const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const confirmUrl = `${returnUrl}/booking/confirmation/bancard`;

// Función segura para entornos Serverless de Next.js (Asegura 15 dígitos fijos)
function generarShopProcessIdSeguro(): number {
  const ahora = Date.now(); // 13 dígitos (ej: 1781198500123)

  // Generamos 2 dígitos aleatorios criptográficos (rango 10 a 99) para evitar colisiones
  // si múltiples instancias distribuidas de Next.js atienden en el mismo milisegundo.
  const bytes = crypto.randomBytes(1);
  const sufijoAleatorio = 10 + (bytes[0] % 90);

  // 13 dígitos + 2 dígitos = 15 dígitos exactos (Límite de Bancard)
  return parseInt(`${ahora}${sufijoAleatorio}`);
}

export async function POST(request: Request) {
  try {
    // 1. Generamos el ID único de 15 dígitos bajo estándares seguros
    const shopProcessId = generarShopProcessIdSeguro();

    const body = await request.json();
    const { amount, description, idCompra } = body;

    const payload = {
      shopProcessId: shopProcessId,
      amount: amount || 0,
      currency: "PYG",
      description: description || "Boleto de boleto.la",
      servicio: "boletos",
      canal: "web",
      id: idCompra,
      action: "single-buy",
      // return_url: confirmUrl,
    };

    const baseUrl = process.env.BANCARD_API_URL;
    if (!baseUrl) {
      throw new Error("Falta la variable de entorno BANCARD_API_URL");
    }

    const response = await fetch(`${baseUrl}/api/pagosimple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error de red al crear transacción: ${response.status} - ${errorText}`,
      );
    }

    const apiResponse = await response.json();

    if (
      apiResponse.status === "success" &&
      (apiResponse.data?.iframeUrl || apiResponse.data?.processId)
    ) {
      return NextResponse.json({
        success: true,
        iframeUrl: apiResponse.data.iframeUrl,
        shopProcessId: shopProcessId,
        processId:
          apiResponse.data.processId ||
          apiResponse.data.rawResponse?.process_id,
      });
    } else {
      throw new Error(
        apiResponse.message ||
          "La API no devolvió un processId o URL válida para la transacción",
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
