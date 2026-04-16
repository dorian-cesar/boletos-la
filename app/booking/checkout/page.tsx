"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bus,
  User,
  CreditCard,
  Shield,
  Lock,
  CheckCircle2,
  Loader2,
  Check,
  Wallet,
  ArrowRight,
  MapPin,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { encryptData } from "@/lib/pagopar-encrypt";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "tarjeta" | "pagopar" | null
  >("pagopar");

  const {
    tripType,
    departureDate,
    returnDate,
    selectedOutboundTrip,
    selectedReturnTrip,
    selectedSeats,
    selectedReturnSeats,
    passengerDetails,
    totalPrice,
    setStep,
    setBookingReference,
    setPaymentStatus,
    resetBooking,
    originTitle,
    destinationTitle,
  } = useBookingStore();

  const [timeLeft, setTimeLeft] = useState(8 * 60); // 8 minutos

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Validar que los pasajeros del store estén completos
  const isFormValid =
    passengerDetails.length > 0 &&
    passengerDetails.every(
      (p) =>
        p.firstName.trim().length >= 2 &&
        p.lastName.trim().length >= 2 &&
        p.documentNumber.trim().length >= 6 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) &&
        p.phone.replace(/\D/g, "").length >= 9,
    );

  const totalPassengers = selectedSeats.length + selectedReturnSeats.length;

  const handlePaymentMethodSelect = (method: "tarjeta" | "pagopar") => {
    setSelectedPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (passengerDetails.length === 0 || !selectedPaymentMethod) return;
    if (!isFormValid) return;

    setIsProcessing(true);
    try {
      if (selectedPaymentMethod === "tarjeta") {
        const reference = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setBookingReference(reference);
        setPaymentStatus("completed");

        await new Promise((resolve) => setTimeout(resolve, 1000));

        router.push("/booking/confirmation/tarjeta");
      } else if (selectedPaymentMethod === "pagopar") {
        const primaryPassenger = passengerDetails[0];
        if (!primaryPassenger) {
          throw new Error("No hay datos del pasajero");
        }

        const paymentData = {
          montoTotal: totalPrice,
          datosComprador: {
            nombre: primaryPassenger.firstName,
            apellido: primaryPassenger.lastName,
            email: primaryPassenger.email,
            telefono: primaryPassenger.phone.replace(/\D/g, ""),
            ruc: primaryPassenger.documentNumber,
          },
        };

        console.log("📤 Enviando a Pagopar:", paymentData);
        const encryptedData = encryptData(paymentData);

        const response = await fetch("/api/pagopar/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: encryptedData }),
        });

        const result = await response.json();
        console.log("📥 Respuesta Pagopar:", result);

        if (result.success === true && result.hash) {
          localStorage.setItem("pagopar_last_hash", result.hash);
          window.location.href = `https://www.pagopar.com/pagos/${result.hash}`;
        } else {
          throw new Error(result.message || "Error al crear pago en Pagopar");
        }
      }
    } catch (error: any) {
      console.error("❌ Error procesando pago:", error);
      setIsProcessing(false);
      alert(`Error: ${error.message || "Por favor intenta nuevamente."}`);
    }
  };

  useEffect(() => {
    setMounted(true);
    setStep(3);
  }, [setStep]);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-bounce"
            priority
          />
          <p className="text-muted-foreground">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (!selectedOutboundTrip || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">No hay reserva activa</p>
          <p className="text-muted-foreground mb-4">
            Por favor, inicia una nueva reserva
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
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background overflow-x-hidden">
      {/* Background Effects - Ajustados para no causar overflow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <BookingProgress />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Passenger Summary (read-only) */}
            <div className="lg:col-span-2 space-y-6 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold animate-fade-in text-background">
                  Resumen de Pasajeros
                </h2>
                {!isFormValid && (
                  <Badge
                    variant="outline"
                    className="animate-fade-in border-destructive/50 text-destructive shrink-0"
                  >
                    Completa los datos en la página de asientos
                  </Badge>
                )}
              </div>

              {/* Outbound passengers */}
              {selectedSeats.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">
                    Viaje de Ida
                  </p>
                  {selectedSeats.map((seat, i) => {
                    const p = passengerDetails[i];
                    const hasData = p?.firstName && p?.lastName;
                    return (
                      <Card
                        key={seat.id}
                        className="p-4 bg-background/5 backdrop-blur-sm border-background/20 animate-fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-background text-sm truncate">
                              {hasData ? (
                                `${p.firstName} ${p.lastName}`
                              ) : (
                                <span className="text-background/40 italic">
                                  Sin datos
                                </span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-background/60 mt-0.5">
                              <span className="flex items-center gap-1">
                                <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded uppercase font-medium">
                                  Ida
                                </span>
                                Asiento {seat.number}
                              </span>
                              {p?.documentNumber && (
                                <span>{p.documentNumber}</span>
                              )}
                              {p?.email && (
                                <span className="truncate max-w-[150px]">
                                  {p.email}
                                </span>
                              )}
                            </div>
                          </div>
                          {hasData && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-green-500/10 text-green-500 border-green-500/30 shrink-0 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Return passengers */}
              {tripType === "round-trip" && selectedReturnSeats.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-secondary/80">
                    Viaje de Regreso
                  </p>
                  {selectedReturnSeats.map((seat, i) => {
                    const p = passengerDetails[selectedSeats.length + i];
                    const hasData = p?.firstName && p?.lastName;
                    return (
                      <Card
                        key={seat.id}
                        className="p-4 bg-background/5 backdrop-blur-sm border-background/20 animate-fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 shrink-0">
                            <User className="h-4 w-4 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-background text-sm truncate">
                              {hasData ? (
                                `${p.firstName} ${p.lastName}`
                              ) : (
                                <span className="text-background/40 italic">
                                  Sin datos
                                </span>
                              )}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-background/60 mt-0.5">
                              <span className="flex items-center gap-1">
                                <span className="bg-secondary/20 text-secondary text-[10px] px-1.5 py-0.5 rounded uppercase font-medium">
                                  Vuelta
                                </span>
                                Asiento {seat.number}
                              </span>
                              {p?.email && (
                                <span className="truncate max-w-[150px]">
                                  {p.email}
                                </span>
                              )}
                            </div>
                          </div>
                          {hasData && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-green-500/10 text-green-500 border-green-500/30 shrink-0 text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {!isFormValid && passengerDetails.length > 0 && (
                <Card className="p-4 bg-destructive/10 border-destructive/30 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-destructive mt-0.5 shrink-0 rotate-180" />
                    <div>
                      <p className="text-sm font-medium text-destructive">
                        Datos incompletos
                      </p>
                      <p className="text-xs text-destructive/80 mt-0.5">
                        Vuelve a la selección de asientos para completar los
                        datos de los pasajeros.
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                        onClick={() => router.push("/booking/seats")}
                      >
                        ← Volver a asientos
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              {/* Payment Section */}
              <Card
                className="p-4 sm:p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20 w-full"
                style={{ animationDelay: `${totalPassengers * 150}ms` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30 shrink-0">
                    <CreditCard className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-background truncate">
                      Método de Pago
                    </h3>
                    <p className="text-sm text-background/60 truncate">
                      Selecciona tu método de pago preferido
                    </p>
                  </div>
                </div>

                {/* Payment Methods Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 w-full">
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-2 bg-background/5 backdrop-blur-sm w-full",
                      selectedPaymentMethod === "tarjeta"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-background/30 hover:border-blue-500",
                    )}
                    onClick={() => handlePaymentMethodSelect("tarjeta")}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center shrink-0">
                        <CreditCard className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-background truncate">
                          Simulación de Pago (Tarjeta)
                        </p>
                        <p className="text-xs text-background/60 truncate">
                          Simulación de pago inmediato
                        </p>
                      </div>
                      {selectedPaymentMethod === "tarjeta" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 self-start" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        "Pago instantáneo",
                        "Sin redirección",
                        "Simulación",
                      ].map((card) => (
                        <span
                          key={card}
                          className="text-xs px-2 py-1 bg-background/10 rounded text-background/80 truncate"
                        >
                          {card}
                        </span>
                      ))}
                    </div>
                  </Card>

                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-2 bg-background/5 backdrop-blur-sm w-full",
                      selectedPaymentMethod === "pagopar"
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-background/30 hover:border-purple-500",
                    )}
                    onClick={() => handlePaymentMethodSelect("pagopar")}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center shrink-0">
                        <Wallet className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-background truncate">
                          Pagopar
                        </p>
                        <p className="text-xs text-background/60 truncate">
                          Pago con tarjeta, transferencia o billetera
                          electrónica
                        </p>
                      </div>
                      {selectedPaymentMethod === "pagopar" && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 self-start" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {["Tarjetas", "Transferencia", "Billetera"].map(
                        (option) => (
                          <span
                            key={option}
                            className="text-xs px-2 py-1 bg-background/10 rounded text-background/80 truncate"
                          >
                            {option}
                          </span>
                        ),
                      )}
                    </div>
                  </Card>
                </div>

                {/* Payment Method Details */}
                <div className="bg-background/10 rounded-xl p-4 mb-6 border border-background/20 w-full">
                  {selectedPaymentMethod === "tarjeta" ? (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Shield className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm font-medium text-background truncate">
                            Pago con Tarjeta (Simulación)
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-background/10 border-background/30 text-background/80 shrink-0 self-start sm:self-auto"
                        >
                          Pago Inmediato
                        </Badge>
                      </div>
                      <p className="text-sm text-background/60 break-words">
                        Esta es una simulación de pago exitoso. Tu reserva se
                        confirmará inmediatamente sin necesidad de redirección.
                      </p>
                    </div>
                  ) : (
                    selectedPaymentMethod === "pagopar" && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Wallet className="h-5 w-5 text-purple-500 shrink-0" />
                            <span className="text-sm font-medium text-background truncate">
                              Pagopar
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-background/10 border-background/30 text-background/80 shrink-0 self-start sm:self-auto"
                          >
                            Múltiples Opciones
                          </Badge>
                        </div>
                        <p className="text-sm text-background/60 break-words">
                          Pagá con tarjeta, transferencia o billetera
                          electrónica desde Paraguay. Serás redirigido al portal
                          de Pagopar.
                        </p>
                      </div>
                    )
                  )}
                </div>

                <div className="mt-6 flex items-start gap-3 p-4 bg-primary/10 rounded-xl border border-primary/20 w-full">
                  <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="text-sm min-w-0 flex-1">
                    <p className="font-medium text-background truncate">
                      Transacción Segura
                    </p>
                    <p className="text-background/60 break-words">
                      Tu información está protegida con encriptación SSL.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary sidebar */}
            <div className="lg:col-span-1 w-full">
              <Card className="p-4 sm:p-6 sticky top-24 animate-slide-in-right bg-background/5 backdrop-blur-sm border-background/20 w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-background truncate">
                    Resumen de Compra
                  </h3>
                  <div className="flex items-center text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-md font-mono text-lg font-bold border border-orange-500/30">
                    <Timer className="w-5 h-5 mr-2 animate-pulse" />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Outbound Trip */}
                <div className="mb-6 pb-6 border-b border-background/20">
                  <p className="text-sm font-medium text-primary mb-3">
                    Viaje de Ida
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <Bus className="h-5 w-5 text-background/60 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-background truncate">
                        {selectedOutboundTrip.company}
                      </p>
                      <p className="text-sm text-background/60 truncate">
                        {selectedOutboundTrip.busType}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between gap-2">
                      <span className="text-background/60 shrink-0">Fecha</span>
                      <span className="text-background truncate text-right">
                        {format(
                          parse(departureDate || "", "yyyy-MM-dd", new Date()),
                          "dd MMM yyyy",
                          {
                            locale: es,
                          },
                        )}
                      </span>
                    </p>
                    <p className="flex justify-between gap-2">
                      <span className="text-background/60 shrink-0">Ruta</span>
                      <span className="text-background truncate text-right">
                        {originTitle} - {destinationTitle}
                      </span>
                    </p>
                    <p className="flex justify-between gap-2">
                      <span className="text-background/60 shrink-0">
                        Horario
                      </span>
                      <span className="text-background truncate text-right">
                        {selectedOutboundTrip.departureTime} -{" "}
                        {selectedOutboundTrip.arrivalTime}
                      </span>
                    </p>
                    <p className="flex justify-between gap-2">
                      <span className="text-background/60 shrink-0">
                        Asientos
                      </span>
                      <span className="text-background truncate text-right">
                        {selectedSeats.map((s) => s.number).join(", ")}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Return Trip */}
                {tripType === "round-trip" && selectedReturnTrip && (
                  <div className="mb-6 pb-6 border-b border-background/20">
                    <p className="text-sm font-medium text-secondary mb-3">
                      Viaje de Regreso
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <Bus className="h-5 w-5 text-background/60 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-background truncate">
                          {selectedReturnTrip.company}
                        </p>
                        <p className="text-sm text-background/60 truncate">
                          {selectedReturnTrip.busType}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex justify-between gap-2">
                        <span className="text-background/60 shrink-0">
                          Fecha
                        </span>
                        <span className="text-background truncate text-right">
                          {format(
                            parse(returnDate || "", "yyyy-MM-dd", new Date()),
                            "dd MMM yyyy",
                            {
                              locale: es,
                            },
                          )}
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-background/60 shrink-0">
                          Ruta
                        </span>
                        <span className="text-background truncate text-right">
                          {destinationTitle} - {originTitle}
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-background/60 shrink-0">
                          Horario
                        </span>
                        <span className="text-background truncate text-right">
                          {selectedReturnTrip.departureTime} -{" "}
                          {selectedReturnTrip.arrivalTime}
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-background/60 shrink-0">
                          Asientos
                        </span>
                        <span className="text-background truncate text-right">
                          {selectedReturnSeats.map((s) => s.number).join(", ")}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-background/20">
                  <p className="flex justify-between text-sm gap-2">
                    <span className="text-background/60 shrink-0">
                      Asientos ({totalPassengers})
                    </span>
                    <span className="text-background truncate text-right">
                      Gs. {totalPrice.toLocaleString("es-PY")}
                    </span>
                  </p>
                </div>

                {/* Total */}
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-base sm:text-lg font-medium text-background">
                      Total a Pagar
                    </span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary break-words">
                      Gs. {totalPrice.toLocaleString("es-PY")}
                    </span>
                  </div>
                </div>

                {/* Pay Button */}
                <Button
                  onClick={handlePayment}
                  disabled={
                    !isFormValid ||
                    passengerDetails.length === 0 ||
                    !selectedPaymentMethod ||
                    isProcessing ||
                    timeLeft <= 0
                  }
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {timeLeft <= 0 ? (
                    "Reserva caducada"
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin shrink-0" />
                      <span className="truncate">
                        {selectedPaymentMethod === "tarjeta"
                          ? "Procesando pago..."
                          : "Redirigiendo a Pagopar..."}
                      </span>
                    </>
                  ) : passengerDetails.length === 0 ? (
                    "Cargando..."
                  ) : isFormValid && selectedPaymentMethod ? (
                    `Pagar con ${selectedPaymentMethod === "tarjeta" ? "Tarjeta" : "Pagopar"}`
                  ) : (
                    "Completa los datos"
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay de procesamiento */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
          <div className="text-center w-full max-w-md p-6 sm:p-8 bg-[#0f1419] border border-gray-700 rounded-2xl shadow-2xl">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 ${selectedPaymentMethod === "tarjeta" ? "bg-blue-500/20" : "bg-purple-500/20"} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 ${selectedPaymentMethod === "tarjeta" ? "border-blue-500/40" : "border-purple-500/40"}`}
            >
              {selectedPaymentMethod === "tarjeta" ? (
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300" />
              ) : (
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-purple-300" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white break-words">
              {selectedPaymentMethod === "tarjeta"
                ? "Procesando pago con Tarjeta"
                : "Redirigiendo a Pagopar"}
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4 break-words">
              {selectedPaymentMethod === "tarjeta"
                ? "Tu reserva se confirmará en instantes..."
                : "Estamos preparando tu pago seguro. Serás redirigido automáticamente."}
            </p>
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <div className="text-xs text-gray-400 mt-4">
              No cierres esta ventana
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
