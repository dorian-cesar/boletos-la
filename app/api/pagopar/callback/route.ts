// /app/api/pagopar/callback/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Pagopar envía el hash en el cuerpo de la petición
    const { hash_pedido, numero_pedido, estado } = body;

    console.log("Callback recibido de Pagopar:", {
      hash_pedido,
      numero_pedido,
      estado,
      timestamp: new Date().toISOString(),
    });

    // Aquí puedes actualizar tu base de datos con el estado del pago
    // Por ejemplo, actualizar el estado del pedido a "paid"

    return NextResponse.json({
      success: true,
      message: "Callback recibido correctamente",
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error en callback de Pagopar:", error);
    return NextResponse.json(
      { success: false, error: "Error procesando callback" },
      { status: 500 },
    );
  }
}

// También manejar GET por si acaso
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "API de callback Pagopar está funcionando",
    method: "GET",
  });
}
