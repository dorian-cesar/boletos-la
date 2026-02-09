import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout

  const backendUrl = process.env.BACKEND_EMAIL_URL || "http://localhost:3000";

  try {
    const ticketData = await request.json();

    // Validar datos mínimos requeridos
    if (!ticketData.reservaCodigo || !ticketData.pasajeroNombre) {
      return NextResponse.json(
        { error: "Datos de reserva incompletos" },
        { status: 400 },
      );
    }

    const externalResponse = await fetch(backendUrl + "/api/tickets/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
      body: JSON.stringify(ticketData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!externalResponse.ok) {
      throw new Error(
        `HTTP ${externalResponse.status}: ${externalResponse.statusText}`,
      );
    }

    const pdfBlob = await externalResponse.blob();
    const pdfBuffer = await pdfBlob.arrayBuffer();

    const headers = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="boleto-${ticketData.reservaCodigo}.pdf"`,
      "Content-Length": pdfBuffer.byteLength.toString(),
      "Cache-Control": "no-store, max-age=0",
    });

    return new NextResponse(pdfBuffer, { status: 200, headers });
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Timeout al generar el PDF" },
        { status: 504 },
      );
    }

    console.error("Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", details: error.message },
      { status: 500 },
    );
  }
}
