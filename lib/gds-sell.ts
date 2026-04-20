import type { Trip, Seat, Passenger } from "./booking-store";

interface SellParams {
  outboundTrip: Trip;
  returnTrip?: Trip | null;
  outboundSeats: Seat[];
  returnSeats: Seat[];
  passengers: Passenger[];
  outboundConnectionId?: string | null;
  returnConnectionId?: string | null;
}

// Función auxiliar para formatear los asientos a enviar al /sell
const buildSeatPayloads = (seats: Seat[], trip: Trip, paxList: Passenger[]) => {
  return seats.map((seat, i) => {
    const passenger = paxList[i];
    return {
      seat: seat.number,
      qualityCode: seat.qualityCode ?? "CA",
      amount: seat.price || trip.price || 0,
      docType: passenger?.docType?.codigo || "D",
      docNumber: passenger?.documentNumber || "0",
    };
  });
};

export async function sellGdsSeats(params: SellParams): Promise<Record<string, string>> {
  const { outboundTrip, returnTrip, outboundSeats, returnSeats, passengers, outboundConnectionId, returnConnectionId } = params;
  const ticketMap: Record<string, string> = {};

  if (!outboundSeats.length) return ticketMap;

  const outboundPax = passengers.slice(0, outboundSeats.length);
  const outboundPayload = {
    company: outboundTrip.company,
    serviceId: outboundTrip.id,
    connectionId: outboundConnectionId ?? undefined,
    originId: outboundTrip.origin,
    destinationId: outboundTrip.destination,
    ticketCount: outboundSeats.length,
    totalAmount: outboundSeats.reduce((acc, s) => acc + (s.price || outboundTrip.price || 0), 0),
    seats: buildSeatPayloads(outboundSeats, outboundTrip, outboundPax),
  };

  const tasks: Promise<any>[] = [];

  // Venta de Ida
  tasks.push(
    fetch("/api/gds/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outboundPayload),
    }).then(res => res.json().then(data => ({ res, data, label: "Ida", seatsObj: outboundSeats })))
  );

  // Venta de Vuelta
  if (returnTrip && returnSeats.length > 0) {
    const returnPax = passengers.slice(outboundSeats.length, outboundSeats.length + returnSeats.length);
    const returnPayload = {
      company: returnTrip.company,
      serviceId: returnTrip.id,
      connectionId: returnConnectionId ?? undefined,
      originId: returnTrip.origin,
      destinationId: returnTrip.destination,
      ticketCount: returnSeats.length,
      totalAmount: returnSeats.reduce((acc, s) => acc + (s.price || returnTrip.price || 0), 0),
      seats: buildSeatPayloads(returnSeats, returnTrip, returnPax),
    };

    tasks.push(
      fetch("/api/gds/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnPayload),
      }).then(res => res.json().then(data => ({ res, data, label: "Vuelta", seatsObj: returnSeats })))
    );
  }

  const results = await Promise.allSettled(tasks);

  results.forEach(result => {
    if (result.status === "fulfilled") {
      const { res, data, label, seatsObj } = result.value;

      if (!res.ok) {
        console.error(`[sell ${label}] Error HTTP:`, JSON.stringify(data));
        return;
      }

      const codigoError = data?.data?.raw?.CodigoError;
      if (codigoError !== undefined && codigoError !== "0") {
        const desc = data?.data?.raw?.Descripcion || "Error desconocido";
        console.error(`[sell ${label}] GDS rechazó CodigoError=${codigoError}: ${desc}`);
        return;
      }

      const ticketNumbers: string[] = data?.data?.ticketNumbers ?? [];
      seatsObj.forEach((seat: Seat, i: number) => {
        if (ticketNumbers[i]) {
          ticketMap[`${label}-${seat.number}`] = ticketNumbers[i];
        }
      });
    } else {
      console.error("[sell] Error en red / excepcion:", result.reason);
    }
  });

  return ticketMap;
}
