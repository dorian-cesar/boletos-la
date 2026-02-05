import jsPDF from "jspdf";
import type { Trip, Passenger, Seat } from "./booking-store";

interface TicketData {
  bookingReference: string;
  outboundTrip: Trip;
  returnTrip?: Trip | null;
  seats: Seat[];
  returnSeats?: Seat[];
  passengers: Passenger[];
  totalPrice: number;
  originCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
}

export async function generateTicketPDF(data: TicketData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor: [number, number, number] = [60, 189, 177]; // Cyan #3CBDB1
  const secondaryColor: [number, number, number] = [247, 148, 29]; // Orange #F7941D
  const darkColor: [number, number, number] = [30, 35, 40];
  const grayColor: [number, number, number] = [120, 120, 120];

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("boletos.la", 20, 30);

  // Booking reference
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("BOLETO ELECTRÓNICO", pageWidth - 20, 20, { align: "right" });
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(data.bookingReference, pageWidth - 20, 35, { align: "right" });

  let yPos = 70;

  // Trip details section
  doc.setTextColor(...darkColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Detalles del Viaje", 20, yPos);

  yPos += 15;

  // Outbound trip box
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(2);
  doc.roundedRect(15, yPos - 5, pageWidth - 30, 55, 3, 3, "S");

  doc.setFillColor(...primaryColor);
  doc.roundedRect(15, yPos - 5, 60, 12, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("VIAJE DE IDA", 20, yPos + 3);

  doc.setTextColor(...darkColor);
  yPos += 15;

  // Route
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.originCity}  →  ${data.destinationCity}`, 20, yPos);

  yPos += 10;

  // Trip info grid
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayColor);

  const col1 = 20;
  const col2 = 70;
  const col3 = 120;
  const col4 = 160;

  doc.text("Fecha:", col1, yPos);
  doc.text("Salida:", col2, yPos);
  doc.text("Llegada:", col3, yPos);
  doc.text("Bus:", col4, yPos);

  yPos += 7;
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.text(data.departureDate, col1, yPos);
  doc.text(data.outboundTrip.departureTime, col2, yPos);
  doc.text(data.outboundTrip.arrivalTime, col3, yPos);
  doc.text(data.outboundTrip.busType, col4, yPos);

  yPos += 10;
  doc.setTextColor(...grayColor);
  doc.setFont("helvetica", "normal");
  doc.text("Empresa:", col1, yPos);
  doc.text("Asientos:", col2, yPos);

  yPos += 7;
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.text(data.outboundTrip.company, col1, yPos);
  doc.text(data.seats.map((s) => s.number).join(", "), col2, yPos);

  yPos += 20;

  // Return trip if exists
  if (data.returnTrip && data.returnSeats && data.returnDate) {
    doc.setDrawColor(...secondaryColor);
    doc.setLineWidth(2);
    doc.roundedRect(15, yPos - 5, pageWidth - 30, 55, 3, 3, "S");

    doc.setFillColor(...secondaryColor);
    doc.roundedRect(15, yPos - 5, 70, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("VIAJE DE VUELTA", 20, yPos + 3);

    doc.setTextColor(...darkColor);
    yPos += 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.destinationCity}  →  ${data.originCity}`, 20, yPos);

    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);

    doc.text("Fecha:", col1, yPos);
    doc.text("Salida:", col2, yPos);
    doc.text("Llegada:", col3, yPos);
    doc.text("Bus:", col4, yPos);

    yPos += 7;
    doc.setTextColor(...darkColor);
    doc.setFont("helvetica", "bold");
    doc.text(data.returnDate, col1, yPos);
    doc.text(data.returnTrip.departureTime, col2, yPos);
    doc.text(data.returnTrip.arrivalTime, col3, yPos);
    doc.text(data.returnTrip.busType, col4, yPos);

    yPos += 10;
    doc.setTextColor(...grayColor);
    doc.setFont("helvetica", "normal");
    doc.text("Empresa:", col1, yPos);
    doc.text("Asientos:", col2, yPos);

    yPos += 7;
    doc.setTextColor(...darkColor);
    doc.setFont("helvetica", "bold");
    doc.text(data.returnTrip.company, col1, yPos);
    doc.text(data.returnSeats.map((s) => s.number).join(", "), col2, yPos);

    yPos += 20;
  }

  // Passengers section
  yPos += 10;
  doc.setTextColor(...darkColor);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Pasajeros", 20, yPos);

  yPos += 10;

  data.passengers.forEach((passenger, index) => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos - 3, pageWidth - 30, 20, 2, 2, "F");

    doc.setTextColor(...darkColor);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${index + 1}. ${passenger.firstName} ${passenger.lastName}`,
      20,
      yPos + 7,
    );

    doc.setTextColor(...grayColor);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`RUT: ${passenger.rut}`, 100, yPos + 7);
    doc.text(`Asiento: ${passenger.seatNumber}`, 150, yPos + 7);

    yPos += 25;
  });

  // Total price
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);

  yPos += 15;
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Total Pagado:", pageWidth - 80, yPos);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...secondaryColor);
  doc.text(
    `$${data.totalPrice.toLocaleString("es-CL")}`,
    pageWidth - 20,
    yPos,
    { align: "right" },
  );

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 30;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, footerY - 10, pageWidth - 15, footerY - 10);

  doc.setTextColor(...grayColor);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Este boleto electrónico es válido como comprobante de viaje.",
    20,
    footerY,
  );
  doc.text(
    "Presente su cédula de identidad al momento de abordar.",
    20,
    footerY + 5,
  );
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-CL")} a las ${new Date().toLocaleTimeString("es-CL")}`,
    20,
    footerY + 10,
  );

  doc.text(
    "www.boletos.la | contacto@boletos.la | +56 2 2345 6789",
    pageWidth - 20,
    footerY + 10,
    { align: "right" },
  );

  return doc.output("blob");
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
