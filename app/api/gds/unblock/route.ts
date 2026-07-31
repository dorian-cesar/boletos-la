import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL;
    const authEmail =
      process.env.NEXT_PUBLIC_AUTH_EMAIL || process.env.NEXT_PUBLIC_AUTH_EMAIL;
    const authPassword =
      process.env.NEXT_PUBLIC_AUTH_PASSWORD ||
      process.env.NEXT_PUBLIC_AUTH_PASSWORD;

    if (!backendUrl || !authEmail || !authPassword) {
      return NextResponse.json(
        {
          error:
            "Faltan variables de entorno: NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_AUTH_EMAIL o NEXT_PUBLIC_AUTH_PASSWORD",
        },
        { status: 500 },
      );
    }

    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json(
        { error: "connectionId es requerido" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("auth_token")?.value;

    const response = NextResponse.json({ success: true });
    let token: string;

    if (existingToken) {
      token = existingToken;
    } else {
      const authRes = await fetch(`${backendUrl}/api/auth/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      if (!authRes.ok) {
        return NextResponse.json(
          { error: "Error autenticando con el backend" },
          { status: 401 },
        );
      }

      const data = await authRes.json();
      token = data?.token;

      if (!token) {
        return NextResponse.json(
          { error: "Token no recibido" },
          { status: 401 },
        );
      }

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    const apiRes = await fetch(`${backendUrl}/api/gds/delta/unblock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Channel": process.env.NEXT_PUBLIC_APP_CHANNEL || "web",
      },
      body: JSON.stringify({ connectionId }),
    });

    if (!apiRes.ok) {
      const errorData = await apiRes.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || "Error al desbloquear en GDS" },
        {
          status: apiRes.status,
          headers: response.headers,
        },
      );
    }

    const result = await apiRes.json();

    return NextResponse.json(result, {
      headers: response.headers,
    });
  } catch (error: any) {
    console.error("❌ Error en /api/gds/unblock:", error);
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 },
    );
  }
}
