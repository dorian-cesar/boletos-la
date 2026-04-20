"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  ArrowLeft,
  Bus,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingProgress } from "@/components/booking-progress";
import { SeatMap } from "@/components/seat-map";
import { PassengerForm } from "@/components/passenger-form";
import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SeatsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [selectingReturn, setSelectingReturn] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  const {
    tripType,
    departureDate,
    returnDate,
    selectedOutboundTrip,
    selectedReturnTrip,
    selectedSeats,
    selectedReturnSeats,
    passengerDetails,
    setStep,
    calculateTotal,
    totalPrice,
    originTitle,
    destinationTitle,
    setOutboundConnectionId,
    setReturnConnectionId,
    initPassengers,
  } = useBookingStore();

  useEffect(() => {
    setMounted(true);
    setStep(2);
    calculateTotal();
  }, [setStep, calculateTotal]);

  useEffect(() => {
    calculateTotal();
    initPassengers();
  }, [selectedSeats, selectedReturnSeats, calculateTotal, initPassengers]);

  const handleContinue = async () => {
    if (tripType === "round-trip" && !selectingReturn && selectedReturnTrip) {
      setSelectingReturn(true);
      return;
    }

    try {
      setIsBlocking(true);
      setBlockError(null);

      // Auto-guardar pasajeros antes de bloquear
      const saveTasks = selectedSeats.map(async (_, i) => {
        const p = passengerDetails[i];
        if (!p || !p.documentNumber || !p.firstName || !p.lastName) return;

        try {
          await fetch("/api/gds/passenger/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              docType: p.docType?.codigo || "C",
              docNumber: p.documentNumber.replace(/[.\-\s]/g, ""),
              lastName: p.lastName,
              name: p.firstName,
              phone: p.phone,
              occupation: p.occupation || "EMPLEADO",
              birthDate: p.birthDate
                ? p.birthDate.replace(/-/g, "/")
                : "1991/06/08",
              gender: p.gender || "M",
              nationality: p.nationality || "PA",
              country: p.country || "PA",
            }),
          });
        } catch (error) {
          console.error("Error auto-guardando pasajero:", error);
        }
      });

      await Promise.allSettled(saveTasks);

      // 1. Bloqueo para asientos de ida
      const res = await fetch("/api/gds/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: selectedOutboundTrip?.id,
          originId: selectedOutboundTrip?.origin,
          destinationId: selectedOutboundTrip?.destination,
          seats: selectedSeats.map((s) => s.number).join(", "),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al bloquear asientos de ida");
      }

      const data = await res.json();

      // Validación profunda del resultado del GDS para la ida
      const blockData = data.data || data;
      const isGdsError =
        blockData.success === false ||
        (blockData.providerResult && blockData.providerResult !== "0");

      if (isGdsError) {
        throw new Error(
          data.message ||
            blockData.message ||
            "No se pudieron bloquear los asientos de ida (Error del proveedor)",
        );
      }

      if (blockData.connectionId) {
        setOutboundConnectionId(blockData.connectionId);
      }

      // 2. Bloqueo para asientos de vuelta (si aplica)
      if (
        tripType === "round-trip" &&
        selectedReturnTrip &&
        selectedReturnSeats.length > 0
      ) {
        const returnRes = await fetch("/api/gds/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedReturnTrip.id,
            originId: selectedReturnTrip.origin,
            destinationId: selectedReturnTrip.destination,
            seats: selectedReturnSeats.map((s) => s.number).join(", "),
          }),
        });

        if (!returnRes.ok) {
          const err = await returnRes.json();
          throw new Error(err.error || "Error al bloquear asientos de regreso");
        }

        const returnData = await returnRes.json();
        const returnBlockData = returnData.data || returnData;
        const isReturnGdsError =
          returnBlockData.success === false ||
          (returnBlockData.providerResult &&
            returnBlockData.providerResult !== "0");

        if (isReturnGdsError) {
          throw new Error(
            returnData.message ||
              returnBlockData.message ||
              "No se pudieron bloquear los asientos de regreso (Error del proveedor)",
          );
        }

        if (returnBlockData.connectionId) {
          setReturnConnectionId(returnBlockData.connectionId);
        }
      }

      router.push("/booking/checkout");
    } catch (err: any) {
      console.error("Block error:", err);
      setBlockError(
        err.message ||
          "No se pudieron bloquear los asientos. Intenta de nuevo.",
      );
    } finally {
      setIsBlocking(false);
    }
  };

  // Obtener asientos actuales basado en si estamos seleccionando ida o regreso
  const currentSelectedSeats = selectingReturn
    ? selectedReturnSeats
    : selectedSeats;

  // Validar que los pasajeros de IDA estén completos
  const arePassengersComplete =
    selectedSeats.length > 0 &&
    selectedSeats.every((_, i) => {
      const p = passengerDetails[i];
      if (!p) return false;
      return (
        p.firstName.trim().length >= 2 &&
        p.lastName.trim().length >= 2 &&
        p.documentNumber.trim().length >= 6 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) &&
        p.phone.replace(/\D/g, "").length >= 9
      );
    });

  const maxAllowed = selectingReturn ? selectedSeats.length : 4;

  // Verificar si se puede continuar (mínimo 1 asiento, máximo 4, y pasajeros completos)
  const canContinue =
    currentSelectedSeats.length > 0 &&
    currentSelectedSeats.length <= maxAllowed &&
    (selectingReturn || arePassengersComplete);

  // Verificar si se ha excedido el límite
  const hasExceededLimit = currentSelectedSeats.length > maxAllowed;

  const currentTrip = selectingReturn
    ? selectedReturnTrip
    : selectedOutboundTrip;
  const currentDate = selectingReturn ? returnDate : departureDate;
  const currentOriginTitle = selectingReturn ? destinationTitle : originTitle;
  const currentDestinationTitle = selectingReturn
    ? originTitle
    : destinationTitle;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background px-4">
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-bounce"
            priority
          />
          <p className="text-muted-foreground">
            Cargando selección de asientos...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedOutboundTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background px-4">
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
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background w-full overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <BookingProgress />

        <div className="w-full px-4 py-8 relative z-10">
          <div className="container mx-auto max-w-7xl">
            {/* Alert para límite de asientos */}
            {hasExceededLimit && (
              <Alert variant="destructive" className="mb-6 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {selectingReturn
                    ? `Solo puedes seleccionar un máximo de ${selectedSeats.length} asiento(s) en tu viaje de regreso. `
                    : `Solo puedes seleccionar un máximo de 4 asientos por reserva. `}
                  Por favor, deselecciona algunos asientos.
                </AlertDescription>
              </Alert>
            )}

            {blockError && (
              <Alert variant="destructive" className="mb-6 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{blockError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Seat Selection */}
              <div className="lg:col-span-2">
                {/* Trip Info */}
                <Card className="p-3 sm:p-4 md:p-6 mb-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20 overflow-hidden w-full">
                  {/* Primera fila: Empresa y tipo de viaje */}
                  <div className="flex flex-row items-center justify-between w-full mb-3 pb-2 border-b border-background/10">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                      <Bus className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                      <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-background truncate">
                        {currentTrip?.company}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-background/60 truncate hidden sm:inline">
                        {currentTrip?.busType}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium flex-shrink-0",
                        selectingReturn
                          ? "bg-secondary/10 text-secondary border border-secondary/30"
                          : "bg-primary/10 text-primary border border-primary/30",
                      )}
                    >
                      {selectingReturn ? "Regreso" : "Ida"}
                    </span>
                  </div>

                  {/* Segunda fila: Horarios y ciudades */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
                    {/* Bloque izquierdo: Hora salida y origen */}
                    <div className="flex flex-row sm:flex-col items-baseline sm:items-start justify-between w-full sm:w-auto gap-1 sm:gap-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-background">
                        {currentTrip?.departureTime}
                      </p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-background/60 flex-shrink-0" />
                        <span className="text-[10px] sm:text-xs md:text-sm text-background/60 truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
                          {currentOriginTitle}
                        </span>
                      </div>
                    </div>

                    {/* Bloque central: Duración */}
                    <div className="flex flex-row sm:flex-col items-center justify-center gap-1 sm:gap-0 w-full sm:w-auto px-2">
                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-background/60 flex-shrink-0" />
                      <span className="text-[10px] sm:text-xs text-background/60 whitespace-nowrap">
                        {currentTrip?.duration}
                      </span>
                      <div className="hidden sm:block w-12 sm:w-16 h-0.5 bg-background/20 mt-1" />
                    </div>

                    {/* Bloque derecho: Hora llegada y destino */}
                    <div className="flex flex-row sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto gap-1 sm:gap-0">
                      <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-background">
                        {currentTrip?.arrivalTime}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] sm:text-xs md:text-sm text-background/60 truncate max-w-[80px] sm:max-w-[100px] md:max-w-[120px]">
                          {currentDestinationTitle}
                        </span>
                        <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-background/60 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Bloque fecha y precio */}
                    <div className="flex flex-row items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-2 sm:gap-0 sm:ml-0 lg:ml-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-background/10 sm:border-0">
                      <p className="text-[10px] sm:text-xs md:text-sm text-background/60">
                        {format(
                          parse(currentDate || "", "yyyy-MM-dd", new Date()),
                          "EEE d MMM",
                          {
                            locale: es,
                          },
                        )}
                      </p>
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-secondary whitespace-nowrap">
                        Gs. {currentTrip?.price.toLocaleString("es-PY")}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Seat Map */}
                <div
                  className="animate-fade-in"
                  style={{ animationDelay: "0.2s" }}
                >
                  <SeatMap
                    tripId={currentTrip?.id || ""}
                    isReturn={selectingReturn}
                  />
                </div>

                {/* Passenger Forms — one per selected outbound seat */}
                {!selectingReturn && selectedSeats.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <h3 className="text-base font-semibold text-background">
                        Datos de los Pasajeros
                      </h3>
                      <span className="text-xs text-background/50 ml-1">
                        ({selectedSeats.length} asiento
                        {selectedSeats.length > 1 ? "s" : ""})
                      </span>
                    </div>
                    {selectedSeats.map((seat, i) => {
                      const outboundIndex = i;
                      const returnSeat = selectedReturnSeats[i] ?? null;
                      const returnIndex = returnSeat
                        ? selectedSeats.length + i
                        : -1;
                      return (
                        <PassengerForm
                          key={seat.id}
                          passengerNumber={i + 1}
                          outboundIndex={outboundIndex}
                          returnIndex={returnIndex}
                          seatNumber={seat.number}
                          returnSeatNumber={returnSeat?.number}
                          animationDelay={i * 80}
                        />
                      );
                    })}
                  </div>
                )}

                {/* En modo regreso: mostrar resumen de pasajeros asignados */}
                {selectingReturn && selectedReturnSeats.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <UserCheck className="h-5 w-5 text-secondary" />
                      <h3 className="text-base font-semibold text-background">
                        Pasajeros asignados al regreso
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {selectedReturnSeats.map((retSeat, i) => {
                        const passenger =
                          passengerDetails[selectedSeats.length + i];
                        return (
                          <div
                            key={retSeat.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-background/5 border border-secondary/20 animate-fade-in"
                          >
                            <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 shrink-0 text-xs font-bold text-secondary">
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-background truncate">
                                {passenger?.firstName
                                  ? `${passenger.firstName} ${passenger.lastName}`
                                  : "Sin datos (completa el formulario de ida)"}
                              </p>
                              <p className="text-xs text-background/60">
                                Asiento {retSeat.number}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-start">
                  <Button
                    variant="outline"
                    onClick={() => {
                      router.push("/booking/services");
                    }}
                    className="border-background/20 text-background bg-background/10 hover:bg-background/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a seleccionar servicio
                  </Button>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-4 md:p-6 sticky top-24 animate-slide-in-right bg-background/5 backdrop-blur-sm border-background/20">
                  <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-background">
                    Resumen de Reserva
                  </h3>

                  {/* Asientos seleccionados contador */}
                  <div className="mb-4 p-3 bg-background/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-background/60">
                        Asientos seleccionados:
                      </span>
                      <div
                        className={cn(
                          "text-xs md:text-sm font-medium",
                          hasExceededLimit
                            ? "text-destructive animate-pulse"
                            : "text-primary",
                        )}
                      >
                        {currentSelectedSeats.length}/{maxAllowed}
                      </div>
                    </div>
                  </div>

                  {/* Outbound Trip */}
                  <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-background/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
                        <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm md:text-base text-background">
                        Viaje de Ida
                      </span>
                    </div>
                    <div className="pl-8 md:pl-10 space-y-1.5 md:space-y-2">
                      <p className="text-xs md:text-sm text-background/80">
                        <span className="text-background/60">Fecha:</span>{" "}
                        {format(
                          parse(departureDate || "", "yyyy-MM-dd", new Date()),
                          "dd MMM yyyy",
                          {
                            locale: es,
                          },
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-background/80">
                        <span className="text-background/60">Horario:</span>{" "}
                        {selectedOutboundTrip?.departureTime} -{" "}
                        {selectedOutboundTrip?.arrivalTime}
                      </p>
                      <p className="text-xs md:text-sm text-background/80">
                        <span className="text-background/60">Asientos:</span>{" "}
                        {selectedSeats.length > 0
                          ? selectedSeats.map((s) => s.number).join(", ")
                          : "Sin seleccionar"}
                        {selectedSeats.length > 4 && (
                          <span className="text-destructive text-xs ml-2">
                            (máximo 4)
                          </span>
                        )}
                      </p>
                      <p className="text-xs md:text-sm font-medium text-secondary">
                        Gs.{" "}
                        {selectedSeats
                          .reduce((acc, s) => acc + s.price, 0)
                          .toLocaleString("es-PY")}
                      </p>
                    </div>
                  </div>

                  {/* Return Trip */}
                  {tripType === "round-trip" && selectedReturnTrip && (
                    <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-background/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 flex-shrink-0">
                          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary rotate-180" />
                        </div>
                        <span className="font-medium text-sm md:text-base text-background">
                          Viaje de Regreso
                        </span>
                      </div>
                      <div className="pl-8 md:pl-10 space-y-1.5 md:space-y-2">
                        <p className="text-xs md:text-sm text-background/80">
                          <span className="text-background/60">Fecha:</span>{" "}
                          {format(
                            parse(returnDate || "", "yyyy-MM-dd", new Date()),
                            "dd MMM yyyy",
                            {
                              locale: es,
                            },
                          )}
                        </p>
                        <p className="text-xs md:text-sm text-background/80">
                          <span className="text-background/60">Horario:</span>{" "}
                          {selectedReturnTrip?.departureTime} -{" "}
                          {selectedReturnTrip?.arrivalTime}
                        </p>
                        <p className="text-xs md:text-sm text-background/80">
                          <span className="text-background/60">Asientos:</span>{" "}
                          {selectedReturnSeats.length > 0
                            ? selectedReturnSeats
                                .map((s) => s.number)
                                .join(", ")
                            : "Sin seleccionar"}
                          {selectedReturnSeats.length >
                            selectedSeats.length && (
                            <span className="text-destructive text-xs ml-2">
                              (máximo {selectedSeats.length})
                            </span>
                          )}
                        </p>
                        <p className="text-xs md:text-sm font-medium text-secondary">
                          Gs.{" "}
                          {selectedReturnSeats
                            .reduce((acc, s) => acc + s.price, 0)
                            .toLocaleString("es-PY")}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Passengers */}
                  <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-background/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-background/60 flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base text-background">
                        {selectedSeats.length + selectedReturnSeats.length}{" "}
                        Pasajeros
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-lg font-medium text-background">
                        Total
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary">
                        Gs. {totalPrice.toLocaleString("es-PY")}
                      </span>
                    </div>
                    <p className="text-xs text-background/60 mt-1">
                      Impuestos incluidos
                    </p>
                  </div>

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinue}
                    disabled={!canContinue || isBlocking}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {isBlocking ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Reservando asiento(s)...
                      </>
                    ) : tripType === "round-trip" &&
                      !selectingReturn &&
                      selectedReturnTrip ? (
                      "Seleccionar Asientos de Regreso"
                    ) : (
                      "Continuar al Pago"
                    )}
                    {!isBlocking && (
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>

                  {!canContinue && (
                    <p className="text-xs md:text-sm text-background/70 mt-3 text-center">
                      {hasExceededLimit
                        ? `Máximo ${maxAllowed} asientos permitidos`
                        : currentSelectedSeats.length === 0
                          ? "Selecciona al menos 1 asiento para continuar"
                          : !selectingReturn && !arePassengersComplete
                            ? "Completa los datos de todos los pasajeros"
                            : "Selecciona los asientos de regreso"}
                    </p>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
