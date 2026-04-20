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

const MAX_RETRIES = 3;

async function doSellWithRetry(payload: any, label: string) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch("/api/gds/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      
      let isError = false;
      let logMsg = "";

      if (!res.ok) {
        isError = true;
        logMsg = `HTTP Error ${res.status}: ${JSON.stringify(data.error || data)}`;
      } else {
        const rawCode = data?.data?.raw?.CodigoError;
        if (rawCode !== undefined && String(rawCode) !== "0") {
          isError = true;
          logMsg = `GDS CodigoError=${rawCode}: ${data?.data?.raw?.Descripcion}`;
        }
      }

      if (isError) {
        console.warn(`[sell ${label}] Intento ${attempt}/${MAX_RETRIES} falló. ${logMsg}`);
        if (attempt < MAX_RETRIES) {
          // Esperar 1.5s antes del próximo intento
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        // Si agotamos intentos, retornamos el error para que la interfaz lo trate
        return { res, data, label };
      }

      // Éxito
      console.log(`[sell ${label}] Venta exitosa en el intento ${attempt}`);
      return { res, data, label };

    } catch (error: any) {
      console.error(`[sell ${label}] Excepción en intento ${attempt}/${MAX_RETRIES}:`, error);
      if (attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, 1500));
        continue;
      }
      throw error; 
    }
  }
  throw new Error("Lógica de reintentos fallida");
}

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
    doSellWithRetry(outboundPayload, "Ida").then(result => ({ ...result, seatsObj: outboundSeats }))
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
      doSellWithRetry(returnPayload, "Vuelta").then(result => ({ ...result, seatsObj: returnSeats }))
    );
  }

  const results = await Promise.allSettled(tasks);

  results.forEach(result => {
    if (result.status === "fulfilled") {
      const { res, data, label, seatsObj } = result.value;

      if (!res.ok) {
        console.error(`[sell ${label}] Error HTTP definitivo:`, JSON.stringify(data));
        return;
      }

      const codigoError = data?.data?.raw?.CodigoError;
      if (codigoError !== undefined && String(codigoError) !== "0") {
        const desc = data?.data?.raw?.Descripcion || "Error desconocido";
        console.error(`[sell ${label}] GDS rechazó definitivo CodigoError=${codigoError}: ${desc}`);
        return;
      }

      const ticketNumbers: string[] = data?.data?.ticketNumbers ?? [];
      seatsObj.forEach((seat: Seat, i: number) => {
        if (ticketNumbers[i]) {
          ticketMap[`${label}-${seat.number}`] = ticketNumbers[i];
        }
      });
    } else {
      console.error("[sell] Error en red / excepcion definitiva:", result.reason);
    }
  });

  return ticketMap;
}
