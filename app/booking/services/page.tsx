"use client";

import React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Clock,
  MapPin,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (!origin || !destination || !departureDate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
    <div className="min-h-screen">
      <BookingProgress />

      {/* Search Summary */}
      {/* <div className="bg-foreground text-background py-8">
        <div className="container mx-auto px-4">
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
                    new Date(showingReturn ? returnDate : departureDate),
                    "EEEE d 'de' MMMM, yyyy",
                    { locale: es },
                  )}
                </p>
              </div>
            </div>

            {selectedOutboundTrip && tripType === "round-trip" && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-background/60">Ida seleccionada</p>
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
      </div> */}

      {/* Trips List */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {trips.length} servicios disponibles
          </h2>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/30"
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
                "overflow-hidden transition-all duration-500 animate-fade-in hover:shadow-lg",
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
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bus className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {trip.company}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trip.busType}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-secondary fill-secondary" />
                        <span className="text-xs text-muted-foreground">
                          4.5
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="flex-1 flex items-center justify-between lg:justify-center gap-4 lg:gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {trip.departureTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {showingReturn
                          ? destinationCity?.name
                          : originCity?.name}
                      </p>
                    </div>

                    <div className="flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-1">
                        {trip.duration}
                      </p>
                      <div className="relative w-24 lg:w-32">
                        <div className="h-0.5 bg-border w-full" />
                        <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                        <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-secondary -translate-y-1/2" />
                        <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-primary mt-1">Directo</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">
                        {trip.arrivalTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {showingReturn
                          ? originCity?.name
                          : destinationCity?.name}
                      </p>
                    </div>
                  </div>

                  {/* Seats Available */}
                  <div className="flex items-center gap-2 lg:w-32">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        trip.availableSeats < 10
                          ? "text-destructive"
                          : "text-primary",
                      )}
                    >
                      {trip.availableSeats} asientos
                    </span>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:w-40">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground line-through">
                        Gs. {(trip.price * 1.2).toLocaleString("es-PY")}
                      </p>
                      <p className="text-2xl font-bold text-secondary">
                        Gs. {trip.price.toLocaleString("es-PY")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        por asiento
                      </p>
                    </div>
                    <Button
                      onClick={() => handleSelectTrip(trip)}
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 transform hover:scale-105"
                    >
                      Seleccionar
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>

                {/* Expandable Details */}
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    onClick={() =>
                      setExpandedTrip(expandedTrip === trip.id ? null : trip.id)
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
                      expandedTrip === trip.id ? "max-h-40 mt-4" : "max-h-0",
                    )}
                  >
                    <div className="flex flex-wrap gap-3">
                      {trip.amenities.map((amenity) => {
                        const Icon = amenityIcons[amenity];
                        return (
                          <Badge
                            key={amenity}
                            variant="secondary"
                            className="flex items-center gap-2"
                          >
                            {Icon && <Icon className="h-4 w-4" />}
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
              className="border-muted-foreground/30"
            >
              Volver a seleccionar ida
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
