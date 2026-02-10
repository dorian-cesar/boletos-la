import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash_pedido } = body;

    if (!hash_pedido) {
      return NextResponse.json(
        { error: "hash_pedido es requerido" },
        { status: 400 },
      );
    }

    // Consultar al backend
    const response = await fetch(
      `${BACKEND_URL}/api/pagopar/consultar-estado`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ hash_pedido }),
      },
    );

    const resultado = await response.json();

    return NextResponse.json(resultado);
  } catch (error: any) {
    console.error("Error consultando estado:", error);
    return NextResponse.json(
      {
        error: "Error interno",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
