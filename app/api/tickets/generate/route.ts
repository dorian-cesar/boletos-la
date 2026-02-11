import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener los datos del frontend
    const body = await request.json();

    // 2. Validar campos mínimos requeridos
    if (!body.reservaCodigo || !body.pasajeroNombre) {
      console.error("Campos requeridos faltantes");
      return NextResponse.json(
        {
          success: false,
          message: "reservaCodigo y pasajeroNombre son requeridos",
        },
        { status: 400 },
      );
    }

    // 3. Generar PDF directamente
    console.log("Generando PDF localmente para:", body.reservaCodigo);

    const pdfData = await generateTicketPDF(body);
    const base64PDF = pdfData.base64;

    // 4. Devolver respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "PDF generado exitosamente",
      pdf: {
        fileName: pdfData.fileName,
        base64: base64PDF,
        size: pdfData.size,
        contentType: "application/pdf",
      },
      metadata: {
        reservaCodigo: body.reservaCodigo,
        timestamp: new Date().toISOString(),
        pasajero: body.pasajeroNombre,
      },
    });
  } catch (error: any) {
    console.error("Error en API interna:", error);

    // Manejar diferentes tipos de errores
    let statusCode = 500;
    let errorMessage = "Error interno del servidor";

    if (error.name === "TimeoutError" || error.name === "AbortError") {
      statusCode = 504;
      errorMessage = "Timeout: La generación del PDF tardó demasiado";
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error.message,
      },
      { status: statusCode },
    );
  }
}

