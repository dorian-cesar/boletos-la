import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const bancardUrl = process.env.BANCARD_API_URL || "";
  try {
    const body = await request.json();
    const { amount, client_ruc, client_name, client_email, total_items } = body;

    const payload = {
      action: "single-buy",
      amount: amount || 0,
      currency: "PYG",
      description:
        total_items && total_items > 1
          ? "Compra de boletos - Boletos.la"
          : "Compra de boleto - Boletos.la",
      billing: {
        client_ruc: client_ruc || "123456-1",
        client_name: client_name || "fallback",
        client_email: client_email || "fallback",
        details: [
          {
            description:
              total_items && total_items > 1
                ? "Boletos de bus - Boletos.la"
                : "Boleto de bus - Boletos.la",
            amount: amount || 0,
            iva_rate: 0,
            total_items: total_items || 1,
          },
        ],
      },
      // prod
      return_url:
        "https://boletos-la-dev.netlify.app/booking/confirmation/bancard",
      cancel_url:
        "https://boletos-la-dev.netlify.app/booking/confirmation/bancard",
      // dev:
      // return_url: "http://localhost:3000/booking/confirmation/bancard",
      // cancel_url: "http://localhost:3000/booking/confirmation/bancard",
      servicio: "boletos",
      canal: "web",
      id: client_ruc || "fallback",
    };

    const targetUrl = `${bancardUrl}/api/pagosimple`;

    const response = await fetch(targetUrl, {
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
      apiResponse.status === "success" ||
      apiResponse.process_id ||
      apiResponse.data?.processId
    ) {
      const processId =
        apiResponse.process_id ||
        apiResponse.data?.processId ||
        apiResponse.data?.rawResponse?.process_id;
      const iframeUrl = apiResponse.url || apiResponse.data?.iframeUrl || null;

      const shopProcessId =
        apiResponse.shop_process_id || apiResponse.data?.shopProcessId || null;

      if (!shopProcessId) {
        throw new Error("La API no devolvió un shopProcessId válido.");
      }

      return NextResponse.json({
        success: true,
        iframeUrl: iframeUrl,
        processId: processId,
        shopProcessId: shopProcessId,
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
