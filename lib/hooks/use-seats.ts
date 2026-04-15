import { useState, useEffect } from "react";
import { Seat } from "@/lib/booking-store";

interface UseSeatsParams {
  serviceId: string;
  originId: string;
  destinationId: string;
}

interface UseSeatsResult {
  seats: Seat[];
  loading: boolean;
  error: string | null;
}

export function useSeats({ serviceId, originId, destinationId }: UseSeatsParams): UseSeatsResult {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId || !originId || !destinationId) return;

    let cancelled = false;

    async function fetchSeats() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ serviceId, originId, destinationId });
        const res = await fetch(`/api/gds/seats?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        
        if (json.status !== "success") {
          throw new Error(json.error?.message || "Error al obtener disponibilidad de asientos");
        }

        const floors = json.data.floors || [];
        const allSeats: Seat[] = [];

        floors.forEach((f: any) => {
          f.seats.forEach((s: any) => {
            allSeats.push({
              id: s.layout || String(s.id),
              number: s.number || "??",
              row: s.row,
              column: s.column,
              floor: f.floor,
              type: "standard", // Simplificado a standard según requerimiento
              status: s.status === "available" ? "available" : "occupied",
              price: s.price || 0, // El backend podría no devolver el precio aquí todavía
            });
          });
        });

        if (!cancelled) {
          setSeats(allSeats);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Error desconocido");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSeats();

    return () => {
      cancelled = true;
    };
  }, [serviceId, originId, destinationId]);

  return { seats, loading, error };
}
