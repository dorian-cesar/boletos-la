import jsPDF from "jspdf";
import type { Trip, Passenger, Seat } from "./booking-store";

interface TicketData {
  bookingReference: string;
  outboundTrip: Trip;
  seats: Seat[];
  passengers: Passenger[];
  originCity: string;
  destinationCity: string;
  departureDate: string;
}

export async function generateTicketPDF(data: TicketData): Promise<Blob> {
  const doc = new jsPDF("p", "mm", "a4");
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  /* =====================
     COLORS
  ===================== */
  const dark: [number, number, number] = [30, 41, 59]; // slate-800
  const light: [number, number, number] = [241, 245, 249]; // slate-100
  const gray: [number, number, number] = [100, 116, 139];
  const accent: [number, number, number] = [16, 185, 129]; // emerald

  /* =====================
     HEADER
  ===================== */
  doc.setFillColor(...dark);
  doc.rect(0, 0, W, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Boletos.la", 15, 22);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("BOLETO ELECTRÓNICO", W - 15, 14, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(data.bookingReference, W - 15, 24, { align: "right" });

  /* =====================
     ROUTE CARD
  ===================== */
  let y = 45;

  doc.setFillColor(...light);
  doc.roundedRect(15, y, W - 30, 40, 4, 4, "F");

  doc.setTextColor(...gray);
  doc.setFontSize(9);
  doc.text("ORIGEN", 35, y + 10, { align: "center" });
  doc.text("DESTINO", W - 35, y + 10, { align: "center" });

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(data.originCity, 35, y + 20, { align: "center" });
  doc.text(data.destinationCity, W - 35, y + 20, {
    align: "center",
  });

  doc.setDrawColor(...dark);
  doc.setLineWidth(1);
  doc.line(70, y + 20, W - 70, y + 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(data.departureDate, W / 2, y + 32, {
    align: "center",
  });

  /* =====================
     DETAILS + QR
  ===================== */
  y += 50;

  doc.setFillColor(250, 250, 250);
  doc.roundedRect(15, y, W - 30, 60, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalles del Viaje", 20, y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Empresa: ${data.outboundTrip.company}`, 20, y + 20);
  doc.text(`Bus: ${data.outboundTrip.busType}`, 20, y + 28);
  doc.text(`Salida: ${data.outboundTrip.departureTime}`, 20, y + 36);
  doc.text(`Llegada: ${data.outboundTrip.arrivalTime}`, 20, y + 44);

  doc.text(
    `Asientos: ${data.seats.map((s) => s.number).join(", ")}`,
    20,
    y + 52,
  );

  /* =====================
     QR
  ===================== */
  const qrPayload = {
    ref: data.bookingReference,
    origin: data.originCity,
    destination: data.destinationCity,
    seats: data.seats.map((s) => s.number),
  };

  doc.setFontSize(9);
  doc.setTextColor(...gray);
  doc.text("Escanea al abordar", W - 47, y + 62, {
    align: "center",
  });

  /* =====================
     PASSENGERS
  ===================== */
  y += 75;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Pasajeros", 15, y);

  y += 8;

  data.passengers.forEach((p, i) => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, y, W - 30, 14, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}. ${p.firstName} ${p.lastName}`, 20, y + 9);

    doc.setFont("helvetica", "normal");
    doc.text(`RUT: ${p.documentNumber}`, W - 20, y + 9, {
      align: "right",
    });

    y += 18;
  });

  /* =====================
     FOOTER
  ===================== */
  doc.setDrawColor(200, 200, 200);
  doc.line(15, H - 30, W - 15, H - 30);

  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text(
    "Boleto electrónico válido para el viaje indicado. Presentar identificación.",
    15,
    H - 22,
  );

  doc.text("www.boletos.la · soporte@boletos.la", W - 15, H - 22, {
    align: "right",
  });

  return doc.output("blob");
}
