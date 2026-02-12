"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
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
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore, cities } from "@/lib/booking-store";
import Image from "next/image";

interface ConfirmationPageContentProps {
  hash: string;
}

// Interfaz para los datos del boleto
interface TicketData {
  fileName: string;
  base64: string;
  buffer?: Buffer;
  origin: string;
  destination: string;
  seat: string;
  passengerName: string;
}

export default function ConfirmationPageContent({
  hash,
}: ConfirmationPageContentProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Estados para previsualización del boleto
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [ticketPreviewData, setTicketPreviewData] = useState<any>(null);
  const [generatedTickets, setGeneratedTickets] = useState<TicketData[]>([]);

  // UN SOLO ESTADO PARA CONTROLAR TODAS LAS ACCIONES
  const [processing, setProcessing] = useState<{
    type: "all-tickets" | "single-ticket" | "email-all" | "email-single" | null;
    passengerIndex?: number | null;
  }>({ type: null, passengerIndex: null });

  // ESTADOS PARA PAGO
  const [pagoparHash, setPagoparHash] = useState<string | null>(hash);
  const [paymentStatus, setPaymentStatus] = useState<
    "checking" | "paid" | "pending" | "failed" | "cancelled"
  >("checking");
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [savingToDB, setSavingToDB] = useState(false);
  const [showPaymentStatus, setShowPaymentStatus] = useState(true);
  const [isTarjetaPayment, setIsTarjetaPayment] = useState(false);

  // ESTADO PARA EMAIL AUTOMÁTICO
  const [autoEmailStatus, setAutoEmailStatus] = useState<
    "idle" | "sending" | "sent" | "failed"
  >("idle");
  const [autoEmailMessage, setAutoEmailMessage] = useState<string>("");

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

  const primaryPassenger = passengerDetails[0];

  // Helper para verificar si se está procesando algo
  const isProcessing = (
    type?: "all-tickets" | "single-ticket" | "email-all" | "email-single",
  ) => {
    if (!processing.type) return false;
    if (!type) return true; // Si no se especifica tipo, cualquier procesamiento cuenta
    return processing.type === type;
  };

  // Helper para verificar si se está procesando algo para un pasajero específico
  const isProcessingForPassenger = (passengerIndex: number) => {
    return processing.passengerIndex === passengerIndex;
  };

  // =====================================================================
  // FUNCIÓN PARA DESCARGAR MULTIPLES PDFs (UNO POR PASAJERO)
  // =====================================================================
  const handleDownloadPDF = async () => {
    if (
      !selectedOutboundTrip ||
      !bookingReference ||
      passengerDetails.length === 0
    ) {
      console.error("Datos insuficientes para generar PDFs");
      return;
    }

    // Verificar si ya se está procesando algo
    if (isProcessing()) {
      console.log("Ya se está procesando una acción");
      return;
    }

    // Activar loader para todos los boletos
    setProcessing({ type: "all-tickets", passengerIndex: null });

    console.log(`Iniciando generación de ${passengerDetails.length} PDF(s)...`);

    try {
      const newGeneratedTickets: TicketData[] = [];

      // Para cada pasajero, generar su boleto individual
      for (const [index, passenger] of passengerDetails.entries()) {
        console.log(
          `Generando boleto ${index + 1}/${passengerDetails.length} para ${passenger.firstName} ${passenger.lastName}`,
        );

        // Encontrar el asiento correspondiente a este pasajero
        const passengerSeat =
          selectedSeats[index]?.number ||
          passenger.seatNumber ||
          `A${index + 1}`;

        // Calcular precio por pasajero
        const pricePerPassenger = Math.round(
          totalPrice / passengerDetails.length,
        );

        // Preparar payload EXACTO como lo espera el backend externo
        const payload = {
          reservaCodigo: `${bookingReference}-${passengerSeat}`,
          horaSalida: selectedOutboundTrip.departureTime,
          origen: originCity?.name || selectedOutboundTrip.origin,
          horaLlegada: selectedOutboundTrip.arrivalTime,
          destino: destinationCity?.name || selectedOutboundTrip.destination,
          fechaViaje: format(
            parse(departureDate || "", "yyyy-MM-dd", new Date()),
            "d 'de' MMMM, yyyy",
            {
              locale: es,
            },
          ),
          duracion: selectedOutboundTrip.duration,
          empresa: selectedOutboundTrip.company,
          servicioTipo: selectedOutboundTrip.busType,
          asientos: passengerSeat, // Solo el asiento de este pasajero
          terminal: `Terminal de Ómnibus de ${originCity?.name}`,
          puerta: Math.floor(Math.random() * 20 + 1).toString(),
          pasajeroNombre: `${passenger.firstName} ${passenger.lastName}`,
          documento: passenger.documentNumber || "Sin documento",
          telefono: passenger.phone || "Sin teléfono",
          subtotal: `Gs. ${Math.round(pricePerPassenger * 0.82).toLocaleString("es-PY")}`,
          iva: `Gs. ${Math.round(pricePerPassenger * 0.1).toLocaleString("es-PY")}`,
          cargoServicio: `Gs. ${Math.round(pricePerPassenger * 0.08).toLocaleString("es-PY")}`,
          total: `Gs. ${pricePerPassenger.toLocaleString("es-PY")}`,
          pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
          metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
        };

        console.log(
          `Enviando a API interna para ${passenger.firstName}:`,
          payload,
        );

        // Llamar a NUESTRA API interna (que luego llama al externo)
        const response = await fetch("/api/tickets/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log(
          `Respuesta de API interna para ${passenger.firstName}:`,
          result.success ? "✅" : "❌",
        );

        if (!result.success) {
          throw new Error(
            `Error generando boleto para ${passenger.firstName}: ${result.message}`,
          );
        }

        if (!result.pdf?.base64) {
          throw new Error(`No se recibió el PDF para ${passenger.firstName}`);
        }

        // Guardar el ticket generado
        newGeneratedTickets.push({
          fileName: result.pdf.fileName,
          base64: result.pdf.base64,
          origin: payload.origen,
          destination: payload.destino,
          seat: passengerSeat,
          passengerName: `${passenger.firstName} ${passenger.lastName}`,
        });
      }

      console.log(
        `${newGeneratedTickets.length} PDF(s) generados exitosamente`,
      );

      // Actualizar estado con los nuevos tickets
      setGeneratedTickets(newGeneratedTickets);

      // Descargar todos los boletos automáticamente (uno tras otro)
      for (const [index, ticket] of newGeneratedTickets.entries()) {
        console.log(
          `Descargando PDF ${index + 1}/${newGeneratedTickets.length}: ${ticket.fileName}`,
        );

        // Pequeña pausa entre descargas para evitar problemas
        await new Promise((resolve) => setTimeout(resolve, 300));

        const link = document.createElement("a");
        link.href = ticket.base64;
        link.download = ticket.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      console.log("Todos los PDFs descargados exitosamente");
    } catch (error: any) {
      console.error("Error generando PDFs:", error);

      // Mensajes de error más amigables
      let userMessage = "Error al generar los boletos";
      let errorDetails = error.message;

      if (error.message.includes("Timeout") || error.message.includes("504")) {
        userMessage =
          "El servicio de boletos está demorando mucho. Por favor, intenta más tarde.";
      } else if (
        error.message.includes("502") ||
        error.message.includes("503")
      ) {
        userMessage =
          "El servicio de boletos no está disponible temporalmente. Intenta nuevamente en unos minutos.";
      } else if (error.message.includes("No se recibió")) {
        userMessage =
          "Algunos PDFs no se generaron correctamente. Contacta con soporte.";
      }
    } finally {
      // Desactivar loader
      setProcessing({ type: null, passengerIndex: null });
    }
  };

  // =====================================================================
  // FUNCIÓN PARA DESCARGAR UN BOLETO ESPECÍFICO
  // =====================================================================
  const handleDownloadSingleTicket = async (passengerIndex: number) => {
    const passenger = passengerDetails[passengerIndex];
    if (!selectedOutboundTrip || !bookingReference || !passenger) {
      console.error("Datos insuficientes para generar PDF");
      return;
    }

    // Verificar si ya se está procesando algo
    if (isProcessing()) {
      console.log("Ya se está procesando una acción");
      return;
    }

    // Activar loader para este pasajero específico
    setProcessing({ type: "single-ticket", passengerIndex });

    try {
      // Encontrar el asiento correspondiente a este pasajero
      const passengerSeat =
        selectedSeats[passengerIndex]?.number ||
        passenger.seatNumber ||
        `A${passengerIndex + 1}`;

      // Calcular precio por pasajero
      const pricePerPassenger = Math.round(
        totalPrice / passengerDetails.length,
      );

      // Preparar payload
      const payload = {
        reservaCodigo: `${bookingReference}-${passengerSeat}`,
        horaSalida: selectedOutboundTrip.departureTime,
        origen: originCity?.name || selectedOutboundTrip.origin,
        horaLlegada: selectedOutboundTrip.arrivalTime,
        destino: destinationCity?.name || selectedOutboundTrip.destination,
        fechaViaje: format(
          parse(departureDate || "", "yyyy-MM-dd", new Date()),
          "d 'de' MMMM, yyyy",
          {
            locale: es,
          },
        ),
        duracion: selectedOutboundTrip.duration,
        empresa: selectedOutboundTrip.company,
        servicioTipo: selectedOutboundTrip.busType,
        asientos: passengerSeat,
        terminal: `Terminal de Ómnibus de ${originCity?.name}`,
        puerta: Math.floor(Math.random() * 20 + 1).toString(),
        pasajeroNombre: `${passenger.firstName} ${passenger.lastName}`,
        documento: passenger.documentNumber || "Sin documento",
        telefono: passenger.phone || "Sin teléfono",
        subtotal: `Gs. ${Math.round(pricePerPassenger * 0.82).toLocaleString("es-PY")}`,
        iva: `Gs. ${Math.round(pricePerPassenger * 0.1).toLocaleString("es-PY")}`,
        cargoServicio: `Gs. ${Math.round(pricePerPassenger * 0.08).toLocaleString("es-PY")}`,
        total: `Gs. ${pricePerPassenger.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
      };

      console.log(
        `Generando boleto individual para ${passenger.firstName}`,
        payload,
      );

      const response = await fetch("/api/tickets/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error del servidor");
      }

      if (!result.pdf?.base64) {
        throw new Error("No se recibió el PDF");
      }

      // Descargar el PDF
      const link = document.createElement("a");
      link.href = result.pdf.base64;
      link.download = result.pdf.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Boleto individual descargado: ${result.pdf.fileName}`);
    } catch (error: any) {
      console.error("Error generando boleto individual:", error);
    } finally {
      // Desactivar loader
      setProcessing({ type: null, passengerIndex: null });
    }
  };

  // =====================================================================
  // FUNCIÓN PARA ENVIAR EMAIL A TODOS LOS PASAJEROS
  // =====================================================================
  const handleSendEmail = async () => {
    if (!selectedOutboundTrip || !bookingReference || !primaryPassenger) return;

    // Verificar si ya se está procesando algo
    if (isProcessing()) {
      console.log("Ya se está procesando una acción");
      return;
    }

    // Activar loader para email a todos
    setProcessing({ type: "email-all", passengerIndex: null });
    setEmailSent(false);
    setAutoEmailStatus("sending");
    setAutoEmailMessage("Enviando boletos por email...");

    try {
      // Para el email, enviamos un solo boleto con todos los pasajeros
      const passengerSeats = selectedSeats.map((s) => s.number).join(", ");
      const passengerNames = passengerDetails
        .map((p) => `${p.firstName} ${p.lastName}`)
        .join(", ");

      // Preparar payload para la API de email
      // SIN PDF - El backend externo generará el PDF automáticamente
      const payload = {
        emailDestino: primaryPassenger.email,
        reservaCodigo: bookingReference,
        horaSalida: selectedOutboundTrip.departureTime,
        origen: originCity?.name || selectedOutboundTrip.origin,
        horaLlegada: selectedOutboundTrip.arrivalTime,
        destino: destinationCity?.name || selectedOutboundTrip.destination,
        fechaViaje: format(
          parse(departureDate || "", "yyyy-MM-dd", new Date()),
          "d 'de' MMMM, yyyy",
          {
            locale: es,
          },
        ),
        duracion: selectedOutboundTrip.duration,
        empresa: selectedOutboundTrip.company,
        servicioTipo: selectedOutboundTrip.busType,
        asientos: passengerSeats,
        terminal: `Terminal de Ómnibus de ${originCity?.name}`,
        puerta: Math.floor(Math.random() * 20 + 1).toString(),
        pasajeroNombre: passengerNames,
        documento: primaryPassenger.documentNumber || "Sin documento",
        telefono: primaryPassenger.phone || "Sin teléfono",
        subtotal: `Gs. ${Math.round(totalPrice * 0.82).toLocaleString("es-PY")}`,
        iva: `Gs. ${Math.round(totalPrice * 0.1).toLocaleString("es-PY")}`,
        cargoServicio: `Gs. ${Math.round(totalPrice * 0.08).toLocaleString("es-PY")}`,
        total: `Gs. ${totalPrice.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
      };

      console.log("📧 Enviando email a todos los pasajeros (destino único):", {
        email: primaryPassenger.email,
        asientos: passengerSeats,
        pasajeros: passengerNames,
      });

      // Llamar DIRECTAMENTE a la API de email
      // Ella se encargará de generar el PDF y enviarlo
      const response = await fetch("/api/tickets/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error al enviar el email");
      }

      // Marcar como enviado exitosamente
      setEmailSent(true);
      setAutoEmailStatus("sent");
      setAutoEmailMessage("Boletos enviados al correo electrónico");

      console.log("✅ Email enviado exitosamente a todos:", result);
    } catch (error: any) {
      console.error("❌ Error enviando email a todos:", error);

      let errorMessage = "Error al enviar el email.";

      if (error.message.includes("Timeout") || error.message.includes("504")) {
        errorMessage =
          "El servicio de email está demorando mucho. Por favor, intenta más tarde.";
      } else if (
        error.message.includes("502") ||
        error.message.includes("503")
      ) {
        errorMessage =
          "El servicio de email no está disponible temporalmente. Intenta nuevamente en unos minutos.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage = "Error de red al enviar el email. Verifica tu conexión.";
      }

      setAutoEmailStatus("failed");
      setAutoEmailMessage(errorMessage);
    } finally {
      // Desactivar loader
      setProcessing({ type: null, passengerIndex: null });
    }
  };

  // =====================================================================
  // 6. FUNCIÓN PARA ENVIAR EMAIL DE CONFIRMACIÓN AUTOMÁTICO
  // =====================================================================
  const sendConfirmationEmail = async (
    passengerEmail: string,
  ): Promise<boolean> => {
    if (!selectedOutboundTrip || !bookingReference || !primaryPassenger) {
      console.warn("⚠️ No hay datos suficientes para enviar email");
      return false;
    }

    try {
      setAutoEmailStatus("sending");
      setAutoEmailMessage("Enviando boleto por email...");

      // Para email automático, enviamos un solo boleto con todos los pasajeros
      const passengerSeats = selectedSeats.map((s) => s.number).join(", ");
      const passengerNames = passengerDetails
        .map((p) => `${p.firstName} ${p.lastName}`)
        .join(", ");

      // Preparar payload para la API de email
      const payload = {
        emailDestino: passengerEmail,
        reservaCodigo: bookingReference,
        horaSalida: selectedOutboundTrip.departureTime,
        origen: originCity?.name || selectedOutboundTrip.origin,
        horaLlegada: selectedOutboundTrip.arrivalTime,
        destino: destinationCity?.name || selectedOutboundTrip.destination,
        fechaViaje: format(
          parse(departureDate || "", "yyyy-MM-dd", new Date()),
          "d 'de' MMMM, yyyy",
          {
            locale: es,
          },
        ),
        duracion: selectedOutboundTrip.duration,
        empresa: selectedOutboundTrip.company,
        servicioTipo: selectedOutboundTrip.busType,
        asientos: passengerSeats,
        terminal: `Terminal de Ómnibus de ${originCity?.name}`,
        puerta: Math.floor(Math.random() * 20 + 1).toString(),
        pasajeroNombre: passengerNames,
        documento: primaryPassenger.documentNumber || "Sin documento",
        telefono: primaryPassenger.phone || "Sin teléfono",
        subtotal: `Gs. ${Math.round(totalPrice * 0.82).toLocaleString("es-PY")}`,
        iva: `Gs. ${Math.round(totalPrice * 0.1).toLocaleString("es-PY")}`,
        cargoServicio: `Gs. ${Math.round(totalPrice * 0.08).toLocaleString("es-PY")}`,
        total: `Gs. ${totalPrice.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
      };

      // Llamar DIRECTAMENTE a la API de email (sin generar PDF primero)
      const response = await fetch("/api/tickets/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Error al enviar el email automático",
        );
      }

      console.log("✅ Email automático enviado exitosamente:", result);
      setAutoEmailStatus("sent");
      setAutoEmailMessage("Boleto enviado al correo electrónico");

      return true;
    } catch (error: any) {
      console.error("Error enviando email automático:", error);

      let errorMessage = "Error al enviar el email automático";
      if (error.name === "AbortError") {
        errorMessage = "Timeout: El envío de email tardó demasiado";
      } else if (error.message.includes("network")) {
        errorMessage = "Error de red al enviar el email";
      }

      setAutoEmailStatus("failed");
      setAutoEmailMessage(errorMessage);

      return false;
    }
  };

  // =====================================================================
  // FUNCIÓN PARA ENVIAR EMAIL A UN PASAJERO ESPECÍFICO
  // =====================================================================
  const handleSendEmailToPassenger = async (passengerIndex: number) => {
    const passenger = passengerDetails[passengerIndex];
    if (!selectedOutboundTrip || !bookingReference || !passenger) {
      return;
    }

    // Verificar si ya se está procesando algo
    if (isProcessing()) {
      console.log("⚠️ Ya se está procesando una acción");
      return;
    }

    // Activar loader para este pasajero específico
    setProcessing({ type: "email-single", passengerIndex });

    try {
      // Buscar el asiento correspondiente
      const passengerSeat =
        selectedSeats[passengerIndex]?.number ||
        passenger.seatNumber ||
        `A${passengerIndex + 1}`;

      // Calcular precio por pasajero
      const pricePerPassenger = Math.round(
        totalPrice / passengerDetails.length,
      );

      // Preparar payload para la API de email
      // AHORA NO NECESITAMOS GENERAR EL PDF PRIMERO
      // La API de email generará el PDF automáticamente
      const payload = {
        emailDestino: passenger.email,
        reservaCodigo: `${bookingReference}-${passengerSeat}`,
        horaSalida: selectedOutboundTrip.departureTime,
        origen: originCity?.name || selectedOutboundTrip.origin,
        horaLlegada: selectedOutboundTrip.arrivalTime,
        destino: destinationCity?.name || selectedOutboundTrip.destination,
        fechaViaje: format(
          parse(departureDate || "", "yyyy-MM-dd", new Date()),
          "d 'de' MMMM, yyyy",
          {
            locale: es,
          },
        ),
        duracion: selectedOutboundTrip.duration,
        empresa: selectedOutboundTrip.company,
        servicioTipo: selectedOutboundTrip.busType,
        asientos: passengerSeat,
        terminal: `Terminal de Ómnibus de ${originCity?.name}`,
        puerta: Math.floor(Math.random() * 20 + 1).toString(),
        pasajeroNombre: `${passenger.firstName} ${passenger.lastName}`,
        documento: passenger.documentNumber || "Sin documento",
        telefono: passenger.phone || "Sin teléfono",
        subtotal: `Gs. ${Math.round(pricePerPassenger * 0.82).toLocaleString("es-PY")}`,
        iva: `Gs. ${Math.round(pricePerPassenger * 0.1).toLocaleString("es-PY")}`,
        cargoServicio: `Gs. ${Math.round(pricePerPassenger * 0.08).toLocaleString("es-PY")}`,
        total: `Gs. ${pricePerPassenger.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
      };

      console.log(`📧 Enviando boleto a ${passenger.email}...`);

      // Llamar DIRECTAMENTE a la API de email
      // Ella se encargará de generar el PDF y enviarlo
      const response = await fetch("/api/tickets/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Error al enviar el email");
      }

      console.log("Email enviado exitosamente:", result);
    } catch (error: any) {
      console.error("Error enviando email al pasajero:", error);
    } finally {
      // Desactivar loader
      setProcessing({ type: null, passengerIndex: null });
    }
  };

  // =====================================================================
  // DETECTAR TIPO DE PAGO AL CARGAR
  // =====================================================================
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
      console.log("Hash válido recibido de Pagopar:", hash);
      setPagoparHash(hash);
      verifyPagoparPayment(hash);
      localStorage.removeItem("pagopar_last_hash");
    } else {
      const savedHash = localStorage.getItem("pagopar_last_hash");
      if (savedHash) {
        console.log("Hash encontrado en localStorage:", savedHash);
        setPagoparHash(savedHash);
        verifyPagoparPayment(savedHash);
        localStorage.removeItem("pagopar_last_hash");
      } else {
        console.log("No se encontró hash");
        setPaymentStatus("failed");
      }
    }
  }, [setStep, hash]);

  // FUNCIÓN PARA PAGO CON TARJETA
  const handleTarjetaPayment = async () => {
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

    // 4. Enviar email de confirmación automático
    if (primaryPassenger?.email) {
      console.log("Enviando email automático para pago con tarjeta...");
      await sendConfirmationEmail(primaryPassenger.email);
    }

    // 5. Guardar en base de datos
    saveTarjetaBookingToDatabase();
  };

  // FUNCIÓN PARA VERIFICAR PAGO CON PAGOPAR
  const verifyPagoparPayment = async (hash: string) => {
    try {
      console.log("Consultando estado en Pagopar con hash:", hash);

      const response = await fetch("/api/pagopar/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash_pedido: hash }),
      });

      const data = await response.json();
      console.log("Respuesta de consulta Pagopar:", data);

      if (data.respuesta === true && data.resultado?.[0]) {
        const payment = data.resultado[0];
        setPaymentDetails(payment);

        if (payment.pagado === true) {
          // PAGO EXITOSO
          console.log("PAGO CONFIRMADO POR PAGOPAR");
          setPaymentStatus("paid");
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);

          if (!bookingReference) {
            const newReference = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setBookingReference(newReference);
            setStorePaymentStatus("completed");
          }

          // Enviar email de confirmación automático
          if (primaryPassenger?.email) {
            console.log("Enviando email automático para pago Pagopar...");
            await sendConfirmationEmail(primaryPassenger.email);
          }

          await saveBookingToDatabase(payment, hash);
        } else if (payment.cancelado === true) {
          // PAGO CANCELADO
          console.log("PAGO CANCELADO");
          setPaymentStatus("cancelled");
        } else if (payment.fecha_pago === null && payment.pagado === false) {
          console.log("PAGO NO REALIZADO - Usuario no completó el pago");
          setPaymentStatus("failed");
        } else {
          // Caso inesperado
          console.log("Estado desconocido del pago");
          setPaymentStatus("failed");
        }
      } else {
        console.log("No se pudo verificar el pago");
        setPaymentStatus("failed");
      }
    } catch (error: any) {
      console.error("Error verificando pago:", error);
      setPaymentStatus("failed");
    }
  };

  // GUARDAR RESERVA EN BASE DE DATOS PARA PAGOPAR
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

      console.log("Guardando reserva Pagopar en BD:", bookingData);

      // const response = await fetch("/api/bookings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(bookingData),
      // });

      // if (response.ok) {
      //   console.log("Reserva Pagopar guardada exitosamente");
      // toast.success("Reserva guardada exitosamente", {
      //   id: savingToast,
      //   duration: 3000,
      // });
      // } else {
      //   console.error("Error guardando reserva Pagopar");
      //   toast.error("Error guardando reserva", {
      //     id: savingToast,
      //     duration: 5000,
      //   });
      // }
    } catch (error) {
      console.error("Error guardando reserva Pagopar:", error);
    } finally {
      setSavingToDB(false);
    }
  };

  // GUARDAR RESERVA EN BASE DE DATOS PARA TARJETA
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

      console.log("Guardando reserva con tarjeta en BD:", bookingData);

      // const response = await fetch("/api/bookings", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(bookingData),
      // });

      // if (response.ok) {
      //   console.log("Reserva con tarjeta guardada exitosamente");
      // toast.success("Reserva con tarjeta guardada", {
      //   id: savingToast,
      //   duration: 3000,
      // });
      // } else {
      //   console.error("Error guardando reserva con tarjeta");
      //   toast.error("Error guardando reserva", {
      //     id: savingToast,
      //     duration: 5000,
      //   });
      // }
    } catch (error) {
      console.error("Error guardando reserva con tarjeta:", error);
    } finally {
      setSavingToDB(false);
    }
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

  // COMPLETAR PAGO EN PAGOPAR
  const handleCompletePayment = () => {
    if (pagoparHash) {
      localStorage.removeItem("pagopar_last_hash");
      setTimeout(() => {
        window.location.href = `https://www.pagopar.com/pagos/${pagoparHash}`;
      }, 500);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        <div className="text-center text-background">
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-bounce"
            priority
          />
          <p className="text-background/60">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  // Si no hay selectedOutboundTrip pero ya tenemos estado de pago, mostrar error
  if (!selectedOutboundTrip) {
    console.log(
      "No hay selectedOutboundTrip, pero paymentStatus es:",
      paymentStatus,
    );

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419]">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <BookingProgress />
          <div className="container mx-auto px-4 py-8">
            <Card className="p-6 bg-amber-500/10 backdrop-blur-sm border-amber-500/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-300 mb-2">
                    Información de reserva no disponible
                  </h3>
                  <p className="text-sm text-amber-400 mb-4">
                    No pudimos recuperar los detalles de tu reserva. Esto puede
                    pasar si:
                  </p>
                  <ul className="text-sm text-amber-400 mb-4 list-disc pl-4">
                    <li>La sesión expiró</li>
                    <li>El pago no se completó correctamente</li>
                  </ul>

                  <div className="bg-amber-500/10 p-3 rounded mb-4 border border-amber-500/20">
                    <p className="text-xs font-medium text-amber-300">
                      Información disponible:
                    </p>
                    <p className="text-xs text-amber-400">Hash: {hash}</p>
                    <p className="text-xs text-amber-400">
                      Estado pago: {paymentStatus}
                    </p>
                    <p className="text-xs text-amber-400">
                      Fecha: {new Date().toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        router.push("/");
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Volver al inicio
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        router.push("/booking/checkout");
                      }}
                      className="border-background/30 text-foreground hover:bg-background/10"
                    >
                      Intentar nuevamente
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const canShowActions = bookingReference && paymentStatus === "paid";

  // Renderizar contenido según estado de pago
  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case "checking":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-blue-500/10 backdrop-blur-sm border-blue-500/30">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-300">
                    Verificando estado del pago...
                  </h3>
                  <p className="text-sm text-blue-400">
                    Estamos consultando el estado de tu transacción.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case "pending":
        return (
          <div className="mb-6 animate-fade-in">
            <Card className="p-6 bg-yellow-500/10 backdrop-blur-sm border-yellow-500/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-300 mb-2">
                    Pago pendiente
                  </h3>
                  <p className="text-sm text-yellow-400 mb-4">
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
            <Card className="p-6 bg-amber-500/10 backdrop-blur-sm border-amber-500/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-300 mb-2">
                    Pago no completado
                  </h3>
                  <p className="text-sm text-amber-400 mb-4">
                    No detectamos un pago exitoso para esta reserva. El pedido
                    en Pagopar está pendiente pero no se realizó el pago.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        router.push("/booking/checkout");
                      }}
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
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <BookingProgress />
          <div className="container mx-auto px-4 py-8">
            {renderPaymentStatus()}

            {/* Mostrar información de la reserva aunque no esté pagada */}
            <Card className="p-6 mb-6 bg-background/5 backdrop-blur-sm border-background/20">
              <h3 className="text-xl font-bold mb-4 text-background">
                Detalles de tu reserva
              </h3>
              <div className="space-y-3">
                <p className="text-background/80">
                  <span className="font-medium text-background">Ruta:</span>{" "}
                  {originCity?.name} → {destinationCity?.name}
                </p>
                <p className="text-background/80">
                  <span className="font-medium text-background">Fecha:</span>{" "}
                  {format(
                    parse(departureDate || "", "yyyy-MM-dd", new Date()),
                    "dd/MM/yyyy",
                  )}
                </p>
                <p className="text-background/80">
                  <span className="font-medium text-background">
                    Pasajeros:
                  </span>{" "}
                  {passengerDetails.length}
                </p>
                <p className="text-background/80">
                  <span className="font-medium text-background">Total:</span>{" "}
                  Gs. {totalPrice.toLocaleString("es-PY")}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Si el pago está confirmado, mostrar la página completa
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(150)].map((_, i) => {
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

      <div className="relative z-10">
        <BookingProgress />

        <div className="container mx-auto px-4 py-8">
          {/* Mostrar estado de pago */}
          {showPaymentStatus && renderPaymentStatus()}

          {/* Notificación de email automático */}
          {/* {autoEmailStatus !== "idle" && (
            <div className="mb-6 animate-fade-in">
              <Card
                className={`p-4 backdrop-blur-sm border ${
                  autoEmailStatus === "sent"
                    ? "bg-green-500/10 border-green-500/30"
                    : autoEmailStatus === "sending"
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-amber-500/10 border-amber-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {autoEmailStatus === "sent" ? (
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  ) : autoEmailStatus === "sending" ? (
                    <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        autoEmailStatus === "sent"
                          ? "text-green-300"
                          : autoEmailStatus === "sending"
                            ? "text-blue-300"
                            : "text-amber-300"
                      }`}
                    >
                      {autoEmailStatus === "sending"
                        ? "Enviando boleto por email..."
                        : autoEmailStatus === "sent"
                          ? "Boleto enviado al correo electrónico"
                          : "⚠️ No se pudo enviar el email automáticamente"}
                    </p>
                    <p
                      className={`text-sm ${
                        autoEmailStatus === "sent"
                          ? "text-green-400"
                          : autoEmailStatus === "sending"
                            ? "text-blue-400"
                            : "text-amber-400"
                      }`}
                    >
                      {autoEmailMessage}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )} */}

          {/* Success Header */}
          <div className="text-center mb-12 animate-bounce-in">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <CheckCircle2 className="h-14 w-14 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-background mb-3">
              ¡Reserva Confirmada!
            </h1>
            <p className="text-lg text-background/60 mb-6">
              {isTarjetaPayment
                ? "Tu pago con tarjeta ha sido procesado exitosamente. Tu boleto electrónico está listo."
                : "Tu pago ha sido procesado exitosamente. Tu boleto electrónico está listo."}
            </p>

            {/* Booking Reference */}
            <div className="inline-flex items-center gap-3 bg-background/10 backdrop-blur-sm rounded-full px-6 py-3 border border-background/20">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-background/60">Código de reserva:</span>
              <span className="font-bold text-xl text-primary">
                {bookingReference}
              </span>
              {bookingReference && (
                <button
                  onClick={handleCopyReference}
                  className="p-1 hover:bg-background/20 rounded transition-colors"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-background/60" />
                  )}
                </button>
              )}
            </div>

            {/* Passenger Info */}
            {primaryPassenger && (
              <div className="mt-4 text-sm text-background/60">
                <p>
                  Boleto enviado a:{" "}
                  <span className="font-medium text-background">
                    {primaryPassenger.email}
                  </span>
                </p>
                <p>
                  Documento:{" "}
                  <span className="font-medium text-background">
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
              <Card className="p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-lg text-background">
                    Viaje de Ida
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-3xl font-bold text-background">
                          {selectedOutboundTrip.departureTime}
                        </p>
                        <p className="text-background/60">{originCity?.name}</p>
                      </div>
                      <div className="flex-1 flex items-center">
                        <div className="w-full h-0.5 bg-background/20 relative">
                          <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary bg-background/5" />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-background">
                          {selectedOutboundTrip.arrivalTime}
                        </p>
                        <p className="text-background/60">
                          {destinationCity?.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-2 text-background/60">
                        <Calendar className="h-4 w-4" />
                        {format(
                          parse(departureDate || "", "yyyy-MM-dd", new Date()),
                          "EEEE d 'de' MMMM",
                          { locale: es },
                        )}
                      </span>
                      <span className="flex items-center gap-2 text-background/60">
                        <Clock className="h-4 w-4" />
                        {selectedOutboundTrip.duration}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Bus className="h-5 w-5 text-background/60" />
                      <div>
                        <p className="font-medium text-background">
                          {selectedOutboundTrip.company}
                        </p>
                        <p className="text-sm text-background/60">
                          {selectedOutboundTrip.busType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-background/60" />
                      <div>
                        <p className="font-medium text-background">
                          Asientos:{" "}
                          {selectedSeats.map((s) => s.number).join(", ")}
                        </p>
                        <p className="text-sm text-background/60">
                          {selectedSeats.length} pasajero
                          {selectedSeats.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terminal Info */}
                <div className="mt-4 pt-4 border-t border-background/20 text-sm">
                  <p className="text-background/60">
                    <span className="font-medium text-background">
                      Terminal de salida:
                    </span>{" "}
                    Terminal de Ómnibus de {originCity?.name}
                  </p>
                  <p className="text-background/60">
                    <span className="font-medium text-background">Puerta:</span>{" "}
                    {Math.floor(Math.random() * 12) + 1}
                  </p>
                </div>
              </Card>

              {/* Return Trip */}
              {tripType === "round-trip" && selectedReturnTrip && (
                <Card
                  className="p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20"
                  style={{ animationDelay: "0.2s" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/30">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="font-bold text-lg text-background">
                      Viaje de Regreso
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <p className="text-3xl font-bold text-background">
                            {selectedReturnTrip.departureTime}
                          </p>
                          <p className="text-background/60">
                            {destinationCity?.name}
                          </p>
                        </div>
                        <div className="flex-1 flex items-center">
                          <div className="w-full h-0.5 bg-background/20 relative">
                            <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-secondary bg-background/5" />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-background">
                            {selectedReturnTrip.arrivalTime}
                          </p>
                          <p className="text-background/60">
                            {originCity?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <span className="flex items-center gap-2 text-background/60">
                          <Calendar className="h-4 w-4" />
                          {format(
                            parse(returnDate || "", "yyyy-MM-dd", new Date()),
                            "EEEE d 'de' MMMM",
                            { locale: es },
                          )}
                        </span>
                        <span className="flex items-center gap-2 text-background/60">
                          <Clock className="h-4 w-4" />
                          {selectedReturnTrip.duration}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Bus className="h-5 w-5 text-background/60" />
                        <div>
                          <p className="font-medium text-background">
                            {selectedReturnTrip.company}
                          </p>
                          <p className="text-sm text-background/60">
                            {selectedReturnTrip.busType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-background/60" />
                        <div>
                          <p className="font-medium text-background">
                            Asientos:{" "}
                            {selectedReturnSeats
                              .map((s) => s.number)
                              .join(", ")}
                          </p>
                          <p className="text-sm text-background/60">
                            {selectedReturnSeats.length} pasajero
                            {selectedReturnSeats.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terminal Info */}
                  <div className="mt-4 pt-4 border-t border-background/20 text-sm">
                    <p className="text-background/60">
                      <span className="font-medium text-background">
                        Terminal de salida:
                      </span>{" "}
                      Terminal de Ómnibus de {destinationCity?.name}
                    </p>
                    <p className="text-background/60">
                      <span className="font-medium text-background">
                        Puerta:
                      </span>{" "}
                      {Math.floor(Math.random() * 12) + 1}
                    </p>
                  </div>
                </Card>
              )}

              {/* Passengers */}
              <Card
                className="p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20"
                style={{ animationDelay: "0.3s" }}
              >
                <h3 className="font-bold text-lg mb-4 text-background">
                  Información de Pasajeros
                </h3>
                <div className="space-y-4">
                  {passengerDetails.map((passenger, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background/10 rounded-xl gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/30">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-background">
                            {passenger.firstName} {passenger.lastName}
                          </p>
                          <p className="text-sm text-background/60">
                            Documento: {passenger.documentNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="font-medium text-background">
                          Asiento {passenger.seatNumber}
                        </p>
                        <p className="text-sm text-background/60">
                          {passenger.email}
                        </p>
                        <p className="text-sm text-background/60">
                          Tel: {passenger.phone}
                        </p>
                        {/* Botones para cada pasajero */}
                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                          {/* Botón para descargar boleto individual */}
                          <Button
                            onClick={() => handleDownloadSingleTicket(index)}
                            disabled={isProcessing()}
                            variant="ghost"
                            size="sm"
                            className="text-xs bg-secondary/10 hover:bg-secondary/20 text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:flex-1"
                          >
                            {processing.type === "single-ticket" &&
                            processing.passengerIndex === index ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Generando...
                              </>
                            ) : (
                              <>
                                <Download className="h-3 w-3" />
                                Descargar boleto individual
                              </>
                            )}
                          </Button>

                          {/* Botón para enviar por email */}
                          <Button
                            onClick={() => handleSendEmailToPassenger(index)}
                            disabled={isProcessing()}
                            variant="ghost"
                            size="sm"
                            className="text-xs bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:flex-1"
                          >
                            {processing.type === "email-single" &&
                            processing.passengerIndex === index ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3" />
                                Enviar a email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment Summary */}
              <Card
                className="p-6 animate-fade-in bg-background/5 backdrop-blur-sm border-background/20"
                style={{ animationDelay: "0.4s" }}
              >
                <h3 className="font-bold text-lg mb-4 text-background">
                  Resumen del Pago
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-background/60">Subtotal</span>
                    <span className="text-background">
                      Gs.{" "}
                      {Math.round(totalPrice * 0.82).toLocaleString("es-PY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/60">IVA (10%)</span>
                    <span className="text-background">
                      Gs. {Math.round(totalPrice * 0.1).toLocaleString("es-PY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-background/60">Servicio (8%)</span>
                    <span className="text-background">
                      Gs.{" "}
                      {Math.round(totalPrice * 0.08).toLocaleString("es-PY")}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-background/20 flex justify-between font-bold text-lg">
                    <span className="text-background">Total Pagado</span>
                    <span className="text-secondary">
                      Gs. {totalPrice.toLocaleString("es-PY")}
                    </span>
                  </div>
                  {paymentDetails?.fecha_pago && (
                    <div className="text-xs text-background/60 mt-2">
                      <p>
                        Pago realizado el{" "}
                        {format(
                          new Date(paymentDetails.fecha_pago),
                          "dd/MM/yyyy 'a las' HH:mm",
                        )}
                      </p>
                      <p className="mt-1">
                        Método: {paymentDetails.forma_pago}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24 animate-slide-in-right bg-background/5 backdrop-blur-sm border-background/20">
                <h3 className="text-xl font-bold mb-6 text-background">
                  Tu Boleto Electrónico
                </h3>

                <div className="space-y-4">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isProcessing() || !canShowActions}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing.type === "all-tickets" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Generando {passengerDetails.length} PDF(s)...
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        Descargar boletos ({passengerDetails.length})
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSendEmail}
                    disabled={isProcessing() || emailSent || !canShowActions}
                    variant="outline"
                    className="w-full h-14 text-lg font-semibold border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing.type === "email-all" ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : emailSent ? (
                      <>
                        <Check className="h-5 w-5" />
                        Reenviar por Correo
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar por Correo
                      </>
                    )}
                  </Button>

                  <div className="pt-4 border-t border-background/20">
                    <Button
                      onClick={handleNewBooking}
                      variant="ghost"
                      className="w-full border border-background/30 text-background hover:bg-background/10"
                    >
                      <Home className="h-4 w-4" />
                      Nueva Reserva
                    </Button>
                  </div>
                </div>

                {/* Información adicional */}
                {generatedTickets.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-background/20">
                    <p className="text-sm text-background/60 mb-2">
                      Boletos generados ({generatedTickets.length}/
                      {passengerDetails.length}):
                    </p>
                    <div className="space-y-2">
                      {generatedTickets.map((ticket, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-background/10 rounded"
                        >
                          <div
                            className="text-xs text-background/60 truncate mr-2"
                            title={ticket.fileName}
                          >
                            • {ticket.passengerName} - Asiento {ticket.seat}
                          </div>
                          <Button
                            onClick={() => {
                              // Si el boleto ya está generado, descargarlo directamente
                              const link = document.createElement("a");
                              link.href = ticket.base64;
                              link.download = ticket.fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            disabled={isProcessing()}
                            variant="ghost"
                            size="sm"
                            className="text-xs h-6 px-2"
                          >
                            {processing.type === "single-ticket" &&
                            processing.passengerIndex === index ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Download className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>
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
