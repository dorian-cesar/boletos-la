import { NextRequest, NextResponse } from "next/server";

// URL del backend externo para enviar email
const EXTERNAL_MAIL_API_URL =
  "https://pdf-mail.dev-wit.com/api/mail/send-ticket";

export async function POST(request: NextRequest) {
  console.log("API interna: Iniciando envío de email con boleto");

  try {
    // 1. Obtener los datos del frontend
    const body = await request.json();
    console.log(
      "Datos recibidos para envío de email:",
      JSON.stringify(body, null, 2),
    );

    // 2. Validar campos requeridos
    const requiredFields = ["emailDestino", "reservaCodigo", "pasajeroNombre"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            message: `Campo requerido faltante: ${field}`,
          },
          { status: 400 },
        );
      }
    }

    // 3. Preparar payload para el backend externo de email
    const mailPayload = {
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

    console.log("Enviando a API de email externa:", {
      url: EXTERNAL_MAIL_API_URL,
      payload: mailPayload,
    });

    // 4. Llamar al backend externo de email
    const response = await fetch(EXTERNAL_MAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailPayload),
      //   signal: AbortSignal.timeout(30000),
    });

    console.log("Respuesta del servicio de email:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // 5. Verificar respuesta
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del servicio de email:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de email: ${response.statusText}`,
          status: response.status,
        },
        { status: 502 },
      );
    }

    // 6. Procesar respuesta exitosa
    const result = await response.json();
    console.log("Respuesta exitosa del servicio de email:", result);

    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente",
      data: {
        email: body.emailDestino,
        reservaCodigo: body.reservaCodigo,
        timestamp: new Date().toISOString(),
        externalResponse: result,
      },
    });
  } catch (error: any) {
    console.error("Error en API interna de email:", error);

    let statusCode = 500;
    let errorMessage = "Error interno del servidor al enviar email";

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
