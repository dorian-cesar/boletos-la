"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Bus,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Lock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  X,
  Wallet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities, Passenger } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { encryptData } from "@/lib/pagopar-encrypt";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDocumentHelp, setShowDocumentHelp] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [formInitialized, setFormInitialized] = useState(false);
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
    setPassengerDetails,
    updatePassenger,
    totalPrice,
    setStep,
    setBookingReference,
    setPaymentStatus,
    resetBooking,
  } = useBookingStore();

  const originCity = cities.find((c) => c.id === selectedOutboundTrip?.origin);
  const destinationCity = cities.find(
    (c) => c.id === selectedOutboundTrip?.destination,
  );

  const totalPassengers = selectedSeats.length + selectedReturnSeats.length;

  // Validaciones
  const validateDocument = (doc: string) => {
    const clean = doc.replace(/[.-]/g, "").toUpperCase();
    if (clean.length < 6 || clean.length > 12) return false;

    if (clean.includes("-")) {
      const [ruc, dv] = clean.split("-");
      if (!/^\d+$/.test(ruc) || ruc.length < 6 || ruc.length > 9) return false;
      if (!/^[\dK]$/.test(dv)) return false;
      return true;
    }

    return /^\d{6,9}$/.test(clean);
  };

  const formatDocument = (doc: string) => {
    const clean = doc.replace(/[^0-9kK-]/g, "");

    if (clean.includes("-")) {
      const parts = clean.split("-");
      if (parts.length === 2) {
        const [ruc, dv] = parts;
        return `${ruc.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
      }
    }

    if (clean.length > 6) {
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1);
      if (body.length > 0) {
        return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
      }
    }

    return clean;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return clean.length >= 9 && clean.length <= 12;
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const getFieldError = (fieldName: string, value: string, index: number) => {
    const fieldId = `${fieldName}-${index}`;
    if (!touchedFields[fieldId] && value === "") return null;

    switch (fieldName) {
      case "firstName":
      case "lastName":
        if (!validateName(value)) return "Mínimo 2 caracteres";
        break;
      case "documentNumber":
        if (!validateDocument(value)) return "Documento inválido";
        break;
      case "email":
        if (!validateEmail(value)) return "Email inválido";
        break;
      case "phone":
        if (!validatePhone(value)) return "Teléfono inválido (9-12 dígitos)";
        break;
    }
    return null;
  };

  const isFormValid =
    passengerDetails.length > 0 &&
    passengerDetails.every(
      (p, index) =>
        validateName(p.firstName) &&
        validateName(p.lastName) &&
        validateDocument(p.documentNumber) &&
        validateEmail(p.email) &&
        validatePhone(p.phone) &&
        !getFieldError("firstName", p.firstName, index) &&
        !getFieldError("lastName", p.lastName, index) &&
        !getFieldError("documentNumber", p.documentNumber, index) &&
        !getFieldError("email", p.email, index) &&
        !getFieldError("phone", p.phone, index),
    );

  const handleFieldBlur = (fieldName: string, index: number) => {
    const fieldId = `${fieldName}-${index}`;
    setTouchedFields((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handlePaymentMethodSelect = (method: "tarjeta" | "pagopar") => {
    setSelectedPaymentMethod(method);
  };

  const handlePayment = async () => {
    if (passengerDetails.length === 0 || !selectedPaymentMethod) return;

    if (!passengerDetails[0]) {
      alert("Por favor completa los datos del primer pasajero");
      return;
    }

    // Marcar todos los campos como tocados para mostrar errores
    const newTouched: Record<string, boolean> = {};
    passengerDetails.forEach((_, index) => {
      ["firstName", "lastName", "documentNumber", "email", "phone"].forEach(
        (field) => {
          newTouched[`${field}-${index}`] = true;
        },
      );
    });
    setTouchedFields(newTouched);

    if (!isFormValid) {
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // ✅ PROCESAR PAGO DIRECTAMENTE
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

    if (
      selectedSeats.length > 0 &&
      passengerDetails.length === 0 &&
      !formInitialized
    ) {
      const allSeats = [...selectedSeats, ...selectedReturnSeats];
      const initialPassengers: Passenger[] = allSeats.map((seat, index) => ({
        seatId: seat.id,
        seatNumber: seat.number,
        firstName: "",
        lastName: "",
        documentNumber: "",
        email: "",
        phone: "",
      }));
      setPassengerDetails(initialPassengers);
      setFormInitialized(true);
    }
  }, [
    selectedSeats,
    selectedReturnSeats,
    passengerDetails.length,
    formInitialized,
    setPassengerDetails,
    setStep,
  ]);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Bus className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
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
            {/* Passenger Forms */}
            <div className="lg:col-span-2 space-y-6 w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold animate-fade-in text-background">
                  Datos de los Pasajeros ({totalPassengers})
                </h2>
                <Badge
                  variant="outline"
                  className="animate-fade-in border-background/30 text-background/80 shrink-0"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Todos los campos son obligatorios
                </Badge>
              </div>

              {passengerDetails.length === 0 ? (
                <Card className="p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20">
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-background/60">
                      Inicializando formulario de pasajeros...
                    </p>
                  </div>
                </Card>
              ) : (
                passengerDetails.map((passenger, index) => {
                  const firstNameError = getFieldError(
                    "firstName",
                    passenger.firstName,
                    index,
                  );
                  const lastNameError = getFieldError(
                    "lastName",
                    passenger.lastName,
                    index,
                  );
                  const documentError = getFieldError(
                    "documentNumber",
                    passenger.documentNumber,
                    index,
                  );
                  const emailError = getFieldError(
                    "email",
                    passenger.email,
                    index,
                  );
                  const phoneError = getFieldError(
                    "phone",
                    passenger.phone,
                    index,
                  );

                  return (
                    <Card
                      key={`${passenger.seatId}-${index}`}
                      className="p-4 sm:p-6 animate-fade-in relative overflow-hidden bg-background/5 backdrop-blur-sm border-background/20 w-full"
                      style={{ animationDelay: `${index * 150}ms` }}
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-background truncate">
                            Pasajero {index + 1}
                          </h3>
                          <p className="text-sm text-background/60 truncate">
                            Asiento {passenger.seatNumber}
                          </p>
                        </div>
                        {!firstNameError &&
                          !lastNameError &&
                          !documentError &&
                          !emailError &&
                          !phoneError &&
                          passenger.firstName &&
                          passenger.lastName &&
                          passenger.documentNumber &&
                          passenger.email &&
                          passenger.phone && (
                            <Badge
                              variant="secondary"
                              className="ml-auto bg-green-500/10 text-green-500 border-green-500/30 shrink-0"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Completo
                            </Badge>
                          )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div className="space-y-2 w-full">
                          <Label
                            htmlFor={`firstName-${index}`}
                            className="text-background text-sm"
                          >
                            Nombre
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id={`firstName-${index}`}
                              placeholder="Ingresa el nombre"
                              value={passenger.firstName}
                              onChange={(e) =>
                                updatePassenger(index, {
                                  firstName: e.target.value,
                                })
                              }
                              onBlur={() => handleFieldBlur("firstName", index)}
                              className={cn(
                                "h-12 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                                firstNameError && "border-destructive",
                                !firstNameError &&
                                  passenger.firstName &&
                                  "border-green-500",
                              )}
                              data-error={!!firstNameError}
                            />
                            {passenger.firstName && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {firstNameError ? (
                                  <X className="h-5 w-5 text-destructive shrink-0" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          {firstNameError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="truncate">{firstNameError}</span>
                            </p>
                          )}
                        </div>

                        {/* Last Name */}
                        <div className="space-y-2 w-full">
                          <Label
                            htmlFor={`lastName-${index}`}
                            className="text-background text-sm"
                          >
                            Apellido
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id={`lastName-${index}`}
                              placeholder="Ingresa el apellido"
                              value={passenger.lastName}
                              onChange={(e) =>
                                updatePassenger(index, {
                                  lastName: e.target.value,
                                })
                              }
                              onBlur={() => handleFieldBlur("lastName", index)}
                              className={cn(
                                "h-12 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                                lastNameError && "border-destructive",
                                !lastNameError &&
                                  passenger.lastName &&
                                  "border-green-500",
                              )}
                              data-error={!!lastNameError}
                            />
                            {passenger.lastName && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {lastNameError ? (
                                  <X className="h-5 w-5 text-destructive shrink-0" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          {lastNameError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="truncate">{lastNameError}</span>
                            </p>
                          )}
                        </div>

                        {/* Document Number */}
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor={`document-${index}`}
                              className="text-background text-sm"
                            >
                              Cédula/RUC
                              <span className="text-destructive ml-1">*</span>
                            </Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-background/60 hover:text-background hover:bg-background/20 shrink-0"
                                    onClick={() =>
                                      setShowDocumentHelp(!showDocumentHelp)
                                    }
                                  >
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Formato
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-background/95 backdrop-blur-sm border-background/20">
                                  <div className="text-sm">
                                    <p>Ejemplos válidos:</p>
                                    <p>• Cédula: 4.123.456</p>
                                    <p>• RUC: 80.012.345-0</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/60 shrink-0" />
                            <Input
                              id={`document-${index}`}
                              placeholder="4.123.456 o 80.012.345-0"
                              value={passenger.documentNumber}
                              onChange={(e) =>
                                updatePassenger(index, {
                                  documentNumber: formatDocument(
                                    e.target.value,
                                  ),
                                })
                              }
                              onBlur={() =>
                                handleFieldBlur("documentNumber", index)
                              }
                              className={cn(
                                "h-12 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                                documentError && "border-destructive",
                                !documentError &&
                                  passenger.documentNumber &&
                                  "border-green-500",
                              )}
                              data-error={!!documentError}
                            />
                            {passenger.documentNumber && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {documentError ? (
                                  <X className="h-5 w-5 text-destructive shrink-0" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          {documentError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="truncate">{documentError}</span>
                            </p>
                          )}
                          {showDocumentHelp && !documentError && (
                            <div className="text-xs text-background/60 p-2 bg-background/10 rounded w-full">
                              <p className="truncate">
                                Formato aceptado: 4.123.456 (cédula) o
                                80.012.345-0 (RUC)
                              </p>
                              <p className="truncate">
                                Para RUC, el dígito verificador puede ser 0-9
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-2 w-full">
                          <Label
                            htmlFor={`phone-${index}`}
                            className="text-background text-sm"
                          >
                            Teléfono
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/60 shrink-0" />
                            <Input
                              id={`phone-${index}`}
                              placeholder="0981 123 456"
                              value={passenger.phone}
                              onChange={(e) =>
                                updatePassenger(index, {
                                  phone: e.target.value,
                                })
                              }
                              onBlur={() => handleFieldBlur("phone", index)}
                              className={cn(
                                "h-12 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                                phoneError && "border-destructive",
                                !phoneError &&
                                  passenger.phone &&
                                  "border-green-500",
                              )}
                              data-error={!!phoneError}
                            />
                            {passenger.phone && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {phoneError ? (
                                  <X className="h-5 w-5 text-destructive shrink-0" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          {phoneError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="truncate">{phoneError}</span>
                            </p>
                          )}
                          {!phoneError && passenger.phone && (
                            <p className="text-sm text-background/60 truncate">
                              Formato: 0981 123 456 o 021 123 456
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2 sm:col-span-2 w-full">
                          <Label
                            htmlFor={`email-${index}`}
                            className="text-background text-sm"
                          >
                            Correo Electrónico
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-background/60 shrink-0" />
                            <Input
                              id={`email-${index}`}
                              name={`booking-passenger-email-${index}`}
                              type="email"
                              placeholder="correo@ejemplo.com"
                              value={passenger.email}
                              onChange={(e) =>
                                updatePassenger(index, {
                                  email: e.target.value,
                                })
                              }
                              onBlur={() => handleFieldBlur("email", index)}
                              className={cn(
                                "h-12 pl-10 pr-10 bg-background/10 border-background/30 text-background placeholder:text-background/40 w-full",
                                emailError && "border-destructive",
                                !emailError &&
                                  passenger.email &&
                                  "border-green-500",
                              )}
                              data-error={!!emailError}
                            />
                            {passenger.email && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {emailError ? (
                                  <X className="h-5 w-5 text-destructive shrink-0" />
                                ) : (
                                  <Check className="h-5 w-5 text-green-500 shrink-0" />
                                )}
                              </div>
                            )}
                          </div>
                          {emailError && (
                            <p className="text-sm text-destructive flex items-center gap-1">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              <span className="truncate">{emailError}</span>
                            </p>
                          )}
                          {index === 0 && (
                            <p className="text-xs text-background/60 truncate">
                              El boleto electrónico será enviado a este correo
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })
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

            {/* Order Summary */}
            <div className="lg:col-span-1 w-full">
              <Card className="p-4 sm:p-6 sticky top-24 animate-slide-in-right bg-background/5 backdrop-blur-sm border-background/20 w-full">
                <h3 className="text-lg sm:text-xl font-bold mb-6 text-background truncate">
                  Resumen de Compra
                </h3>

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
                        {format(new Date(departureDate || ""), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    </p>
                    <p className="flex justify-between gap-2">
                      <span className="text-background/60 shrink-0">Ruta</span>
                      <span className="text-background truncate text-right">
                        {originCity?.name} - {destinationCity?.name}
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
                          {format(new Date(returnDate || ""), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </p>
                      <p className="flex justify-between gap-2">
                        <span className="text-background/60 shrink-0">
                          Ruta
                        </span>
                        <span className="text-background truncate text-right">
                          {destinationCity?.name} - {originCity?.name}
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
                      Subtotal ({totalPassengers} asiento
                      {totalPassengers > 1 ? "s" : ""})
                    </span>
                    <span className="text-background truncate text-right">
                      Gs.{" "}
                      {Math.round(totalPrice * 0.82).toLocaleString("es-PY")}
                    </span>
                  </p>
                  <p className="flex justify-between text-sm gap-2">
                    <span className="text-background/60 shrink-0">
                      IVA (10%)
                    </span>
                    <span className="text-background truncate text-right">
                      Gs. {Math.round(totalPrice * 0.1).toLocaleString("es-PY")}
                    </span>
                  </p>
                  <p className="flex justify-between text-sm gap-2">
                    <span className="text-background/60 shrink-0">
                      Servicio (8%)
                    </span>
                    <span className="text-background truncate text-right">
                      Gs.{" "}
                      {Math.round(totalPrice * 0.08).toLocaleString("es-PY")}
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
                    isProcessing
                  }
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
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
