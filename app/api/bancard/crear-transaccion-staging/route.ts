import { NextResponse } from "next/server";

export async function POST() {
  const bancardUrl = process.env.APP_BASE_URL || "https://wit-bancard.dev-wit.com";
  try {
    const amount = "10330.00";
    const client_ruc = "44444401-7";
    const client_name = "JUAN GONZALEZ";
    const client_email = "juangonzalez@mail.com.py";
    
    const payload = {
      action: "single-buy",
      servicio: "Tester Panel Staging",
      canal: "web",
      id: `TEST-STAGING-${Date.now()}`,
      amount: Number(amount),
      currency: "PYG",
      preauthorization: true,
      description: "Compra de prueba con Factura Electronica en Staging",
      returnUrl: "https://boletos-la-dev.netlify.app/booking/confirmation/bancard",
      cancelUrl: "https://boletos-la-dev.netlify.app/booking/confirmation/bancard",
      billing: {
        client_ruc: client_ruc,
        client_name: client_name,
        client_email: client_email,
        details: [
          {
            description: "item 1 de staging",
            amount: 10000.00,
            iva_rate: 10,
            total_items: 1,
          },
          {
            description: "item 2 de staging",
            amount: 330.00,
            iva_rate: 10,
            total_items: 1,
          },
        ],
      },
    };

    const targetUrl = `${bancardUrl}/api/pagosimple`;
    console.log("[Bancard Staging TEST] Enviando payload a Gateway:", targetUrl);
    console.log("[Bancard Staging TEST] Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Bancard Staging TEST] Error de red Gateway:", errorText);
      throw new Error(`Error de red en Gateway: ${response.status} - ${errorText}`);
    }

    const apiResponse = await response.json();
    console.log("[Bancard Staging TEST] Respuesta del Gateway:", JSON.stringify(apiResponse, null, 2));

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
      let shopProcessId = apiResponse.shop_process_id || apiResponse.data?.shopProcessId || 0;

      // Consultar el shopProcessId con el endpoint de soporte
      if (!shopProcessId && processId) {
        try {
          const shopUrl = `${bancardUrl}/api/bancard/shop-process-id/${processId}`;
          console.log("[Bancard Staging TEST] Fetching shopProcessId from:", shopUrl);
          const shopRes = await fetch(shopUrl);
          if (shopRes.ok) {
            const shopData = await shopRes.json();
            if (shopData.data?.shopProcessId) {
              shopProcessId = shopData.data.shopProcessId;
            }
          } else {
             console.log("[Bancard Staging TEST] Error en shop-process-id endpoint:", shopRes.status);
          }
        } catch (err) {
          console.error("No se pudo obtener el shopProcessId de soporte:", err);
        }
      }

      return NextResponse.json({
        success: true,
        shopProcessId: shopProcessId,
        processId: processId,
        url: iframeUrl,
      });
    } else {
      const errorMsg =
        apiResponse.messages?.[0]?.description ||
        apiResponse.message ||
        "Error desconocido devuelto por el Gateway";
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error("[Bancard Staging TEST Exception]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error interno al procesar el pago de prueba.",
      },
      { status: 500 }
    );
  }
}
