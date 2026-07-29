import { useState, useEffect } from "react";
import { Trip } from "@/lib/booking-store";

interface UseSearchParams {
  originId: string;
  destinationId: string;
  date: string;
}

interface UseSearchResult {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

export function useSearch({
  originId,
  destinationId,
  date,
}: UseSearchParams): UseSearchResult {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originId || !destinationId || !date) return;

    let cancelled = false;

    async function fetchSearch() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ originId, destinationId, date });
        const res = await fetch(`/api/gds/search?${params.toString()}`);

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.error || "Error en la búsqueda");
        }

        const rawTrips = json.data.trips || [];

        const mapped: Trip[] = rawTrips.map((t: any) => {
          // Extraer solo la hora (quitar la fecha)
          const depTime =
            t.departureDisplay?.split(" ")[1] || t.departureDisplay || "";
          const arrTime =
            t.arrivalDisplay?.split(" ")[1] || t.arrivalDisplay || "";

          // Calculate duration
          let durationStr = "N/A";

          if (t.departureDisplay && t.arrivalDisplay) {
            try {
              const depTimeStr = t.departureDisplay.split(" ")[1]; // "18:45"
              const arrTimeStr = t.arrivalDisplay.split(" ")[1]; // "08:45"

              const [depH, depM] = depTimeStr.split(":").map(Number);
              const [arrH, arrM] = arrTimeStr.split(":").map(Number);

              const depTotal = depH * 60 + depM;
              let arrTotal = arrH * 60 + arrM;

              // Si llega "antes", es día siguiente
              if (arrTotal < depTotal) {
                arrTotal += 24 * 60;
              }

              const diffMins = arrTotal - depTotal;

              const h = Math.floor(diffMins / 60);
              const m = diffMins % 60;

              durationStr = `${h}h ${m}m`;
            } catch (e) {
              console.error("Error calculating duration:", e);
              durationStr = "Variable";
            }
          }

          // Default amenities
          const amenities = ["Aire Acondicionado", "Baño", "TV"];
          if (
            t.serviceClassCode === "CA" ||
            t.serviceClass?.toLowerCase().includes("cama")
          ) {
            amenities.push("WiFi");
            amenities.push("Enchufes USB");
          }

          return {
            id: t.id,
            origin: t.origin.id,
            destination: t.destination.id,
            date: t.departureTime ? t.departureTime.split("T")[0] : date,
            departureTime: depTime,
            arrivalTime: arrTime,
            duration: durationStr,
            price: Number(t.price ?? t.amount ?? t.fare ?? t.totalAmount ?? 0),
            busType: t.serviceClass || "Bus",
            company: t.company,
            amenities,
            availableSeats: t.availableSeats || 0,
          };
        });

        if (!cancelled) {
          setTrips(mapped);
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

    fetchSearch();

    return () => {
      cancelled = true;
    };
  }, [originId, destinationId, date]);

  return { trips, loading, error };
}
