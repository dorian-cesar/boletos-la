import { useEffect, useState } from "react";

export interface Stop {
  id: string;
  name: string;
}

interface UseStopsResult {
  stops: Stop[];
  loading: boolean;
  error: string | null;
}

export function useStops(): UseStopsResult {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStops() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/gds/stops");

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();

        // Estructura: json.data.stops[{ Id, Descripcion }]
        const rawStops: { Id: string; Descripcion: string }[] =
          json?.data?.stops ?? [];

        const mapped: Stop[] = rawStops.map((s) => ({
          id: s.Id,
          name: s.Descripcion,
        }));

        if (!cancelled) {
          setStops(mapped);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Error desconocido");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStops();

    return () => {
      cancelled = true;
    };
  }, []);

  return { stops, loading, error };
}
