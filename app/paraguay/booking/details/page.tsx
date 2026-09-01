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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const [hasBenefit, setHasBenefit] = useState(false);
  const [benefits, setBenefits] = useState<any[]>([]);
  const [isLoadingBenefits, setIsLoadingBenefits] = useState(false);
  const [hasFetchedBenefits, setHasFetchedBenefits] = useState(false);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string>("");
  const [benefitRut, setBenefitRut] = useState("");
  const [isApplyingBenefit, setIsApplyingBenefit] = useState(false);
  const [benefitError, setBenefitError] = useState<string | null>(null);

  useEffect(() => {
    if (hasBenefit && !hasFetchedBenefits) {
      setIsLoadingBenefits(true);
      fetch("/api/convenios?beneficio=true&tipo_not=CODIGO_DESCUENTO")
        .then((res) => res.json())
        .then((data) => {
          if (data.rows) {
            const filtered = data.rows.filter((b: any) => b.status === "ACTIVO");
            setBenefits(filtered);
          }
          setHasFetchedBenefits(true);
        })
        .catch((err) => {
          console.error("Error al obtener beneficios:", err);
          setHasFetchedBenefits(true);
        })
        .finally(() => {
          setIsLoadingBenefits(false);
        });
    }
  }, [hasBenefit, hasFetchedBenefits]);

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
    setBookingExpiresAt,
    calculateTotal,
    totalPrice,
    originTitle,
    destinationTitle,
    discountCode,
    discountPercentage,
    serviceCharge,
    dynamicServiceCharge,
    appliedServiceChargeAmount,
    fetchServiceCharge,
    setDiscount,
    outboundConnectionId,
    returnConnectionId,
    setOutboundConnectionId,
    setReturnConnectionId,
    addFailedSeats,
  } = useBookingStore();

  useEffect(() => {
    setMounted(true);
    setStep(3); // Paso Datos
    fetchServiceCharge();
  }, [setStep, fetchServiceCharge]);

  useEffect(() => {
    calculateTotal();
  }, [calculateTotal, discountPercentage, passengerDetails.length]);

  // Si no hay asientos, volver al buscador
  useEffect(() => {
    if (mounted && selectedSeats.length === 0) {
      router.push("/paraguay");
    }
  }, [mounted, selectedSeats, router]);

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

  const handleGoBackToSeats = async () => {
    // Si hay connectionIds (ej. si el usuario regresó desde el checkout por navegador e intenta retroceder más)
    const promises = [];
    if (outboundConnectionId) {
      console.log(
        `[Details] Liberando asiento de ida preventivo: ${outboundConnectionId}`,
      );
      promises.push(
        fetch("/api/gds/unblock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId: outboundConnectionId }),
        }).catch((e) => console.error("Error al liberar asiento de ida:", e)),
      );
    }
    if (returnConnectionId) {
      console.log(
        `[Details] Liberando asiento de vuelta preventivo: ${returnConnectionId}`,
      );
      promises.push(
        fetch("/api/gds/unblock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connectionId: returnConnectionId }),
        }).catch((e) =>
          console.error("Error al liberar asiento de vuelta:", e),
        ),
      );
    }
    if (promises.length > 0) {
      await Promise.all(promises);
    }
    setOutboundConnectionId(null);
    setReturnConnectionId(null);
    router.push("/paraguay/booking/seats");
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError(null);
    setDiscountSuccess(null);
    try {
      const res = await fetch(`/api/convenios/validar/${discountInput.trim()}`);
      const data = await res.json();
      if (!res.ok || !data.valido) {
        throw new Error(data.error || data.msj || "Código inválido");
      }

      const percentage = data.descuento;
      if (percentage && percentage > 0 && percentage <= 100) {
        setDiscount(
          discountInput.trim(),
          percentage,
          data.empresa_convenio,
          data.convenio,
          data.cargo_por_servicio,
          data.valor_cargo_servicio,
        );
        setDiscountSuccess(
          `¡Descuento de ${percentage}% aplicado! ${data.nombre ? `(${data.nombre})` : ""}`,
        );
      } else {
        throw new Error("El código no tiene un porcentaje válido asociado");
      }
    } catch (err: any) {
      setDiscountError(err.message);
      setDiscount(null, null); // Clear discount si era inválido
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

  const handleApplyBenefit = async () => {
    if (!selectedBenefitId || !benefitRut.trim()) return;
    const selectedBenefit = benefits.find(b => b.id.toString() === selectedBenefitId);
    
    setIsApplyingBenefit(true);
    setBenefitError(null);
    setDiscountSuccess(null);
    setDiscountError(null);

    try {
      const endpoint = selectedBenefit?.endpoint || "/integraciones/beneficiarios/validar";
      const res = await fetch("/api/beneficiarios/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          rut: benefitRut.trim(), 
          convenio_id: parseInt(selectedBenefitId),
          endpointUrl: endpoint
        })
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        let msg = "Error al validar el beneficio";
        if (data.errors && data.errors.length > 0) {
           msg = data.errors[0].mensaje;
        } else if (data.mensaje) {
           msg = data.mensaje;
        } else if (data.message) {
           msg = data.message;
        } else if (data.error) {
           msg = data.error;
        }
        setBenefitError(msg);
        return;
      }

      if (data.afiliado === false) {
        setBenefitError(data.mensaje || "El documento no está registrado para este beneficio.");
        return;
      }

      const percentage = selectedBenefit ? parseFloat(selectedBenefit.valor_descuento || "0") : 0;
      
      if (percentage > 0 && percentage <= 100) {
        setDiscount(
          "BENEFICIO",
          percentage,
          selectedBenefit?.empresa_nombre,
          selectedBenefit?.nombre,
          selectedBenefit?.cargo_por_servicio,
          selectedBenefit?.valor_cargo_servicio
        );
      } else {
        setBenefitError("El beneficio no tiene un porcentaje válido asociado.");
      }
    } catch (e: any) {
      setBenefitError("Error de conexión al validar el beneficio.");
    } finally {
      setIsApplyingBenefit(false);
    }
  };

  const handleRemoveBenefit = () => {
    setDiscount(null, null, null, null);
    setBenefitRut("");
    setSelectedBenefitId("");
    setHasBenefit(false);
  };

  const handleContinue = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // 1. Auto-guardar (crear) pasajeros
      const saveTasks = selectedSeats.map(async (_, i) => {
        const p = passengerDetails[i];
        if (!p || !p.documentNumber || !p.firstName || !p.lastName) return;

        const res = await fetch("/api/gds/passenger/create", {
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

        if (!res.ok) {
          const err = await res.json();
          throw new Error(
            err.error ||
              `Error al registrar los datos del pasajero ${p.firstName} ${p.lastName}`,
          );
        }
      });

      await Promise.all(saveTasks);

      // 2. Bloquear asientos de ida
      try {
        const res = await fetch("/api/gds/block", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedOutboundTrip?.id,
            originId: selectedOutboundTrip?.origin,
            destinationId: selectedOutboundTrip?.destination,
            seats: selectedSeats.map((s) => s.number).join(","),
            ...(outboundConnectionId && { connectionId: outboundConnectionId }),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Error al reservar asientos de ida");
        }

        const data = await res.json();
        const blockData = data.data || data;

        console.log("=== INSPECCIÓN GDS BLOCK (IDA) ===");
        console.log(JSON.stringify(blockData, null, 2));

        const isGdsError =
          blockData.success === false ||
          (blockData.providerResult && blockData.providerResult !== "0");

        if (isGdsError) {
          const detail =
            blockData.Descripcion ||
            blockData.raw?.Descripcion ||
            blockData.message ||
            blockData.error?.message ||
            blockData.error;
          throw new Error(
            detail
              ? `No se pudo reservar el asiento (${detail}). Por favor regresa a la selección de asientos y elige otro.`
              : "No se pudo reservar el asiento. Por favor regresa a la selección de asientos y elige otro.",
          );
        }

        if (blockData.connectionId) {
          setOutboundConnectionId(blockData.connectionId);
        }
      } catch (err: any) {
        if (selectedOutboundTrip) {
          addFailedSeats(
            selectedOutboundTrip.id,
            selectedSeats.map((s) => s.number),
          );
        }
        throw err;
      }

      // 3. Bloquear asientos de regreso (si aplica)
      if (
        tripType === "round-trip" &&
        selectedReturnTrip &&
        selectedReturnSeats.length > 0
      ) {
        try {
          const returnRes = await fetch("/api/gds/block", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              serviceId: selectedReturnTrip.id,
              originId: selectedReturnTrip.origin,
              destinationId: selectedReturnTrip.destination,
              seats: selectedReturnSeats.map((s) => s.number).join(","),
              ...(returnConnectionId && { connectionId: returnConnectionId }),
            }),
          });

          if (!returnRes.ok) {
            const err = await returnRes.json();
            throw new Error(
              err.error || "Error al reservar asientos de regreso",
            );
          }

          const returnData = await returnRes.json();
          const returnBlockData = returnData.data || returnData;

          console.log("=== INSPECCIÓN GDS BLOCK (VUELTA) ===");
          console.log(JSON.stringify(returnBlockData, null, 2));

          const isReturnGdsError =
            returnBlockData.success === false ||
            (returnBlockData.providerResult &&
              returnBlockData.providerResult !== "0");

          if (isReturnGdsError) {
            const detail =
              returnBlockData.Descripcion ||
              returnBlockData.raw?.Descripcion ||
              returnBlockData.message ||
              returnBlockData.error?.message ||
              returnBlockData.error;
            throw new Error(
              detail
                ? `No se pudo reservar el asiento de regreso (${detail}). Por favor regresa a la selección de asientos y elige otro.`
                : "No se pudo reservar el asiento de regreso. Por favor regresa a la selección de asientos y elige otro.",
            );
          }

          if (returnBlockData.connectionId) {
            setReturnConnectionId(returnBlockData.connectionId);
          }
        } catch (err: any) {
          if (selectedReturnTrip) {
            addFailedSeats(
              selectedReturnTrip.id,
              selectedReturnSeats.map((s) => s.number),
            );
          }
          throw err;
        }
      }

      // Iniciar el temporizador global al bloquear los asientos
      setBookingExpiresAt(Date.now() + 10 * 60 * 1000);
      router.push("/paraguay/booking/checkout");
    } catch (err: any) {
      console.error("Save / Block error:", err);
      setSaveError(
        err.message ||
          "Hubo un error al procesar tu reserva. Por favor intenta de nuevo.",
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
                  Completá tus datos
                </h1>
                <p className="text-sm md:text-base text-slate-900 dark:text-white/60 mt-1 md:mt-2">
                  Ingresa los detalles de los pasajeros para continuar con el
                  pago
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

              {/* Descuentos */}
              <Card className="p-4 md:p-6 bg-white dark:bg-white/5 dark:backdrop-blur-sm border-slate-200 dark:border-white/20 animate-fade-in shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-5 w-5 text-secondary" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Código de Descuento
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
                    Tengo un código de descuento
                  </span>
                </label>

                {(hasDiscount || discountCode) && (
                  <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/10 animate-fade-in">
                    {!discountPercentage ? (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ingresá tu código"
                          value={discountInput}
                          onChange={(e) =>
                            setDiscountInput(e.target.value.toUpperCase())
                          }
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
                              {discountSuccess ||
                                `¡Descuento de ${discountPercentage}% aplicado!`}
                            </p>
                            <p className="text-xs opacity-80">
                              Código: {discountCode}
                            </p>
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

              {/* Beneficios Activos */}
              <Card className="p-4 md:p-6 bg-white dark:bg-white/5 dark:backdrop-blur-sm border-slate-200 dark:border-white/20 animate-fade-in shadow-sm mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCheck className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Aplicar Beneficio Activo
                  </h3>
                </div>

                <label className="flex items-center gap-2 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    checked={hasBenefit || !!(discountCode && discountCode === "BENEFICIO" && !hasDiscount)}
                    onChange={(e) => {
                      if (!e.target.checked && discountCode) {
                        handleRemoveBenefit();
                      }
                      setHasBenefit(e.target.checked);
                    }}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Soy parte del Club de Beneficios
                  </span>
                </label>

                {(hasBenefit || (discountCode && discountCode === "BENEFICIO" && !hasDiscount)) && (
                  <div className="space-y-4 pt-2 border-t border-black/5 dark:border-white/10 animate-fade-in">
                    {!discountPercentage ? (
                      <div className="flex flex-col gap-3">
                        {isLoadingBenefits ? (
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-3">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>Cargando beneficios disponibles...</span>
                          </div>
                        ) : benefits.length === 0 && hasFetchedBenefits ? (
                          <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg text-amber-800 dark:text-amber-300 text-sm flex items-start gap-2.5">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-xs sm:text-sm">No hay beneficios activos disponibles</p>
                              <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                                En este momento no existen convenios o beneficios activos habilitados para selección.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Select
                              value={selectedBenefitId}
                              onValueChange={setSelectedBenefitId}
                            >
                              <SelectTrigger className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white h-11">
                                <SelectValue placeholder="Selecciona tu beneficio" />
                              </SelectTrigger>
                              <SelectContent className="bg-white dark:bg-[#1a2332] border-slate-200 dark:border-white/10">
                                {benefits.map(b => (
                                  <SelectItem key={b.id} value={b.id.toString()}>
                                    {b.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nro. Documento (RUT/CI)"
                                value={benefitRut}
                                onChange={(e) => setBenefitRut(e.target.value)}
                                className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/20"
                              />
                              <Button
                                onClick={handleApplyBenefit}
                                disabled={!benefitRut.trim() || !selectedBenefitId || isApplyingBenefit}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]"
                              >
                                {isApplyingBenefit ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Validar"
                                )}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <Check className="h-5 w-5" />
                          <div>
                            <p className="font-medium text-sm">
                              {discountSuccess || `¡Beneficio de ${discountPercentage}% aplicado!`}
                            </p>
                            <p className="text-xs opacity-80">
                              Documento: {benefitRut}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveBenefit}
                          className="text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          Quitar
                        </Button>
                      </div>
                    )}

                    {benefitError && (
                      <p className="text-sm text-destructive font-medium flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" />
                        {benefitError}
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

                {/* Resumen Viajes - Simplificado */}
                <div className="space-y-4 mb-6">
                  {/* Ida */}
                  <div className="pb-4 border-b border-black/10 dark:border-white/20">
                    <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">
                      Ida: {originTitle} - {destinationTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/60 mb-2">
                      {format(
                        parse(departureDate || "", "yyyy-MM-dd", new Date()),
                        "dd MMM yyyy",
                        { locale: es },
                      )}{" "}
                      • {selectedOutboundTrip?.departureTime}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-white/70">
                        Asientos ({selectedSeats.length})
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        Gs.{" "}
                        {selectedSeats
                          .reduce((acc, s) => acc + s.price, 0)
                          .toLocaleString("es-PY")}
                      </span>
                    </div>
                  </div>

                  {/* Regreso */}
                  {tripType === "round-trip" && selectedReturnTrip && (
                    <div className="pb-4 border-b border-black/10 dark:border-white/20">
                      <p className="font-semibold text-sm mb-1 text-slate-900 dark:text-white">
                        Regreso: {destinationTitle} - {originTitle}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-white/60 mb-2">
                        {format(
                          parse(returnDate || "", "yyyy-MM-dd", new Date()),
                          "dd MMM yyyy",
                          { locale: es },
                        )}{" "}
                        • {selectedReturnTrip?.departureTime}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-white/70">
                          Asientos ({selectedReturnSeats.length})
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          Gs.{" "}
                          {selectedReturnSeats
                            .reduce((acc, s) => acc + s.price, 0)
                            .toLocaleString("es-PY")}
                        </span>
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
                          Gs.{" "}
                          {(
                            selectedSeats.reduce((acc, s) => acc + s.price, 0) +
                            selectedReturnSeats.reduce(
                              (acc, s) => acc + s.price,
                              0,
                            )
                          ).toLocaleString("es-PY")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3 text-green-600 dark:text-green-400 font-medium">
                        <span>Descuento ({discountPercentage}%)</span>
                        <span>
                          - Gs.{" "}
                          {(
                            (selectedSeats.reduce(
                              (acc, s) => acc + s.price,
                              0,
                            ) +
                              selectedReturnSeats.reduce(
                                (acc, s) => acc + s.price,
                                0,
                              )) *
                            (discountPercentage / 100)
                          ).toLocaleString("es-PY")}
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
                                aria-label="Información sobre el cargo por servicio"
                              >
                                <HelpCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                              </button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            sideOffset={6}
                            className="z-50 max-w-xs sm:max-w-sm bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl shadow-xl backdrop-blur-md"
                          >
                            <p className="text-sm font-normal text-slate-700 dark:text-slate-200 leading-relaxed">
                              Este cargo te da acceso a nuestro amplio catálogo,
                              servicios de atención al cliente y devolución de
                              los pasajes cuando sea posible.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      Gs. {appliedServiceChargeAmount.toLocaleString("es-PY")}
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
                    Completá los datos de todos los pasajeros
                  </div>
                )}

                {saveError && (
                  <div className="text-sm text-destructive font-medium flex items-center gap-1.5 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-fade-in">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Action Buttons inside Card */}
                <div className="w-full flex flex-col gap-3 mt-4">
                  <Button
                    onClick={handleContinue}
                    disabled={!arePassengersComplete || isSaving}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 md:h-14 text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Continuando...
                      </>
                    ) : (
                      "Continuar al Pago"
                    )}
                    {!isSaving && (
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          {/* Navigation buttons */}
          <div className="flex justify-start items-center mt-8 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button
              variant="outline"
              onClick={handleGoBackToSeats}
              className="border-slate-200 dark:border-white/20 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-black/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a seleccionar asientos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
