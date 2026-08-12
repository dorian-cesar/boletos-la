"use client";

import React, { useEffect, useState } from "react";
import { Calendar, CalendarSearch, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AltDateOption {
  date: Date;
  count: number;
}

interface AlternateDatesInlineProps {
  originalDate: Date | null;
  originId: string;
  destinationId: string;
  onSelectDate: (date: Date) => void;
}

export function AlternateDatesInline({
  originalDate,
  originId,
  destinationId,
  onSelectDate,
}: AlternateDatesInlineProps) {
  const [options, setOptions] = useState<AltDateOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (originalDate && originId && destinationId) {
      searchAlternateDates();
    }
  }, [originalDate, originId, destinationId]);

  const searchAlternateDates = async () => {
    setIsLoading(true);
    setOptions([]);

    const nextDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(originalDate!);
      d.setDate(d.getDate() + i + 1);
      return d;
    });

    const promises = nextDays.map(async (d) => {
      const dStr = format(d, "yyyy-MM-dd");
      const params = new URLSearchParams({ originId, destinationId, date: dStr });
      
      let retries = 2; // Resiliencia anti-bloqueos
      while (retries >= 0) {
        try {
          const res = await fetch(`/api/gds/search?${params.toString()}`);
          if (!res.ok) throw new Error("HTTP " + res.status);
          
          const json = await res.json();
          if (json.success) {
             const tripsCount = json.data?.trips?.length || 0;
             return { date: d, count: tripsCount };
          }
          throw new Error("No success");
        } catch (error) {
          if (retries === 0) return { date: d, count: 0 };
          retries--;
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      return { date: d, count: 0 };
    });

    const results = await Promise.all(promises);
    setOptions(results.filter((r) => r.count > 0));
    setIsLoading(false);
  };

  const formattedOriginalDate = originalDate
    ? format(originalDate, "EEEE d 'de' MMMM", { locale: es })
    : "";

  return (
    <div className="w-full bg-background/5 rounded-3xl border border-background/10 overflow-hidden animate-in fade-in duration-500 max-w-3xl mx-auto mt-4 mb-10">
      {/* Header Inline */}
      <div className="bg-gradient-to-r from-primary/10 via-transparent to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-background/10 text-center sm:text-left">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
          <CalendarSearch className="w-8 h-8 stroke-[2.5]" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-background tracking-tight mb-1">
            Sin servicios para esta fecha
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            No hay servicios el <strong className="text-primary font-bold capitalize">{formattedOriginalDate}</strong>.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 min-h-[250px] flex flex-col justify-center relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-background mb-2">Buscando alternativas...</h3>
            <p className="text-muted-foreground text-sm sm:text-base text-center max-w-sm">
              Verificando disponibilidad en los próximos 7 días para esta ruta.
            </p>
          </div>
        ) : options.length > 0 ? (
          <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-background text-center sm:text-left">
                Fechas cercanas disponibles:
              </h3>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full inline-block self-center sm:self-auto">
                {options.length} {options.length === 1 ? 'Opción' : 'Opciones'}
              </span>
            </div>

            <div className="grid gap-3">
              {options.map((opt, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => onSelectDate(opt.date)}
                  className="h-auto p-4 sm:p-5 flex items-center justify-between bg-background/5 border-background/20 hover:border-primary hover:bg-primary/5 transition-all duration-300 group rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background/10 border border-background/20 group-hover:bg-primary/20 group-hover:border-primary/40 flex items-center justify-center text-background group-hover:text-primary transition-all duration-300">
                      <Calendar className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="text-left">
                      <div className="text-lg sm:text-xl font-semibold text-background capitalize mb-1 group-hover:text-primary transition-colors">
                        {format(opt.date, "EEEE d 'de' MMMM", { locale: es })}
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-400 font-medium">
                        {opt.count} {opt.count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                      </div>
                    </div>
                  </div>

                  {/* Botón Acción Destacado */}
                  <div className="hidden sm:flex items-center gap-2 bg-primary/10 text-primary font-semibold text-sm px-4 py-2 rounded-lg group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <span>Seleccionar</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="sm:hidden flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-2xl bg-background/5 border border-background/10 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-background mb-2 text-center">No hay alternativas cercanas</h3>
            <p className="text-muted-foreground text-sm sm:text-base text-center max-w-sm mb-6">
              Lo sentimos, no hemos encontrado servicios disponibles en los próximos 7 días para esta ruta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
