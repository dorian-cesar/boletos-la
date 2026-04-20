import type { Trip, Seat, Passenger } from "./booking-store";

interface SellParams {
  outboundTrip: Trip;
  returnTrip?: Trip | null;
  outboundSeats: Seat[];
  returnSeats: Seat[];
  passengers: Passenger[];
  connectionId?: string | null;
}

export async function sellGdsSeats(params: SellParams): Promise<Record<string, string>> {
  const { outboundTrip, returnTrip, outboundSeats, returnSeats, passengers, connectionId } = params;
  const ticketMap: Record<string, string> = {};

  const allSeats: { seat: Seat; isReturn: boolean }[] = [
    ...outboundSeats.map((seat) => ({ seat, isReturn: false })),
    ...(returnTrip ? returnSeats.map((seat) => ({ seat, isReturn: true })) : []),
  ];

  if (allSeats.length === 0) return ticketMap;

  const seatPayloads = allSeats.map((item, i) => {
    const passenger = passengers[i];
    const trip = item.isReturn ? returnTrip! : outboundTrip;
    return {
      seat: item.seat.number,
      qualityCode: item.seat.qualityCode ?? "CA",
      amount: item.seat.price || trip.price || 0,
      docType: passenger?.docType?.codigo || "D",
      docNumber: passenger?.documentNumber || "0",
    };
  });

  const totalAmount = allSeats.reduce((acc, item) => {
    const trip = item.isReturn ? returnTrip! : outboundTrip;
    return acc + (item.seat.price || trip.price || 0);
  }, 0);

  const payload = {
    company: outboundTrip.company,
    serviceId: outboundTrip.id,
    connectionId: connectionId ?? undefined,
    originId: outboundTrip.origin,
    destinationId: outboundTrip.destination,
    ticketCount: allSeats.length,
    totalAmount,
    seats: seatPayloads,
  };

  try {
    const res = await fetch("/api/gds/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[sell] Error HTTP:", JSON.stringify(data));
      return ticketMap;
    }

    const codigoError = data?.data?.raw?.CodigoError;
    if (codigoError !== undefined && codigoError !== "0") {
      const desc = data?.data?.raw?.Descripcion || "Error desconocido";
      console.error(`[sell] GDS rechazó CodigoError=${codigoError}: ${desc}`);
      return ticketMap;
    }

    const ticketNumbers: string[] = data?.data?.ticketNumbers ?? [];
    allSeats.forEach((item, i) => {
      if (ticketNumbers[i]) {
        const label = item.isReturn ? "Vuelta" : "Ida";
        ticketMap[`${label}-${item.seat.number}`] = ticketNumbers[i];
      }
    });
  } catch (error: any) {
    console.error("[sell] Error inesperado:", error.message);
  }

  return ticketMap;
}
