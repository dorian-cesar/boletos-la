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

  const callSell = async (
    trip: Trip,
    seats: Seat[],
    offset: number,
    label: string,
  ) => {
    const seatPayloads = seats.map((seat, i) => {
      const passenger = passengers[offset + i];
      return {
        seat: seat.number,
        qualityCode: seat.qualityCode ?? "CA",
        amount: seat.price || trip.price || 0,
        docType: passenger?.docType?.codigo || "D",
        docNumber: passenger?.documentNumber || "0",
      };
    });

    const payload = {
      company: trip.company,
      serviceId: trip.id,
      connectionId: connectionId ?? undefined,
      originId: trip.origin,
      destinationId: trip.destination,
      ticketCount: seats.length,
      totalAmount: seats.reduce((acc, s) => acc + (s.price || trip.price || 0), 0),
      seats: seatPayloads,
    };

    const res = await fetch("/api/gds/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`[sell] Error HTTP (${label}):`, JSON.stringify(data));
      return;
    }

    const codigoError = data?.data?.raw?.CodigoError;
    if (codigoError !== undefined && codigoError !== "0") {
      const desc = data?.data?.raw?.Descripcion || "Error desconocido";
      console.error(`[sell] GDS rechazó (${label}) CodigoError=${codigoError}: ${desc}`);
      return;
    }

    const ticketNumbers: string[] = data?.data?.ticketNumbers ?? [];
    seats.forEach((seat, i) => {
      if (ticketNumbers[i]) {
        ticketMap[`${label}-${seat.number}`] = ticketNumbers[i];
      }
    });
  };

  const tasks: Promise<void>[] = [];
  if (outboundSeats.length > 0) {
    tasks.push(callSell(outboundTrip, outboundSeats, 0, "Ida"));
  }
  if (returnTrip && returnSeats.length > 0) {
    tasks.push(callSell(returnTrip, returnSeats, outboundSeats.length, "Vuelta"));
  }

  try {
    await Promise.allSettled(tasks);
  } catch (error: any) {
    console.error("[sell] Error inesperado:", error.message);
  }

  return ticketMap;
}
