"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Bus,
  ChevronDown,
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
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBookingStore, cities } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function SearchForm() {
  const router = useRouter();
  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);
  const [departureDateOpen, setDepartureDateOpen] = useState(false);
  const [returnDateOpen, setReturnDateOpen] = useState(false);
  const [passengersOpen, setPassengersOpen] = useState(false);

  const {
    tripType,
    origin,
    destination,
    departureDate,
    returnDate,
    passengers,
    setTripType,
    setOrigin,
    setDestination,
    setDepartureDate,
    setReturnDate,
    setPassengers,
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

  return (
    <div
      className="max-w-5xl mx-auto animate-scale-in"
      style={{ animationDelay: "0.6s" }}
    >
      <div className="bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 lg:p-8 border border-border/50">
        {/* Trip Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-full p-1">
            <button
              onClick={() => setTripType("one-way")}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-300",
                tripType === "one-way"
                  ? "bg-primary text-primary-foreground shadow-lg transform scale-105"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Solo Ida
            </button>
            <button
              onClick={() => setTripType("round-trip")}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all duration-300",
                tripType === "round-trip"
                  ? "bg-primary text-primary-foreground shadow-lg transform scale-105"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Ida y Vuelta
            </button>
          </div>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Origin */}
          <div className="relative group">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Origen
            </Label>
            <Popover open={originOpen} onOpenChange={setOriginOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className={cn(!origin && "text-muted-foreground")}>
                      {origin
                        ? cities.find((c) => c.id === origin)?.name
                        : "Seleccionar ciudad"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar ciudad..."
                    className="h-12"
                  />
                  <CommandList>
                    <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                    <CommandGroup>
                      {cities.map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.name}
                          onSelect={() => {
                            setOrigin(city.id);
                            setOriginOpen(false);
                          }}
                          className="cursor-pointer py-3"
                        >
                          <MapPin className="h-4 w-4 mr-2 text-primary" />
                          <div>
                            <p className="font-medium">{city.name}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Swap Button - Floating */}
          <button
            onClick={swapCities}
            className="hidden lg:flex absolute left-[calc(25%-12px)] top-[calc(50%+16px)] z-20 w-10 h-10 items-center justify-center bg-secondary text-secondary-foreground rounded-full shadow-lg hover:scale-110 transition-transform duration-300"
          >
            <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
          </button>

          {/* Destination */}
          <div className="relative group">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Destino
            </Label>
            <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-secondary" />
                    <span
                      className={cn(!destination && "text-muted-foreground")}
                    >
                      {destination
                        ? cities.find((c) => c.id === destination)?.name
                        : "Seleccionar ciudad"}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Buscar ciudad..."
                    className="h-12"
                  />
                  <CommandList>
                    <CommandEmpty>No se encontró la ciudad.</CommandEmpty>
                    <CommandGroup>
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
                            className="cursor-pointer py-3"
                          >
                            <MapPin className="h-4 w-4 mr-2 text-secondary" />
                            <div>
                              <p className="font-medium">{city.name}</p>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Departure Date */}
          <div className="relative group">
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
              Fecha de Ida
            </Label>
            <Popover
              open={departureDateOpen}
              onOpenChange={setDepartureDateOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span
                      className={cn(!departureDate && "text-muted-foreground")}
                    >
                      {departureDate
                        ? format(new Date(departureDate), "dd MMM yyyy", {
                            locale: es,
                          })
                        : "Seleccionar fecha"}
                    </span>
                  </div>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={departureDate ? new Date(departureDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      setDepartureDate(format(date, "yyyy-MM-dd"));
                      setDepartureDateOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Return Date or Passengers */}
          {tripType === "round-trip" ? (
            <div className="relative group">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Fecha de Vuelta
              </Label>
              <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-secondary" />
                      <span
                        className={cn(!returnDate && "text-muted-foreground")}
                      >
                        {returnDate
                          ? format(new Date(returnDate), "dd MMM yyyy", {
                              locale: es,
                            })
                          : "Seleccionar fecha"}
                      </span>
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={returnDate ? new Date(returnDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setReturnDate(format(date, "yyyy-MM-dd"));
                        setReturnDateOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(departureDate || new Date())
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="relative group">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Pasajeros
              </Label>
              <Popover open={passengersOpen} onOpenChange={setPassengersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span>
                        {passengers}{" "}
                        {passengers === 1 ? "Pasajero" : "Pasajeros"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="start">
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Pasajeros</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setPassengers(Math.max(1, passengers - 1))
                        }
                        className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {passengers}
                      </span>
                      <button
                        onClick={() =>
                          setPassengers(Math.min(4, passengers + 1))
                        }
                        className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máximo 4 pasajeros por reserva
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Passengers for Round Trip */}
        {tripType === "round-trip" && (
          <div className="mt-4 flex justify-center">
            <div className="relative group w-full max-w-xs">
              <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                Pasajeros
              </Label>
              <Popover open={passengersOpen} onOpenChange={setPassengersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <span>
                        {passengers}{" "}
                        {passengers === 1 ? "Pasajero" : "Pasajeros"}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48" align="center">
                  <div className="flex items-center justify-between py-2">
                    <span className="font-medium">Pasajeros</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setPassengers(Math.max(1, passengers - 1))
                        }
                        className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">
                        {passengers}
                      </span>
                      <button
                        onClick={() =>
                          setPassengers(Math.min(4, passengers + 1))
                        }
                        className="w-8 h-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Máximo 4 pasajeros
                  </p>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Search Button */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleSearch}
            disabled={!origin || !destination || !departureDate}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 px-12 text-lg font-semibold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none animate-pulse-glow"
          >
            <Bus className="h-5 w-5 mr-2" />
            Buscar Pasajes
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
