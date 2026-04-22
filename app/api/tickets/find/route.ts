import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// URL base del backend para analíticas desde variables de entorno
const ANALYTICS_BASE_URL = process.env.DB_URL;

export async function POST(request: NextRequest) {
  try {
    const { ticketNumber } = await request.json();

    if (!ticketNumber) {
      return NextResponse.json(
        { success: false, message: "ticketNumber es requerido" },
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
      const authRes = await fetch(`${ANALYTICS_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: process.env.AUTH_EMAIL,
          password: process.env.AUTH_PASSWORD,
        }),
      });

      if (!authRes.ok) {
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

      // Guardar token en cookie
      nextResponse.cookies.set("analytics_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60, // 1 hora
      });
    }

    const response = await fetch(
      `${ANALYTICS_BASE_URL}/api/tickets/number/${ticketNumber}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Error al buscar el ticket en analíticas",
          error: responseData,
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
        data: responseData,
      },
      {
        headers: nextResponse.headers,
      },
    );
  } catch (error: any) {
    console.error("Error en /api/tickets/find:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Error interno" },
      { status: 500 },
    );
  }
}
