import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { Trip, Passenger, Seat } from "./booking-store";

export interface TicketData {
  bookingReference: string; // Ej: "90012160000099" o "BOL-123456"

  // Datos Empresa / Emisor
  companyName?: string; // "La Santaniana S.A."
  companyRuc?: string; // "RUC 80012667-0"
  companyAddress?: string; // "Maria Auxiliadora 974 esq Rca Argentina"
  companyCity?: string; // "Asuncion - Paraguay"

  // Factura y Autorización
  invoiceNumber?: string; // "001-216-0000099"
  authorizationDate?: string; // "26/06/2024"
  timbradoNumber?: string; // "1731316"

  // Trayecto
  originCity: string; // "San Ignacio Misiones"
  destinationCity: string; // "Pacheco Talar - Termir"
  departureDate: string; // "Sábado 01/08/2026"
  departureTime?: string; // "13:40"
  estimatedArrivalTime?: string; // "02/08/2026 10:30"

  // Asiento y Pasajero
  seatNumber?: string; // "35"
  passengerName?: string; // "LOMBILLO CESPEDES, ARIANA"
  documentNumber?: string; // "D 56861250"
  busType?: string; // "Semicama"
  catering?: string; // "Menu a bordo"

  // Detalles del Pago y Facturación
  totalPrice?: number | string; // "550,000"
  paymentCondition?: string; // "CONTADO"
  paymentMethod?: string; // "EF"
  saleDate?: string; // "26/07/2026 09:41"
  agencyUser?: string; // "SI4 / SI4 OAR2"
  nroInterno?: string; // "90012160000099"

  // Informaciones Adicionales
  phoneContact?: string; // "NUEVA LINEA BSAS +549 11 2560 8168"
  luggageInfo?: string; // "1 VALIJA Y 1 BOLSO DE MANO"
  luggagePolicy?: string; // "EQUIPAJE PERMITIDO"
  copyType?: string; // "1ra Copia Archivo Tributario"

  // Para retrocompatibilidad
  outboundTrip?: Trip;
  seats?: Seat[];
  passengers?: Passenger[];
  qrBase64?: string;
}

