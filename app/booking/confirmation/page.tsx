"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Download,
  Mail,
  Bus,
  MapPin,
  Calendar,
  Clock,
  User,
  Home,
  Share2,
  Printer,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities } from "@/lib/booking-store";
import { generateTicketPDF, downloadPDF } from "@/lib/generate-ticket-pdf";
import { cn } from "@/lib/utils";

export default function ConfirmationPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

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
    bookingReference,
    setStep,
    resetBooking,
  } = useBookingStore();

  const originCity = cities.find((c) => c.id === selectedOutboundTrip?.origin);
  const destinationCity = cities.find(
    (c) => c.id === selectedOutboundTrip?.destination,
  );

  useEffect(() => {
    setMounted(true);
    setStep(4);

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, [setStep]);

  const handleDownloadPDF = async () => {
    if (!selectedOutboundTrip) return;

    setIsGeneratingPDF(true);
    try {
      const pdfBlob = await generateTicketPDF({
        bookingReference,
        outboundTrip: selectedOutboundTrip,
        returnTrip: selectedReturnTrip,
        seats: selectedSeats,
        returnSeats: selectedReturnSeats,
        passengers: passengerDetails,
        totalPrice,
        originCity: originCity?.name || "",
        destinationCity: destinationCity?.name || "",
        departureDate: format(new Date(departureDate || ""), "dd MMM yyyy", {
          locale: es,
        }),
        returnDate: returnDate
          ? format(new Date(returnDate), "dd MMM yyyy", { locale: es })
          : undefined,
      });

      downloadPDF(pdfBlob, `boleto-${bookingReference}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setEmailSent(true);
    setIsSendingEmail(false);
  };

  const handleCopyReference = () => {
    navigator.clipboard.writeText(bookingReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewBooking = () => {
    resetBooking();
    router.push("/");
  };

  if (!mounted || !selectedOutboundTrip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bus className="h-16 w-16 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-muted-foreground">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  const primaryPassenger = passengerDetails[0];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BookingProgress />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-20px`,
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: ["#3CBDB1", "#F7941D", "#FFD700", "#FF6B6B"][
                  Math.floor(Math.random() * 4)
                ],
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
                animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-14 w-14 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Tu pago ha sido procesado exitosamente. Tu boleto electrónico está
            listo.
          </p>

          {/* Booking Reference */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full px-6 py-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">Código de reserva:</span>
            <span className="font-bold text-xl text-primary">
              {bookingReference}
            </span>
            <button
              onClick={handleCopyReference}
              className="p-1 hover:bg-background rounded transition-colors"
              title="Copiar código"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Passenger Info */}
          {primaryPassenger && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p>
                Boleto enviado a:{" "}
                <span className="font-medium text-foreground">
                  {primaryPassenger.email}
                </span>
              </p>
              <p>
                Documento:{" "}
                <span className="font-medium text-foreground">
                  {primaryPassenger.documentNumber}
                </span>
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Trip Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outbound Trip */}
            <Card className="p-6 animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-lg">Viaje de Ida</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div>
                      <p className="text-3xl font-bold">
                        {selectedOutboundTrip.departureTime}
                      </p>
                      <p className="text-muted-foreground">
                        {originCity?.name}
                      </p>
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="w-full h-0.5 bg-border relative">
                        <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary bg-background" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">
                        {selectedOutboundTrip.arrivalTime}
                      </p>
                      <p className="text-muted-foreground">
                        {destinationCity?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(
                        new Date(departureDate || ""),
                        "EEEE d 'de' MMMM",
                        { locale: es },
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {selectedOutboundTrip.duration}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
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
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Asientos:{" "}
                        {selectedSeats.map((s) => s.number).join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedSeats.length} pasajero
                        {selectedSeats.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terminal Info */}
              <div className="mt-4 pt-4 border-t border-border text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium">Terminal de salida:</span>{" "}
                  Terminal de Ómnibus de {originCity?.name}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium">Puerta:</span>{" "}
                  {Math.floor(Math.random() * 12) + 1}
                </p>
              </div>
            </Card>

            {/* Return Trip */}
            {tripType === "round-trip" && selectedReturnTrip && (
              <Card
                className="p-6 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-secondary" />
                  </div>
                  <span className="font-bold text-lg">Viaje de Regreso</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-3xl font-bold">
                          {selectedReturnTrip.departureTime}
                        </p>
                        <p className="text-muted-foreground">
                          {destinationCity?.name}
                        </p>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-full h-0.5 bg-border relative">
                          <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-secondary bg-background" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">
                          {selectedReturnTrip.arrivalTime}
                        </p>
                        <p className="text-muted-foreground">
                          {originCity?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(
                          new Date(returnDate || ""),
                          "EEEE d 'de' MMMM",
                          { locale: es },
                        )}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {selectedReturnTrip.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
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
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Asientos:{" "}
                          {selectedReturnSeats.map((s) => s.number).join(", ")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedReturnSeats.length} pasajero
                          {selectedReturnSeats.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminal Info */}
                <div className="mt-4 pt-4 border-t border-border text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Terminal de salida:</span>{" "}
                    Terminal de Ómnibus de {destinationCity?.name}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Puerta:</span>{" "}
                    {Math.floor(Math.random() * 12) + 1}
                  </p>
                </div>
              </Card>
            )}

            {/* Passengers */}
            <Card
              className="p-6 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="font-bold text-lg mb-4">
                Información de Pasajeros
              </h3>
              <div className="space-y-4">
                {passengerDetails.map((passenger, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-muted/50 rounded-xl gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Documento: {passenger.documentNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-medium">
                        Asiento {passenger.seatNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {passenger.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tel: {passenger.phone}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Summary */}
            <Card
              className="p-6 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <h3 className="font-bold text-lg mb-4">Resumen del Pago</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    Gs. {Math.round(totalPrice * 0.82).toLocaleString("es-PY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (10%)</span>
                  <span>
                    Gs. {Math.round(totalPrice * 0.1).toLocaleString("es-PY")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicio (8%)</span>
                  <span>
                    Gs. {Math.round(totalPrice * 0.08).toLocaleString("es-PY")}
                  </span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between font-bold text-lg">
                  <span>Total Pagado</span>
                  <span className="text-secondary">
                    Gs. {totalPrice.toLocaleString("es-PY")}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  <p>
                    Pago realizado con éxito el{" "}
                    {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 animate-slide-in-right">
              <h3 className="text-xl font-bold mb-6">Tu Boleto Electrónico</h3>

              <div className="space-y-4">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  {isGeneratingPDF ? (
                    <span className="animate-pulse">Generando PDF...</span>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Descargar Boleto PDF
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSendEmail}
                  disabled={isSendingEmail || emailSent}
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  {emailSent ? (
                    <>
                      <Check className="h-5 w-5 mr-2" />
                      Enviado al correo
                    </>
                  ) : isSendingEmail ? (
                    <span className="animate-pulse">Enviando...</span>
                  ) : (
                    <>
                      <Mail className="h-5 w-5 mr-2" />
                      Enviar por Correo
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => {
                      const text = `Mi reserva de bus: ${bookingReference}. ${originCity?.name} → ${destinationCity?.name} ${format(new Date(departureDate || ""), "dd/MM")} @${selectedOutboundTrip.departureTime}`;
                      navigator.share?.({ text }) ||
                        navigator.clipboard.writeText(text);
                    }}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={handleNewBooking}
                    variant="ghost"
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Nueva Reserva
                  </Button>
                </div>
              </div>

              {/* Important Info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                <h4 className="font-medium mb-3">Información Importante</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Presenta tu cédula de identidad o RUC original al abordar
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Llega al terminal 45 minutos antes de la salida</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Guarda este código:{" "}
                      <strong className="text-foreground">
                        {bookingReference}
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      El boleto fue enviado a{" "}
                      <strong className="text-foreground">
                        {primaryPassenger?.email}
                      </strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>
                      Validez del boleto: Hasta 1 hora después de la hora de
                      salida
                    </span>
                  </li>
                </ul>

                <div className="mt-4 pt-4 border-t border-border">
                  <h5 className="font-medium mb-2">¿Necesitas ayuda?</h5>
                  <p className="text-sm text-muted-foreground">
                    Contacta al soporte: <br />
                    <strong className="text-foreground">
                      0981 123 456
                    </strong>{" "}
                    <br />
                    <strong className="text-foreground">
                      reservas@busparaguay.com.py
                    </strong>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom styles for confetti animation */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
