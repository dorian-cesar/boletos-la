"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Clock,
  Bus,
  Wifi,
  Tv,
  Coffee,
  Plug,
  ChevronDown,
  ChevronUp,
  Users,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/booking-progress";
import {
  useBookingStore,
  generateTrips,
  cities,
  Trip,
} from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  WiFi: Wifi,
  TV: Tv,
  Refrigeración: Coffee,
  "Enchufes USB": Plug,
  Baño: Coffee,
  "Aire Acondicionado": Coffee,
};

export default function ServicesPage() {
  const router = useRouter();
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    origin,
    destination,
    departureDate,
    returnDate,
    tripType,
    selectedOutboundTrip,
    setSelectedOutboundTrip,
    selectedReturnTrip,
    setSelectedReturnTrip,
    setStep,
  } = useBookingStore();

  const [outboundTrips, setOutboundTrips] = useState<Trip[]>([]);
  const [returnTrips, setReturnTrips] = useState<Trip[]>([]);
  const [showingReturn, setShowingReturn] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStep(1);

    if (origin && destination && departureDate) {
      setOutboundTrips(generateTrips(origin, destination, departureDate));
      if (tripType === "round-trip" && returnDate) {
        setReturnTrips(generateTrips(destination, origin, returnDate));
      }
    }
  }, [origin, destination, departureDate, returnDate, tripType, setStep]);

  const handleSelectTrip = (trip: Trip) => {
    if (!showingReturn) {
      setSelectedOutboundTrip(trip);
      if (tripType === "round-trip") {
        setShowingReturn(true);
      } else {
        router.push("/booking/seats");
      }
    } else {
      setSelectedReturnTrip(trip);
      router.push("/booking/seats");
    }
  };

  const originCity = cities.find((c) => c.id === origin);
  const destinationCity = cities.find((c) => c.id === destination);
  const trips = showingReturn ? returnTrips : outboundTrips;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-bounce"
            priority
          />
          <p className="text-muted-foreground">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (!origin || !destination || !departureDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">No hay datos de búsqueda</p>
          <p className="text-muted-foreground mb-4">
            Por favor, realiza una búsqueda desde la página principal
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background w-full overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <BookingProgress />

        {/* Search Summary - versión original corregida */}
        <div className="bg-background/10 py-8 backdrop-blur-sm border-b border-background/10 w-full">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-center lg:text-left">
                <div>
                  <p className="text-sm text-background/60">
                    {showingReturn ? "Viaje de Regreso" : "Viaje de Ida"}
                  </p>
                  <div className="flex items-center gap-3 text-2xl font-bold">
                    <span>
                      {showingReturn ? destinationCity?.name : originCity?.name}
                    </span>
                    <ArrowRight className="h-6 w-6 text-primary" />
                    <span>
                      {showingReturn ? originCity?.name : destinationCity?.name}
                    </span>
                  </div>
                  <p className="text-background/60 mt-1">
                    {format(
                      parse(
                        showingReturn
                          ? returnDate || departureDate
                          : departureDate,
                        "yyyy-MM-dd",
                        new Date(),
                      ),
                      "EEEE d 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
              </div>

              {selectedOutboundTrip && tripType === "round-trip" && (
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-background/60">
                      Ida seleccionada
                    </p>
                    <p className="font-semibold">
                      {selectedOutboundTrip.departureTime} -{" "}
                      {selectedOutboundTrip.company}
                    </p>
                  </div>
                  {!showingReturn && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                      onClick={() => setShowingReturn(true)}
                    >
                      Continuar al Regreso
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trips List */}
        <div className="w-full px-4 py-8 relative z-10">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-background">
                {trips.length} servicios disponibles
              </h2>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30 whitespace-nowrap"
                >
                  Mejor precio
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              {trips.map((trip, index) => (
                <Card
                  key={trip.id}
                  className={cn(
                    "overflow-hidden transition-all duration-500 animate-fade-in hover:shadow-lg bg-background/5 backdrop-blur-sm border-background/20",
                    selectedOutboundTrip?.id === trip.id ||
                      selectedReturnTrip?.id === trip.id
                      ? "ring-2 ring-primary"
                      : "",
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Company Info */}
                      <div className="flex items-center gap-4 lg:w-48">
                        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bus className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-background">
                            {trip.company}
                          </p>
                          <p className="text-sm text-background/60">
                            {trip.busType}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 text-secondary fill-secondary" />
                            <span className="text-xs text-background/60">
                              4.5
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                        <div className="flex w-full md:w-auto justify-between md:justify-start md:flex-1">
                          <div className="text-center flex-1 md:flex-none">
                            <p className="text-2xl font-bold text-background">
                              {trip.departureTime}
                            </p>
                            <p className="text-sm text-background/60">
                              {showingReturn
                                ? destinationCity?.name
                                : originCity?.name}
                            </p>
                          </div>

                          <div className="flex flex-col items-center px-4">
                            <p className="text-xs text-background/60 mb-1">
                              {trip.duration}
                            </p>
                            <div className="relative w-24 lg:w-32">
                              <div className="h-0.5 bg-background/20 w-full" />
                              <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                              <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-secondary -translate-y-1/2" />
                              <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                            </div>
                            <p className="text-xs text-primary mt-1">Directo</p>
                          </div>

                          <div className="text-center flex-1 md:flex-none">
                            <p className="text-2xl font-bold text-background">
                              {trip.arrivalTime}
                            </p>
                            <p className="text-sm text-background/60">
                              {showingReturn
                                ? originCity?.name
                                : destinationCity?.name}
                            </p>
                          </div>
                        </div>

                        {/* Seats Available */}
                        <div className="flex items-center gap-2 lg:w-32">
                          <Users className="h-5 w-5 text-background/60" />
                          <span
                            className={cn(
                              "text-sm font-medium whitespace-nowrap",
                              trip.availableSeats < 10
                                ? "text-destructive"
                                : "text-primary",
                            )}
                          >
                            {trip.availableSeats} asientos
                          </span>
                        </div>

                        {/* Price & Action */}
                        <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:w-40 w-full">
                          <div className="text-left lg:text-right">
                            <p className="text-sm text-background/60 line-through">
                              Gs. {(trip.price * 1.2).toLocaleString("es-PY")}
                            </p>
                            <p className="text-2xl font-bold text-secondary">
                              Gs. {trip.price.toLocaleString("es-PY")}
                            </p>
                            <p className="text-xs text-background/60">
                              por asiento
                            </p>
                          </div>
                          <Button
                            onClick={() => handleSelectTrip(trip)}
                            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                          >
                            Seleccionar
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <div className="mt-4 pt-4 border-t border-background/20">
                      <button
                        onClick={() =>
                          setExpandedTrip(
                            expandedTrip === trip.id ? null : trip.id,
                          )
                        }
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Ver detalles
                        {expandedTrip === trip.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      <div
                        className={cn(
                          "overflow-hidden transition-all duration-500",
                          expandedTrip === trip.id
                            ? "max-h-40 mt-4"
                            : "max-h-0",
                        )}
                      >
                        <div className="flex flex-wrap gap-2">
                          {trip.amenities.map((amenity) => {
                            const Icon = amenityIcons[amenity];
                            return (
                              <Badge
                                key={amenity}
                                variant="secondary"
                                className="flex items-center gap-1.5 bg-background/10 text-background"
                              >
                                {Icon && <Icon className="h-3.5 w-3.5" />}
                                {amenity}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Back Button */}
            {showingReturn && (
              <div className="mt-8 flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowingReturn(false);
                    setSelectedOutboundTrip(null);
                  }}
                  className="border-background/20 text-background hover:bg-background/10"
                >
                  Volver a seleccionar ida
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
