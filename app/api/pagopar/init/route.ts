import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_PAGOPAR_URL || "http://localhost:3001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "No se proporcionaron datos encriptados",
        },
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
      const authRes = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.NEXT_PUBLIC_AUTH_EMAIL,
          password: process.env.NEXT_PUBLIC_AUTH_PASSWORD,
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

    console.log("Enviando datos ENCRIPTADOS al backend...");
    console.log("Longitud:", data.length);
    console.log("Primeros 50 chars:", data.substring(0, 50) + "...");

    // Enviar los datos ENCRIPTADOS al backend
    const apiRes = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/pagopar/iniciar-pago`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      },
    );

    const resultado = await apiRes.json();

    if (!apiRes.ok) {
      throw new Error(resultado.message || "Error del backend");
    }

    return NextResponse.json(resultado, {
      headers: response.headers,
    });
  } catch (error: any) {
    console.error("Error en proxy:", error);
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
