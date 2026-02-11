import { NextRequest, NextResponse } from "next/server";

// URL del backend externo para enviar emails
const EXTERNAL_EMAIL_API_URL =
  "https://pdf-mail.dev-wit.com/api/pdf-mail/send-confirmed";

// URL de la API interna de generación de PDF
const TICKET_API_URL = "http://localhost:3000/api/tickets/generate";

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

    // 3. Variables iniciales
    let pdfBase64: string | undefined = body.pdfBase64;
    let fileName: string | undefined = body.fileName;

    // 4. Si NO hay PDF → generarlo
    if (!pdfBase64) {
      // Validar datos mínimos para generar boleto
      if (
        !body.reservaCodigo ||
        !body.pasajeroNombre ||
        !body.origen ||
        !body.destino
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Se requiere reservaCodigo, pasajeroNombre, origen y destino para generar el PDF",
          },
          { status: 400 },
        );
      }

      try {
        const ticketPayload = {
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
          documento: body.documento || "Sin documento",
          telefono: body.telefono || "Sin teléfono",
          subtotal: body.subtotal,
          iva: body.iva,
          cargoServicio: body.cargoServicio,
          total: body.total,
          pagoFecha: body.pagoFecha || new Date().toISOString(),
          metodoPago: body.metodoPago || "Tarjeta de Crédito/Débito",
        };

        const ticketResponse = await fetch(TICKET_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ticketPayload),
          signal: AbortSignal.timeout(30000),
        });

        if (!ticketResponse.ok) {
          throw new Error(`Error generando PDF: ${ticketResponse.statusText}`);
        }

        const ticketResult = await ticketResponse.json();

        if (!ticketResult.success || !ticketResult.pdf?.base64) {
          throw new Error("No se pudo generar el PDF");
        }

        pdfBase64 = ticketResult.pdf.base64;
        fileName = ticketResult.pdf.fileName;
      } catch (ticketError: any) {
        return NextResponse.json(
          {
            success: false,
            message: `Error al generar el boleto: ${ticketError.message}`,
          },
          { status: 502 },
        );
      }
    }

    // 5. Verificar que ahora sí tenemos PDF
    if (!pdfBase64) {
      return NextResponse.json(
        { success: false, message: "No se pudo generar o recibir el PDF" },
        { status: 500 },
      );
    }

    // 6. 🔥 LIMPIEZA CORRECTA DEL BASE64 (SOLO AQUÍ)
    if (pdfBase64.startsWith("data:")) {
      const base64Match = pdfBase64.match(
        /^data:application\/pdf;base64,(.*)$/,
      );

      if (!base64Match?.[1]) {
        return NextResponse.json(
          { success: false, message: "Formato de PDF inválido" },
          { status: 400 },
        );
      }

      pdfBase64 = base64Match[1];
    }

    // 7. Payload para backend externo de email
    const externalPayload = {
      email: body.emailDestino,
      pdfBase64,
      fileName: fileName || `boleto-${body.reservaCodigo || Date.now()}.pdf`,
      pasajeroNombre: body.pasajeroNombre || "Pasajero",
      reservaCodigo: body.reservaCodigo,
    };

    console.log("Enviando email a backend externo:", {
      pdfBase64Preview: pdfBase64.slice(0, 50) + "...",
      pdfSize: pdfBase64.length,
      email: body.emailDestino,
      fileName: externalPayload.fileName,
    });

    // 8. Llamar backend externo
    const emailResponse = await fetch(EXTERNAL_EMAIL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(externalPayload),
      signal: AbortSignal.timeout(30000),
    });

    if (!emailResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de email: ${emailResponse.statusText}`,
          status: emailResponse.status,
        },
        { status: 502 },
      );
    }

    const result = await emailResponse.json();

    // 9. Respuesta final
    return NextResponse.json({
      success: true,
      message: "Email enviado exitosamente",
      emailSentTo: body.emailDestino,
      pdfGenerated: !body.pdfBase64,
      pdfFileName: externalPayload.fileName,
      externalResponse: result,
    });
  } catch (error: any) {
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Timeout: El servicio tardó demasiado en responder";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      statusCode = 503;
      errorMessage = "Servicio no disponible temporalmente";
    }

    return NextResponse.json(
      { success: false, message: errorMessage, error: error.message },
      { status: statusCode },
    );
  }
}
