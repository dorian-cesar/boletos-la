import { NextRequest, NextResponse } from "next/server";

const PDF_BASE_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_PDF_API_URL ||
  "https://new-backend-pdf.dev-wit.com";

const EXTERNAL_EMAIL_API_URL = `${PDF_BASE_URL}/api/mail/send-ticket`;

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener datos del frontend
    const body = await request.json();

    // 2. Validar email requerido
    if (!body.emailDestino) {
      return NextResponse.json(
        { success: false, message: "emailDestino es requerido" },
        { status: 400 },
      );
    }

    // 3. Validar datos mínimos requeridos por el backend externo
    const requiredFields = [
      "reservaCodigo",
      "origen",
      "destino",
      "fechaViaje",
      "horaSalida",
      "horaLlegada",
      "duracion",
      "asiento",
      "servicio",
      "pasajeroNombre",
      "documento",
      "email",
      "fechaNacimiento",
      "total",
      "cdc",
      "qrBase64",
      "numeroFactura",
      "fechaVenta",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.error(
        "Campos requeridos faltantes en send-email:",
        missingFields,
      );
      return NextResponse.json(
        {
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
          missingFields,
        },
        { status: 400 },
      );
    }

    // 4. Preparar payload para el backend externo
    // Limpiar el QR de prefijos si existen
    const cleanQrBase64 = body.qrBase64.replace(
      /^data:image\/[a-z]+;base64,/,
      "",
    );

    const externalPayload = {
      templateName: "ticket-boleto",
      emailDestino: body.emailDestino,
      logo: "logo-santaniana-blanco.png",
      logoBoletos: "logo-boletos.png",
      type: "boletos.la",
      reservaCodigo: body.reservaCodigo,
      numeroFactura: body.numeroFactura,
      timbrado: body.timbrado || "",
      fechaVenta: body.fechaVenta,
      origen: body.origen,
      destino: body.destino,
      fechaViaje: body.fechaViaje,
      horaSalida: body.horaSalida,
      horaLlegada: body.horaLlegada,
      duracion: body.duracion,
      asiento: body.asiento,
      servicio: body.servicio,
      pasajeroNombre: body.pasajeroNombre,
      documento: body.documento,
      email: body.email,
      fechaNacimiento: body.fechaNacimiento,
      total: body.total,
      cdc: body.cdc,
      qrBase64: cleanQrBase64,
    };

    console.log("📧 Enviando email a backend externo:", {
      email: externalPayload.emailDestino,
      reservaCodigo: externalPayload.reservaCodigo,
      pasajero: externalPayload.pasajeroNombre,
      template: externalPayload.templateName,
    });

    // 5. Llamar al backend externo
    const emailResponse = await fetch(EXTERNAL_EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalPayload),
      signal: AbortSignal.timeout(30000), // 30 segundos timeout
    });

    // 6. Obtener respuesta del backend externo
    let responseData;
    try {
      responseData = await emailResponse.json();
    } catch (e) {
      responseData = { message: "No se pudo parsear la respuesta" };
    }

    if (!emailResponse.ok) {
      console.error("Error en backend externo:", {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        data: responseData,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de email: ${emailResponse.statusText}`,
          status: emailResponse.status,
          externalError: responseData,
        },
        { status: 502 }, // Bad Gateway
      );
    }

    // 7. Respuesta exitosa
    console.log("Email enviado exitosamente:", {
      email: externalPayload.emailDestino,
      reservaCodigo: externalPayload.reservaCodigo,
      response: responseData,
    });

    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente",
      emailSentTo: body.emailDestino,
      reservaCodigo: body.reservaCodigo,
      externalResponse: responseData,
    });
  } catch (error: any) {
    // Manejo de errores
    console.error("Error en API send-email:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Timeout: El servicio tardó demasiado en responder";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("Failed to fetch")
      ) {
        statusCode = 503;
        errorMessage = "Servicio de email no disponible temporalmente";
      } else {
        statusCode = 503;
        errorMessage = "Error de conexión con el servicio de email";
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message,
        type: error.name,
      },
      { status: statusCode },
    );
  }
}
