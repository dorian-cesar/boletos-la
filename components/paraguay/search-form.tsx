"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Bus,
  ChevronDown,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import { useBookingStore } from "@/lib/booking-store";
import { useStops } from "@/lib/hooks/use-stops";
import { useAvailableDestinations } from "@/lib/hooks/use-available-destinations";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { createPortal } from "react-dom";
import Image from "next/image";

// Modal Component
function ComingSoonModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  // Usamos portal para renderizar directamente en el body
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative max-w-4xl w-full bg-gradient-to-br from-[#1a2332] to-[#0f1419] rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-[150px] h-[150px] bg-secondary/20 rounded-full blur-[60px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-8 mt-4">
            <Image
              src="/logos/logo-boletos.png"
              alt="Logo Boletos.la"
              width={135}
              height={100}
            />
          </div>

          {/* Title */}
          <h3 className="text-3xl font-bold text-gray-300 mb-4">
            ¡Próximamente en <span className="text-primary">Paraguay</span>!
          </h3>

          {/* Description */}
          <p className="text-gray-400 mb-8">
            Estamos trabajando para traerte la mejor experiencia de compra de
            boletos de bus. Muy pronto podrás reservar tus viajes por todo el
            país.
          </p>

          {/* Button */}
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>,
    document.body, // Renderizamos directamente en el body
  );
}

