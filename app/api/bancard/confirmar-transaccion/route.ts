import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopProcessId, id } = body;

    if (!shopProcessId || !id) {
      return NextResponse.json(
        { success: false, message: "shopProcessId e id son requeridos" },
        { status: 400 }
      );
    }

    const payload = {
      action: "confirmation",
      shopProcessId: Number(shopProcessId),
      servicio: "boletos",
      canal: "web",
      id: id,
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
        `Error de red al confirmar transacción: ${response.status} - ${errorText}`
      );
    }

    const apiResponse = await response.json();
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error("Error confirmando transacción:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}