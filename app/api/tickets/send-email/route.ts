import { NextRequest, NextResponse } from "next/server";

// URL del backend externo para enviar emails
const EXTERNAL_EMAIL_API_URL = "https://tu-backend.com/api/email/send";

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos del frontend
    const body = await request.json();

    // 2. Validar campos requeridos
    if (!body.emailDestino || !body.pdfBase64) {
      console.error("Campos requeridos faltantes");
      return NextResponse.json(
        {
          success: false,
          message: "emailDestino y pdfBase64 son requeridos",
        },
        { status: 400 },
      );
    }

    // 3. Preparar payload para el backend externo
    const externalPayload = {
      email: body.emailDestino,
      pdfBase64: body.pdfBase64,
      fileName:
        body.fileName || `boleto-${body.reservaCodigo || Date.now()}.pdf`,
      pasajeroNombre: body.pasajeroNombre,
    };

    console.log("📤 Enviando a backend externo de email:", {
      email: body.emailDestino,
      fileName: externalPayload.fileName,
    });

    // 4. Llamar al backend externo de email
    const response = await fetch(EXTERNAL_EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Agregar headers de autorización si tu backend los requiere
        // "Authorization": `Bearer ${process.env.BACKEND_API_KEY}`,
      },
      body: JSON.stringify(externalPayload),
      signal: AbortSignal.timeout(30000),
    });

    console.log("📥 Respuesta del backend de email:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // 5. Verificar respuesta
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del backend de email:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de email: ${response.statusText}`,
          status: response.status,
        },
        { status: 502 },
      );
    }

    // 6. Obtener respuesta del backend
    const result = await response.json();

    // 7. Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente",
      emailSentTo: body.emailDestino,
      externalResponse: result,
    });
  } catch (error: any) {
    console.error("Error en API interna de email:", error);

    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage =
        "Timeout: El servicio de email tardó demasiado en responder";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      statusCode = 503;
      errorMessage = "Servicio de email no disponible";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message,
      },
      { status: statusCode },
    );
  }
}
