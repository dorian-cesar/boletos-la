import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    const authEmail = process.env.NEXT_PUBLIC_AUTH_EMAIL || process.env.AUTH_EMAIL;
    const authPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD || process.env.AUTH_PASSWORD;

    if (!backendUrl || !authEmail || !authPassword) {
      return NextResponse.json(
        { error: "Faltan variables de entorno: NEXT_PUBLIC_BACKEND_URL, NEXT_PUBLIC_AUTH_EMAIL o NEXT_PUBLIC_AUTH_PASSWORD" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const {
      docType,
      docNumber,
      lastName,
      name,
      phone,
      occupation,
      birthDate,
      gender,
      nationality,
      country,
    } = body;

    if (!docType || !docNumber || !lastName || !name) {
      return NextResponse.json(
        { error: "Faltan parámetros: docType, docNumber, lastName, name" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get("auth_token")?.value;

    let token: string;
    const response = NextResponse.json({});

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

    // Campos asegurados (se envían sus valores o un dato por defecto válido para el GDS)
    const payload = {
      docType,
      docNumber,
      lastName: lastName.toUpperCase(),
      name: name.toUpperCase(),
      occupation: occupation || "EMPLEADO",
      birthDate: birthDate || "1991/06/08",
      gender: gender || "M",
      nationality: nationality || "PA",
      country: country || "PA",
      phone: phone?.replace(/\D/g, "") || "",
    };

    const apiRes = await fetch(
      `${backendUrl}/api/gds/delta/createPassenger`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Channel": process.env.NEXT_PUBLIC_APP_CHANNEL || "web",
        },
        body: JSON.stringify(payload),
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
    return NextResponse.json(data, { headers: response.headers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 },
    );
  }
}