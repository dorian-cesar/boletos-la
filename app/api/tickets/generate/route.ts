// app/api/tickets/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketData, email, authCode, bookingReference } = body;

    console.log("Generando boleto HTML...");

    // Validar datos
    if (!ticketData || !email) {
      return NextResponse.json(
        {
          success: false,
          message: "Datos incompletos",
          tickets: [],
        },
        { status: 400 },
      );
    }

    // Generar boletos
    const tickets = [];

    // Procesar todos los viajes
    for (const bookingId of Object.keys(ticketData)) {
      const booking = ticketData[bookingId];

      // Procesar viajes de ida
      if (booking.ida && Array.isArray(booking.ida)) {
        for (const trip of booking.ida) {
          if (trip.asientos && Array.isArray(trip.asientos)) {
            for (const seat of trip.asientos) {
              const ticket = await generateTicket(
                trip,
                seat,
                "ida",
                authCode || bookingReference,
              );
              if (ticket) tickets.push(ticket);
            }
          }
        }
      }

      // Procesar viajes de vuelta
      if (booking.vuelta && Array.isArray(booking.vuelta)) {
        for (const trip of booking.vuelta) {
          if (trip.asientos && Array.isArray(trip.asientos)) {
            for (const seat of trip.asientos) {
              const ticket = await generateTicket(
                trip,
                seat,
                "vuelta",
                authCode || bookingReference,
              );
              if (ticket) tickets.push(ticket);
            }
          }
        }
      }
    }

    if (tickets.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se encontraron asientos para generar boletos",
          tickets: [],
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `${tickets.length} boleto(s) generado(s) correctamente`,
      tickets,
    });
  } catch (error: any) {
    console.error("Error en /api/tickets/generate:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor: " + error.message,
        tickets: [],
      },
      { status: 500 },
    );
  }
}