// Función para formatear fechas
const formatDate = (dateStr: string) => {
  if (!dateStr) return "";

  // Intentar parsear diferentes formatos de fecha
  let date: Date;

  if (dateStr.includes("de")) {
    // Formato: "15 de enero, 2024"
    const months: { [key: string]: number } = {
      enero: 0,
      febrero: 1,
      marzo: 2,
      abril: 3,
      mayo: 4,
      junio: 5,
      julio: 6,
      agosto: 7,
      septiembre: 8,
      octubre: 9,
      noviembre: 10,
      diciembre: 11,
    };

    const parts = dateStr.match(/(\d+)\s+de\s+(\w+),\s+(\d+)/);
    if (parts) {
      const day = parseInt(parts[1]);
      const month = months[parts[2].toLowerCase()];
      const year = parseInt(parts[3]);
      date = new Date(year, month, day);
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return dateStr; // Devolver el string original si no se puede parsear
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

// Función para generar el PDF del ticket
async function generateTicketPDF(ticketData: any): Promise<{
  fileName: string;
  base64: string;
  size: number;
}> {
  // Crear el contenido HTML del ticket optimizado para A4
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        line-height: 1.4;
        color: #1f2937;
        background: #ffffff;
        width: 210mm;
        height: 297mm;
        padding: 15mm;
      }

      /* Contenedor principal */
      .ticket-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Encabezado */
      .header {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(30, 64, 175, 0.2);
      }

      .company-name {
        font-size: 28px;
        font-weight: 800;
        margin-bottom: 5px;
        letter-spacing: -0.5px;
      }

      .ticket-type {
        font-size: 13px;
        font-weight: 600;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      /* Sección de Ruta */
      .route-section {
        background: #f8fafc;
        border: 2px solid #e2e8f0;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: relative;
      }

      .route-point {
        text-align: center;
        flex: 1;
      }

      .location-label {
        font-size: 10px;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .location-name {
        font-size: 22px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 5px;
      }

      .terminal-name {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        margin-bottom: 12px;
      }

      .date-hour {
        font-size: 14px;
        font-weight: 600;
        color: #334155;
      }

      .route-connector {
        width: 80px;
        height: 2px;
        background: linear-gradient(90deg, #e2e8f0, #94a3b8, #e2e8f0);
        margin: 0 15px;
        position: relative;
      }

      .route-connector::after {
        content: "→";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        color: #3b82f6;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid #3b82f6;
      }

      /* Grid de detalles */
      .details-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
        margin-bottom: 20px;
      }

      .details-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 18px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
      }

      .card-title {
        font-size: 13px;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #f1f5f9;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .detail-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f8fafc;
      }

      .detail-row:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
      }

      .detail-label {
        font-size: 11px;
        color: #64748b;
        font-weight: 500;
      }

      .detail-value {
        font-size: 12px;
        font-weight: 600;
        color: #1e293b;
        text-align: right;
      }

      /* Código de reserva */
      .reservation-code {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2px dashed #0ea5e9;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        margin-bottom: 20px;
      }

      .code-label {
        font-size: 11px;
        color: #0369a1;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .code-value {
        font-size: 22px;
        font-weight: 800;
        color: #0c4a6e;
        letter-spacing: 2px;
        font-family: 'Courier New', monospace;
      }

      /* Resumen de pago */
      .payment-section {
        background: white;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .payment-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 2px solid #f1f5f9;
      }

      .payment-title {
        font-size: 14px;
        font-weight: 700;
        color: #1e293b;
      }

      .payment-method {
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
      }

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #1e293b;
        padding: 18px 20px;
        border-radius: 6px;
        color: white;
        margin-top: 10px;
      }

      .total-label {
        font-size: 14px;
        font-weight: 600;
        color: #cbd5e1;
      }

      .total-value {
        font-size: 24px;
        font-weight: 800;
        color: white;
      }

      /* Footer */
      .footer {
        margin-top: auto;
        background: #f8fafc;
        border-radius: 8px;
        padding: 20px;
        border: 1px solid #e2e8f0;
      }

      .footer-title {
        font-size: 16px;
        font-weight: 700;
        color: #1e293b;
        text-align: center;
        margin-bottom: 15px;
      }

      .instructions {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 15px;
        flex-wrap: wrap;
      }

      .instruction {
        font-size: 10px;
        color: #475569;
        background: white;
        padding: 8px 12px;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        font-weight: 500;
        flex: 1;
        text-align: center;
        min-width: 120px;
      }

      .footer-note {
        font-size: 9px;
        color: #64748b;
        text-align: center;
        font-style: italic;
        margin-top: 10px;
        line-height: 1.3;
      }

      .company-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        font-size: 9px;
        color: #94a3b8;
      }

      .company-logo {
        font-weight: 700;
        color: #3b82f6;
      }

      /* Responsive para impresión */
      @media print {
        body {
          width: 210mm;
          height: 297mm;
          padding: 10mm !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .ticket-container {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="ticket-container">
      <!-- Encabezado -->
      <div class="header">
        <div class="company-name">${ticketData.empresa || "BusExpress"}</div>
        <div class="ticket-type">BOLETO ELECTRÓNICO</div>
      </div>

      <!-- Sección de Ruta -->
      <div class="route-section">
        <div class="route-point">
          <div class="location-label">Origen</div>
          <div class="location-name">${ticketData.origen}</div>
          <div class="terminal-name">${ticketData.terminal}</div>
          <div class="date-hour">
            <div>${formatDate(ticketData.fechaViaje)}</div>
            <div>${ticketData.horaSalida} hrs</div>
          </div>
        </div>
        
        <div class="route-connector"></div>
        
        <div class="route-point">
          <div class="location-label">Destino</div>
          <div class="location-name">${ticketData.destino}</div>
          <div class="terminal-name">${ticketData.terminal}</div>
          <div class="date-hour">
            <div>${formatDate(ticketData.fechaViaje)}</div>
            <div>${ticketData.horaLlegada} hrs</div>
          </div>
        </div>
      </div>

      <!-- Grid de detalles -->
      <div class="details-container">
        <!-- Detalles del viaje -->
        <div class="details-card">
          <div class="card-title">Detalles del Viaje</div>
          <div class="detail-row">
            <div class="detail-label">Duración</div>
            <div class="detail-value">${ticketData.duracion}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Servicio</div>
            <div class="detail-value">${ticketData.servicioTipo}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Asiento(s)</div>
            <div class="detail-value">${ticketData.asientos}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Puerta de embarque</div>
            <div class="detail-value">${ticketData.puerta}</div>
          </div>
        </div>

        <!-- Información del pasajero -->
        <div class="details-card">
          <div class="card-title">Información del Pasajero</div>
          <div class="detail-row">
            <div class="detail-label">Nombre completo</div>
            <div class="detail-value">${ticketData.pasajeroNombre}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Documento</div>
            <div class="detail-value">${ticketData.documento}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Teléfono</div>
            <div class="detail-value">${ticketData.telefono}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Fecha de pago</div>
            <div class="detail-value">${ticketData.pagoFecha}</div>
          </div>
        </div>
      </div>

      <!-- Código de reserva -->
      <div class="reservation-code">
        <div class="code-label">Código de Reserva</div>
        <div class="code-value">${ticketData.reservaCodigo}</div>
      </div>

      <!-- Resumen de pago -->
      <div class="payment-section">
        <div class="payment-header">
          <div class="payment-title">Resumen de Pago</div>
          <div class="payment-method">${ticketData.metodoPago}</div>
        </div>
        <div class="total-row">
          <div class="total-label">TOTAL PAGADO</div>
          <div class="total-value">${ticketData.total}</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-title">¡Gracias por viajar con nosotros!</div>
        <div class="instructions">
          <div class="instruction">Presenta este boleto al abordar</div>
          <div class="instruction">Lleva identificación válida</div>
          <div class="instruction">Llega 30 minutos antes</div>
        </div>
        <div class="footer-note">
          Este boleto es intransferible. Válido únicamente para la fecha y horario especificados.
        </div>
        <div class="company-info">
          <div class="company-logo">BOLETOS.LA</div>
          <div>Boleto generado electrónicamente - ${new Date().toLocaleDateString("es-ES")}</div>
          <div>Sistema de reservas © ${new Date().getFullYear()}</div>
        </div>
      </div>
    </div>
  </body>
</html>
  `;

  async function launchPuppeteer() {
    const isServerless =
      process.env.AWS_EXECUTION_ENV ||
      process.env.AWS_REGION ||
      process.env.VERCEL;

    // ===== AWS / AMPLIFY / SERVERLESS =====
    if (isServerless) {
      const executablePath = await chromium.executablePath();

      return puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
        executablePath,
        headless: true,
      });
    }

    // ===== DESARROLLO LOCAL =====
    return puppeteer.launch({
      headless: true,
      executablePath:
        process.platform === "win32"
          ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
          : process.platform === "linux"
            ? "/usr/bin/google-chrome"
            : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  // En tu función generateTicketPDF:
  let browser;
  try {
    browser = await launchPuppeteer();

    const page = await browser.newPage();

    // Establecer las dimensiones exactas de A4
    await page.setViewport({
      width: 794, // 210mm en pixels (210 * 3.78)
      height: 1123, // 297mm en pixels (297 * 3.78)
    });

    // Establecer el contenido HTML
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    // Generar el PDF con márgenes mínimos
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "5mm",
        right: "5mm",
        bottom: "5mm",
        left: "5mm",
      },
      preferCSSPageSize: true,
    });

    await browser.close();

    const buffer = Buffer.from(pdfBuffer);
    const base64 = `data:application/pdf;base64,${buffer.toString("base64")}`;
    const fileName = `Boleto_${ticketData.origen}-${ticketData.destino}_${ticketData.reservaCodigo}.pdf`;

    return {
      fileName,
      base64,
      size: buffer.length,
    };
  } finally {
    if (browser) await browser.close();
  }
}
