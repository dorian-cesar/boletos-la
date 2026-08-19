import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const analyticsBaseUrl =
  process.env.NEXT_PUBLIC_DB_URL || process.env.NEXT_PUBLIC_DB_URL;
const authEmail =
  process.env.NEXT_PUBLIC_AUTH_EMAIL || process.env.NEXT_PUBLIC_AUTH_EMAIL;
const authPassword =
  process.env.NEXT_PUBLIC_AUTH_PASSWORD ||
  process.env.NEXT_PUBLIC_AUTH_PASSWORD;

// URL base del backend para analíticas desde variables de entorno
const ANALYTICS_API_URL = `${analyticsBaseUrl}/api/tickets`;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Validación básica
    if (!payload.ticket_number) {
      return NextResponse.json(
        { success: false, message: "ticket_number es requerido" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("analytics_token")?.value;

    let token: string;
    let nextResponse = NextResponse.json({ success: true });

    if (existingToken) {
      token = existingToken;
    } else {
      const authRes = await fetch(`${analyticsBaseUrl}/api/auth/login`, {
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
        const errorData = await authRes.json().catch(() => ({}));
        console.error("Error en login de analíticas:", errorData);
        return NextResponse.json(
          { success: false, message: "Error de autenticación en analíticas" },
          { status: 401 },
        );
      }

      const authData = await authRes.json();
      token = authData.token;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "No se recibió token de analíticas" },
          { status: 401 },
        );
      }
    }

    const response = await fetch(ANALYTICS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-Channel": process.env.NEXT_PUBLIC_APP_CHANNEL || "web",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(20000), // 20 segundos timeout
    });

    // 4. Manejar respuesta y persistencia del token
    if (!existingToken && token) {
      nextResponse.cookies.set("analytics_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1 hora
      });
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = {
        message: "No se pudo parsear la respuesta del servidor",
      };
    }

    if (!response.ok) {
      console.error("Error en backend de analíticas:", {
        status: response.status,
        data: responseData,
        sentPayload: payload,
      });

      return NextResponse.json(
        {
          success: false,
          message:
            responseData?.message ||
            responseData?.error ||
            "Error al guardar el ticket en analíticas",
          externalResponse: responseData,
          sentPayload: payload,
        },
        {
          status: response.status,
          headers: nextResponse.headers,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Ticket guardado exitosamente",
        data: responseData,
      },
      {
        headers: nextResponse.headers,
      },
    );
  } catch (error: any) {
    console.error("Error en API tickets/save:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno al procesar el guardado del ticket",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
