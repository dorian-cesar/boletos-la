import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  try {
    // Cargar llave privada del .env y limpiar comillas si existen
    const rawPrivateKey = process.env.BANCARD_PRIVATE_KEY || "";
    const privateKey = rawPrivateKey.replace(/^["']|["']$/g, "");

    const amount = "10330.00";
    const currency = "PYG";

    // 2. Generar shop_process_id de 15 dígitos de forma aleatoria como en el script de Postman
    const shopProcessId = Math.floor(
      100000000000000 + Math.random() * 900000000000000,
    );

    // 3. Generar token MD5 obligatorio
    const stringToHash = `${privateKey}${shopProcessId}${amount}${currency}`;
    const token = crypto.createHash("md5").update(stringToHash).digest("hex");

    // Cargar llave pública del .env y limpiar comillas
    const rawPublicKey = process.env.BANCARD_PUBLIC_KEY || "";
    const publicKey = rawPublicKey.replace(/^["']|["']$/g, "");

    // 4. Armar el payload exacto para Bancard
    const payload = {
      public_key: publicKey,
      operation: {
        token: token,
        shop_process_id: shopProcessId,
        currency: currency,
        amount: amount,
        iva_amount: "0.00",
        description: "Ejemplo de pago",
        return_url: "http://localhost:3000/booking/confirmation/bancard",
        cancel_url: "http://localhost:3000/booking/confirmation/bancard",
        billing: {
          client_ruc: "44444401-7",
          client_name: "JUAN GONZALEZ",
          client_email: "juangonzalez@mail.com.py",
          commerce_stamp: "12559969",
          commerce_expedition_point: "001",
          commerce_establishment: "001",
          details: [
            {
              description: "item 1",
              amount: "10000.00",
              iva_rate: 0,
              total_items: 1,
            },
            {
              description: "item 2",
              amount: "330.00",
              iva_rate: 0,
              total_items: 1,
            },
          ],
        },
      },
    };

    // 5. Petición al endpoint de Staging de Bancard
    const targetUrl =
      "https://vpos.infonet.com.py:8888/vpos/api/0.3/single_buy";

    console.log(
      "[Bancard Staging TEST] Enviando payload:",
      JSON.stringify(payload, null, 2),
    );

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[Bancard Staging TEST] Error de red de Bancard:",
        errorText,
      );
      throw new Error(
        `Error de red en pasarela Bancard: ${response.status} - ${errorText}`,
      );
    }

    const apiResponse = await response.json();
    console.log(
      "[Bancard Staging TEST] Respuesta de Bancard:",
      JSON.stringify(apiResponse, null, 2),
    );

    if (apiResponse.status === "success" || apiResponse.process_id) {
      return NextResponse.json({
        success: true,
        shopProcessId: shopProcessId,
        processId: apiResponse.process_id,
        url: apiResponse.url || null,
      });
    } else {
      const errorMsg =
        apiResponse.messages?.[0]?.description ||
        apiResponse.message ||
        "Error desconocido devuelto por Bancard";
      throw new Error(errorMsg);
    }
  } catch (error: any) {
    console.error("[Bancard Staging TEST Exception]:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Error interno al procesar el pago de prueba.",
      },
      { status: 500 },
    );
  }
}
