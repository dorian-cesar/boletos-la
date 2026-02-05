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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities, Passenger } from "@/lib/booking-store";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const {
    tripType,
    passengers,
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

  useEffect(() => {
    setMounted(true);
    setStep(3);

    // Initialize passenger details
    if (passengerDetails.length === 0) {
      const allSeats = [...selectedSeats, ...selectedReturnSeats];
      const uniqueSeats = selectedSeats.slice(0, passengers);
      const initialPassengers: Passenger[] = uniqueSeats.map((seat) => ({
        seatId: seat.id,
        seatNumber: seat.number,
        firstName: "",
        lastName: "",
        rut: "",
        email: "",
        phone: "",
      }));
      setPassengerDetails(initialPassengers);
    }
  }, []);

  const validateRut = (rut: string) => {
    // Basic RUT validation (Chilean ID)
    const rutClean = rut.replace(/[.-]/g, "");
    return rutClean.length >= 8;
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = passengerDetails.every(
    (p) =>
      p.firstName.trim() !== "" &&
      p.lastName.trim() !== "" &&
      validateRut(p.rut) &&
      validateEmail(p.email) &&
      p.phone.trim() !== "",
  );

  const handlePayment = async () => {
    if (!isFormValid) return;

    setShowPaymentModal(true);
  };

  const processPayment = async () => {
    setIsProcessing(true);

    // Simulate Webpay Plus payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Generate booking reference
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
            <h2 className="text-2xl font-bold animate-fade-in">
              Datos de los Pasajeros
            </h2>

            {passengerDetails.map((passenger, index) => (
              <Card
                key={index}
                className="p-6 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Pasajero {index + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Asiento{" "}
                      {selectedSeats[index]?.number || passenger.seatNumber}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`firstName-${index}`}>Nombre</Label>
                    <Input
                      id={`firstName-${index}`}
                      placeholder="Ingresa el nombre"
                      value={passenger.firstName}
                      onChange={(e) =>
                        updatePassenger(index, { firstName: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`lastName-${index}`}>Apellido</Label>
                    <Input
                      id={`lastName-${index}`}
                      placeholder="Ingresa el apellido"
                      value={passenger.lastName}
                      onChange={(e) =>
                        updatePassenger(index, { lastName: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`rut-${index}`}>RUT</Label>
                    <Input
                      id={`rut-${index}`}
                      placeholder="12.345.678-9"
                      value={passenger.rut}
                      onChange={(e) =>
                        updatePassenger(index, { rut: e.target.value })
                      }
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`phone-${index}`}>Teléfono</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id={`phone-${index}`}
                        placeholder="+56 9 1234 5678"
                        value={passenger.phone}
                        onChange={(e) =>
                          updatePassenger(index, { phone: e.target.value })
                        }
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`email-${index}`}>Correo Electrónico</Label>
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
                        className="h-12 pl-10"
                      />
                    </div>
                    {index === 0 && (
                      <p className="text-xs text-muted-foreground">
                        El boleto será enviado a este correo electrónico
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {/* Payment Section */}
            <Card
              className="p-6 animate-fade-in"
              style={{ animationDelay: `${passengers * 150}ms` }}
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
                      className="px-3 py-2 bg-background rounded border border-border text-xs font-medium"
                    >
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
                    Subtotal ({passengers} pasajero{passengers > 1 ? "s" : ""})
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

              {/* Pay Button */}
              <Button
                onClick={handlePayment}
                disabled={!isFormValid}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                <Lock className="h-5 w-5 mr-2" />
                Pagar con Webpay Plus
              </Button>

              {!isFormValid && (
                <p className="text-sm text-destructive mt-3 text-center">
                  Completa todos los datos para continuar
                </p>
              )}

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
