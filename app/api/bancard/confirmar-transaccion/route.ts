import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { processId, amount } = body;

    if (!processId || !amount) {
      return NextResponse.json(
        { success: false, message: "processId y amount son requeridos" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BANCARD_API_URL || "https://wit-bancard.dev-wit.com";
    if (!baseUrl) {
      throw new Error("Falta la variable de entorno BANCARD_API_URL");
    }

    const targetUrl = `${baseUrl}/api/pagosimple`;
    console.log("[Bancard Preauth Confirm API] Calling URL:", targetUrl);

    const payload = {
      action: "preauth-confirm",
      processId: processId,
      amount: Number(amount)
    };

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error de red al confirmar transacción: ${response.status} - ${errorText}`
      );
    }

    const apiResponse = await response.json();
    console.log("[Bancard Confirmation API] Response:", JSON.stringify(apiResponse, null, 2));
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error("Error confirmando transacción:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}