import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopProcessId, processId, amount, action } = body;

    if (!processId) {
      return NextResponse.json(
        { success: false, message: "processId es requerido" },
        { status: 400 },
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BANCARD_API_URL ||
      "https://wit-bancard.dev-wit.com";
    if (!baseUrl) {
      throw new Error(
        "Falta la variable de entorno NEXT_PUBLIC_BANCARD_API_URL",
      );
    }

    const targetUrl = `${baseUrl}/api/pagosimple`;
    console.log("[Bancard Confirm API] Calling URL:", targetUrl);

    const payload: Record<string, any> = {
      action: action || "confirmation",
      processId: processId,
    };
    if (shopProcessId) payload.shopProcessId = Number(shopProcessId);
    if (amount) payload.amount = Number(amount);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        const errorText = await response.text();
        return NextResponse.json(
          {
            success: false,
            message: `Error de red: ${response.status} - ${errorText}`,
          },
          { status: response.status },
        );
      }
      console.log(
        `[Bancard Confirmation API] Error Response (${response.status}):`,
        JSON.stringify(errorData, null, 2),
      );
      return NextResponse.json(errorData, { status: response.status });
    }

    const apiResponse = await response.json();
    console.log(
      "[Bancard Confirmation API] Response:",
      JSON.stringify(apiResponse, null, 2),
    );

    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error("Error confirmando transacción:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
