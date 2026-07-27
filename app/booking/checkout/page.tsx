"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "tarjeta" | "bancard" | null
  >("bancard");
  const [iframeProcessId, setIframeProcessId] = useState<string | null>(null);

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
    resetBooking,
    originTitle,
    destinationTitle,
    bancardProcessId,
    setBancardProcessId,
    bancardShopProcessId,
    setBancardShopProcessId,
    setBancardIsVisa,
  } = useBookingStore();

  const [isExpired, setIsExpired] = useState(false);
  const [showVisaModal, setShowVisaModal] = useState(false);
  const handleExpire = useCallback(() => setIsExpired(true), []);

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

  const handlePaymentMethodSelect = (method: "tarjeta" | "bancard") => {
    setSelectedPaymentMethod(method);
  };

  const executeBancardPayment = async (isVisa: boolean) => {
    setShowVisaModal(false);
    setIsProcessing(true);
    setBancardIsVisa(isVisa);
    if (typeof window !== "undefined") {
      localStorage.setItem("bancard_is_visa", isVisa ? "true" : "false");
    }
    try {
      const primaryPassenger = passengerDetails[0];
      const response = await fetch("/api/bancard/crear-transaccion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          client_ruc: primaryPassenger?.documentNumber || "fallback",
          client_name:
            `${primaryPassenger?.firstName} ${primaryPassenger?.lastName}`.toUpperCase(),
          client_email: primaryPassenger?.email || "fallback",
          total_items: totalPassengers,
          preauthorization: isVisa ? false : true, // False si es tarjeta VISA, True si es otra tarjeta
        }),
      });

      const result = await response.json();

      if (result.shopProcessId) {
        setBancardShopProcessId(String(result.shopProcessId));
        localStorage.setItem(
          "bancard_shop_process_id",
          String(result.shopProcessId),
        );
      }

      if (result.processId) {
        setBancardProcessId(String(result.processId));
        localStorage.setItem("bancard_process_id", String(result.processId));
        setIsProcessing(false);
        setIframeProcessId(result.processId);
      } else if (result.iframeUrl) {
        try {
          const urlObj = new URL(result.iframeUrl);
          const pId = urlObj.searchParams.get("process_id");
          if (pId) {
            setBancardProcessId(pId);
            localStorage.setItem("bancard_process_id", pId);
            setIsProcessing(false);
            setIframeProcessId(pId);
          } else {
            window.location.href = result.iframeUrl;
          }
        } catch (e) {
          window.location.href = result.iframeUrl;
        }
      } else if (result.url) {
        window.location.href = result.url;
      } else if (result.success && result.processUrl) {
        window.location.href = result.processUrl;
      } else {
        throw new Error(result.message || "Error al crear pago en Bancard");
      }
    } catch (error: any) {
      console.error("Error procesando pago:", error);
      setIsProcessing(false);
      alert(`Error: ${error.message || "Por favor intenta nuevamente."}`);
    }
  };

  const handlePayment = async () => {
    if (passengerDetails.length === 0 || !selectedPaymentMethod) return;
    if (!isFormValid) return;

    if (selectedPaymentMethod === "tarjeta") {
      setIsProcessing(true);
      router.push("/booking/confirmation/tarjeta");
    } else if (selectedPaymentMethod === "bancard") {
      // Preguntar si utilizará tarjeta VISA antes de generar el payload
      setShowVisaModal(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    setStep(3);
  }, [setStep]);

  // Efecto para inyectar dinámicamente el SDK de Bancard e inicializar el formulario de pago
  useEffect(() => {
    if (!iframeProcessId) return;

    let active = true;
    const scriptId = "bancard-checkout-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeForm = () => {
      if (!active) return;
      const bancard = (window as any).Bancard;
      if (bancard && bancard.Checkout) {
        const estilosBase = {
          "button-background-color": "#f37032", // Naranja corporativo de boletos.la
          "button-text-color": "#ffffff",
          "button-border-color": "#f37032",
          "form-background-color": "#ffffff",
          "form-border-color": "#ffffff",
          "input-background-color": "#f8fafc",
          "input-text-color": "#1e293b",
          "input-border-color": "#cbd5e1",
          "input-placeholder-color": "#94a3b8",
          "input-error-color": "#ef4444",
          "label-text-color": "#475569",
          "hr-border-color": "#e2e8f0",
          "tab-main-color": "#3b82f6", // Azul para acentuar (Bancard)
          "tab-background-color": "#f1f5f9",
        };

        const estilosPersonalizados = {
          styles: estilosBase,
          ...estilosBase,
        };
        try {
          const container = document.getElementById("mi-contenedor-vpos");
          if (container) {
            container.innerHTML = "";
            bancard.Checkout.createForm(
              "mi-contenedor-vpos",
              iframeProcessId,
              estilosPersonalizados,
            );
          }
        } catch (err) {
          console.error("Error al inicializar formulario de Bancard:", err);
        }
      } else {
        console.error("SDK de Bancard no disponible en window");
      }
    };

    const checkContainerAndInitialize = () => {
      const container = document.getElementById("mi-contenedor-vpos");
      if (container) {
        initializeForm();
      } else {
        setTimeout(checkContainerAndInitialize, 50);
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      const vposUrl =
        process.env.NEXT_PUBLIC_BANCARD_VPOS_URL ||
        "https://vpos.infonet.com.py:8888";
      script.src = `${vposUrl}/checkout/javascript/dist/bancard-checkout-4.0.0.js`;
      script.async = true;
      script.onload = () => {
        setTimeout(checkContainerAndInitialize, 100);
      };
      script.onerror = () => {
        console.error("Error al cargar la librería de Bancard");
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).Bancard) {
        checkContainerAndInitialize();
      } else {
        script.addEventListener("load", checkContainerAndInitialize);
      }
    }

    return () => {
      active = false;
      if (script) {
        script.removeEventListener("load", checkContainerAndInitialize);
      }
    };
  }, [iframeProcessId]);

  // Efecto para bloquear el scroll del fondo (body) mientras el modal de pago está abierto
  useEffect(() => {
    if (iframeProcessId) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [iframeProcessId]);

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
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-bounce"
            priority
          />
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

              {/* Passengers Grouped View */}
              {selectedSeats.length > 0 && (
                <div className="space-y-3">
                  {selectedSeats.map((outboundSeat, i) => {
                    const p = passengerDetails[i];
                    const returnSeat = selectedReturnSeats[i];
                    const hasData = p?.firstName && p?.lastName;

                    return (
                      <Card
                        key={`passenger-${i}`}
                        className="p-4 bg-background/5 backdrop-blur-sm border-background/20 animate-fade-in"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-background text-base truncate">
                                  {hasData ? (
                                    `${p.firstName} ${p.lastName}`
                                  ) : (
                                    <span className="text-background/40 italic font-normal">
                                      Sin datos
                                    </span>
                                  )}
                                </p>
                                {hasData && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-500/10 text-green-500 border-green-500/30 shrink-0 text-[10px] px-1.5 py-0"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    OK
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-background/60 mt-1">
                                {p?.documentNumber && (
                                  <span className="flex items-center gap-1.5">
                                    <span>C.I. {p.documentNumber}</span>
                                  </span>
                                )}
                                {p?.email && (
                                  <span className="flex items-center gap-1.5 truncate max-w-[160px] sm:max-w-[200px]">
                                    <span className="w-1 h-1 rounded-full bg-background/30" />
                                    <span className="truncate">{p.email}</span>
                                  </span>
                                )}
                                {p?.phone && (
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-background/30" />
                                    <span>{p.phone}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Asientos */}
                          <div className="flex flex-col gap-2 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-background/10">
                            <div className="flex items-center gap-2">
                              <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded uppercase font-bold w-16 text-center border border-primary/20">
                                Ida
                              </span>
                              <span className="text-sm font-medium text-background">
                                Asiento {outboundSeat.number}
                              </span>
                            </div>
                            {returnSeat && (
                              <div className="flex items-center gap-2">
                                <span className="bg-secondary/20 text-secondary text-[10px] px-2 py-0.5 rounded uppercase font-bold w-16 text-center border border-secondary/20">
                                  Regreso
                                </span>
                                <span className="text-sm font-medium text-background">
                                  Asiento {returnSeat.number}
                                </span>
                              </div>
                            )}
                          </div>
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
                      "p-4 cursor-pointer transition-all duration-200 border-2 bg-background/5 backdrop-blur-sm w-full relative",
                      selectedPaymentMethod === "tarjeta"
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-background/30 hover:border-purple-500",
                    )}
                    onClick={() => handlePaymentMethodSelect("tarjeta")}
                  >
                    {selectedPaymentMethod === "tarjeta" && (
                      <CheckCircle2 className="h-5 w-5 text-purple-500 absolute top-4 right-4" />
                    )}
                    <div className="pr-8">
                      <div className="h-7 mb-2 flex items-center">
                        <div className="w-10 h-6 bg-purple-500 rounded flex items-center justify-center shrink-0">
                          <CreditCard className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="ml-2 font-medium text-background truncate text-sm">
                          Tarjeta de Crédito / Débito
                        </p>
                      </div>
                      <p className="text-xs text-background/60 leading-relaxed">
                        Pago inmediato y seguro con tu tarjeta
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {["Visa", "Mastercard", "American Express"].map(
                        (card) => (
                          <span
                            key={card}
                            className="text-[10px] px-2 py-1 bg-background/10 rounded text-background/80 truncate"
                          >
                            {card}
                          </span>
                        ),
                      )}
                    </div>
                  </Card>

                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-2 bg-background/5 backdrop-blur-sm w-full relative",
                      selectedPaymentMethod === "bancard"
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-background/30 hover:border-blue-500",
                    )}
                    onClick={() => handlePaymentMethodSelect("bancard")}
                  >
                    {selectedPaymentMethod === "bancard" && (
                      <CheckCircle2 className="h-5 w-5 text-blue-500 absolute top-4 right-4" />
                    )}
                    <div className="pr-8">
                      <div className="h-7 mb-2 flex items-center">
                        <Image
                          src="/logos/logo-bancard-blanco.png"
                          alt="Bancard"
                          width={110}
                          height={30}
                          className="h-full w-auto object-contain"
                        />
                      </div>
                      <p className="text-xs text-background/60 leading-relaxed">
                        Pago con tarjeta de crédito/débito y billeteras vía
                        Bancard
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-4">
                      {["Tarjetas", "Infonet"].map((option) => (
                        <span
                          key={option}
                          className="text-[10px] px-2 py-1 bg-background/10 rounded text-background/80 truncate"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Payment Method Details */}
                <div className="bg-background/10 rounded-xl p-4 mb-6 border border-background/20 w-full">
                  {selectedPaymentMethod === "tarjeta" && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Shield className="h-5 w-5 text-purple-500 shrink-0" />
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
                  )}

                  {selectedPaymentMethod === "bancard" && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Shield className="h-5 w-5 text-blue-500 shrink-0" />
                          <span className="text-sm font-medium text-background truncate">
                            Pago Seguro con Bancard
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-background/10 border-background/30 text-background/80 shrink-0 self-start sm:self-auto"
                        >
                          Pago en línea
                        </Badge>
                      </div>
                      <p className="text-sm text-background/60 break-words">
                        Se abrirá el portal seguro de Bancard aquí mismo para
                        completar tu pago con tarjeta o billetera.
                      </p>
                    </div>
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
                <div className="flex flex-col items-start gap-4 mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-background truncate w-full">
                    Resumen de Compra
                  </h3>
                  <CheckoutTimer onExpire={handleExpire} />
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
                    isExpired
                  }
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isExpired ? (
                    "Reserva caducada"
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin shrink-0" />
                      <span className="truncate">
                        {selectedPaymentMethod === "tarjeta"
                          ? "Procesando pago..."
                          : "Conectando con Bancard..."}
                      </span>
                    </>
                  ) : passengerDetails.length === 0 ? (
                    "Cargando..."
                  ) : isFormValid && selectedPaymentMethod ? (
                    `Pagar con ${selectedPaymentMethod === "tarjeta" ? "Tarjeta" : "Bancard"}`
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
              className={`w-20 h-20 sm:w-24 sm:h-24 ${selectedPaymentMethod === "tarjeta" ? "bg-purple-500/20" : "bg-blue-500/20"} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border-4 ${selectedPaymentMethod === "tarjeta" ? "border-purple-500/40" : "border-blue-500/40"}`}
            >
              {selectedPaymentMethod === "tarjeta" ? (
                <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-purple-300" />
              ) : (
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-blue-300" />
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-2 text-white break-words">
              {selectedPaymentMethod === "tarjeta"
                ? "Procesando pago con Tarjeta"
                : "Conectando con Bancard..."}
            </h3>
            <p className="text-sm sm:text-base text-gray-300 mb-4 break-words">
              {selectedPaymentMethod === "tarjeta"
                ? "Tu reserva se confirmará en instantes..."
                : "Estamos abriendo tu entorno seguro de pago. Por favor espera."}
            </p>
            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <div className="text-xs text-gray-400 mt-4">
              No cierres esta ventana
            </div>
          </div>
        </div>
      )}

      {/* Modal de consulta para Tarjeta VISA */}
      {showVisaModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0f1419] border border-blue-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setShowVisaModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 transition-colors"
              title="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              ¿Pagarás con Tarjeta VISA?
            </h3>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Por favor indícanos si utilizarás una tarjeta de crédito o débito{" "}
              <strong className="text-blue-400">VISA</strong> para aplicar la configuración
              de procesamiento requerida por Bancard.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => executeBancardPayment(true)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 h-12 rounded-xl transition-all shadow-lg shadow-blue-600/25"
              >
                Sí, utilizaré Tarjeta VISA
              </Button>
              <Button
                onClick={() => executeBancardPayment(false)}
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-800 text-gray-200 font-medium py-3 h-12 rounded-xl transition-all"
              >
                No (Otra tarjeta / medio)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay de Checkout Bancard con Contenedor Embebido */}
      {iframeProcessId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-6 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-gray-200 max-h-[95vh]">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 shrink-0">
              <span className="font-bold text-gray-700">Pagar con Bancard</span>
              <button
                onClick={() => setIframeProcessId(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 transition-colors"
                title="Cerrar ventana de pago"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 bg-white overflow-y-auto overflow-x-hidden flex-1 max-h-[85vh]">
              {/* Forzar estilo del iframe inyectado por Bancard para evitar scroll interno */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
                #mi-contenedor-vpos iframe {
                  height: 590px !important;
                  min-height: 590px !important;
                  border: none !important;
                }
              `,
                }}
              />
              <div
                id="mi-contenedor-vpos"
                className="w-full min-h-[590px] flex items-center justify-center"
              >
                <div className="text-center text-gray-500">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm">
                    Cargando formulario seguro de Bancard...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function CheckoutTimer({ onExpire }: { onExpire: () => void }) {
  const [seconds, setSeconds] = useState(8 * 60);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Invocar la expiración de forma segura en la fase posterior al renderizado (efectos)
  useEffect(() => {
    if (seconds <= 0) {
      onExpireRef.current();
    }
  }, [seconds]);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="flex items-center gap-3 bg-emerald-500/15 border-2 border-emerald-500/40 px-4 py-2 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.2)] transition-all animate-fade-in hover:scale-[1.02]">
      <div className="relative shrink-0">
        <Timer className="w-5 h-5 text-emerald-400" />
        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)] border-2 border-[#1a2332]" />
      </div>
      <div className="flex flex-col min-w-[65px]">
        <span className="text-xl font-black font-mono text-center text-emerald-400 tabular-nums leading-none drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">
          {m}:{s.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
