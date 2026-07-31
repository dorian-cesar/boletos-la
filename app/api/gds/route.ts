import { NextResponse } from "next/server";

export async function POST() {
  try {
    const email =
      process.env.NEXT_PUBLIC_AUTH_EMAIL || process.env.NEXT_PUBLIC_AUTH_EMAIL;
    const password =
      process.env.NEXT_PUBLIC_AUTH_PASSWORD ||
      process.env.NEXT_PUBLIC_AUTH_PASSWORD;
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!email || !password || !backendUrl) {
      return NextResponse.json(
        {
          error:
            "Faltan variables de entorno: NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_AUTH_EMAIL o NEXT_PUBLIC_AUTH_PASSWORD",
        },
        { status: 500 },
      );
    }

    const res = await fetch(`${backendUrl}/api/auth/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: errorText || "Error autenticando" },
        { status: res.status },
      );
    }

    const data = await res.json();
    const token = data?.token;

    if (!token) {
      return NextResponse.json(
        { error: "No se recibió token" },
        { status: 401 },
      );
    }

    // Guardar en cookie segura
    const response = NextResponse.json({ success: true });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 },
    );
  }
}
