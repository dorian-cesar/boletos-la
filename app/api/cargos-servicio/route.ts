import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = "https://backend-convenios-py.dev-wit.com";

    const res = await fetch(`${backendUrl}/api/cargos-servicio`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMessage = "Error al obtener cargos";
      try {
        const errorData = await res.json();
        if (errorData.message) errorMessage = errorData.message;
        else if (errorData.error) errorMessage = errorData.error;
      } catch (e) {
        const text = await res.text();
        if (text) errorMessage = text;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error obteniendo cargos por servicio:", error);
    return NextResponse.json(
      { error: "Error de red o de configuracion al obtener cargos" },
      { status: 500 }
    );
  }
}

