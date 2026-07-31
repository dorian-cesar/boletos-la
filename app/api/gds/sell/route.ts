import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
      company,
      serviceId,
      connectionId,
      originId,
      destinationId,
      ticketCount,
      totalAmount,
      seats,
    } = body;

    if (
      !serviceId ||
      !originId ||
      !destinationId ||
      !totalAmount ||
      !seats ||
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Faltan parámetros obligatorios o seats no es un array válido",
        },
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
      const authRes = await fetch(`${backendUrl}/api/auth/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      if (!authRes.ok) {
        const errorText = await authRes.text();
        return NextResponse.json(
          { error: errorText || "Error autenticando" },
          { status: authRes.status },
        );
      }

      const authData = await authRes.json();
      const newToken = authData?.token;

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

    const payload: Record<string, unknown> = {
      serviceId,
      originId,
      destinationId,
      ticketCount: ticketCount ?? seats.length,
      totalAmount,
      seats,
    };

    if (company) payload.company = company;
    if (connectionId) payload.connectionId = connectionId;

    console.log("📤 [sell] Enviando al backend:", JSON.stringify(payload));

    const apiRes = await fetch(`${backendUrl}/api/gds/delta/sell`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Channel": process.env.NEXT_PUBLIC_APP_CHANNEL || "web",
      },
      body: JSON.stringify(payload),
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      console.error(
        "[sell] Error del backend:",
        apiRes.status,
        JSON.stringify(data),
      );
      return NextResponse.json(
        { error: data?.message || data?.error || "Error en backend" },
        { status: apiRes.status },
      );
    }

    console.log("[sell] Respuesta del backend:", JSON.stringify(data));

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
