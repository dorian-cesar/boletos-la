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
    const docType = passenger?.docType?.codigo || "C";
    return {
      seat: seat.number,
      qualityCode: seat.qualityCode ?? "CA",
      amount: seat.price || trip.price || 0,
      docType: docType,
      docNumber: passenger?.documentNumber || "0",
    };
  });
};

async function doSell(payload: any, label: string) {
  try {
    const res = await fetch("/api/gds/sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return { res, data, label };
  } catch (error: any) {
    console.error(`[sell ${label}] Excepción en la llamada a /sell:`, error);
    throw error;
  }
}

async function retrySellWithNewBlock(
  payload: any,
  originalSeats: any[],
  label: string,
) {
  console.log(
    `[sell ${label}] Intentando re-bloquear asientos por expiración (Error 233)...`,
  );
  try {
    // 1. Intentar desbloquear la sesión anterior (por si el asiento quedó en un limbo en el GDS)
    if (payload.connectionId) {
      console.log(
        `[sell ${label}] Liberando conexión anterior fantasma: ${payload.connectionId}`,
      );
      await fetch("/api/gds/unblock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: payload.connectionId }),
      }).catch((e) =>
        console.error(
          `[sell ${label}] Error silencioso al liberar conexión anterior:`,
          e,
        ),
      );

      // Pequeña pausa para darle tiempo al GDS de procesar la liberación
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 2. Intentar nuevo bloqueo con reintentos (el unblock puede tardar unos segundos en propagarse en el GDS)
    let blockData = null;
    let blockSuccess = false;

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`[sell ${label}] Intento de re-bloqueo ${attempt}/3...`);
      const blockRes = await fetch("/api/gds/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: payload.serviceId,
          originId: payload.originId,
          destinationId: payload.destinationId,
          seats: originalSeats.map((s: any) => s.number).join(", "),
        }),
      });

      if (blockRes.ok) {
        const rawData = await blockRes.json();
        blockData = rawData.data || rawData;
        const isGdsError =
          blockData.success === false ||
          (blockData.providerResult && blockData.providerResult !== "0");

        if (!isGdsError && blockData.connectionId) {
          blockSuccess = true;
          break; // Salir del loop si fue exitoso
        }
      }

      if (attempt < 3) {
        console.log(
          `[sell ${label}] GDS aún retiene el asiento. Esperando 2 segundos para reintentar...`,
        );
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    if (!blockSuccess || !blockData?.connectionId) {
      console.error(
        `[sell ${label}] GDS rechazó el re-bloqueo definitivamente o no devolvió connectionId.`,
      );
      return null;
    }

    const newConnectionId = blockData.connectionId;
    console.log(
      `[sell ${label}] Re-bloqueo exitoso. Nuevo connectionId: ${newConnectionId}. Reintentando venta...`,
    );

    const newPayload = { ...payload, connectionId: newConnectionId };
    return await doSell(newPayload, label);
  } catch (error) {
    console.error(`[sell ${label}] Excepción durante el re-bloqueo:`, error);
    return null;
  }
}

export async function sellGdsSeats(
  params: SellParams,
): Promise<Record<string, string>> {
  const {
    outboundTrip,
    returnTrip,
    outboundSeats,
    returnSeats,
    passengers,
    outboundConnectionId,
    returnConnectionId,
  } = params;
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
    totalAmount: outboundSeats.reduce(
      (acc, s) => acc + (s.price || outboundTrip.price || 0),
      0,
    ),
    seats: buildSeatPayloads(outboundSeats, outboundTrip, outboundPax),
  };

  const tasks: Promise<any>[] = [];

  // Venta de Ida
  tasks.push(
    doSell(outboundPayload, "Ida").then((result) => ({
      ...result,
      seatsObj: outboundSeats,
      payload: outboundPayload,
    })),
  );

  // Venta de Vuelta
  if (returnTrip && returnSeats.length > 0) {
    const returnPax = passengers.slice(
      outboundSeats.length,
      outboundSeats.length + returnSeats.length,
    );
    const returnPayload = {
      company: returnTrip.company,
      serviceId: returnTrip.id,
      connectionId: returnConnectionId ?? undefined,
      originId: returnTrip.origin,
      destinationId: returnTrip.destination,
      ticketCount: returnSeats.length,
      totalAmount: returnSeats.reduce(
        (acc, s) => acc + (s.price || returnTrip.price || 0),
        0,
      ),
      seats: buildSeatPayloads(returnSeats, returnTrip, returnPax),
    };

    tasks.push(
      doSell(returnPayload, "Vuelta").then((result) => ({
        ...result,
        seatsObj: returnSeats,
        payload: returnPayload,
      })),
    );
  }

  const results = await Promise.allSettled(tasks);

  // Usamos un loop secuencial en lugar de forEach para poder manejar operaciones asíncronas de reintento
  for (const result of results) {
    if (result.status === "fulfilled") {
      let { res, data, label, seatsObj, payload } = result.value;

      let isSuccess = res.ok;
      let codigoError =
        data?.data?.raw?.CodigoError ||
        data?.error?.errorCode ||
        data?.errorCode;

      // Extract error code from stringified error if necessary
      if (!codigoError && data?.error && typeof data.error === "string") {
        const match = data.error.match(/CodigoError:\s*(\d+)/);
        if (match) codigoError = match[1];
      }

      // Intento de re-bloqueo y venta si el error es 233 (Asiento no disponible / Bloqueo expirado)
      if (
        (!isSuccess ||
          (codigoError !== undefined && String(codigoError) !== "0")) &&
        String(codigoError) === "233"
      ) {
        const retryResult = await retrySellWithNewBlock(
          payload,
          seatsObj,
          label,
        );
        if (retryResult) {
          res = retryResult.res;
          data = retryResult.data;
          isSuccess = res.ok;
          codigoError =
            data?.data?.raw?.CodigoError ||
            data?.error?.errorCode ||
            data?.errorCode;
        }
      }

      if (!isSuccess) {
        console.error(
          `[sell ${label}] Error HTTP en la venta:`,
          JSON.stringify(data),
        );
        continue;
      }

      if (codigoError !== undefined && String(codigoError) !== "0") {
        const desc = data?.data?.raw?.Descripcion || "Error desconocido";
        console.error(
          `[sell ${label}] GDS rechazó la venta (CodigoError=${codigoError}): ${desc}`,
        );
        continue;
      }

      const ticketNumbers: string[] = data?.data?.ticketNumbers ?? [];
      seatsObj.forEach((seat: Seat, i: number) => {
        if (ticketNumbers[i]) {
          ticketMap[`${label}-${seat.number}`] = ticketNumbers[i];
        }
      });
    } else {
      console.error("[sell] Error en red o excepción:", result.reason);
    }
  }

  return ticketMap;
}