export function ParaguaySearchForm() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    setTripType,
    setOrigin,
    setDestination,
    setOriginTitle,
    setDestinationTitle,
    swapTitles,
    setDepartureDate,
    setReturnDate,
    originTitle,
    destinationTitle,
  } = useBookingStore();

  const { stops, loading: stopsLoading, error: stopsError } = useStops();
  const { availableDestinations, loading: destLoading } = useAvailableDestinations(
    origin || null,
    departureDate || null
  );

  const getStopDynamicCount = (stopId: string | number) => {
    const destData = availableDestinations.find(d => {
      if (typeof d === 'string') return d === String(stopId);
      return String((d as any).destinationId) === String(stopId);
    });
    const isObject = destData && typeof destData === 'object';
    if (!isObject) return 0;

    if ((destData as any).times && departureDate) {
      const times = (destData as any).times;
      const todayDate = new Date();
      const tzOffset = todayDate.getTimezoneOffset() * 60000;
      const localISOToday = (new Date(todayDate.getTime() - tzOffset)).toISOString().slice(0, 10);
      const selectedISODate = new Date(departureDate).toISOString().slice(0, 10);

      if (selectedISODate === localISOToday) {
        const hours = String(todayDate.getHours()).padStart(2, '0');
        const minutes = String(todayDate.getMinutes()).padStart(2, '0');
        const currentHourMinute = `${hours}:${minutes}`;
        return times.filter((t: string) => t >= currentHourMinute).length;
      } else if (selectedISODate > localISOToday) {
        return times.length;
      }
    }
    return (destData as any).serviceCount || 0;
  };

  const filteredStops = useMemo(() => {
    if (!origin || !departureDate) return stops;
    if (destLoading) return [];

    // Si llega vacío (0), no filtramos agresivamente
    if (availableDestinations.length === 0) return stops;

    // Filtramos comparando los IDs
    return stops
      .filter(stop => {
        return availableDestinations.some(d => {
          if (typeof d === 'string') return d === String(stop.id);
          return String((d as any).destinationId) === String(stop.id);
        });
      })
      .sort((a, b) => {
        const countA = getStopDynamicCount(a.id);
        const countB = getStopDynamicCount(b.id);

        // 1. Destinos con servicios disponibles primero
        if (countA > 0 && countB === 0) return -1;
        if (countA === 0 && countB > 0) return 1;

        // 2. Mayor cantidad de servicios primero
        if (countA > 0 && countB > 0 && countB !== countA) {
          return countB - countA;
        }

        // 3. Alfabético por nombre
        return a.name.localeCompare(b.name);
      });
  }, [stops, origin, departureDate, destLoading, availableDestinations]);



  const hasInitializedDefault = useRef(false);

  // Forzar Asunción y fecha actual obligatoriamente al cargar la página (ignorar persistencia anterior)
  useEffect(() => {
    if (!mounted || stops.length === 0) return;

    if (!hasInitializedDefault.current) {
      const asuncion = stops.find(s => s.name.toLowerCase().includes('asunción') || s.name.toLowerCase().includes('asuncion'));
      if (asuncion) {
        setOrigin(asuncion.id);
        setOriginTitle(asuncion.name);
      }

      const d = new Date();
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 10);
      setDepartureDate(localISOTime);

      hasInitializedDefault.current = true;
    } else {
      if (origin && !originTitle) {
        const stop = stops.find((s) => String(s.id) === String(origin));
        if (stop) setOriginTitle(stop.name);
      }

      if (destination && !destinationTitle) {
        const stop = stops.find((s) => String(s.id) === String(destination));
        if (stop) setDestinationTitle(stop.name);
      }
    }
  }, [
    mounted,
    stops,
    origin,
    departureDate,
    destination,
    originTitle,
    destinationTitle,
    setOrigin,
    setDepartureDate,
    setOriginTitle,
    setDestinationTitle,
  ]);

  const handleSearch = () => {
    if (origin && destination && departureDate) {
      router.push("/paraguay/booking/services");
    }
  };

  const swapCities = () => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
    swapTitles();
  };

  // Función helper para parsear fechas sin problemas de zona horaria
  const parseDate = (dateString: string) => {
    return parse(dateString, "yyyy-MM-dd", new Date());
  };

  // Helper para obtener hoy sin hora (medianoche local)
  const today = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  if (!mounted) {
    return (
      <div className="w-full flex justify-center px-4">
        <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/30 w-full max-w-7xl h-[400px] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4 text-gray-400">
            <Bus className="h-12 w-12 text-gray-400" />
            <p>Preparando buscador...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="w-full flex justify-center px-4 animate-scale-in"
        style={{ animationDelay: "0.6s" }}
      >
        <div className="bg-white/50 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-8 border border-white/60 relative overflow-hidden w-full max-w-7xl">
          {/* Efecto de vidrio con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

          {/* Trip Type Toggle */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="inline-flex bg-slate-200/50 backdrop-blur-sm rounded-full p-1 border border-slate-300/50">
              <button
                onClick={() => setTripType("one-way")}
                className={cn(
                  "px-6 py-2 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 relative",
                  tripType === "one-way"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
                )}
              >
                Solo Ida
              </button>
              <button
                onClick={() => setTripType("round-trip")}
                className={cn(
                  "px-6 py-2 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 relative",
                  tripType === "round-trip"
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
                )}
              >
                Ida y Vuelta
              </button>
            </div>
          </div>

          {/* Search Fields - Responsive con mismo ancho */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-3 relative z-10 items-stretch lg:items-end">
            {/* Origin */}
            <div className="flex-1 min-w-0">
              <Label className="text-lg sm:text-xl lg:text-base font-extrabold text-slate-900 mb-2 block [text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]">
                Origen
              </Label>
              <Popover
                open={originOpen && !stopsLoading}
                onOpenChange={(open) => {
                  if (!stopsLoading) setOriginOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={stopsLoading}
                    className={cn(
                      "w-full justify-between h-14 text-left font-normal transition-all duration-300 bg-white border-slate-300 shadow-sm hover:border-primary/50 hover:bg-slate-50",
                      stopsLoading ? "cursor-not-allowed opacity-60" : "",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="h-5 w-5 text-primary/70 flex-shrink-0" />
                      <span className={cn("text-gray-900 text-lg lg:text-base font-semibold truncate")}>
                        {stopsLoading
                          ? "Cargando ciudades..."
                          : origin
                            ? stops.find((c) => String(c.id) === String(origin))
                              ?.name
                            : "Selecciona origen"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 backdrop-blur-md bg-white/30 border-white/40 min-w-[var(--radix-popover-trigger-width)]"
                  align="start"
                >
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Buscá ciudad..."
                      className="h-12 bg-transparent border-b border-white/40 text-gray-700 placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty className="text-gray-500">
                        {stopsLoading || destLoading
                          ? "Cargando ciudades..."
                          : stopsError
                            ? "Error al cargar ciudades"
                            : filteredStops.length === 0 && origin
                              ? "No hay rutas disponibles para esta fecha"
                              : availableDestinations.length === 0
                                ? "No existen servicios disponibles para fechas cercanas desde este origen."
                                : "No se encontró la ciudad."}
                      </CommandEmpty>
                      <CommandGroup className="bg-transparent">
                        {stops.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setOrigin(city.id);
                              setOriginTitle(city.name);
                              setDestination("");
                              setDestinationTitle("");
                              setOriginOpen(false);
                            }}
                            className="cursor-pointer py-3 text-white hover:bg-white/20"
                          >
                            <MapPin className="h-4 w-4 mr-2 text-white flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                            <div className="min-w-0">
                              <p className="font-semibold truncate tracking-wide [text-shadow:_0_1px_3px_rgb(0_0_0_/_80%)]">
                                {city.name}
                              </p>


                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Swap Button - Mobile (debajo de origen) */}
            <div className="lg:hidden flex items-center justify-center mt-3">
              <button
                onClick={swapCities}
                disabled={stopsLoading}
                className={cn(
                  "w-10 h-10 flex items-center justify-center text-slate-600 rounded-full shadow-sm transition-all duration-300 bg-white border border-slate-300",
                  stopsLoading
                    ? "cursor-not-allowed opacity-50"
                    : "hover:scale-110 hover:text-primary hover:border-primary/40 hover:bg-slate-50",
                )}
                aria-label="Intercambiar origen y destino"
              >
                <ArrowRightLeft className="h-5 w-5 rotate-90" />
              </button>
            </div>

            {/* Swap Button - Desktop */}
            <div className="hidden lg:flex items-center justify-center w-[52px] flex-shrink-0">
              <div className="h-14 flex items-center">
                <button
                  onClick={swapCities}
                  disabled={stopsLoading}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-slate-600 rounded-full shadow-sm transition-all duration-300 bg-white border border-slate-300",
                    stopsLoading
                      ? "cursor-not-allowed opacity-50"
                      : "hover:scale-110 hover:text-primary hover:border-primary/40 hover:bg-slate-50",
                  )}
                  aria-label="Intercambiar origen y destino"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Destination */}
            <div className="flex-1 min-w-0">
              <Label className="text-lg sm:text-xl lg:text-base font-extrabold text-slate-900 mb-2 block [text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]">
                Destino
              </Label>
              <Popover
                open={destinationOpen && !stopsLoading}
                onOpenChange={(open) => {
                  if (!stopsLoading) setDestinationOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={stopsLoading}
                    className={cn(
                      "w-full justify-between h-14 text-left font-normal transition-all duration-300 bg-white border-slate-300 shadow-sm hover:border-primary/50 hover:bg-slate-50",
                      stopsLoading ? "cursor-not-allowed opacity-60" : "",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="h-5 w-5 text-primary/70 flex-shrink-0" />
                      <span className={cn("text-gray-900 text-lg lg:text-base font-semibold truncate")}>
                        {stopsLoading
                          ? "Cargando ciudades..."
                          : destination
                            ? stops.find(
                              (c) => String(c.id) === String(destination),
                            )?.name
                            : "Selecciona destino"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full p-0 backdrop-blur-md bg-white/30 border-white/40 min-w-[var(--radix-popover-trigger-width)]"
                  align="start"
                >
                  <Command className="bg-transparent">
                    <CommandInput
                      placeholder="Buscá ciudad..."
                      className="h-12 bg-transparent border-b border-white/40 text-gray-700 placeholder:text-gray-500"
                    />
                    <CommandList>
                      <CommandEmpty className="text-gray-500">
                        {stopsLoading
                          ? "Cargando ciudades..."
                          : stopsError
                            ? "Error al cargar ciudades"
                            : "No se encontró la ciudad."}
                      </CommandEmpty>
                      <CommandGroup className="bg-transparent">
                        {originTitle && (
                          <div className="px-2 py-2 text-xs font-semibold text-gray-700 bg-white/40 backdrop-blur-sm rounded-lg mb-2 flex items-center gap-2 border border-white/50 shadow-sm">
                            <MapPin className="h-3.5 w-3.5" />
                            Rutas disponibles desde {originTitle}
                          </div>
                        )}
                        {filteredStops
                          .filter((c) => String(c.id) !== String(origin))
                          .map((city) => (
                            <CommandItem
                              key={city.id}
                              value={city.name}
                              onSelect={() => {
                                setDestination(city.id);
                                setDestinationTitle(city.name);
                                setDestinationOpen(false);
                              }}
                              className="cursor-pointer py-3 text-white hover:bg-white/20"
                            >
                              <MapPin className="h-4 w-4 mr-2 text-white flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                              <div className="min-w-0">
                                <p className="font-semibold truncate tracking-wide [text-shadow:_0_1px_3px_rgb(0_0_0_/_80%)]">
                                  {city.name}
                                </p>
                                {(() => {
                                  const destData = availableDestinations.find(d => {
                                    if (typeof d === 'string') return d === String(city.id);
                                    return String((d as any).destinationId) === String(city.id);
                                  });
                                  const isObject = destData && typeof destData === 'object';
                                  const dynamicCount = getStopDynamicCount(city.id);

                                  if (isObject) {
                                    if (dynamicCount > 0) {
                                      return (
                                        <p className="text-xs text-white/70 mt-0.5">
                                          {dynamicCount} {dynamicCount === 1 ? 'servicio' : 'servicios'}
                                        </p>
                                      );
                                    } else if ((destData as any).times?.length > 0) {
                                      return (
                                        <p className="text-xs text-red-400 font-medium mt-0.5">
                                          Salidas finalizadas por hoy
                                        </p>
                                      );
                                    }
                                  }
                                  return null;
                                })()}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha de Ida */}
            <div className="flex-1 min-w-0">
              <Label className="text-lg sm:text-xl lg:text-base font-extrabold text-slate-900 mb-2 block [text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]">
                Fecha de Ida
              </Label>
              <Popover
                open={departureDateOpen}
                onOpenChange={setDepartureDateOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal transition-all duration-300 bg-white border-slate-300 shadow-sm hover:border-primary/50 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className="h-5 w-5 text-primary/70 flex-shrink-0" />
                      <span
                        className={cn(
                          !departureDate && "text-gray-400",
                          "text-gray-900 text-lg lg:text-base font-semibold truncate",
                        )}
                      >
                        {departureDate
                          ? format(parseDate(departureDate), "dd MMM yyyy", {
                            locale: es,
                          })
                          : "Selecciona fecha"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 backdrop-blur-md bg-white/30 border-white/40"
                  align="start"
                >
                  <CalendarComponent
                    mode="single"
                    selected={
                      departureDate ? parseDate(departureDate) : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setDepartureDate(format(date, "yyyy-MM-dd"));
                        setDepartureDateOpen(false);
                      }
                    }}
                    disabled={(date) => date < today()}
                    initialFocus
                    className="bg-transparent"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Fecha de Vuelta */}
            {tripType === "round-trip" && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-5 duration-500">
                <Label className="text-lg sm:text-xl lg:text-base font-extrabold text-slate-900 mb-2 block [text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]">
                  Fecha de Vuelta
                </Label>
                <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-14 text-left font-normal transition-all duration-300 bg-white border-slate-300 shadow-sm hover:border-primary/50 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-5 w-5 text-primary/70 flex-shrink-0" />
                        <span
                          className={cn(
                            !returnDate && "text-gray-400",
                            "text-gray-900 text-lg lg:text-base font-semibold truncate",
                          )}
                        >
                          {returnDate
                            ? format(parseDate(returnDate), "dd MMM yyyy", {
                              locale: es,
                            })
                            : "Selecciona fecha"}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 backdrop-blur-md bg-white/30 border-white/40"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={returnDate ? parseDate(returnDate) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setReturnDate(format(date, "yyyy-MM-dd"));
                          setReturnDateOpen(false);
                        }
                      }}
                      disabled={(date) =>
                        date <
                        (departureDate ? parseDate(departureDate) : today())
                      }
                      initialFocus
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="mt-8 flex justify-center relative z-10">
            <Button
              onClick={handleSearch}
              disabled={
                stopsLoading ||
                !origin ||
                !destination ||
                !departureDate ||
                (tripType === "round-trip" && !returnDate)
              }
              className="bg-primary hover:bg-primary/90 text-white h-14 px-12 text-lg sm:text-xl lg:text-lg font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-primary"
            >
              Buscar Boletos
              <ArrowRight className="h-5 w-5 shrink-0 text-white" />
            </Button>
          </div>
        </div>
      </div>
      <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
