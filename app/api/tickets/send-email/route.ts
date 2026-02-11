import { NextRequest, NextResponse } from "next/server";

// URL del backend externo para enviar emails (NUEVO ENDPOINT)
const EXTERNAL_EMAIL_API_URL =
  "https://pdf-mail.dev-wit.com/api/mail/send-ticket";

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
      "horaSalida",
      "origen",
      "horaLlegada",
      "destino",
      "fechaViaje",
      "duracion",
      "empresa",
      "servicioTipo",
      "asientos",
      "terminal",
      "puerta",
      "pasajeroNombre",
      "documento",
      "telefono",
      "subtotal",
      "iva",
      "cargoServicio",
      "total",
      "pagoFecha",
      "metodoPago",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // 4. Preparar payload para el backend externo
    // El backend externo ahora generará el PDF automáticamente
    const externalPayload = {
      templateName: "ticket-boleto", // Template fijo para boletos
      emailDestino: body.emailDestino,
      reservaCodigo: body.reservaCodigo,
      horaSalida: body.horaSalida,
      origen: body.origen,
      horaLlegada: body.horaLlegada,
      destino: body.destino,
      fechaViaje: body.fechaViaje,
      duracion: body.duracion,
      empresa: body.empresa,
      servicioTipo: body.servicioTipo,
      asientos: body.asientos,
      terminal: body.terminal,
      puerta: body.puerta,
      pasajeroNombre: body.pasajeroNombre,
      documento: body.documento,
      telefono: body.telefono,
      subtotal: body.subtotal,
      iva: body.iva,
      cargoServicio: body.cargoServicio,
      total: body.total,
      pagoFecha: body.pagoFecha,
      metodoPago: body.metodoPago,
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
      console.error("❌ Error en backend externo:", {
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
    console.log("✅ Email enviado exitosamente:", {
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
    console.error("❌ Error en API send-email:", {
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
