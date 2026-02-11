import { NextRequest, NextResponse } from "next/server";

// URL del backend externo para generar PDFs
const EXTERNAL_PDF_API_URL =
  "https://pdf-mail.dev-wit.com/api/tickets/generate";

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos del frontend
    const body = await request.json();

    // 2. Validar campos mínimos requeridos
    if (!body.reservaCodigo || !body.pasajeroNombre) {
      console.error("Campos requeridos faltantes");
      return NextResponse.json(
        {
          success: false,
          message: "reservaCodigo y pasajeroNombre son requeridos",
        },
        { status: 400 },
      );
    }

    // 3. Validar campos adicionales requeridos por el backend externo
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
      console.error("Campos requeridos faltantes:", missingFields);
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
    const externalPayload = {
      templateName: "ticketTemplate",
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

    console.log("Solicitando generación de PDF al backend externo:", {
      reservaCodigo: externalPayload.reservaCodigo,
      pasajero: externalPayload.pasajeroNombre,
      asientos: externalPayload.asientos,
    });

    // 5. Llamar al backend externo
    const pdfResponse = await fetch(EXTERNAL_PDF_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalPayload),
      signal: AbortSignal.timeout(30000), // 30 segundos timeout
    });

    // 6. Verificar si la respuesta es OK
    if (!pdfResponse.ok) {
      let errorData;
      try {
        errorData = await pdfResponse.json();
      } catch (e) {
        errorData = { message: pdfResponse.statusText };
      }

      console.error("Error en backend externo de PDF:", {
        status: pdfResponse.status,
        statusText: pdfResponse.statusText,
        error: errorData,
      });

      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de PDF: ${pdfResponse.statusText}`,
          status: pdfResponse.status,
          externalError: errorData,
        },
        { status: 502 }, // Bad Gateway
      );
    }

    // 7. Obtener el PDF como ArrayBuffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // 8. Convertir a base64 con el prefijo data:application/pdf;base64,
    const base64PDF = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    // 9. Generar nombre de archivo
    const fileName =
      `Boleto_${body.origen}-${body.destino}_${body.reservaCodigo}.pdf`
        .replace(/\s+/g, "_")
        .replace(/[^\w\-_.]/g, "");

    console.log("PDF generado exitosamente por backend externo:", {
      reservaCodigo: body.reservaCodigo,
      fileName,
      size: pdfBuffer.length,
    });

    // 10. Devolver respuesta exitosa con el mismo formato que antes
    return NextResponse.json({
      success: true,
      message: "PDF generado exitosamente",
      pdf: {
        fileName,
        base64: base64PDF,
        size: pdfBuffer.length,
        contentType: "application/pdf",
      },
      metadata: {
        reservaCodigo: body.reservaCodigo,
        timestamp: new Date().toISOString(),
        pasajero: body.pasajeroNombre,
        generatedBy: "external-service",
      },
    });
  } catch (error: any) {
    console.error("Error en API interna de PDF:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Timeout: El servicio de PDF tardó demasiado en responder";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("Failed to fetch")
      ) {
        statusCode = 503;
        errorMessage = "Servicio de PDF no disponible temporalmente";
      } else {
        statusCode = 503;
        errorMessage = "Error de conexión con el servicio de PDF";
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

// Opcional: Endpoint GET para health check
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(EXTERNAL_PDF_API_URL, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });

    return NextResponse.json({
      success: response.ok,
      service: "external-pdf",
      status: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        service: "external-pdf",
        status: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
