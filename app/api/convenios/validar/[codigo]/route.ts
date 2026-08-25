import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const codigo = resolvedParams.codigo;
    
    if (!codigo || codigo === "undefined") {
      return NextResponse.json({ error: "Código no proporcionado" }, { status: 400 });
    }
    
    const backendUrl = "https://backend-convenios-py.dev-wit.com";

    // Call the external backend
    const res = await fetch(`${backendUrl}/api/convenios/validar/${codigo}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      let errorMessage = "Código inválido o error en el servidor";
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
    
    // El JSON devuelve valor_descuento: "20.00"
    return NextResponse.json({
      valido: true,
      descuento: parseFloat(data.valor_descuento || "0"),
      nombre: data.nombre,
      tipo_descuento: data.tipo_descuento,
      empresa_convenio: data.empresa_nombre,
      convenio: data.nombre
    });
  } catch (error: any) {
    console.error("Error validando código de descuento:", error);
    return NextResponse.json(
      { error: "Error de red o de configuración al validar el código" },
      { status: 500 }
    );
  }
}
