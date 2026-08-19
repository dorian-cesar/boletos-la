import { useState, useEffect } from "react";

export interface AvailableDestination {
  destinationId: string;
  times: string[];
  lastServiceTime: string;
  serviceCount: number;
}

export function useAvailableDestinations(originId: string | null, date: string | null) {
  const [availableDestinations, setAvailableDestinations] = useState<(AvailableDestination | string)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDestinations() {
      if (!originId || !date) {
        setAvailableDestinations([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/gds/delta/available-destinations?originId=${originId}&date=${date}`);
        
        if (!res.ok) {
          throw new Error("Error fetching destinations");
        }
        
        const json = await res.json();
        
        if (mounted) {
          setAvailableDestinations(json.data?.destinations || []);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message);
          setAvailableDestinations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchDestinations();

    return () => {
      mounted = false;
    };
  }, [originId, date]);

  return { availableDestinations, loading, error };
}
