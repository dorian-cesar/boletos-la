"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
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
  Eye,
  EyeOff,
  Check,
  X,
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

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRutHelp, setShowRutHelp] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );
  const [formInitialized, setFormInitialized] = useState(false);

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
  } = useBookingStore();

  const originCity = cities.find((c) => c.id === selectedOutboundTrip?.origin);
  const destinationCity = cities.find(
    (c) => c.id === selectedOutboundTrip?.destination,
  );

  const totalPassengers = selectedSeats.length + selectedReturnSeats.length;

  useEffect(() => {
    setMounted(true);
    setStep(3);

    // Solo inicializar si no hay pasajeros y hay asientos seleccionados
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
        rut: "",
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

  const validateRut = (rut: string) => {
    const rutClean = rut.replace(/[.-]/g, "").toUpperCase();
    if (rutClean.length < 8) return false;

    const rutDigits = rutClean.slice(0, -1);
    const verifier = rutClean.slice(-1);

    if (!/^\d+$/.test(rutDigits)) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = rutDigits.length - 1; i >= 0; i--) {
      sum += parseInt(rutDigits.charAt(i)) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedVerifier = 11 - (sum % 11);
    let expectedVerifier =
      calculatedVerifier === 11
        ? "0"
        : calculatedVerifier === 10
          ? "K"
          : calculatedVerifier.toString();

    return expectedVerifier === verifier;
  };

  const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9kK]/g, "");
    if (clean.length <= 1) return clean;

    let formatted = "";
    const body = clean.slice(0, -1);
    const verifier = clean.slice(-1);

    if (body.length > 0) {
      formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "-" + verifier;
    }

    return formatted;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    return clean.length >= 9;
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
      case "rut":
        if (!validateRut(value)) return "RUT inválido";
        break;
      case "email":
        if (!validateEmail(value)) return "Email inválido";
        break;
      case "phone":
        if (!validatePhone(value)) return "Teléfono inválido";
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
        validateRut(p.rut) &&
        validateEmail(p.email) &&
        validatePhone(p.phone) &&
        !getFieldError("firstName", p.firstName, index) &&
        !getFieldError("lastName", p.lastName, index) &&
        !getFieldError("rut", p.rut, index) &&
        !getFieldError("email", p.email, index) &&
        !getFieldError("phone", p.phone, index),
    );

  const handleFieldBlur = (fieldName: string, index: number) => {
    const fieldId = `${fieldName}-${index}`;
    setTouchedFields((prev) => ({ ...prev, [fieldId]: true }));
  };

  const handlePayment = async () => {
    if (passengerDetails.length === 0) return;

    // Marcar todos los campos como tocados para mostrar errores
    const newTouched: Record<string, boolean> = {};
    passengerDetails.forEach((_, index) => {
      ["firstName", "lastName", "rut", "email", "phone"].forEach((field) => {
        newTouched[`${field}-${index}`] = true;
      });
    });
    setTouchedFields(newTouched);

    if (!isFormValid) {
      // Scroll al primer error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const reference = `BL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setBookingReference(reference);
    setPaymentStatus("completed");

    router.push("/booking/confirmation");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Cargando checkout...</p>
        </div>
      </div>
    );
  }

  if (!selectedOutboundTrip || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
    <div className="min-h-screen">
      <BookingProgress />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Passenger Forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold animate-fade-in">
                Datos de los Pasajeros ({totalPassengers})
              </h2>
              <Badge variant="outline" className="animate-fade-in">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Todos los campos son obligatorios
              </Badge>
            </div>

            {passengerDetails.length === 0 ? (
              <Card className="p-6 animate-fade-in">
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">
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
                const rutError = getFieldError("rut", passenger.rut, index);
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
                    className="p-6 animate-fade-in relative overflow-visible"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Pasajero {index + 1}</h3>
                        <p className="text-sm text-muted-foreground">
                          Asiento {passenger.seatNumber}
                        </p>
                      </div>
                      {!firstNameError &&
                        !lastNameError &&
                        !rutError &&
                        !emailError &&
                        !phoneError &&
                        passenger.firstName &&
                        passenger.lastName &&
                        passenger.rut &&
                        passenger.email &&
                        passenger.phone && (
                          <Badge variant="secondary" className="ml-auto">
                            <Check className="h-3 w-3 mr-1" />
                            Completo
                          </Badge>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`firstName-${index}`}>
                          Nombre
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id={`firstName-${index}`}
                            placeholder="Ingresa el nombre (ej: Juan)"
                            value={passenger.firstName}
                            onChange={(e) =>
                              updatePassenger(index, {
                                firstName: e.target.value,
                              })
                            }
                            onBlur={() => handleFieldBlur("firstName", index)}
                            className={cn(
                              "h-12 pr-10",
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
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {firstNameError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {firstNameError}
                          </p>
                        )}
                        {!firstNameError && passenger.firstName && (
                          <p className="text-sm text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" />
                            Nombre válido
                          </p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`lastName-${index}`}>
                          Apellido
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id={`lastName-${index}`}
                            placeholder="Ingresa el apellido (ej: Pérez)"
                            value={passenger.lastName}
                            onChange={(e) =>
                              updatePassenger(index, {
                                lastName: e.target.value,
                              })
                            }
                            onBlur={() => handleFieldBlur("lastName", index)}
                            className={cn(
                              "h-12 pr-10",
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
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {lastNameError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {lastNameError}
                          </p>
                        )}
                      </div>

                      {/* RUT */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`rut-${index}`}>
                            RUT
                            <span className="text-destructive ml-1">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-muted-foreground"
                                  onClick={() => setShowRutHelp(!showRutHelp)}
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Formato
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ejemplo: 12.345.678-9</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <Input
                            id={`rut-${index}`}
                            placeholder="12.345.678-9 o 12345678-9"
                            value={passenger.rut}
                            onChange={(e) =>
                              updatePassenger(index, {
                                rut: formatRut(e.target.value),
                              })
                            }
                            onBlur={() => handleFieldBlur("rut", index)}
                            className={cn(
                              "h-12 pr-10",
                              rutError && "border-destructive",
                              !rutError && passenger.rut && "border-green-500",
                            )}
                            data-error={!!rutError}
                          />
                          {passenger.rut && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              {rutError ? (
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {rutError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {rutError}
                          </p>
                        )}
                        {showRutHelp && !rutError && (
                          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                            <p>Formato aceptado: 12.345.678-9 o 12345678-9</p>
                            <p>El dígito verificador puede ser 0-9 o K</p>
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor={`phone-${index}`}>
                          Teléfono
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id={`phone-${index}`}
                            placeholder="+56 9 1234 5678"
                            value={passenger.phone}
                            onChange={(e) =>
                              updatePassenger(index, {
                                phone: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 12),
                              })
                            }
                            onBlur={() => handleFieldBlur("phone", index)}
                            className={cn(
                              "h-12 pl-10 pr-10",
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
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {phoneError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {phoneError}
                          </p>
                        )}
                        {!phoneError && passenger.phone && (
                          <p className="text-sm text-muted-foreground">
                            Se aceptan números móviles y fijos
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor={`email-${index}`}>
                          Correo Electrónico
                          <span className="text-destructive ml-1">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id={`email-${index}`}
                            type="email"
                            placeholder="correo@ejemplo.com"
                            value={passenger.email}
                            onChange={(e) =>
                              updatePassenger(index, { email: e.target.value })
                            }
                            onBlur={() => handleFieldBlur("email", index)}
                            className={cn(
                              "h-12 pl-10 pr-10",
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
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {emailError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {emailError}
                          </p>
                        )}
                        {index === 0 && (
                          <p className="text-xs text-muted-foreground">
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
              className="p-6 animate-fade-in"
              style={{ animationDelay: `${totalPassengers * 150}ms` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold">Método de Pago</h3>
                  <p className="text-sm text-muted-foreground">
                    Pago seguro con Webpay Plus
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-10 bg-background rounded flex items-center justify-center border border-border">
                      <span className="text-xs font-bold text-foreground">
                        Webpay
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">Webpay Plus</p>
                      <p className="text-xs text-muted-foreground">
                        Tarjeta de crédito o débito
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Pago Seguro
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {["Visa", "Mastercard", "Redcompra", "Amex"].map((card) => (
                    <div
                      key={card}
                      className="px-3 py-2 bg-background rounded border border-border text-xs font-medium flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    Transacción Segura
                  </p>
                  <p className="text-muted-foreground">
                    Tus datos están protegidos con encriptación SSL de 256 bits.
                    Serás redirigido a Webpay Plus para completar el pago.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-slide-in-right">
              <h3 className="text-xl font-bold mb-6">Resumen de Compra</h3>

              {/* Outbound Trip */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm font-medium text-primary mb-3">
                  Viaje de Ida
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <Bus className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {selectedOutboundTrip.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedOutboundTrip.busType}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Fecha</span>
                    <span>
                      {format(new Date(departureDate || ""), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Ruta</span>
                    <span>
                      {originCity?.name} - {destinationCity?.name}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Horario</span>
                    <span>
                      {selectedOutboundTrip.departureTime} -{" "}
                      {selectedOutboundTrip.arrivalTime}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Asientos</span>
                    <span>{selectedSeats.map((s) => s.number).join(", ")}</span>
                  </p>
                </div>
              </div>

              {/* Return Trip */}
              {tripType === "round-trip" && selectedReturnTrip && (
                <div className="mb-6 pb-6 border-b border-border">
                  <p className="text-sm font-medium text-secondary mb-3">
                    Viaje de Vuelta
                  </p>
                  <div className="flex items-center gap-3 mb-3">
                    <Bus className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedReturnTrip.company}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReturnTrip.busType}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Fecha</span>
                      <span>
                        {format(new Date(returnDate || ""), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Ruta</span>
                      <span>
                        {destinationCity?.name} - {originCity?.name}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Horario</span>
                      <span>
                        {selectedReturnTrip.departureTime} -{" "}
                        {selectedReturnTrip.arrivalTime}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Asientos</span>
                      <span>
                        {selectedReturnSeats.map((s) => s.number).join(", ")}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-border">
                <p className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalPassengers} asiento
                    {totalPassengers > 1 ? "s" : ""})
                  </span>
                  <span>
                    ${Math.round(totalPrice * 0.81).toLocaleString("es-CL")}
                  </span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span>
                    ${Math.round(totalPrice * 0.19).toLocaleString("es-CL")}
                  </span>
                </p>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total a Pagar</span>
                  <span className="text-3xl font-bold text-secondary">
                    ${totalPrice.toLocaleString("es-CL")}
                  </span>
                </div>
              </div>

              {/* Validation Summary */}
              {passengerDetails.length === 0 ? (
                <div className="mb-4 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-700">
                        Inicializando formulario...
                      </p>
                      <p className="text-xs text-amber-600/80 mt-1">
                        Por favor espera mientras se cargan los datos
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                !isFormValid && (
                  <div className="mb-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-destructive">
                          Datos incompletos
                        </p>
                        <p className="text-xs text-destructive/80 mt-1">
                          Completa todos los campos obligatorios (*) para
                          continuar
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={!isFormValid || passengerDetails.length === 0}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Lock className="h-5 w-5 mr-2" />
                {passengerDetails.length === 0
                  ? "Cargando..."
                  : isFormValid
                    ? "Pagar con Webpay Plus"
                    : "Completa los datos"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Al pagar aceptas nuestros términos y condiciones
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Webpay Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
            onClick={() => !isProcessing && setShowPaymentModal(false)}
          />
          <div className="relative bg-background rounded-2xl p-8 max-w-md w-full mx-4 animate-scale-in shadow-2xl">
            {!isProcessing ? (
              <>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Webpay Plus</h3>
                  <p className="text-muted-foreground">
                    Serás redirigido al portal de pago seguro de Transbank
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monto a pagar</span>
                    <span className="text-2xl font-bold text-secondary">
                      ${totalPrice.toLocaleString("es-CL")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={processPayment}
                    className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-xl font-bold mb-2">Procesando pago...</h3>
                <p className="text-muted-foreground">
                  Por favor espera mientras confirmamos tu transacción
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
