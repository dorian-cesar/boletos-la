"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trackInitiateCheckout } from "@/lib/meta-pixel";
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
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingProgress } from "@/components/paraguay/booking-progress";
import { BookingTimer } from "@/components/paraguay/booking-timer";
import { SeatMap } from "@/components/paraguay/seat-map";
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
    outboundConnectionId,
    returnConnectionId,
    setOutboundConnectionId,
    setReturnConnectionId,
    addFailedSeats,
    removeSeat,
    removeReturnSeat,
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

    trackInitiateCheckout();
    router.push("/paraguay/booking/details");
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

  // Verificar si se puede continuar (mínimo 1 asiento, máximo 4)
  const canContinue =
    currentSelectedSeats.length > 0 &&
    currentSelectedSeats.length <= maxAllowed;

  // Calcular total bruto de los asientos seleccionados sin cargos extra
  const bruteTotal = [...selectedSeats, ...selectedReturnSeats].reduce(
    (acc, seat) => acc + seat.price,
    0,
  );

  // Limpiar error de bloqueo cuando el botón se vuelve a habilitar (nueva selección válida)
  useEffect(() => {
    if (canContinue && blockError) {
      setBlockError(null);
    }
  }, [canContinue, blockError]);

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

  const companyCode = (currentTrip?.company || "").toUpperCase();
  let companyName = currentTrip?.company || "";
  let companyLogo = null;
  let isObjectFitContain = false;

  if (
    companyCode === "LSN" ||
    companyCode === "LSA" ||
    companyCode.includes("SANTANIANA")
  ) {
    companyName =
      companyCode === "LSA" ? "La Santaniana Argentina" : "La Santaniana";
    companyLogo = "/logos/santaniana-color.jpeg";
  } else if (companyCode === "LSP" || companyCode.includes("SAMPEDRANA")) {
    companyName = "La Sampedrana";
    companyLogo = "/logos/logo-la-sampedrana.original.png";
    isObjectFitContain = true;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419]">
        <div className="text-center text-slate-900 dark:text-white px-4">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419]">
        <div className="text-center text-slate-900 dark:text-white px-4">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">
            No hay viaje seleccionado
          </p>
          <p className="text-muted-foreground mb-4">
            Por favor, selecciona un servicio primero
          </p>
          <Button
            onClick={() => router.push("/paraguay")}
            className="bg-primary hover:bg-primary/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] text-slate-900 dark:text-white w-full">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden dark:block">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Seat Selection */}
              <div className="lg:col-span-2">
                {/* Trip Info Card */}
                <div className="animate-fade-in">
                  {/* Vista Desktop (Original restaurada) */}
                  <Card className="hidden sm:block p-4 md:p-6 mb-6 bg-white dark:bg-white/5 dark:backdrop-blur-sm border-slate-200 dark:border-white/20 overflow-hidden w-full shadow-sm">
                    <div className="flex flex-row items-center justify-between w-full mb-3 pb-2 border-b border-black/10 dark:border-white/10">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {companyLogo ? (
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center border border-black/10 dark:border-white/20">
                            <Image
                              src={companyLogo}
                              alt={companyName}
                              width={32}
                              height={32}
                              className={cn(
                                "w-full h-full",
                                isObjectFitContain
                                  ? "object-contain scale-125"
                                  : "object-cover",
                              )}
                            />
                          </div>
                        ) : (
                          <Bus className="h-5 w-5 md:h-6 md:w-6 text-primary flex-shrink-0" />
                        )}
                        <span className="font-bold text-sm md:text-base lg:text-lg text-slate-900 dark:text-white truncate">
                          {companyName}
                        </span>
                        <span className="text-xs md:text-sm text-slate-900 dark:text-white/60 truncate">
                          {currentTrip?.busType}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium flex-shrink-0",
                          selectingReturn
                            ? "bg-secondary/10 text-secondary border border-secondary/30"
                            : "bg-primary/10 text-primary border border-primary/30",
                        )}
                      >
                        {selectingReturn ? "Regreso" : "Ida"}
                      </span>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-3 w-full">
                      {/* Salida */}
                      <div className="flex flex-col items-start gap-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                          {currentTrip?.departureTime}
                        </p>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 text-slate-900 dark:text-white/60 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60 truncate max-w-[100px] md:max-w-[120px]">
                            {currentOriginTitle}
                          </span>
                        </div>
                      </div>

                      {/* Duración */}
                      <div className="flex flex-col items-center justify-center gap-0 px-2 leading-tight">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-900 dark:text-white/60 flex-shrink-0" />
                        <span className="text-xs text-slate-900 dark:text-white/60 whitespace-nowrap">
                          {currentTrip?.duration}
                        </span>
                        <div className="w-16 h-0.5 bg-black/20 dark:bg-white/20 mt-1" />
                      </div>

                      {/* Llegada */}
                      <div className="flex flex-col items-end gap-0">
                        <p className="text-lg md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                          {currentTrip?.arrivalTime}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60 truncate max-w-[100px] md:max-w-[120px]">
                            {currentDestinationTitle}
                          </span>
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 text-slate-900 dark:text-white/60 flex-shrink-0" />
                        </div>
                      </div>

                      {/* Fecha y Precio */}
                      <div className="flex flex-col items-end lg:ml-4 border-l border-black/10 dark:border-white/10 pl-4">
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/60">
                          {format(
                            parse(currentDate || "", "yyyy-MM-dd", new Date()),
                            "EEE d MMM",
                            { locale: es },
                          )}
                        </p>
                        <p className="text-base md:text-lg lg:text-xl font-bold text-secondary whitespace-nowrap">
                          Gs. {currentTrip?.price.toLocaleString("es-PY")}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Vista Mobile (Optimización nueva) */}
                  <Card className="sm:hidden p-4 mb-6 bg-white dark:bg-white/5 dark:backdrop-blur-md border-slate-200 dark:border-white/20 overflow-hidden w-full relative shadow-sm">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
                          {companyLogo ? (
                            <Image
                              src={companyLogo}
                              alt={companyName}
                              width={40}
                              height={40}
                              className={cn(
                                "w-full h-full",
                                isObjectFitContain
                                  ? "object-contain scale-125"
                                  : "object-cover",
                              )}
                            />
                          ) : (
                            <Bus className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {companyName}
                          </h3>
                          <p className="text-[10px] text-slate-900 dark:text-white/50 truncate">
                            {currentTrip?.busType}
                          </p>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 border",
                          selectingReturn
                            ? "bg-secondary/10 text-secondary border-secondary/30"
                            : "bg-primary/10 text-primary border-primary/30",
                        )}
                      >
                        {selectingReturn ? "Regreso" : "Ida"}
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-slate-900 dark:text-white/40 uppercase tracking-widest leading-none">
                            Salida
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {currentTrip?.departureTime}
                          </p>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-sm text-slate-900 dark:text-white/70 truncate max-w-[120px]">
                              {currentOriginTitle}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xs font-medium text-slate-900 dark:text-white/40 uppercase tracking-widest leading-none">
                            Llegada
                          </p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
                            {currentTrip?.arrivalTime}
                          </p>
                          <div className="flex items-center gap-1 justify-end">
                            <span className="text-sm text-slate-900 dark:text-white/70 truncate max-w-[120px]">
                              {currentDestinationTitle}
                            </span>
                            <MapPin className="h-3 w-3 text-secondary shrink-0" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-900 dark:text-white/40" />
                            <span className="text-xs text-slate-900 dark:text-white/60">
                              {format(
                                parse(
                                  currentDate || "",
                                  "yyyy-MM-dd",
                                  new Date(),
                                ),
                                "d MMM",
                                { locale: es },
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-900 dark:text-white/40" />
                            <span className="text-xs text-slate-900 dark:text-white/60">
                              {currentTrip?.duration}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-secondary leading-none">
                            Gs. {currentTrip?.price.toLocaleString("es-PY")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

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


              </div>

              {/* Summary Sidebar */}
              <div className="lg:col-span-1 lg:sticky lg:top-24 self-start z-20">
                <Card className="p-4 md:p-6 animate-slide-in-right bg-white dark:bg-white/5 dark:backdrop-blur-sm border-slate-200 dark:border-white/20 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                      Resumen de Reserva
                    </h3>
                    <BookingTimer />
                  </div>

                  {/* Asientos seleccionados contador */}
                  <div className="mb-4 p-3 bg-black/10 dark:bg-white/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-slate-900 dark:text-white/60">
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
                  <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-black/10 dark:border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 flex-shrink-0">
                        <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm md:text-base text-slate-900 dark:text-white">
                        Viaje de Ida
                      </span>
                    </div>
                    <div className="pl-8 md:pl-10 space-y-1.5 md:space-y-2">
                      <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                        <span className="text-slate-900 dark:text-white/60">
                          Fecha:
                        </span>{" "}
                        {format(
                          parse(departureDate || "", "yyyy-MM-dd", new Date()),
                          "dd MMM yyyy",
                          {
                            locale: es,
                          },
                        )}
                      </p>
                      <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                        <span className="text-slate-900 dark:text-white/60">
                          Horario:
                        </span>{" "}
                        {selectedOutboundTrip?.departureTime} -{" "}
                        {selectedOutboundTrip?.arrivalTime}
                      </p>
                      <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                        <span className="text-slate-900 dark:text-white/60">
                          Asientos:
                        </span>{" "}
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
                    <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-black/10 dark:border-white/20">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 flex-shrink-0">
                          <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-secondary rotate-180" />
                        </div>
                        <span className="font-medium text-sm md:text-base text-slate-900 dark:text-white">
                          Viaje de Regreso
                        </span>
                      </div>
                      <div className="pl-8 md:pl-10 space-y-1.5 md:space-y-2">
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                          <span className="text-slate-900 dark:text-white/60">
                            Fecha:
                          </span>{" "}
                          {format(
                            parse(returnDate || "", "yyyy-MM-dd", new Date()),
                            "dd MMM yyyy",
                            {
                              locale: es,
                            },
                          )}
                        </p>
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                          <span className="text-slate-900 dark:text-white/60">
                            Horario:
                          </span>{" "}
                          {selectedReturnTrip?.departureTime} -{" "}
                          {selectedReturnTrip?.arrivalTime}
                        </p>
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/80">
                          <span className="text-slate-900 dark:text-white/60">
                            Asientos:
                          </span>{" "}
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
                  <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-black/10 dark:border-white/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-slate-900 dark:text-white/60 flex-shrink-0" />
                      <span className="font-medium text-sm md:text-base text-slate-900 dark:text-white">
                        {selectedSeats.length + selectedReturnSeats.length}{" "}
                        Pasajeros
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-base md:text-lg font-medium text-slate-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary">
                        Gs. {bruteTotal.toLocaleString("es-PY")}
                      </span>
                    </div>
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
                        Reservando boletos...
                      </>
                    ) : tripType === "round-trip" &&
                      !selectingReturn &&
                      selectedReturnTrip ? (
                      "Seleccionar Asientos de Regreso"
                    ) : (
                      "Continuar a Datos"
                    )}
                    {!isBlocking && (
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>

                  {blockError && (
                    <Alert
                      variant="destructive"
                      className="mt-4 animate-fade-in py-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs mt-1">
                        {blockError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {!canContinue && (
                    <div className="mt-3">
                      {hasExceededLimit ? (
                        <p className="text-xs md:text-sm text-destructive text-center font-medium animate-pulse">
                          Máximo {maxAllowed} asientos permitidos
                        </p>
                      ) : currentSelectedSeats.length === 0 ? (
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/70 text-center">
                          Elegí al menos 1 asiento para continuar
                        </p>
                      ) : (
                        <p className="text-xs md:text-sm text-slate-900 dark:text-white/70 text-center">
                          Elegí los asientos de regreso
                        </p>
                      )}
                    </div>
                  )}
                </Card>

            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-white/10">
            {/* Desktop */}
            <div className="hidden sm:flex justify-start">
              <Button
                variant="outline"
                onClick={() => {
                  router.push("/paraguay/booking/services");
                }}
                className="border-slate-200 dark:border-white/20 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-black/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a seleccionar servicio
              </Button>
            </div>
            {/* Mobile */}
            <div className="sm:hidden flex justify-center w-full">
              <Button
                variant="ghost"
                onClick={() => {
                  if (selectingReturn) {
                    setSelectingReturn(false);
                  } else {
                    router.push("/paraguay/booking/services");
                  }
                }}
                className="text-slate-900 dark:text-white/60 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5 w-full bg-black/5 border border-black/10 dark:border-white/10 h-12"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {selectingReturn
                  ? "Volver a asientos de ida"
                  : "Volver a seleccionar servicio"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
