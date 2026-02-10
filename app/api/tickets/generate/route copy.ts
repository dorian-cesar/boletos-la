import { NextRequest, NextResponse } from "next/server";

// URL del backend externo
const EXTERNAL_API_URL = "https://pdf-mail.dev-wit.com/api/tickets/generate";

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos del frontend
    const body = await request.json();
    // console.log("Datos recibidos del frontend:", JSON.stringify(body, null, 2));

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

    // 3. Preparar payload para el backend externo (exactamente como lo esperan)
    const externalPayload = {
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

    // 4. Llamar al backend externo
    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(externalPayload),
      // Timeout de 30 segundos
      signal: AbortSignal.timeout(30000),
    });

    console.log("Respuesta del backend externo:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // 5. Verificar respuesta
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error del backend externo:", errorText);

      return NextResponse.json(
        {
          success: false,
          message: `Error del servicio de PDF: ${response.statusText}`,
          status: response.status,
        },
        { status: 502 }, // Bad Gateway
      );
    }

    // 6. Obtener el PDF
    const pdfBlob = await response.blob();

    // 7. Convertir a base64 para enviar al frontend
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const base64PDF = Buffer.from(arrayBuffer).toString("base64");

    // 8. Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "PDF generado exitosamente",
      pdf: {
        fileName: `boleto-${body.reservaCodigo}.pdf`,
        base64: `data:application/pdf;base64,${base64PDF}`,
        size: pdfBlob.size,
        contentType: pdfBlob.type,
      },
      metadata: {
        reservaCodigo: body.reservaCodigo,
        timestamp: new Date().toISOString(),
        pasajero: body.pasajeroNombre,
      },
    });
  } catch (error: any) {
    console.error("Error en API interna:", error);

    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Timeout: El servicio de PDF tardó demasiado en responder";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      statusCode = 503;
      errorMessage = "Servicio de PDF no disponible";
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
