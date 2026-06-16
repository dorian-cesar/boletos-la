import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopProcessId } = body;

    if (!shopProcessId) {
      return NextResponse.json(
        { success: false, message: "shopProcessId es requerido" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BANCARD_API_URL;
    if (!baseUrl) {
      throw new Error("Falta la variable de entorno BANCARD_API_URL");
    }

    const targetUrl = `${baseUrl}/api/bancard/confirmation/${shopProcessId}`;
    console.log("[Bancard Confirmation API] Calling URL:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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