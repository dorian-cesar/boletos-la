// app/api/pagopar/check-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash_pedido } = body;

    console.log("=== CONSULTANDO ESTADO PAGOPAR ===");
    console.log("Hash pedido:", hash_pedido);

    // Obtener claves
    const publicKey = process.env.NEXT_PUBLIC_PAGOPAR_PUBLIC_KEY;
    const privateKey = process.env.NEXT_PUBLIC_PAGOPAR_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      throw new Error("Claves Pagopar no configuradas");
    }

    // Generar token para consulta: sha1(private_key + "CONSULTA")
    const tokenConsulta = crypto
      .createHash("sha1")
      .update(privateKey + "CONSULTA")
      .digest("hex");

    console.log("Token consulta:", tokenConsulta);

    // Consultar estado a Pagopar
    const response = await axios.post(
      "https://api.pagopar.com/api/pedidos/1.1/traer",
      {
        hash_pedido: hash_pedido,
        token: tokenConsulta,
        token_publico: publicKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Respuesta estado:", JSON.stringify(response.data, null, 2));

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("=== ERROR CONSULTA ESTADO ===");

    if (error.response) {
      console.error("Error de Pagopar:", error.response.data);
      return NextResponse.json(
        {
          error: "Error consultando estado",
          message: error.response.data?.resultado || error.message,
        },
        { status: error.response.status },
      );
    }

    console.error("Error:", error.message);
    return NextResponse.json(
      {
        error: "Error interno",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
