"use client";

import { useState, useEffect } from "react";
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

  const { stops, loading: stopsLoading, error: stopsError } = useStops();

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

  // Populate titles if they are missing but IDs exist (e.g. on page load with persisted state)
  useEffect(() => {
    if (!mounted || stops.length === 0) return;

    if (origin && !originTitle) {
      const stop = stops.find((s) => String(s.id) === String(origin));
      if (stop) setOriginTitle(stop.name);
    }
    if (destination && !destinationTitle) {
      const stop = stops.find((s) => String(s.id) === String(destination));
      if (stop) setDestinationTitle(stop.name);
    }
  }, [
    mounted,
    stops,
    origin,
    destination,
    originTitle,
    destinationTitle,
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
        <div className="bg-white/40 backdrop-blur-md rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/30 relative overflow-hidden w-full max-w-7xl">
          {/* Efecto de vidrio con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

          {/* Trip Type Toggle */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="inline-flex bg-black/20 backdrop-blur-sm rounded-full p-1 border border-white/10">
              <button
                onClick={() => setTripType("one-way")}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all duration-300 relative",
                  tripType === "one-way"
                    ? "bg-white/20 text-gray-800 shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/5",
                )}
              >
                Solo Ida
              </button>
              <button
                onClick={() => setTripType("round-trip")}
                className={cn(
                  "px-6 py-2 rounded-full font-medium transition-all duration-300 relative",
                  tripType === "round-trip"
                    ? "bg-white/20 text-gray-800 shadow-lg"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/5",
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
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
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
                      "w-full justify-between h-14 text-left font-normal transition-all duration-300 backdrop-blur-sm",
                      stopsLoading
                        ? "bg-white/20 border-white/30 cursor-not-allowed opacity-60"
                        : "bg-white/10 border-white/40 hover:border-white/60 hover:bg-white/40",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <span className={cn("text-gray-700 truncate")}>
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
                        {stopsLoading
                          ? "Cargando ciudades..."
                          : stopsError
                            ? "Error al cargar ciudades"
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
                              setOriginOpen(false);
                            }}
                            className="cursor-pointer py-3 text-gray-700 hover:bg-white/20"
                          >
                            <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">
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
                  "w-10 h-10 flex items-center justify-center text-gray-600 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/40",
                  stopsLoading
                    ? "bg-white/20 cursor-not-allowed opacity-50"
                    : "bg-white/30 hover:scale-110 hover:bg-white/40",
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
                    "w-10 h-10 flex items-center justify-center text-gray-600 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/40",
                    stopsLoading
                      ? "bg-white/20 cursor-not-allowed opacity-50"
                      : "bg-white/30 hover:scale-110 hover:bg-white/40",
                  )}
                  aria-label="Intercambiar origen y destino"
                >
                  <ArrowRightLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Destination */}
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
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
                      "w-full justify-between h-14 text-left font-normal transition-all duration-300 backdrop-blur-sm",
                      stopsLoading
                        ? "bg-white/20 border-white/30 cursor-not-allowed opacity-60"
                        : "bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <span className={cn("text-gray-700 truncate")}>
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
                        {stops
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
                              className="cursor-pointer py-3 text-gray-700 hover:bg-white/20"
                            >
                              <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium truncate">
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

            {/* Fecha de Ida */}
            <div className="flex-1 min-w-0">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Fecha de Ida
              </Label>
              <Popover
                open={departureDateOpen}
                onOpenChange={setDepartureDateOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <span
                        className={cn(
                          !departureDate && "text-gray-500",
                          "text-gray-700 truncate",
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fecha de Vuelta
                </Label>
                <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-14 text-left font-normal bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40 transition-all duration-300 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                        <span
                          className={cn(
                            !returnDate && "text-gray-500",
                            "text-gray-700 truncate",
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
              className="bg-white/30 hover:bg-white/40 text-gray-700 h-12 px-12 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/40 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-white/30"
            >
              Buscar Boletos
              <ArrowRight className="h-5 w-5 shrink-0 text-gray-700" />
            </Button>
          </div>
        </div>
      </div>
      <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
