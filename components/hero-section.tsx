"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
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

export function HeroSection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bus.jpg"
          alt="Bus viajando por Paraguay"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a2332]/95 via-[#1a2332]/85 to-[#1a2332]/75" />

        {/* Animated Gradient Mesh */}
        <div className="absolute inset-0 opacity-60">
          <div
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse"
            style={{ animationDuration: "4s" }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Glowing Orbs with stronger effect */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6 animate-bounce-in">
            Tu viaje comienza aquí
          </span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-background mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-balance">Viaja por todo </span>
            <span className="text-primary">Paraguay</span>
            <br />
            <span className="text-secondary">con nosotros</span>
          </h1>
          <p
            className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Reserva tus pasajes de bus de forma rápida y segura. Las mejores
            empresas, los mejores precios.
          </p>
        </div>

        {/* Search Form */}
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
                        <span
                          className={cn(!origin && "text-muted-foreground")}
                        >
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
                                {/* <p className="text-xs text-muted-foreground">
                                  {city.region}
                                </p> */}
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
                <Popover
                  open={destinationOpen}
                  onOpenChange={setDestinationOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-secondary" />
                        <span
                          className={cn(
                            !destination && "text-muted-foreground",
                          )}
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
                                  {/* <p className="text-xs text-muted-foreground">
                                    {city.region}
                                  </p> */}
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
                          className={cn(
                            !departureDate && "text-muted-foreground",
                          )}
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
                      selected={
                        departureDate ? new Date(departureDate) : undefined
                      }
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
                  <Popover
                    open={returnDateOpen}
                    onOpenChange={setReturnDateOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-14 text-left font-normal bg-muted/50 border-border hover:border-primary hover:bg-muted transition-all duration-300 group-hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-secondary" />
                          <span
                            className={cn(
                              !returnDate && "text-muted-foreground",
                            )}
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
                  <Popover
                    open={passengersOpen}
                    onOpenChange={setPassengersOpen}
                  >
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
                  <Popover
                    open={passengersOpen}
                    onOpenChange={setPassengersOpen}
                  >
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

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { value: "200+", label: "Destinos" },
            { value: "40+", label: "Empresas" },
            { value: "500K+", label: "Viajeros" },
            { value: "24/7", label: "Soporte" },
          ].map((stat, index) => (
            <div key={index} className="text-center group cursor-default">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                {stat.value}
              </p>
              <p className="text-background/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-background/50" />
      </div>
    </section>
  );
}
