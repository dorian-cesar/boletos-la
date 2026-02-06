"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Bus,
  MapPin,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingProgress } from "@/components/booking-progress";
import { SeatMap } from "@/components/seat-map";
import { useBookingStore, cities } from "@/lib/booking-store";
import { cn } from "@/lib/utils";

export default function SeatsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectingReturn, setSelectingReturn] = useState(false);

  const {
    tripType,
    departureDate,
    returnDate,
    selectedOutboundTrip,
    selectedReturnTrip,
    selectedSeats,
    selectedReturnSeats,
    setStep,
    calculateTotal,
    totalPrice,
  } = useBookingStore();

  useEffect(() => {
    setMounted(true);
    setStep(2);
    calculateTotal();
  }, [setStep, calculateTotal]);

  useEffect(() => {
    calculateTotal();
  }, [selectedSeats, selectedReturnSeats, calculateTotal]);

  const handleContinue = () => {
    if (tripType === "round-trip" && !selectingReturn && selectedReturnTrip) {
      setSelectingReturn(true);
    } else {
      router.push("/booking/checkout");
    }
  };

  const canContinue = selectingReturn
    ? selectedReturnSeats.length > 0 // Al menos 1 asiento seleccionado
    : selectedSeats.length > 0; // Al menos 1 asiento seleccionado

  const currentTrip = selectingReturn
    ? selectedReturnTrip
    : selectedOutboundTrip;
  const currentDate = selectingReturn ? returnDate : departureDate;
  const origin = selectingReturn
    ? selectedReturnTrip?.origin
    : selectedOutboundTrip?.origin;
  const destination = selectingReturn
    ? selectedReturnTrip?.destination
    : selectedOutboundTrip?.destination;
  const originCity = cities.find((c) => c.id === origin);
  const destinationCity = cities.find((c) => c.id === destination);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">
            Cargando selección de asientos...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedOutboundTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">
            No hay viaje seleccionado
          </p>
          <p className="text-muted-foreground mb-4">
            Por favor, selecciona un servicio primero
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            {/* Trip Info */}
            <Card className="p-6 mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bus className="h-6 w-6 text-primary" />
                  <span className="font-bold text-lg">
                    {currentTrip?.company}
                  </span>
                  <span className="text-muted-foreground">
                    - {currentTrip?.busType}
                  </span>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    selectingReturn
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {selectingReturn ? "Viaje de Regreso" : "Viaje de Ida"}
                </span>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {currentTrip?.departureTime}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {originCity?.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-border" />
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {currentTrip?.duration}
                    </span>
                    <div className="w-16 h-0.5 bg-border" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {currentTrip?.arrivalTime}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {destinationCity?.name}
                    </p>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(currentDate || ""), "EEE d MMM", {
                      locale: es,
                    })}
                  </p>
                  <p className="text-xl font-bold text-secondary">
                    Gs. {currentTrip?.price.toLocaleString("es-PY")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Seat Map */}
            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <SeatMap
                tripId={currentTrip?.id || ""}
                isReturn={selectingReturn}
              />
            </div>

            {/* Navigation for Return */}
            {tripType === "round-trip" && selectedReturnTrip && (
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectingReturn(false)}
                  disabled={!selectingReturn}
                  className={cn(!selectingReturn && "opacity-50")}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Asientos de Ida
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectingReturn(true)}
                  disabled={selectingReturn || selectedSeats.length === 0}
                  className={cn(
                    (selectingReturn || selectedSeats.length === 0) &&
                      "opacity-50",
                  )}
                >
                  Asientos de Regreso
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-slide-in-right">
              <h3 className="text-xl font-bold mb-6">Resumen de Reserva</h3>

              {/* Outbound Trip */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Viaje de Ida</span>
                </div>
                <div className="pl-10 space-y-2">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Fecha:</span>{" "}
                    {format(new Date(departureDate || ""), "dd MMM yyyy", {
                      locale: es,
                    })}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Horario:</span>{" "}
                    {selectedOutboundTrip?.departureTime} -{" "}
                    {selectedOutboundTrip?.arrivalTime}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Asientos:</span>{" "}
                    {selectedSeats.length > 0
                      ? selectedSeats.map((s) => s.number).join(", ")
                      : "Sin seleccionar"}
                  </p>
                  <p className="text-sm font-medium text-secondary">
                    Gs.{" "}
                    {selectedSeats
                      .reduce((acc, s) => acc + s.price, 0)
                      .toLocaleString("es-PY")}
                  </p>
                </div>
              </div>

              {/* Return Trip */}
              {tripType === "round-trip" && selectedReturnTrip && (
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-secondary rotate-180" />
                    </div>
                    <span className="font-medium">Viaje de Regreso</span>
                  </div>
                  <div className="pl-10 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Fecha:</span>{" "}
                      {format(new Date(returnDate || ""), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Horario:</span>{" "}
                      {selectedReturnTrip?.departureTime} -{" "}
                      {selectedReturnTrip?.arrivalTime}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Asientos:</span>{" "}
                      {selectedReturnSeats.length > 0
                        ? selectedReturnSeats.map((s) => s.number).join(", ")
                        : "Sin seleccionar"}
                    </p>
                    <p className="text-sm font-medium text-secondary">
                      Gs.{" "}
                      {selectedReturnSeats
                        .reduce((acc, s) => acc + s.price, 0)
                        .toLocaleString("es-PY")}
                    </p>
                  </div>
                </div>
              )}

              {/* Passengers - Basado en asientos seleccionados */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">
                    {selectedSeats.length + selectedReturnSeats.length}{" "}
                    Pasajeros
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-3xl font-bold text-secondary">
                    Gs. {totalPrice.toLocaleString("es-PY")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Impuestos incluidos
                </p>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {tripType === "round-trip" &&
                !selectingReturn &&
                selectedReturnTrip
                  ? "Seleccionar Asientos de Regreso"
                  : "Continuar al Pago"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {!canContinue && (
                <p className="text-sm text-destructive mt-3 text-center animate-pulse">
                  Selecciona al menos 1 asiento para continuar
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
