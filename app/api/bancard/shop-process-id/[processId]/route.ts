import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { processId: string } }
) {
  const bancardUrl = process.env.APP_BASE_URL || "https://wit-bancard.dev-wit.com";
  const { processId } = params;

  if (!processId) {
    return NextResponse.json(
      { status: "error", message: "processId es requerido" },
      { status: 400 }
    );
  }

  try {
    const targetUrl = `${bancardUrl}/api/bancard/shop-process-id/${processId}`;
    console.log("[Bancard Shop Process ID] Calling URL:", targetUrl);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { status: "error", message: `Error del Gateway: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const apiResponse = await response.json();
    return NextResponse.json(apiResponse);
  } catch (error: any) {
    console.error("Error obteniendo shopProcessId:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
