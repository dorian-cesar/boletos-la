import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_PUBLICIDAD_URL;
    const apiKey = process.env.NEXT_PUBLIC_PUBLICIDAD_API_KEY;

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Falta configurar variables de entorno del servidor de publicidad",
        },
        { status: 500 },
      );
    }

    const response = await fetch(`${baseUrl}/api/logs-operaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      const fallbackResponse = await fetch(`${baseUrl}/api/logs-operaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apiKey,
          "x-api-key": apiKey,
        },
        body: JSON.stringify(body),
      });

      const fallbackData = await fallbackResponse.json().catch(() => ({}));
      return NextResponse.json(fallbackData, {
        status: fallbackResponse.status,
      });
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error proxying logs operaciones:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
