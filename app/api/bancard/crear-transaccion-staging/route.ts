import { NextResponse } from "next/server";
import crypto from "crypto";

const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const confirmUrl = `${returnUrl}/booking/confirmation/bancard`;
const cancelUrl = `${returnUrl}/booking/canceled`; // URL en caso de cancelación

// Función segura para entornos Serverless de Next.js (Asegura 15 dígitos fijos)
function generarShopProcessIdSeguro(): number {
  const ahora = Date.now(); // 13 dígitos
  const bytes = crypto.randomBytes(1);
  const sufijoAleatorio = 10 + (bytes[0] % 90); // 2 dígitos (10 a 99)
  return parseInt(`${ahora}${sufijoAleatorio}`);
}

// Función para generar el token de validación requerido por Bancard v0.3
function generarTokenBancard(
  shopProcessId: number,
  amount: string,
  currency: string,
): string {
  const privateKey = process.env.BANCARD_PRIVATE_KEY;

  // Fórmula estándar de Bancard para single_buy: MD5(private_key + shop_process_id + amount + currency)
  const cadena = `${privateKey}${shopProcessId}${amount}${currency}`;

  return crypto.createHash("md5").update(cadena).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Extraemos datos del frontend. Si no vienen, se usan valores por defecto o de prueba estructurados para el payload
    const {
      amount = "10330.00",
      iva_amount = "1033.00",
      description = "Pago con Factura Elec",
      billingClient,
    } = body;

    // 1. Generamos el ID único de 15 dígitos bajo estándares seguros
    const shopProcessId = generarShopProcessIdSeguro();

    // 2. Generamos el Token MD5 obligatorio
    const token = generarTokenBancard(shopProcessId, amount, "PYG");

    // 3. Estructuramos el nuevo payload según la especificación de la API v0.3
    const payload = {
      public_key: process.env.BANCARD_PUBLIC_KEY,
      operation: {
        token: token,
        shop_process_id: shopProcessId,
        currency: "PYG",
        amount: amount,
        iva_amount: iva_amount,
        description: description,
        return_url: confirmUrl,
        cancel_url: cancelUrl,
        billing: {
          client_ruc: billingClient?.ruc || "123456-1",
          client_name: billingClient?.name || "JUAN GONZALEZ",
          client_email: billingClient?.email || "juangonzalez@mail.com.py",
          commerce_stamp: "12559969", // Reemplazar por tu identificador real de comercio
          commerce_expedition_point: "001",
          commerce_establishment: "001",
          details: billingClient?.details || [
            {
              description: description || "Articulo de prueba",
              amount: amount,
              iva_rate: 10,
              total_items: 1,
            },
          ],
        },
      },
    };

    // 4. Endpoint directo de producción o staging según tu entorno
    // Endpoint solicitado: https://vpos.infonet.com.py:8888/vpos/api/0.3/single_buy
    const targetUrl =
      "https://vpos.infonet.com.py:8888/vpos/api/0.3/single_buy";

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
        `Error de red al crear transacción Bancard: ${response.status} - ${errorText}`,
      );
    }

    const apiResponse = await response.json();

    // NOTA: Bancard v0.3 suele retornar un objeto con "status": "status_en_proceso" o similar, junto con el "process_id"
    if (
      apiResponse.status === "success" ||
      apiResponse.process_id ||
      apiResponse.status === "status_en_proceso"
    ) {
      return NextResponse.json({
        success: true,
        shopProcessId: shopProcessId,
        // Adaptamos las respuestas comunes de la respuesta nativa de Infonet
        processId: apiResponse.process_id || apiResponse.data?.processId,
        // Si la API devuelve la URL directamente, la mapeamos aquí
        url: apiResponse.url || null,
      });
    } else {
      throw new Error(
        apiResponse.messages?.[0]?.description ||
          apiResponse.message ||
          "La API de Bancard rechazó la solicitud o no devolvió los parámetros esperados.",
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
