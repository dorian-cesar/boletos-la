import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_PAGOPAR_URL || "http://localhost:3001";

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

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("pagopar_token")?.value;

    const response = NextResponse.json({});

    let token: string;

    if (existingToken) {
      token = existingToken;
    } else {
      const authRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.AUTH_EMAIL,
          password: process.env.AUTH_PASSWORD,
        }),
      });

      if (!authRes.ok) {
        const errorText = await authRes.text();
        return NextResponse.json(
          { error: errorText || "Error autenticando en Pagopar" },
          { status: authRes.status },
        );
      }

      const authData = await authRes.json();
      const newToken = authData?.token;

      if (!newToken) {
        return NextResponse.json(
          { error: "Token no recibido de Pagopar" },
          { status: 401 },
        );
      }

      token = newToken;

      response.cookies.set("pagopar_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 día
      });
    }

    // Consultar al backend
    const apiRes = await fetch(`${BACKEND_URL}/api/pagopar/consultar-estado`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ hash_pedido }),
    });

    const resultado = await apiRes.json();

    return NextResponse.json(resultado, {
      headers: response.headers,
    });
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
