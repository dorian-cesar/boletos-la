"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Loader2,
  AlertCircle,
  Tag,
  Check,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingProgress } from "@/components/paraguay/booking-progress";
import { BookingTimer } from "@/components/paraguay/booking-timer";
import { PassengerForm } from "@/components/paraguay/passenger-form";
import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DetailsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);

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
    discountCode,
    discountPercentage,
    serviceCharge,
    setDiscount,
  } = useBookingStore();

  useEffect(() => {
    setMounted(true);
    setStep(3); // Paso Datos
    calculateTotal();
  }, [setStep, calculateTotal]);

  // Si no hay asientos, volver al buscador
  useEffect(() => {
    if (mounted && selectedSeats.length === 0) {
      router.push("/paraguay");
    }
  }, [mounted, selectedSeats, router]);

  // Validar que los pasajeros de IDA estÃ©n completos
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

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError(null);
    setDiscountSuccess(null);
    try {
      const res = await fetch(`/api/convenios/validar/${discountInput.trim()}`);
      const data = await res.json();
      if (!res.ok || !data.valido) {
        throw new Error(data.error || data.msj || "CÃ³digo invÃ¡lido");
      }
      
      const percentage = data.descuento;
      if (percentage && percentage > 0 && percentage <= 100) {
        setDiscount(
          discountInput.trim(),
          percentage,
          data.empresa_convenio,
          data.convenio,
          data.cargo_por_servicio,
          data.valor_cargo_servicio
        );
        setDiscountSuccess(`Â¡Descuento de ${percentage}% aplicado! ${data.nombre ? `(${data.nombre})` : ''}`);
      } else {
        throw new Error("El cÃ³digo no tiene un porcentaje vÃ¡lido asociado");
      }
    } catch (err: any) {
      setDiscountError(err.message);
      setDiscount(null, null); // Clear discount si era invÃ¡lido
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscount(null, null, null, null);
    setDiscountInput("");
    setDiscountSuccess(null);
    setHasDiscount(false);
  };

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Auto-guardar pasajeros antes del checkout final
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

      router.push("/paraguay/booking/checkout");
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(
        err.message ||
          "Hubo un error al guardar los pasajeros. Por favor intenta de nuevo.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1419] flex flex-col">
      <BookingProgress />
      
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <div className="mb-6 animate-fade-in">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  CompletÃ¡ tus datos
                </h1>
                <p className="text-sm md:text-base text-slate-900 dark:text-white/60 mt-1 md:mt-2">
                  Ingresa los detalles de los pasajeros para continuar con el pago
                </p>
              </div>

              {/* Passenger Forms */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                      Datos de los Pasajeros
                    </h3>
                    <span className="text-xs text-slate-900 dark:text-white/50 ml-1">
                      ({selectedSeats.length} asiento{selectedSeats.length > 1 ? "s" : ""})
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

              {/* Descuentos */}
              <Card className="p-4 md:p-6 bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/20 animate-fade-in shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    CÃ³digo de Descuento
                  </h3>
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    checked={hasDiscount || !!discountCode}
                    onChange={(e) => {
                      if (!e.target.checked && discountCode) {
                        handleRemoveDiscount();
                      }
                      setHasDiscount(e.target.checked);
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tengo un cÃ³digo de descuento
                  </span>
                </label>

                {(hasDiscount || discountCode) && (
                  <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/10 animate-fade-in">
                    {!discountPercentage ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ingresa tu cÃ³digo"
                          value={discountInput}
                          onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                          className="uppercase bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20"
                        />
                        <Button 
                          onClick={handleApplyDiscount}
                          disabled={!discountInput.trim() || isApplyingDiscount}
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground min-w-[100px]"
                        >
                          {isApplyingDiscount ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Validar"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Check className="h-5 w-5" />
                          <div>
                            <p className="font-medium text-sm">
                              {discountSuccess || `Â¡Descuento de ${discountPercentage}% aplicado!`}
                            </p>
                            <p className="text-xs opacity-80">CÃ³digo: {discountCode}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleRemoveDiscount}
                          className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          Quitar
                        </Button>
                      </div>
                    )}
                    
                    {discountError && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        {discountError}
                      </p>
                    )}
                  </div>
                )}
              </Card>

              {saveError && (
                <div className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-4">
                  <AlertCircle className="h-4 w-4" />
                  {saveError}
                </div>
              )}

              {/* Navigation buttons */}
              <div className="hidden sm:flex justify-between items-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => router.push("/paraguay/booking/seats")}
                  className="border-black/10 dark:border-white/20 text-slate-900 dark:text-white bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver a asientos
                </Button>
                
                <Button
                  onClick={handleContinue}
                  disabled={!arePassengersComplete || isSaving}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 px-8 text-base font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Continuando...
                    </>
                  ) : (
                    "Continuar al Pago"
                  )}
                  {!isSaving && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 self-start z-20">
              <Card className="p-4 md:p-6 sticky top-24 animate-slide-in-right bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/20 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                    Resumen de Reserva
                  </h3>
                  <BookingTimer />
                </div>

                {/* Resumen Viajes - Simplificado */}
                <div className="space-y-4 mb-6">
                  {/* Ida */}
                  <div className="pb-4 border-b border-black/10 dark:border-white/20">
                    <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Ida: {originTitle} - {destinationTitle}</p>
                    <p className="text-xs text-slate-500 dark:text-white/60 mb-2">
                      {format(parse(departureDate || "", "yyyy-MM-dd", new Date()), "dd MMM yyyy", { locale: es })} â€¢ {selectedOutboundTrip?.departureTime}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-white/70">Asientos ({selectedSeats.length})</span>
                      <span className="font-medium text-slate-900 dark:text-white">Gs. {selectedSeats.reduce((acc, s) => acc + s.price, 0).toLocaleString("es-PY")}</span>
                    </div>
                  </div>
                  
                  {/* Regreso */}
                  {tripType === "round-trip" && selectedReturnTrip && (
                    <div className="pb-4 border-b border-black/10 dark:border-white/20">
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">Regreso: {destinationTitle} - {originTitle}</p>
                      <p className="text-xs text-slate-500 dark:text-white/60 mb-2">
                        {format(parse(returnDate || "", "yyyy-MM-dd", new Date()), "dd MMM yyyy", { locale: es })} â€¢ {selectedReturnTrip?.departureTime}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">Asientos ({selectedReturnSeats.length})</span>
                        <span className="font-medium text-slate-900 dark:text-white">Gs. {selectedReturnSeats.reduce((acc, s) => acc + s.price, 0).toLocaleString("es-PY")}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="mb-4">
                  {discountPercentage ? (
                    <>
                      <div className="flex items-center justify-between text-sm mb-1 text-slate-500 dark:text-white/60 line-through">
                        <span>Subtotal</span>
                        <span>
                          Gs. {(
                            selectedSeats.reduce((acc, s) => acc + s.price, 0) + 
                            selectedReturnSeats.reduce((acc, s) => acc + s.price, 0)
                          ).toLocaleString("es-PY")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3 text-green-600 dark:text-green-400 font-medium">
                        <span>Descuento ({discountPercentage}%)</span>
                        <span>
                          - Gs. {((
                            selectedSeats.reduce((acc, s) => acc + s.price, 0) + 
                            selectedReturnSeats.reduce((acc, s) => acc + s.price, 0)
                          ) * (discountPercentage / 100)).toLocaleString("es-PY")}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className="flex items-center justify-between text-sm mb-3 text-slate-600 dark:text-white/70">
                    <span className="flex items-center gap-2">
                      <span>Cargo por servicio</span>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="relative inline-flex items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-secondary opacity-50"></span>
                              <button
                                type="button"
                                className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary/20 hover:bg-secondary/30 text-amber-700 dark:text-secondary border border-secondary/50 transition-all duration-200 hover:scale-125 shadow-xs cursor-pointer focus:outline-none"
                                aria-label="InformaciÃ³n sobre el cargo por servicio"
                              >
                                <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent 
                            side="top" 
                            sideOffset={6}
                            className="z-50 max-w-xs sm:max-w-sm bg-slate-900 text-white dark:bg-slate-950 dark:text-white border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-2xl"
                          >
                            <p className="text-sm sm:text-base font-normal text-slate-100 leading-relaxed">
                              texto de ejemplo
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Gs. {((selectedSeats.length + selectedReturnSeats.length) * serviceCharge).toLocaleString("es-PY")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base md:text-lg font-medium text-slate-900 dark:text-white">
                      Total a Pagar
                    </span>
                    <span className="text-xl md:text-2xl font-bold text-secondary">
                      Gs. {totalPrice.toLocaleString("es-PY")}
                    </span>
                  </div>
                </div>

                {!arePassengersComplete && (
                   <div className="flex items-center gap-2 bg-orange-500/15 text-orange-600 dark:text-orange-400 p-3 rounded-lg border border-orange-500/30 mb-4 text-xs font-medium">
                     <AlertCircle className="h-4 w-4 shrink-0" />
                     CompletÃ¡ los datos de todos los pasajeros
                   </div>
                )}

                {/* Continue Button Mobile */}
                <div className="sm:hidden w-full flex flex-col gap-3 mt-4">
                  <Button
                    onClick={handleContinue}
                    disabled={!arePassengersComplete || isSaving}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base font-semibold"
                  >
                    {isSaving ? "Continuando..." : "Continuar al Pago"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push("/paraguay/booking/seats")}
                    className="w-full text-slate-900 dark:text-white/60 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 h-12"
                  >
                    Volver a asientos
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

