import { NextResponse } from "next/server";

const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const cancelUrl = `${returnUrl}/booking/checkout`;
const confirmUrl = `${returnUrl}/booking/confirmation/bancard`;

export async function POST(request: Request) {
  try {
    const shopProcessId = Math.floor(100000000000000 + Math.random() * 900000000000000);
    const body = await request.json();
    const { amount, description, idCompra } = body;

    const payload = {
      shopProcessId: shopProcessId, // En producción esto debería ser el ID de la reserva
      amount: amount || 0,
      currency: "PYG",
      description: description || "Boleto de boleto.la",
      servicio: "boletos",
      canal: "web",
      id: idCompra,
      action: "single-buy",
      // return_url: confirmUrl,
      // cancel_url: cancelUrl,
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
