import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rut, convenio_id } = body;

    if (!rut || !convenio_id) {
      return NextResponse.json(
        { error: "RUT y convenio_id son requeridos" },
        { status: 400 }
      );
    }

    const backendUrl = "https://backend-convenios-py.dev-wit.com/api";
    const apiKey = process.env.CONVENIOS_API_KEY;

    if (!apiKey) {
      console.error("Falta CONVENIOS_API_KEY en las variables de entorno");
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/integraciones/beneficiarios/validar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ rut, convenio_id }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al validar beneficiario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