async function generateTicket(
  trip: any,
  seat: any,
  tripType: string,
  authCode: string,
) {
  try {
    // Generar QR
    const qrData = JSON.stringify({
      origin: trip.origin,
      destination: trip.destination,
      date: trip.date,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      seat: seat.asiento,
      floor: seat.floor,
      price: seat.valorAsiento,
      authCode: authCode,
      type: "boleto",
      timestamp: new Date().toISOString(),
    });

    const encoded = Buffer.from(qrData).toString("base64");
    const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/ver-boleto?data=${encoded}`;
    const qrImage = await QRCode.toDataURL(qrUrl, {
      width: 180,
      margin: 1,
      color: {
        dark: "#1a1a1a",
        light: "#ffffff",
      },
    });

    // Generar HTML del boleto
    const htmlContent = generateTicketHTML(
      trip,
      seat,
      tripType,
      qrImage,
      authCode,
    );

    const base64 = `data:text/html;base64,${Buffer.from(htmlContent).toString("base64")}`;
    const fileName = `Boleto_${trip.origin}_${trip.destination}_${seat.asiento}_${trip.date.replace(/-/g, "")}.html`;

    return {
      fileName,
      base64,
      origin: trip.origin,
      destination: trip.destination,
      seat: seat.asiento,
    };
  } catch (error) {
    console.error("Error generando boleto:", error);
    return null;
  }
}

function generateTicketHTML(
  trip: any,
  seat: any,
  tripType: string,
  qrImage: string,
  authCode: string,
): string {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Boleto de Viaje - ${trip.origin} a ${trip.destination}</title>
  <style>
    /* Importar fuente */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    /* Reset y estilos base */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    /* Contenedor del boleto */
    .ticket-container {
      width: 100%;
      max-width: 800px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }
    
    /* Encabezado */
    .ticket-header {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }
    
    .ticket-header::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      filter: blur(10px);
    }
    
    .company-name {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    
    .trip-type {
      font-size: 16px;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.9;
      font-weight: 500;
    }
    
    /* Cuerpo del boleto */
    .ticket-body {
      padding: 40px;
    }
    
    /* Sección de ruta */
    .route-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      padding: 30px;
      border-radius: 16px;
      margin-bottom: 30px;
      border: 1px solid #e2e8f0;
    }
    
    .route-point {
      flex: 1;
      text-align: center;
    }
    
    .location-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      font-weight: 600;
    }
    
    .location-name {
      font-size: 28px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 4px;
    }
    
    .terminal-name {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 12px;
    }
    
    .date-hour {
      font-size: 16px;
      font-weight: 500;
      color: #334155;
      line-height: 1.4;
    }
    
    .route-arrow {
      width: 60px;
      height: 60px;
      background: #3b82f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      margin: 0 20px;
      flex-shrink: 0;
    }
    
    /* Detalles y QR */
    .details-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .details-section {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    
    .seat-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .detail-item {
      display: flex;
      flex-direction: column;
    }
    
    .detail-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 600;
    }
    
    .detail-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }
    
    .qr-section {
      background: #f8fafc;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .qr-label {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      margin-bottom: 20px;
    }
    
    .qr-image {
      width: 180px;
      height: 180px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
    
    /* Código de autenticación */
    .auth-section {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 30px;
      border: 2px dashed #3b82f6;
    }
    
    .auth-label {
      font-size: 14px;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .auth-code {
      font-size: 28px;
      font-weight: 800;
      color: #1e40af;
      letter-spacing: 2px;
      font-family: monospace;
    }
    
    /* Instrucciones */
    .instructions {
      background: #f0f9ff;
      padding: 25px;
      border-radius: 12px;
      border: 1px solid #bae6fd;
    }
    
    .instructions-title {
      font-size: 18px;
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .instructions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }
    
    .instruction-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #bae6fd;
      text-align: center;
      font-size: 14px;
      color: #0c4a6e;
    }
    
    /* Pie de página */
    .footer {
      padding: 25px 40px;
      background: #1e293b;
      color: #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .footer-logo {
      width: 24px;
      height: 24px;
      background: #10b981;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }
    
    .footer-right {
      font-size: 12px;
      opacity: 0.8;
    }
    
    /* Botón de impresión */
    .print-button {
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.5);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1000;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(59, 130, 246, 0.6);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .route-section {
        flex-direction: column;
        text-align: center;
        gap: 20px;
      }
      
      .route-arrow {
        transform: rotate(90deg);
        margin: 10px 0;
      }
      
      .details-row {
        grid-template-columns: 1fr;
      }
      
      .seat-details {
        grid-template-columns: 1fr;
        gap: 15px;
      }
      
      .instructions-grid {
        grid-template-columns: 1fr;
      }
      
      .footer {
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }
      
      .print-button {
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        font-size: 14px;
      }
    }
    
    /* Estilos para impresión */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .ticket-container {
        box-shadow: none;
        border: 1px solid #ddd;
      }
      
      .print-button {
        display: none;
      }
      
      /* Mejorar legibilidad en impresión */
      .ticket-header {
        background: #1e293b !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .auth-section {
        background: #dbeafe !important;
        border: 2px dashed #3b82f6 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .instructions {
        background: #f0f9ff !important;
        border: 1px solid #bae6fd !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .footer {
        background: #1e293b !important;
        color: #cbd5e1 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="ticket-container">
    <!-- Encabezado -->
    <div class="ticket-header">
      <div class="company-name">${trip.company || "BusExpress"}</div>
      <div class="trip-type">Boleto de ${tripType === "ida" ? "Ida" : "Vuelta"}</div>
    </div>
    
    <!-- Cuerpo -->
    <div class="ticket-body">
      <!-- Ruta -->
      <div class="route-section">
        <div class="route-point">
          <div class="location-label">Origen</div>
          <div class="location-name">${trip.origin}</div>
          <div class="terminal-name">${trip.terminalOrigin}</div>
          <div class="date-hour">
            <div>${formatDate(trip.date)}</div>
            <div>${trip.departureTime} hrs</div>
          </div>
        </div>
        
        <div class="route-arrow">→</div>
        
        <div class="route-point">
          <div class="location-label">Destino</div>
          <div class="location-name">${trip.destination}</div>
          <div class="terminal-name">${trip.terminalDestination}</div>
          <div class="date-hour">
            <div>${formatDate(trip.arrivalDate)}</div>
            <div>${trip.arrivalTime} hrs</div>
          </div>
        </div>
      </div>
      
      <!-- Detalles y QR -->
      <div class="details-row">
        <!-- Detalles del asiento -->
        <div class="details-section">
          <div class="seat-details">
            <div class="detail-item">
              <div class="detail-label">Asiento</div>
              <div class="detail-value">${seat.asiento}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Piso</div>
              <div class="detail-value">${seat.floor === "floor1" ? "1" : "2"}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Tipo</div>
              <div class="detail-value">${seat.floor === "floor1" ? trip.seatLayout?.tipo_Asiento_piso_1 || "Standard" : trip.seatLayout?.tipo_Asiento_piso_2 || "Standard"}</div>
            </div>
            
            <div class="detail-item">
              <div class="detail-label">Precio</div>
              <div class="detail-value">Gs. ${seat.valorAsiento}</div>
            </div>
          </div>
        </div>
        
        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-label">Código QR</div>
          <img src="${qrImage}" alt="QR Code" class="qr-image">
          <div style="margin-top: 15px; font-size: 12px; color: #64748b;">
            Escanea para verificar
          </div>
        </div>
      </div>
      
      <!-- Código de autenticación -->
      <div class="auth-section">
        <div class="auth-label">Código de Transacción</div>
        <div class="auth-code">${authCode}</div>
      </div>
      
      <!-- Instrucciones -->
      <div class="instructions">
        <div class="instructions-title">¡Gracias por viajar con nosotros!</div>
        <div class="instructions-grid">
          <div class="instruction-item">Presenta este boleto al abordar</div>
          <div class="instruction-item">Lleva identificación válida</div>
          <div class="instruction-item">Llega 30 minutos antes</div>
          <div class="instruction-item">Boleto es intransferible</div>
        </div>
      </div>
    </div>
    
    <!-- Pie de página -->
    <div class="footer">
      <div class="footer-left">
        <div class="footer-logo">B</div>
        <span>Boleto generado electrónicamente</span>
      </div>
      <div class="footer-right">
        <span>Sistema de reservas BusExpress © ${new Date().getFullYear()}</span>
      </div>
    </div>
  </div>
  
  <!-- Botón de impresión -->
  <button class="print-button" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
    Imprimir Boleto
  </button>
  
  <script>
    // Auto-centrar y mejorar experiencia de impresión
    document.addEventListener('DOMContentLoaded', function() {
      // Establecer título de la página
      document.title = "Boleto - ${trip.origin} a ${trip.destination}";
      
      // Opcional: auto-scroll al inicio
      window.scrollTo(0, 0);
      
      // Opcional: auto-imprimir después de 1 segundo
      // setTimeout(function() {
      //   window.print();
      // }, 1000);
      
      // Mejorar el botón de impresión
      const printButton = document.querySelector('.print-button');
      printButton.addEventListener('click', function() {
        // Agregar clase de impresión
        document.body.classList.add('printing');
        window.print();
        setTimeout(function() {
          document.body.classList.remove('printing');
        }, 100);
      });
    });
  </script>
</body>
</html>
  `;
}
