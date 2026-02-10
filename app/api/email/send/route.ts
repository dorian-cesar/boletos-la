import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

  const backendUrl = process.env.BACKEND_EMAIL_URL || "http://localhost:3000";

  try {
    const emailData = await request.json();

    // Validar datos mínimos requeridos
    const requiredFields = [
      "to",
      "reservaCodigo",
      "pasajeroNombre",
      "origen",
      "destino",
    ];
    const missingFields = requiredFields.filter((field) => !emailData[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Datos incompletos",
          missingFields,
          message: `Faltan los siguientes campos: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 },
      );
    }

    console.log(
      "Enviando solicitud de email para reserva:",
      emailData.reservaCodigo,
    );

    const externalResponse = await fetch(backendUrl + "/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      throw new Error(
        `HTTP ${externalResponse.status}: ${externalResponse.statusText} - ${errorText}`,
      );
    }

    const responseData = await externalResponse.json();

    console.log("Email procesado correctamente:", {
      reserva: emailData.reservaCodigo,
      destinatario: emailData.to,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Boleto enviado por email exitosamente",
      data: responseData,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      console.error("⏰ Timeout enviando email");
      return NextResponse.json(
        {
          error: "Timeout al enviar el email",
          message: "El servidor de email está tardando demasiado en responder",
        },
        { status: 504 },
      );
    }

    console.error("Error en endpoint de email:", error);
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud de email",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