export async function generateTicketPDF(data: TicketData): Promise<Blob> {
  const doc = new jsPDF("p", "mm", "a4");
  const W = doc.internal.pageSize.getWidth(); // 210mm
  const H = doc.internal.pageSize.getHeight(); // 297mm

  /* =====================
     EXTRACCIÓN Y VALORES POR DEFECTO
  ===================== */
  const company =
    data.companyName || data.outboundTrip?.company || "La Santaniana S.A.";
  const ruc = data.companyRuc || "RUC 80012667-0";
  const address =
    data.companyAddress || "Maria Auxiliadora 974 esq Rca Argentina";
  const cityCountry = data.companyCity || "Asuncion - Paraguay";

  const invoice =
    data.invoiceNumber || data.nroInterno || `001-216-${data.bookingReference}`;
  const timbrado = data.timbradoNumber || "1731316";
  const autorizacion = data.authorizationDate || "26/06/2024";

  const origen = data.originCity || data.outboundTrip?.origin || "Origen";
  const destino =
    data.destinationCity || data.outboundTrip?.destination || "Destino";
  const fechaEmbarque = data.departureDate || "01/08/2026";
  const horaSalida =
    data.departureTime || data.outboundTrip?.departureTime || "13:40";
  const llegadaEstimada =
    data.estimatedArrivalTime ||
    data.outboundTrip?.arrivalTime ||
    "02/08/2026 10:30";

  const primerPasajero = data.passengers?.[0];
  const nombrePasajero = (
    data.passengerName ||
    (primerPasajero
      ? `${primerPasajero.lastName}, ${primerPasajero.firstName}`
      : "LOMBILLO CESPEDES, ARIANA")
  ).toUpperCase();

  const documento =
    data.documentNumber || primerPasajero?.documentNumber || "D 56861250";
  const asiento =
    data.seatNumber ||
    data.seats?.[0]?.number ||
    (data.seats ? data.seats.map((s) => s.number).join(", ") : "35");

  const servicio =
    data.busType || data.outboundTrip?.busType || "Semicama";
  const catering = data.catering || "Menu a bordo";

  const total =
    data.totalPrice !== undefined
      ? typeof data.totalPrice === "number"
        ? data.totalPrice.toLocaleString("es-PY")
        : data.totalPrice
      : "550,000";

  const condicion = data.paymentCondition || "CONTADO";
  const formaPago = data.paymentMethod || "EF";
  const fechaVenta = data.saleDate || "26/07/2026 09:41";
  const agenUsu = data.agencyUser || "SI4 / SI4 OAR2";
  const nroInterno = data.nroInterno || data.bookingReference;

  const contacto =
    data.phoneContact || "NUEVA LINEA BSAS +549 11 2560 8168";
  const equipajeInfo = data.luggageInfo || "1 VALIJA Y 1 BOLSO DE MANO";
  const equipajePolicy = data.luggagePolicy || "EQUIPAJE PERMITIDO";
  const tipoCopia = data.copyType || "1ra Copia Archivo Tributario";

  /* =====================
     PALETA DE COLORES
  ===================== */
  const darkHeader: [number, number, number] = [20, 30, 45];
  const lightBg: [number, number, number] = [248, 250, 252];
  const textDark: [number, number, number] = [15, 23, 42];
  const textMuted: [number, number, number] = [100, 116, 139];
  const accentRed: [number, number, number] = [220, 38, 38];

  /* =====================
     1. ENCABEZADO Y DATOS EMPRESA (CON CUADRADO PERFECTO)
  ===================== */
  // Franja oscura superior
  doc.setFillColor(...darkHeader);
  doc.rect(0, 0, W, 44, "F");

  // Columna Izquierda: Datos Empresa (X: 15 a 125 mm para NO chocar con el cuadro derecho)
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(company, 15, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text(ruc, 15, 23);
  doc.text(address, 15, 29);
  doc.text(cityCountry, 15, 35);

  // Columna Derecha: Recuadro Blanco de Factura (X: 130 a 195 mm, ancho 65 mm)
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(130, 7, 65, 30, 2, 2, "F");

  doc.setTextColor(...textDark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text(`Factura: ${invoice}`, 134, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  doc.text(`Autorizacion: ${autorizacion}`, 134, 21);
  doc.text(`Timbrado: ${timbrado}`, 134, 26);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(`Ref. Reserva: ${data.bookingReference}`, 134, 32);

  /* =====================
     2. TARJETA DE TRAYECTO (ORIGEN - DESTINO)
  ===================== */
  let y = 50;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 180, 38, 3, 3, "FD");

  // Origen (Columna Izquierda: X = 22 mm)
  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ORIGEN", 22, y + 9);

  doc.setTextColor(...textDark);
  doc.setFontSize(13.5);
  doc.setFont("helvetica", "bold");
  doc.text(origen, 22, y + 18);

  // Destino (Columna Derecha: X = 110 mm)
  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DESTINO", 110, y + 9);

  doc.setTextColor(...textDark);
  doc.setFontSize(13.5);
  doc.setFont("helvetica", "bold");
  doc.text(destino, 110, y + 18);

  // Línea roja separadora de ruta
  doc.setDrawColor(...accentRed);
  doc.setLineWidth(1);
  doc.line(22, y + 23, 188, y + 23);

  // Fechas y horas de embarque (bien distribuidas en X = 22 y X = 110)
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Embarque:", 22, y + 32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(`${fechaEmbarque} a las ${horaSalida} hs`, 40, y + 32);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Llegada estimada:", 110, y + 32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(llegadaEstimada, 138, y + 32);

  /* =====================
     3. DATOS DEL ASIENTO Y PASAJERO
  ===================== */
  y += 44;

  // Recuadro Izquierdo Destacado: ASIENTO (X: 15 a 58 mm, ancho 43 mm)
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(15, y, 43, 34, 3, 3, "FD");

  doc.setTextColor(...accentRed);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ASIENTO", 36.5, y + 10, { align: "center" });

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(String(asiento), 36.5, y + 25, { align: "center" });

  // Recuadro Derecho: DATOS DEL PASAJERO (X: 63 a 195 mm, ancho 132 mm)
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(63, y, 132, 34, 3, 3, "FD");

  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("PASAJERO(A)", 70, y + 9);

  doc.setTextColor(...textDark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(nombrePasajero, 70, y + 17);

  // Sub-columnas bien distanciadas: Documento (X = 70) y Servicio (X = 125)
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Documento:", 70, y + 26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(documento, 88, y + 26);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Servicio:", 125, y + 26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(`${servicio} (${catering})`, 139, y + 26);

  /* =====================
     4. DETALLES DE PAGO Y FACTURACIÓN (ALINEACIÓN PERFECTA DE COLUMNAS)
  ===================== */
  y += 40;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 180, 40, 3, 3, "FD");

  // Recuadro Total a Pagar (X: 20 a 82 mm, ancho 62 mm)
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(20, y + 6, 62, 28, 2, 2, "F");

  doc.setTextColor(...textMuted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL A PAGAR", 25, y + 14);

  doc.setTextColor(...accentRed);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(`Gs. ${total}`, 25, y + 25);

  // Columna 2 (X: 88 a 138 mm): Condición, F. de Pago, Fecha Venta
  const xCol2Label = 88;
  const xCol2Val = 107;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Condición:", xCol2Label, y + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(condicion, xCol2Val, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("F. de Pago:", xCol2Label, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(formaPago, xCol2Val, y + 20);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Fecha Venta:", xCol2Label, y + 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(fechaVenta, xCol2Val, y + 28);

  // Columna 3 (X: 142 a 190 mm): Agen/Usu, Nro Interno (Con margen seguro a la derecha)
  const xCol3Label = 142;
  const xCol3Val = 160;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Agen/Usu:", xCol3Label, y + 12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(agenUsu, xCol3Val, y + 12);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textMuted);
  doc.text("Nro Interno:", xCol3Label, y + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textDark);
  doc.text(nroInterno, xCol3Val, y + 20);

  /* =====================
     5. EQUIPAJE, INFORMACIÓN Y CÓDIGO QR
  ===================== */
  y += 46;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 180, 48, 3, 3, "FD");

  // Columna Izquierda: Información (X: 22 a 140 mm)
  doc.setTextColor(...textDark);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMACIÓN IMPORTANTE Y EQUIPAJE", 22, y + 11);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentRed);
  doc.text(contacto, 22, y + 19);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textDark);
  doc.text(`• ${equipajeInfo}`, 22, y + 27);
  doc.text(`• ${equipajePolicy}`, 22, y + 34);

  doc.setTextColor(...textMuted);
  doc.setFontSize(7.5);
  doc.text(
    "Presentar documento de identidad original al momento de abordar el autobús.",
    22,
    y + 41,
  );

  // Columna Derecha: Código QR (X: 146 a 186 mm, ancho 40 mm, y = y + 4)
  try {
    const qrData = data.qrBase64 || (await QRCode.toDataURL(data.bookingReference));
    doc.addImage(qrData, "PNG", 146, y + 4, 40, 40);
  } catch (e) {
    console.error("Error al renderizar QR en PDF:", e);
  }

  /* =====================
     6. PIE DE PÁGINA TRIBUTARIO
  ===================== */
  doc.setDrawColor(203, 213, 225);
  doc.line(15, H - 22, 195, H - 22);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textMuted);
  doc.text(tipoCopia, 15, H - 15);

  doc.setFont("helvetica", "normal");
  doc.text("Boletos.la · Venta oficial de boletos electrónicos", 195, H - 15, {
    align: "right",
  });

  return doc.output("blob");
}
