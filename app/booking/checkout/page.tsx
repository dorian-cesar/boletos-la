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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    if (!selectedPaymentMethod) return;

    setIsProcessing(true);

    try {
      if (selectedPaymentMethod === "tarjeta") {
        // Lógica existente para Webpay
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const reference = `BL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setBookingReference(reference);
        setPaymentStatus("completed");
        router.push("/booking/confirmation");
      } else if (selectedPaymentMethod === "pagopar") {
        // 1. Verificar que todos los datos estén completos
        const primaryPassenger = passengerDetails[0];
        if (!primaryPassenger) {
          throw new Error("No hay datos del pasajero");
        }

        // 2. Preparar datos EXACTAMENTE como los necesita Pagopar
        const paymentData = {
          montoTotal: totalPrice,
          datosComprador: {
            nombre: primaryPassenger.firstName,
            apellido: primaryPassenger.lastName,
            email: primaryPassenger.email,
            telefono: primaryPassenger.phone.replace(/\D/g, ""), // Solo números
            ruc: primaryPassenger.documentNumber,
          },
        };

        console.log("📤 Enviando a Pagopar:", paymentData);

        // 3. Encriptar (como ya tienes)
        const encryptedData = encryptData(paymentData);

        // 4. Llamar a TU API para crear el pedido en Pagopar
        const response = await fetch("/api/pagopar/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: encryptedData }),
        });

        const result = await response.json();
        console.log("📥 Respuesta Pagopar:", result);

        // 5. Si es exitoso, redirigir a Pagopar para pagar
        if (result.success === true && result.hash) {
          // IMPORTANTE: Guardar temporalmente el hash para después
          localStorage.setItem("pagopar_last_hash", result.hash);

          // Redirigir a Pagopar para que el usuario pague
          window.location.href = `https://www.pagopar.com/pagos/${result.hash}`;
        } else {
          throw new Error(result.message || "Error al crear pago en Pagopar");
        }
      }
    } catch (error: any) {
      console.error("❌ Error procesando pago:", error);
      setIsProcessing(false);
      setShowPaymentModal(false);
      alert(`Error: ${error.message || "Por favor intenta nuevamente."}`);
    }
  };

  // Effects
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
                        !documentError &&
                        !emailError &&
                        !phoneError &&
                        passenger.firstName &&
                        passenger.lastName &&
                        passenger.documentNumber &&
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

                      {/* Document Number */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`document-${index}`}>
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
                                  className="h-6 px-2 text-xs text-muted-foreground"
                                  onClick={() =>
                                    setShowDocumentHelp(!showDocumentHelp)
                                  }
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Formato
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
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
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id={`document-${index}`}
                            placeholder="4.123.456 o 80.012.345-0"
                            value={passenger.documentNumber}
                            onChange={(e) =>
                              updatePassenger(index, {
                                documentNumber: formatDocument(e.target.value),
                              })
                            }
                            onBlur={() =>
                              handleFieldBlur("documentNumber", index)
                            }
                            className={cn(
                              "h-12 pl-10 pr-10",
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
                                <X className="h-5 w-5 text-destructive" />
                              ) : (
                                <Check className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          )}
                        </div>
                        {documentError && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {documentError}
                          </p>
                        )}
                        {showDocumentHelp && !documentError && (
                          <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                            <p>
                              Formato aceptado: 4.123.456 (cédula) o
                              80.012.345-0 (RUC)
                            </p>
                            <p>Para RUC, el dígito verificador puede ser 0-9</p>
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
                            placeholder="0981 123 456"
                            value={passenger.phone}
                            onChange={(e) =>
                              updatePassenger(index, {
                                phone: e.target.value,
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
                            Formato: 0981 123 456 o 021 123 456
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
                    Selecciona tu método de pago preferido
                  </p>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 border-2 hover:border-blue-500",
                    selectedPaymentMethod === "tarjeta"
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-border",
                  )}
                  onClick={() => handlePaymentMethodSelect("tarjeta")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Tarjeta de Crédito</p>
                      <p className="text-xs text-muted-foreground">
                        Visa, Mastercard, Amex
                      </p>
                    </div>
                    {selectedPaymentMethod === "tarjeta" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["Visa", "Mastercard", "Amex"].map((card) => (
                      <span
                        key={card}
                        className="text-xs px-2 py-1 bg-muted rounded"
                      >
                        {card}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 border-2 hover:border-purple-500",
                    selectedPaymentMethod === "pagopar"
                      ? "border-purple-500 bg-purple-500/5"
                      : "border-border",
                  )}
                  onClick={() => handlePaymentMethodSelect("pagopar")}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-8 bg-purple-600 rounded flex items-center justify-center">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pagopar</p>
                      <p className="text-xs text-muted-foreground">
                        Pago con tarjeta, transferencia o billetera electrónica
                      </p>
                    </div>
                    {selectedPaymentMethod === "pagopar" && (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["Tarjetas", "Transferencia", "Billetera"].map(
                      (option) => (
                        <span
                          key={option}
                          className="text-xs px-2 py-1 bg-muted rounded"
                        >
                          {option}
                        </span>
                      ),
                    )}
                  </div>
                </Card>
              </div>

              {/* Payment Method Details */}
              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                {selectedPaymentMethod === "tarjeta" ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">
                          Pago con Tarjeta
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-background">
                        Pago Seguro
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aceptamos tarjetas Visa, Mastercard y American Express con
                      seguridad SSL.
                    </p>
                  </div>
                ) : (
                  selectedPaymentMethod === "pagopar" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-5 w-5 text-purple-500" />
                          <span className="text-sm font-medium">Pagopar</span>
                        </div>
                        <Badge variant="outline" className="bg-background">
                          Múltiples Opciones
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pagá con tarjeta, transferencia o billetera electrónica
                        desde Paraguay.
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
                        <li>Pago en supermercados, farmacias y agencias</li>
                        <li>Tarjetas de crédito y débito</li>
                        <li>Transferencia bancaria</li>
                        <li>Billeteras electrónicas</li>
                      </ul>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                <Lock className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    Transacción Segura
                  </p>
                  <p className="text-muted-foreground">
                    Tu información está protegida con encriptación SSL. Los
                    datos sensibles nunca son almacenados en nuestros
                    servidores.
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
                    Viaje de Regreso
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
                    Gs. {Math.round(totalPrice * 0.82).toLocaleString("es-PY")}
                  </span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA (10%)</span>
                  <span>
                    Gs. {Math.round(totalPrice * 0.1).toLocaleString("es-PY")}
                  </span>
                </p>
                <p className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Servicio (8%)</span>
                  <span>
                    Gs. {Math.round(totalPrice * 0.08).toLocaleString("es-PY")}
                  </span>
                </p>
              </div>

              {/* Total */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Total a Pagar</span>
                  <span className="text-3xl font-bold text-secondary">
                    Gs. {totalPrice.toLocaleString("es-PY")}
                  </span>
                </div>
                {selectedPaymentMethod === "tarjeta" && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <p>Posible cobro en dólares según tu banco</p>
                  </div>
                )}
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
                disabled={
                  !isFormValid ||
                  passengerDetails.length === 0 ||
                  !selectedPaymentMethod
                }
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
              >
                <Lock className="h-5 w-5 mr-2" />
                {passengerDetails.length === 0
                  ? "Cargando..."
                  : isFormValid && selectedPaymentMethod
                    ? `Pagar con ${selectedPaymentMethod === "tarjeta" ? "Tarjeta" : "Pagopar"}`
                    : "Completa los datos"}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Al pagar aceptas nuestros términos y condiciones
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPaymentMethod && (
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
                    {selectedPaymentMethod === "tarjeta" ? (
                      <CreditCard className="h-10 w-10 text-blue-500" />
                    ) : (
                      <Wallet className="h-10 w-10 text-purple-500" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedPaymentMethod === "tarjeta"
                      ? "Pago con Tarjeta"
                      : "Pagopar"}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedPaymentMethod === "tarjeta"
                      ? "Serás redirigido al portal de pago seguro"
                      : "Serás redirigido al portal de pago de Pagopar"}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Monto a pagar</span>
                    <span className="text-2xl font-bold text-secondary">
                      Gs. {totalPrice.toLocaleString("es-PY")}
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
                    className={cn(
                      "flex-1 text-secondary-foreground",
                      selectedPaymentMethod === "tarjeta"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-purple-600 hover:bg-purple-700",
                    )}
                  >
                    Confirmar Pago
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
