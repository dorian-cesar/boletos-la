import { BACKEND_URL, AUTH_EMAIL, AUTH_PASSWORD } from "@/lib/config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_URL || !AUTH_EMAIL || !AUTH_PASSWORD) {
      return NextResponse.json(
        { error: "Faltan variables de entorno: BACKEND_URL, AUTH_EMAIL o AUTH_PASSWORD" },
        { status: 500 },
      );
    }

    const { searchParams } = req.nextUrl;
    const originId = searchParams.get("originId");
    const destinationId = searchParams.get("destinationId");
    const date = searchParams.get("date");

    if (!originId || !destinationId || !date) {
      return NextResponse.json(
        { error: "Faltan parámetros: originId, destinationId, date" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("auth_token")?.value;

    const response = NextResponse.json({});

    let token: string;

    if (existingToken) {
      token = existingToken;
    } else {
      const authRes = await fetch(`${BACKEND_URL}/api/auth/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: AUTH_EMAIL,
          password: AUTH_PASSWORD,
        }),
      });

      if (!authRes.ok) {
        const errorText = await authRes.text();
        return NextResponse.json(
          { error: errorText || "Error autenticando" },
          { status: authRes.status },
        );
      }

      const data = await authRes.json();
      const newToken = data?.token;

      if (!newToken) {
        return NextResponse.json(
          { error: "Token no recibido del backend" },
          { status: 401 },
        );
      }

      token = newToken;

      response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    const params = new URLSearchParams({ originId, destinationId, date });

    const apiRes = await fetch(
      `${BACKEND_URL}/api/gds/delta/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Channel": process.env.NEXT_PUBLIC_APP_CHANNEL || "web",
        },
      },
    );

    if (!apiRes.ok) {
      const errorText = await apiRes.text();
      return NextResponse.json(
        { error: errorText || "Error en backend" },
        { status: apiRes.status },
      );
    }

    const data = await apiRes.json();

    return NextResponse.json(data, {
      headers: response.headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 },
    );
  }
}
