import { NextResponse } from "next/server";

// URL base del backend para búsqueda de tickets (DB Analítica)
const BACKEND_URL = process.env.DB_URL || "https://boletos-la-analitica.dev-wit.com";
const AUTH_EMAIL = process.env.AUTH_EMAIL || "admin@wit.la";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "witla951";

// Cache the token in memory to avoid logging in on every request if possible.
// In a production serverless environment this might reset, but it's safe and saves time.
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAuthToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  try {
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: AUTH_EMAIL, password: AUTH_PASSWORD })
    });

    if (!loginRes.ok) {
      console.error("[Ticket Search] Login failed:", await loginRes.text());
      return null;
    }

    const data = await loginRes.json();
    cachedToken = data.token;
    // Token lasts 1h according to docs. We cache it for 50 minutes (50 * 60 * 1000)
    tokenExpiresAt = now + (50 * 60 * 1000);
    return cachedToken;
  } catch (error) {
    console.error("[Ticket Search] Error during login:", error);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketNumber = searchParams.get("number");

    if (!ticketNumber) {
      return NextResponse.json({ success: false, message: "Número de ticket requerido" }, { status: 400 });
    }

    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json({ success: false, message: "Error de autenticación con el backend" }, { status: 500 });
    }

    // Buscar el ticket usando el token
    const ticketRes = await fetch(`${BACKEND_URL}/api/tickets/number/${ticketNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!ticketRes.ok) {
      if (ticketRes.status === 404) {
        return NextResponse.json({ success: false, message: "Ticket no encontrado" }, { status: 404 });
      }
      console.error("[Ticket Search] Fetch failed with status:", ticketRes.status);
      return NextResponse.json({ success: false, message: "Error consultando el ticket" }, { status: 500 });
    }

    const ticketData = await ticketRes.json();

    // Map the backend data to our frontend format.
    // Assuming backend returns standard fields. We provide fallbacks in case it differs.
    const formattedData = {
      id: ticketData.id || ticketNumber,
      documentType: ticketData.passenger?.docType || ticketData.docType || "Documento",
      documentNumber: ticketData.passenger?.docNumber || ticketData.docNumber || "N/A",
      route: `${ticketData.origin || 'Origen'} - ${ticketData.destination || 'Destino'}`,
      date: ticketData.date || "Fecha de viaje",
      email: ticketData.passenger?.email || ticketData.email || "",
      phone: ticketData.passenger?.phone || ticketData.phone || "",
      firstName: ticketData.passenger?.name || ticketData.name || "Usuario",
      lastName: ticketData.passenger?.surname || ticketData.surname || ""
    };

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error) {
    console.error("[Ticket Search API Error]:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
