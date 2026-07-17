import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceId, originId, destinationId, seats, connectionId } = body;

    if (!serviceId || !originId || !destinationId || !seats) {
      return NextResponse.json(
        {
          error: "Faltan parámetros: serviceId, originId, destinationId, seats",
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
      const authRes = await fetch(`${process.env.BACKEND_URL}/api/auth/email`, {
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

    const apiRes = await fetch(
      `${process.env.BACKEND_URL}/api/gds/delta/block`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          originId,
          destinationId,
          seats, // Podría ser un string o un array dependiendo de cómo lo mande el frontend
          ...(connectionId && { connectionId }),
        }),
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
    
    console.log("=== INSPECCIÓN CRUDA GDS BLOCK (BACKEND) ===");
    console.log(JSON.stringify(data, null, 2));
    console.log("============================================");

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
