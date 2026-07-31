import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shopProcessId, processId } = body;

    if (!shopProcessId && !processId) {
      return NextResponse.json(
        { success: false, message: "shopProcessId o processId son requeridos" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.BANCARD_API_URL || "https://wit-bancard.dev-wit.com";
    const targetUrl = `${baseUrl}/api/pagosimple`;
    console.log("[Bancard Rollback API] Calling URL:", targetUrl);

    let finalShopProcessId = Number(shopProcessId || 0);

    // Si el shopProcessId es 0, intentamos recuperarlo desde el Gateway
    if (!finalShopProcessId && processId) {
      try {
        const shopUrl = `${baseUrl}/api/bancard/shop-process-id/${processId}`;
        const shopRes = await fetch(shopUrl);
        if (shopRes.ok) {
          const shopData = await shopRes.json();
          if (shopData.data?.shopProcessId) {
            finalShopProcessId = Number(shopData.data.shopProcessId);
            console.log("[Bancard Rollback API] Recuperado shopProcessId:", finalShopProcessId);
          }
        }
      } catch (err) {
        console.error("[Bancard Rollback API] Error recuperando shopProcessId:", err);
      }
    }

    const payload = {
      action: "rollback",
      shopProcessId: finalShopProcessId,
      processId: processId
    };
    console.log("[Bancard Rollback API] Payload to Gateway:", JSON.stringify(payload));

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error de red al cancelar transacción: ${response.status} - ${errorText}`);
    }

    const apiResponse = await response.json();
    console.log("[Bancard Rollback API] Response:", JSON.stringify(apiResponse, null, 2));
    
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error("Error cancelando (rollback) transacción:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
