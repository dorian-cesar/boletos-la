import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body; // data ya está encriptada desde el frontend

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "No se proporcionaron datos encriptados",
        },
        { status: 400 },
      );
    }
    console.log("📤 Enviando datos ENCRIPTADOS al backend...");
    console.log("Longitud:", data.length);
    console.log("Primeros 50 chars:", data.substring(0, 50) + "...");

    // Enviar los datos ENCRIPTADOS al backend
    const response = await fetch(`${BACKEND_URL}/api/pagopar/iniciar-pago`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data }),
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.message || "Error del backend");
    }

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error("❌ Error en proxy:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
