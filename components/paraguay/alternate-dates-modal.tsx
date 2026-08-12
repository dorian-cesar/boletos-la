"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, X, CalendarSearch, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface AltDateOption {
  date: Date;
  count: number;
}

interface AlternateDatesModalProps {
  isOpen: boolean;
  originalDate: Date | null;
  originId: string;
  destinationId: string;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export function AlternateDatesModal({
  isOpen,
  originalDate,
  originId,
  destinationId,
  onSelectDate,
  onClose,
}: AlternateDatesModalProps) {
  const [options, setOptions] = useState<AltDateOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && originalDate && originId && destinationId) {
      searchAlternateDates();
    }
  }, [isOpen, originalDate, originId, destinationId]);

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

  if (!isOpen) return null;

  const formattedOriginalDate = originalDate
    ? format(originalDate, "EEEE d 'de' MMMM", { locale: es })
    : "";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="bg-[#1a2332] w-full max-w-3xl rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden flex flex-col relative"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 via-white/5 to-transparent p-6 sm:p-8 flex items-start sm:items-center gap-6 border-b border-white/10 relative z-10">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-[0_0_35px_rgba(var(--primary),0.3)] border border-primary/50">
              <CalendarSearch className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div className="flex-1 pr-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1">
                Sin servicios para esta fecha
              </h2>
              <p className="text-neutral-300 text-base sm:text-lg">
                No hay servicios el <strong className="text-primary font-bold capitalize">{formattedOriginalDate}</strong>.
              </p>
            </div>
            
            <Button 
              onClick={onClose}
              className="absolute top-6 right-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 w-12 h-12 text-white flex-shrink-0 transition-colors p-0 flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8 min-h-[300px] flex flex-col justify-center relative z-10">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-14 h-14 text-primary animate-spin mb-6 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-wide">Buscando alternativas...</h3>
                <p className="text-neutral-400 text-base sm:text-lg text-center max-w-sm">
                  Estamos verificando disponibilidad en los próximos días para esta ruta.
                </p>
              </div>
            ) : options.length > 0 ? (
              <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Fechas cercanas con pasajes disponibles:
                  </h3>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full inline-block self-start sm:self-auto">
                    {options.length} {options.length === 1 ? 'Opción disponible' : 'Opciones encontradas'}
                  </span>
                </div>

                <div className="grid gap-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  {options.map((opt, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => onSelectDate(opt.date)}
                      className="h-auto p-5 sm:p-6 flex items-center justify-between bg-white/5 border-white/10 hover:border-primary hover:bg-primary/5 transition-all duration-300 group rounded-[1.5rem] shadow-sm hover:shadow-[0_8px_25px_rgba(var(--primary),0.15)] hover:scale-[1.01]"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 flex items-center justify-center text-white group-hover:text-primary transition-all duration-300">
                          <Calendar className="w-6 h-6 stroke-[2]" />
                        </div>
                        <div className="text-left">
                          <div className="text-xl sm:text-2xl font-bold text-white capitalize mb-1 group-hover:text-primary transition-colors">
                            {format(opt.date, "EEEE d 'de' MMMM", { locale: es })}
                          </div>
                          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {opt.count} {opt.count === 1 ? 'servicio disponible' : 'servicios disponibles'}
                          </div>
                        </div>
                      </div>

                      {/* Botón Acción Destacado */}
                      <div className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground font-bold text-base px-5 py-2.5 rounded-xl shadow-md group-hover:scale-105 transition-all duration-300">
                        <span>Seleccionar</span>
                        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div className="sm:hidden flex items-center justify-center bg-primary text-primary-foreground w-10 h-10 rounded-full group-hover:scale-105 transition-all">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 animate-in fade-in duration-500">
                <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 text-center">No hay alternativas cercanas</h3>
                <p className="text-neutral-400 text-base text-center max-w-sm mb-8">
                  Lo sentimos, no hemos encontrado servicios disponibles en los próximos días para esta ruta.
                </p>
                <Button 
                  onClick={onClose}
                  className="bg-primary text-primary-foreground hover:scale-[1.02] active:scale-95 shadow-[0_10px_25px_rgba(var(--primary),0.3)] px-10 py-6 rounded-[1.5rem] text-lg font-bold transition-all duration-300 flex items-center gap-3"
                >
                  Intentar otra búsqueda
                  <ArrowRight className="w-6 h-6 stroke-[2.5]" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
