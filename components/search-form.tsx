"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Bus,
  ChevronDown,
  ArrowRightLeft,
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
import { useBookingStore, cities } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

export function SearchForm() {
  const router = useRouter();
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);

  const {
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    setTripType,
    setOrigin,
    setDestination,
    setDepartureDate,
    setReturnDate,
  } = useBookingStore();

  const handleSearch = () => {
    if (origin && destination && departureDate) {
      router.push("/booking/services");
    }
  };

  const swapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Función helper para parsear fechas sin problemas de zona horaria
  const parseDate = (dateString: string) => {
    return parse(dateString, "yyyy-MM-dd", new Date());
  };

  return (
    <div
      className="w-full flex justify-center px-4 animate-scale-in"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl p-6 lg:p-8 border border-white/30 relative overflow-hidden w-full max-w-7xl">
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
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/5",
              )}
            >
              Solo Ida
            </button>
            <button
              onClick={() => setTripType("round-trip")}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-300 relative",
                tripType === "round-trip"
                  ? "bg-white/20 text-white shadow-lg"
                  : "text-white/80 hover:text-white hover:bg-white/5",
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
            <Label className="text-sm font-medium text-white/90 mb-2 block">
              Origen
            </Label>
            <Popover open={originOpen} onOpenChange={setOriginOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-14 text-left font-normal bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="h-5 w-5 text-white flex-shrink-0" />
                    <span
                      className={cn(
                        !origin && "text-white/70",
                        "text-white truncate",
                      )}
                    >
                      {origin
                        ? cities.find((c) => c.id === origin)?.name
                        : "Seleccionar ciudad"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/70 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 backdrop-blur-md bg-white/30 border-white/40 min-w-[var(--radix-popover-trigger-width)]"
                align="start"
              >
                <Command className="bg-transparent">
                  <CommandInput
                    placeholder="Buscar ciudad..."
                    className="h-12 bg-transparent border-b border-white/40 text-white placeholder:text-white/70"
                  />
                  <CommandList>
                    <CommandEmpty className="text-white/70">
                      No se encontró la ciudad.
                    </CommandEmpty>
                    <CommandGroup className="bg-transparent">
                      {cities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.name}
                          onSelect={() => {
                            setOrigin(city.id);
                            setOriginOpen(false);
                          }}
                          className="cursor-pointer py-3 text-white hover:bg-white/20"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-white flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{city.name}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Swap Button - Desktop */}
          <div className="hidden lg:flex items-center justify-center w-[52px] flex-shrink-0">
            <div className="h-14 flex items-center">
              <button
                onClick={swapCities}
                className="w-10 h-10 flex items-center justify-center bg-white/30 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-white/40 hover:bg-white/40"
                aria-label="Intercambiar origen y destino"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Destination */}
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium text-white/90 mb-2 block">
              Destino
            </Label>
            <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-14 text-left font-normal bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapPin className="h-5 w-5 text-white flex-shrink-0" />
                    <span
                      className={cn(
                        !destination && "text-white/70",
                        "text-white truncate",
                      )}
                    >
                      {destination
                        ? cities.find((c) => c.id === destination)?.name
                        : "Seleccionar ciudad"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/70 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 backdrop-blur-md bg-white/30 border-white/40 min-w-[var(--radix-popover-trigger-width)]"
                align="start"
              >
                <Command className="bg-transparent">
                  <CommandInput
                    placeholder="Buscar ciudad..."
                    className="h-12 bg-transparent border-b border-white/40 text-white placeholder:text-white/70"
                  />
                  <CommandList>
                    <CommandEmpty className="text-white/70">
                      No se encontró la ciudad.
                    </CommandEmpty>
                    <CommandGroup className="bg-transparent">
                      {cities
                        .filter((c) => c.id !== origin)
                        .map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              setDestination(city.id);
                              setDestinationOpen(false);
                            }}
                            className="cursor-pointer py-3 text-white hover:bg-white/20"
                          >
                            <MapPin className="h-4 w-4 mr-2 text-white flex-shrink-0" />
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
            <Label className="text-sm font-medium text-white/90 mb-2 block">
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
                    <Calendar className="h-5 w-5 text-white flex-shrink-0" />
                    <span
                      className={cn(
                        !departureDate && "text-white/70",
                        "text-white truncate",
                      )}
                    >
                      {departureDate
                        ? format(parseDate(departureDate), "dd MMM yyyy", {
                            locale: es,
                          })
                        : "Seleccionar"}
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
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="bg-transparent"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de Vuelta */}
          {tripType === "round-trip" && (
            <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-5 duration-500">
              <Label className="text-sm font-medium text-white/90 mb-2 block">
                Fecha de Vuelta
              </Label>
              <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal bg-white/30 border-white/40 hover:border-white/60 hover:bg-white/40 transition-all duration-300 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Calendar className="h-5 w-5 text-white flex-shrink-0" />
                      <span
                        className={cn(
                          !returnDate && "text-white/70",
                          "text-white truncate",
                        )}
                      >
                        {returnDate
                          ? format(parseDate(returnDate), "dd MMM yyyy", {
                              locale: es,
                            })
                          : "Seleccionar"}
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
                      (departureDate ? parseDate(departureDate) : new Date())
                    }
                    initialFocus
                    className="bg-transparent"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Swap Button para móvil */}
        <div className="lg:hidden flex items-center justify-center my-4 relative z-10">
          <button
            onClick={swapCities}
            className="w-10 h-10 flex items-center justify-center bg-white/30 text-white rounded-full shadow-lg hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-white/40 hover:bg-white/40"
            aria-label="Intercambiar origen y destino"
          >
            <ArrowRightLeft className="h-5 w-5 rotate-90" />
          </button>
        </div>

        {/* Search Button */}
        <div className="mt-8 flex justify-center relative z-10">
          <Button
            onClick={handleSearch}
            disabled={
              !origin ||
              !destination ||
              !departureDate ||
              (tripType === "round-trip" && !returnDate)
            }
            className="bg-white/30 hover:bg-white/40 text-white h-14 px-12 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm border border-white/40 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-white/30"
          >
            Buscar Pasajes
            <ArrowRight className="h-5 w-5 ml-2 shrink-0" />
          </Button>
        </div>
      </div>
    </div>
  );
}
