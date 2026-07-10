import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const bancardUrl = process.env.APP_BASE_URL || "https://wit-bancard.dev-wit.com";
  try {
    const body = await request.json();
    const { amount, client_ruc, client_name, client_email, total_items } = body;

    // Detectar el host dinámico para las URLs de retorno
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const appBaseUrl = `${protocol}://${host}`;

    const payload = {
      action: "single-buy",
      servicio: "boletos",
      canal: "web",
      id: `BOLETOS-FRONT-${Date.now()}`,
      amount: amount || 0,
      currency: "PYG",
      preauthorization: true,
      description:
        total_items && total_items > 1
          ? "Compra de boletos - Boletos.la"
          : "Compra de boleto - Boletos.la",
      returnUrl: `${appBaseUrl}/booking/confirmation/bancard`,
      cancelUrl: `${appBaseUrl}/booking/confirmation/bancard`,
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
            iva_rate: 10,
            total_items: total_items || 1,
          },
        ],
      },
    };

    const targetUrl = `${bancardUrl}/api/pagosimple`;
    console.log("[Bancard Crear] Calling URL:", targetUrl);
    console.log("[Bancard Crear] Payload:", JSON.stringify(payload, null, 2));

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
    console.log("[Bancard Crear] Response:", JSON.stringify(apiResponse, null, 2));

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

      let shopProcessId =
        apiResponse.shop_process_id || apiResponse.data?.shopProcessId || 0;

      // Consultar el shopProcessId con el endpoint de soporte
      if (!shopProcessId && processId) {
        try {
          const shopUrl = `${bancardUrl}/api/bancard/shop-process-id/${processId}`;
          console.log("[Bancard Crear] Fetching shopProcessId from:", shopUrl);
          const shopRes = await fetch(shopUrl);
          if (shopRes.ok) {
            const shopData = await shopRes.json();
            if (shopData.data?.shopProcessId) {
              shopProcessId = shopData.data.shopProcessId;
            }
          } else {
             console.log("[Bancard Crear] Error en shop-process-id endpoint:", shopRes.status);
          }
        } catch (err) {
          console.error("No se pudo obtener el shopProcessId de soporte:", err);
        }
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
          "La API no devolvió un processId válido para la transacción",
      );
    }
  } catch (error: any) {
    console.error("Error creando transacción:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
