// app/api/pagopar/check-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash_pedido } = body;

    console.log("🔍 Consultando estado para hash:", hash_pedido);

    const privateKey = process.env.PAGOPAR_PRIVATE_KEY;
    const publicKey = process.env.PAGOPAR_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      throw new Error("Claves Pagopar no configuradas");
    }

    // Token para consulta: sha1(private_key + "CONSULTA")
    const token = crypto
      .createHash("sha1")
      .update(privateKey + "CONSULTA")
      .digest("hex");

    // Consultar a Pagopar
    const response = await axios.post(
      "https://api.pagopar.com/api/pedidos/1.1/traer",
      {
        hash_pedido: hash_pedido,
        token: token,
        token_publico: publicKey,
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
    );

    console.log("📊 Estado recibido:", response.data);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("❌ Error consultando estado:", error);

    return NextResponse.json(
      {
        error: "Error consultando estado",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
