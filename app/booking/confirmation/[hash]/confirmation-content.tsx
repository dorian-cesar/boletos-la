"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
  AlertCircle,
  Wallet,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities } from "@/lib/booking-store";
import { generateTicketPDF, downloadPDF } from "@/lib/generate-ticket-pdf";

interface ConfirmationPageContentProps {
  hash: string;
}

export default function ConfirmationPageContent({
  hash,
}: ConfirmationPageContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // ESTADOS PARA PAGO
  const [pagoparHash, setPagoparHash] = useState<string | null>(hash);
  const [paymentStatus, setPaymentStatus] = useState<
    "checking" | "paid" | "pending" | "failed" | "cancelled"
  >("checking");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [savingToDB, setSavingToDB] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(true);
  const [isTarjetaPayment, setIsTarjetaPayment] = useState(false);

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
    setBookingReference,
    setPaymentStatus: setStorePaymentStatus,
  } = useBookingStore();

  const originCity = cities.find((c) => c.id === selectedOutboundTrip?.origin);
  const destinationCity = cities.find(
    (c) => c.id === selectedOutboundTrip?.destination,
  );

  // 1. DETECTAR TIPO DE PAGO AL CARGAR
  useEffect(() => {
    console.log("🔗 Hash recibido en la URL:", hash);

    setMounted(true);
    setStep(4);

    // DETECCIÓN DE PAGO CON TARJETA
    if (hash === "tarjeta") {
      console.log("💳 PAGO CON TARJETA DETECTADO");
      handleTarjetaPayment();
      return;
    }

    // Lógica para Pagopar (con hash válido)
    if (hash && hash !== "undefined" && hash !== "null" && hash !== "tarjeta") {
      console.log("✅ Hash válido recibido de Pagopar:", hash);
      setPagoparHash(hash);
      verifyPagoparPayment(hash);
      localStorage.removeItem("pagopar_last_hash");
    } else {
      const savedHash = localStorage.getItem("pagopar_last_hash");
      if (savedHash) {
        console.log("🔍 Hash encontrado en localStorage:", savedHash);
        setPagoparHash(savedHash);
        verifyPagoparPayment(savedHash);
        localStorage.removeItem("pagopar_last_hash");
      } else {
        console.log("⚠️ No se encontró hash");
        setPaymentStatus("failed");
      }
    }
  }, [setStep, hash]);

  // 2. FUNCIÓN PARA PAGO CON TARJETA
  const handleTarjetaPayment = () => {
    setIsTarjetaPayment(true);

    // 1. Crear referencia de reserva si no existe
    if (!bookingReference) {
      const newReference = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setBookingReference(newReference);
      setStorePaymentStatus("completed");
    }

    // 2. Marcar como pagado
    setPaymentStatus("paid");
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // 3. Configurar detalles de pago con tarjeta
    setPaymentDetails({
      forma_pago: "Tarjeta de Crédito/Débito",
      fecha_pago: new Date().toISOString(),
      numero_pedido: `TARJ-${Date.now().toString(36).toUpperCase()}`,
      monto: totalPrice.toString(),
      pagado: true,
      cancelado: false,
    });

    // 4. Guardar en base de datos
    saveTarjetaBookingToDatabase();
  };

  // 3. FUNCIÓN PARA VERIFICAR PAGO CON PAGOPAR
  const verifyPagoparPayment = async (hash: string) => {
    try {
      console.log("🔄 Consultando estado en Pagopar con hash:", hash);

      const response = await fetch("/api/pagopar/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash_pedido: hash }),
      });

      const data = await response.json();
      console.log("📊 Respuesta de consulta Pagopar:", data);

      if (data.respuesta === true && data.resultado?.[0]) {
        const payment = data.resultado[0];
        setPaymentDetails(payment);

        // ✅ LÓGICA CORREGIDA:
        if (payment.pagado === true) {
          // PAGO EXITOSO
          console.log("✅ PAGO CONFIRMADO POR PAGOPAR");
          setPaymentStatus("paid");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);

          if (!bookingReference) {
            const newReference = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setBookingReference(newReference);
            setStorePaymentStatus("completed");
          }

          await saveBookingToDatabase(payment, hash);
        } else if (payment.cancelado === true) {
          // PAGO CANCELADO
          console.log("❌ PAGO CANCELADO");
          setPaymentStatus("cancelled");
        } else if (payment.fecha_pago === null && payment.pagado === false) {
          // ✅ ESTADO CORRECTO: NO HAY PAGO (no "pending")
          console.log("🚫 PAGO NO REALIZADO - Usuario no completó el pago");
          setPaymentStatus("failed");

          // Opcional: mostrar botón para reintentar pago
          // O redirigir al checkout nuevamente
        } else {
          // Caso inesperado
          console.log("⚠️ Estado desconocido del pago");
          setPaymentStatus("failed");
        }
      } else {
        console.log("⚠️ No se pudo verificar el pago");
        setPaymentStatus("failed");
      }
    } catch (error: any) {
      console.error("💥 Error verificando pago:", error);
      setPaymentStatus("failed");
    }
  };

  // 4. GUARDAR RESERVA EN BASE DE DATOS PARA PAGOPAR
  const saveBookingToDatabase = async (payment: any, hash: string) => {
    try {
      setSavingToDB(true);

      const bookingData = {
        reference: bookingReference,
        pagoparHash: hash,
        pagoparOrderId: payment.numero_pedido,
        status: "paid",
        paymentMethod: payment.forma_pago,
        paymentDate: payment.fecha_pago,
        amount: payment.monto,
        passengerCount: passengerDetails.length,
        totalPrice,
        departureDate,
        returnDate,
        passengerDetails,
        tripDetails: {
          outbound: selectedOutboundTrip,
          return: selectedReturnTrip,
          seats: selectedSeats,
          returnSeats: selectedReturnSeats,
        },
      };

      console.log("💾 Guardando reserva Pagopar en BD:", bookingData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        console.log("✅ Reserva Pagopar guardada exitosamente");
      } else {
        console.error("❌ Error guardando reserva Pagopar");
      }
    } catch (error) {
      console.error("💥 Error guardando reserva Pagopar:", error);
    } finally {
      setSavingToDB(false);
    }
  };

  // 5. GUARDAR RESERVA EN BASE DE DATOS PARA TARJETA
  const saveTarjetaBookingToDatabase = async () => {
    try {
      setSavingToDB(true);

      const bookingData = {
        reference: bookingReference,
        pagoparHash: null,
        pagoparOrderId: `TARJ-${Date.now().toString(36).toUpperCase()}`,
        status: "paid",
        paymentMethod: "Tarjeta de Crédito/Débito",
        paymentDate: new Date().toISOString(),
        amount: totalPrice,
        passengerCount: passengerDetails.length,
        totalPrice,
        departureDate,
        returnDate,
        passengerDetails,
        tripDetails: {
          outbound: selectedOutboundTrip,
          return: selectedReturnTrip,
          seats: selectedSeats,
          returnSeats: selectedReturnSeats,
        },
      };

      console.log("💳 Guardando reserva con tarjeta en BD:", bookingData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        console.log("✅ Reserva con tarjeta guardada exitosamente");
      } else {
        console.error("❌ Error guardando reserva con tarjeta");
      }
    } catch (error) {
      console.error("💥 Error guardando reserva con tarjeta:", error);
    } finally {
      setSavingToDB(false);
    }
  };

  // 6. FUNCIONES EXISTENTES
  const handleDownloadPDF = async () => {
    if (!selectedOutboundTrip || !bookingReference) return;

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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setEmailSent(true);
    setIsSendingEmail(false);
  };

  const handleCopyReference = () => {
    if (bookingReference) {
      navigator.clipboard.writeText(bookingReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewBooking = () => {
    resetBooking();
    router.push("/");
  };

  // 7. COMPLETAR PAGO EN PAGOPAR
  const handleCompletePayment = () => {
    if (pagoparHash) {
      localStorage.removeItem("pagopar_last_hash");
      window.location.href = `https://www.pagopar.com/pagos/${pagoparHash}`;
    }
  };

  // Agrega DEBUG para ver qué está pasando:
  console.log("🔍 DEBUG - Estado inicial:", {
    mounted,
    selectedOutboundTrip: !!selectedOutboundTrip,
    paymentStatus,
    hash,
  });

  // MODIFICA la condición para permitir mostrar error incluso sin selectedOutboundTrip
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  // Si no hay selectedOutboundTrip pero ya tenemos estado de pago, mostrar error
  if (!selectedOutboundTrip) {
    console.log(
      "⚠️ No hay selectedOutboundTrip, pero paymentStatus es:",
      paymentStatus,
    );

    return (
      <div className="min-h-screen">
        <BookingProgress />
        <div className="container mx-auto px-4 py-8">
          <Card className="p-6 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-2">
                  Información de reserva no disponible
                </h3>
                <p className="text-sm text-amber-600 mb-4">
                  No pudimos recuperar los detalles de tu reserva. Esto puede
                  pasar si:
                </p>
                <ul className="text-sm text-amber-600 mb-4 list-disc pl-4">
                  <li>La sesión expiró</li>
                  <li>El pago no se completó correctamente</li>
                </ul>

                <div className="bg-amber-100 p-3 rounded mb-4">
                  <p className="text-xs font-medium">Información disponible:</p>
                  <p className="text-xs">Hash: {hash}</p>
                  <p className="text-xs">Estado pago: {paymentStatus}</p>
                  <p className="text-xs">
                    Fecha: {new Date().toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/")}
                    className="bg-primary"
                  >
                    Volver al inicio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/booking/checkout")}
                  >
                    Intentar nuevamente
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const primaryPassenger = passengerDetails[0];
  const canShowActions = bookingReference && paymentStatus === "paid";

  // Renderizar contenido según estado de pago
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case "checking":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-800">
                    Verificando estado del pago...
                  </h3>
                  <p className="text-sm text-blue-600">
                    Estamos consultando el estado de tu transacción.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case "paid":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-4">
                {isTarjetaPayment ? (
                  <CreditCard className="h-8 w-8 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="h-8 w-8 text-green-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  {isTarjetaPayment ? (
                    <>
                      <h3 className="font-semibold text-green-800 mb-2">
                        ¡Pago con Tarjeta Confirmado!
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-green-700">
                            <span className="font-medium">Método:</span> Tarjeta
                            de Crédito/Débito
                          </p>
                          <p className="text-green-700">
                            <span className="font-medium">Fecha:</span>{" "}
                            {format(new Date(), "dd/MM/yyyy HH:mm")}
                          </p>
                          <p className="text-green-700">
                            <span className="font-medium">N° Transacción:</span>{" "}
                            {paymentDetails?.numero_pedido ||
                              `TARJ-${Date.now().toString(36).toUpperCase()}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-green-700">
                            <span className="font-medium">Monto:</span> Gs.{" "}
                            {totalPrice.toLocaleString("es-PY")}
                          </p>
                          <p className="text-green-700">
                            <span className="font-medium">Estado:</span>{" "}
                            <span className="font-bold">Pagado</span>
                          </p>
                          <p className="text-xs text-green-600 mt-2">
                            Simulación de pago exitosa
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-semibold text-green-800 mb-2">
                        ¡Pago confirmado con Pagopar!
                      </h3>
                      {paymentDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-green-700">
                              <span className="font-medium">Método:</span>{" "}
                              {paymentDetails.forma_pago}
                            </p>
                            <p className="text-green-700">
                              <span className="font-medium">Fecha:</span>{" "}
                              {paymentDetails.fecha_pago
                                ? format(
                                    new Date(paymentDetails.fecha_pago),
                                    "dd/MM/yyyy HH:mm",
                                  )
                                : "N/A"}
                            </p>
                            <p className="text-green-700">
                              <span className="font-medium">N° Pedido:</span>{" "}
                              {paymentDetails.numero_pedido}
                            </p>
                          </div>
                          <div>
                            <p className="text-green-700">
                              <span className="font-medium">Monto:</span> Gs.{" "}
                              {parseFloat(paymentDetails.monto).toLocaleString(
                                "es-PY",
                              )}
                            </p>
                            <p className="text-green-700">
                              <span className="font-medium">Estado:</span>{" "}
                              <span className="font-bold">Pagado</span>
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <Button
                    onClick={() => setShowPaymentStatus(false)}
                    variant="ghost"
                    size="sm"
                    className="text-green-700 hover:text-green-800 hover:bg-green-100"
                  >
                    Ocultar detalles
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        );

      case "pending":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Pago pendiente
                  </h3>
                  <p className="text-sm text-yellow-600 mb-4">
                    Tu pedido está esperando el pago. Por favor, completa el
                    pago en Pagopar para confirmar tu reserva.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleCompletePayment}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Completar pago en Pagopar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      case "cancelled":
      case "failed":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800 mb-2">
                    Pago no completado
                  </h3>
                  <p className="text-sm text-amber-600 mb-4">
                    No detectamos un pago exitoso para esta reserva. El pedido
                    en Pagopar está pendiente pero no se realizó el pago.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => router.push("/booking/checkout")}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Wallet className="h-4 w-4" />
                      Intentar pago nuevamente
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Si el pago no está confirmado, mostrar solo el estado
  if (paymentStatus !== "paid") {
    return (
      <div className="min-h-screen">
        <BookingProgress />
        <div className="container mx-auto px-4 py-8">
          {renderPaymentStatus()}

          {/* Mostrar información de la reserva aunque no esté pagada */}
          <Card className="p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Detalles de tu reserva</h3>
            <div className="space-y-3">
              <p>
                <span className="font-medium">Ruta:</span> {originCity?.name} →{" "}
                {destinationCity?.name}
              </p>
              <p>
                <span className="font-medium">Fecha:</span>{" "}
                {format(new Date(departureDate || ""), "dd/MM/yyyy")}
              </p>
              <p>
                <span className="font-medium">Pasajeros:</span>{" "}
                {passengerDetails.length}
              </p>
              <p>
                <span className="font-medium">Total:</span> Gs.{" "}
                {totalPrice.toLocaleString("es-PY")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Si el pago está confirmado, mostrar la página completa
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BookingProgress />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => {
            const colors = ["#3CBDB1", "#F7941D", "#FFD700", "#FF6B6B"];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];

            return (
              <div
                key={i}
                className="absolute animate-fade-in"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-20px`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: randomColor,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  animation: `confetti-fall ${Math.random() * 3 + 2}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            );
          })}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Mostrar estado de pago */}
        {showPaymentStatus && renderPaymentStatus()}

        {/* Success Header */}
        <div className="text-center mb-12 animate-bounce-in">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            ¡Reserva Confirmada!
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {isTarjetaPayment
              ? "Tu pago con tarjeta ha sido procesado exitosamente. Tu boleto electrónico está listo."
              : "Tu pago ha sido procesado exitosamente. Tu boleto electrónico está listo."}
          </p>

          {/* Booking Reference */}
          <div className="inline-flex items-center gap-3 bg-muted rounded-full px-6 py-3">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-muted-foreground">Código de reserva:</span>
            <span className="font-bold text-xl text-primary">
              {bookingReference}
            </span>
            {bookingReference && (
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
            )}
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

        {/* Resto del contenido */}
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
                {paymentDetails?.fecha_pago && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>
                      Pago realizado el{" "}
                      {format(
                        new Date(paymentDetails.fecha_pago),
                        "dd/MM/yyyy 'a las' HH:mm",
                      )}
                    </p>
                    <p className="mt-1">Método: {paymentDetails.forma_pago}</p>
                  </div>
                )}
                {isTarjetaPayment && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <p>
                      Pago realizado el{" "}
                      {format(new Date(), "dd/MM/yyyy 'a las' HH:mm")}
                    </p>
                    <p className="mt-1">Método: Tarjeta de Crédito/Débito</p>
                  </div>
                )}
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
                  disabled={isGeneratingPDF || !canShowActions}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={isSendingEmail || emailSent || !canShowActions}
                  variant="outline"
                  className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="flex-1 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => window.print()}
                    disabled={!canShowActions}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      const text = `Mi reserva de bus: ${bookingReference}. ${originCity?.name} → ${destinationCity?.name} ${format(new Date(departureDate || ""), "dd/MM")} @${selectedOutboundTrip.departureTime}`;
                      navigator.share?.({ text }) ||
                        navigator.clipboard.writeText(text);
                    }}
                    disabled={!canShowActions}
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
