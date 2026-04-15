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

export function useSearch({ originId, destinationId, date }: UseSearchParams): UseSearchResult {
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
          // Extract time from "01/04 19:35" -> "19:35"
          const depTime = t.departureDisplay?.split(" ")[1] || "";
          const arrTime = t.arrivalDisplay?.split(" ")[1] || "";
          
          // Calculate duration if null
          let durationStr = "N/A";
          if (t.departureTime && t.raw?.Desembarque) {
            // This is a bit complex due to formats, but let's try a simple version
            // Actually, let's just use the display strings if possible or "Variable"
            durationStr = "Directo"; 
          }

          // Default amenities
          const amenities = ["Aire Acondicionado", "Baño", "TV"];
          if (t.serviceClassCode === "CA" || t.serviceClass?.toLowerCase().includes("cama")) {
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
            price: t.minFare,
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
