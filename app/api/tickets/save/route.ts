import { NextRequest, NextResponse } from "next/server";

// URL base del backend para analíticas desde variables de entorno
const ANALYTICS_API_URL = `${process.env.DB_URL}/api/tickets`;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validación básica
    if (!payload.ticket_number) {
      return NextResponse.json(
        { success: false, message: "ticket_number es requerido" },
        { status: 400 },
      );
    }

    console.log("📊 Guardando ticket en analíticas:", {
      ticket_number: payload.ticket_number,
      passenger: `${payload.first_name} ${payload.last_name}`,
    });

    const response = await fetch(ANALYTICS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000), // 20 segundos timeout
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = { message: "No se pudo parsear la respuesta del servidor" };
    }

    if (!response.ok) {
      console.error("❌ Error en backend de analíticas:", {
        status: response.status,
        data: responseData,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Error al guardar el ticket en analíticas",
          externalResponse: responseData,
        },
        { status: response.status },
      );
    }

    console.log("✅ Ticket guardado exitosamente en analíticas:", payload.ticket_number);

    return NextResponse.json({
      success: true,
      message: "Ticket guardado exitosamente",
      data: responseData,
    });
  } catch (error: any) {
    console.error("❌ Error en API tickets/save:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno al procesar el guardado del ticket",
        error: error.message,
      },
      { status: 500 },
    );
  }
}