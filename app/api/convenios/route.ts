import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();
    
    const backendUrl = "https://backend-convenios-py.dev-wit.com/api";
    const apiKey = process.env.CONVENIOS_API_KEY || "";

    const res = await fetch(`${backendUrl}/convenios${qs ? `?${qs}` : ""}`, {
      headers: {
        "x-api-key": apiKey,
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching convenios:", error);
    return NextResponse.json({ error: "Error fetching convenios" }, { status: 500 });
  }
}
