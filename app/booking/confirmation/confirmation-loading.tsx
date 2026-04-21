"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore } from "@/lib/booking-store";
import { sellGdsSeats } from "@/lib/gds-sell";
import { AlertCircle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface Props {
  hash: string;
  onReady: (paymentDetails: any, isTarjeta: boolean) => void;
}

type Status = "checking" | "pending" | "cancelled" | "failed";

export default function ConfirmationLoading({ hash, onReady }: Props) {
  const router = useRouter();
  const processingRef = useRef(false);
  const [status, setStatus] = useState<Status>("checking");
  const [pagoparHash, setPagoparHash] = useState<string | null>(null);

  const {
    departureDate,
    returnDate,
    originTitle,
    destinationTitle,
    selectedOutboundTrip,
    selectedReturnTrip,
    selectedSeats,
    selectedReturnSeats,
    passengerDetails,
    outboundConnectionId,
    returnConnectionId,
    totalPrice,
    bookingReference,
    setBookingReference,
    setPaymentStatus: setStorePaymentStatus,
    setPaymentResult,
    assignTicketNumbers,
  } = useBookingStore();

  const primaryPassenger = passengerDetails[0];

  const sendEmailAlertsInBackground = async (
    paymentDetails: any,
    activeRef: string,
    tickets: Record<string, string>,
  ) => {
    if (!primaryPassenger?.email || !selectedOutboundTrip) return;

    const getTicketNumber = (label: string, seatNumber: string) => {
      return tickets[`${label}-${seatNumber}`] || `${activeRef}-${seatNumber}`;
    };

    const sendTripEmail = async (
      trip: any,
      seat: any,
      passenger: any,
      label: string,
    ) => {
      const payload = {
        emailDestino: primaryPassenger.email,
        reservaCodigo: getTicketNumber(label, seat.number),
        horaSalida: trip.departureTime,
        origen:
          (label === "Ida" ? originTitle : destinationTitle) || trip.origin,
        horaLlegada: trip.arrivalTime,
        destino:
          (label === "Ida" ? destinationTitle : originTitle) ||
          trip.destination,
        fechaViaje: format(
          parse(
            (label === "Ida" ? departureDate : returnDate) || "",
            "yyyy-MM-dd",
            new Date(),
          ),
          "d 'de' MMMM, yyyy",
          { locale: es },
        ),
        duracion: trip.duration,
        empresa: trip.company,
        servicioTipo: trip.busType,
        asientos: seat.number,
        terminal:
          (label === "Ida" ? originTitle : destinationTitle) || "Terminal",
        puerta: Math.floor(Math.random() * 20 + 1).toString(),
        pasajeroNombre: `${passenger.firstName} ${passenger.lastName}`,
        documento: passenger.documentNumber || "Sin documento",
        telefono: passenger.phone || "Sin teléfono",
        subtotal: `Gs. ${Math.round(seat.price * 0.82).toLocaleString("es-PY")}`,
        iva: `Gs. ${Math.round(seat.price * 0.1).toLocaleString("es-PY")}`,
        cargoServicio: `Gs. ${Math.round(seat.price * 0.08).toLocaleString("es-PY")}`,
        total: `Gs. ${seat.price.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
      };

      try {
        await fetch("/api/tickets/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("Error enviando email:", err);
      }
    };

    const tasks: Promise<void>[] = [];
    selectedSeats.forEach((seat, idx) => {
      const pass = passengerDetails[idx];
      if (pass)
        tasks.push(sendTripEmail(selectedOutboundTrip, seat, pass, "Ida"));
    });

    if (selectedReturnTrip && selectedReturnSeats.length > 0) {
      selectedReturnSeats.forEach((seat, idx) => {
        const pass = passengerDetails[selectedSeats.length + idx];
        if (pass)
          tasks.push(sendTripEmail(selectedReturnTrip, seat, pass, "Vuelta"));
      });
    }

    await Promise.allSettled(tasks);
  };

  const saveTicketsInBackground = async (
    paymentDetails: any,
    activeRef: string,
    tickets: Record<string, string>,
  ) => {
    if (!selectedOutboundTrip) return;

    const saveTripTickets = async (
      trip: any,
      seats: any[],
      label: string,
      passengerStartIndex: number,
      connId: string,
      origin: string,
      dest: string,
      date: string
    ) => {
      const tasks = seats.map(async (seat, idx) => {
        const passenger = passengerDetails[passengerStartIndex + idx];
        if (!passenger) return;

        const ticketNumber = tickets[`${label}-${seat.number}`] || `${activeRef}-${seat.number}`;

        const payload = {
          ticket_number: ticketNumber,
          connection_id: connId,
          first_name: passenger.firstName,
          last_name: passenger.lastName,
          document_number: passenger.documentNumber,
          document_type_code: passenger.docType?.codigo || "N/A",
          document_type_name: passenger.docType?.nombre || "N/A",
          email: passenger.email || primaryPassenger?.email,
          phone: passenger.phone || primaryPassenger?.phone,
          occupation: passenger.occupation || "N/A",
          birth_date: passenger.birthDate,
          gender: passenger.gender,
          nationality: passenger.nationality,
          country: passenger.country,
          seat_id: seat.id,
          seat_number: seat.number,
          seat_row: seat.row,
          seat_column: seat.column,
          seat_floor: seat.floor,
          seat_type: seat.type,
          seat_status: "occupied",
          quality_code: seat.qualityCode,
          trip_id: trip.id,
          origin_id: trip.origin,
          destination_id: trip.destination,
          origin_title: origin,
          destination_title: dest,
          departure_date: date,
          departure_time: trip.departureTime.includes(":") && trip.departureTime.split(":").length === 2 ? `${trip.departureTime}:00` : trip.departureTime,
          arrival_time: trip.arrivalTime.includes(":") && trip.arrivalTime.split(":").length === 2 ? `${trip.arrivalTime}:00` : trip.arrivalTime,
          duration: trip.duration,
          bus_type: trip.busType,
          company: trip.company,
          seat_price: seat.price,
          total_booking_price: totalPrice,
          payment_status: "completed",
          payment_amount: seat.price,
          payment_paid: paymentDetails.pagado,
          payment_token: String(paymentDetails.token || ""),
          payment_hash: String(paymentDetails.hash_pedido || ""),
        };

        try {
          await fetch("/api/tickets/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error("Error saving ticket to analytics:", err);
        }
      });

      await Promise.allSettled(tasks);
    };

    // Ida
    await saveTripTickets(
      selectedOutboundTrip,
      selectedSeats,
      "Ida",
      0,
      outboundConnectionId || "",
      originTitle || "",
      destinationTitle || "",
      departureDate || ""
    );

    // Vuelta
    if (selectedReturnTrip && selectedReturnSeats.length > 0) {
      await saveTripTickets(
        selectedReturnTrip,
        selectedReturnSeats,
        "Vuelta",
        selectedSeats.length,
        returnConnectionId || "",
        destinationTitle || "",
        originTitle || "",
        returnDate || ""
      );
    }
  };

  useEffect(() => {
    if (processingRef.current) return;
    processingRef.current = true;

    const run = async () => {
      if (hash === "tarjeta") {
        const ref =
          bookingReference ||
          `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setBookingReference(ref);
        setStorePaymentStatus("completed");

        let finalRef = ref;

        const simDate = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const simHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        const simToken = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
        
        const simulatedPaymentDetails = {
            pagado: true,
            forma_pago: "Tarjetas de crédito",
            fecha_pago: simDate,
            monto: totalPrice.toFixed(2),
            fecha_maxima_pago: simDate,
            hash_pedido: simHash,
            numero_pedido: Math.floor(10000000 + Math.random() * 90000000).toString(),
            cancelado: false,
            forma_pago_identificador: "9",
            token: simToken,
            mensaje_resultado_pago: {
                titulo: "Pedido pagado exitosamente",
                descripcion: ""
            }
        };

        if (selectedOutboundTrip) {
          const ticketMap = await sellGdsSeats({
            outboundTrip: selectedOutboundTrip,
            returnTrip: selectedReturnTrip,
            outboundSeats: selectedSeats,
            returnSeats: selectedReturnSeats,
            passengers: passengerDetails,
            outboundConnectionId,
            returnConnectionId,
          });
          if (Object.keys(ticketMap).length > 0) {
            assignTicketNumbers(ticketMap);
            const first = Object.values(ticketMap)[0];
            if (first) {
              setBookingReference(first);
              finalRef = first;
            }
          }
          await sendEmailAlertsInBackground(
            simulatedPaymentDetails,
            finalRef,
            ticketMap,
          );
          await saveTicketsInBackground(
            simulatedPaymentDetails,
            finalRef,
            ticketMap,
          );
        }

        setPaymentResult({
          monto: simulatedPaymentDetails.monto,
          pagado: simulatedPaymentDetails.pagado,
          token: simulatedPaymentDetails.token,
          hash_pedido: simulatedPaymentDetails.hash_pedido,
        });

        onReady(simulatedPaymentDetails, true);
        return;
      }

      // Pagopar
      const resolvedHash = localStorage.getItem("pagopar_last_hash") ?? "";

      if (!resolvedHash) {
        setStatus("failed");
        return;
      }

      setPagoparHash(resolvedHash);

      try {
        const res = await fetch("/api/pagopar/check-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash_pedido: resolvedHash }),
        });
        const data = await res.json();

        if (
          data.respuesta === true &&
          data.resultado === "Sin datos que mostrar"
        ) {
          setStatus("failed");
          return;
        }

        if (
          data.respuesta === true &&
          Array.isArray(data.resultado) &&
          data.resultado.length > 0
        ) {
          const payment = data.resultado[0];

          if (payment.pagado === true) {
            localStorage.removeItem("pagopar_last_hash");
            let finalRef = bookingReference;
            if (!finalRef) {
              finalRef = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
              setBookingReference(finalRef);
            }
            setStorePaymentStatus("completed");

            if (selectedOutboundTrip) {
              const ticketMap = await sellGdsSeats({
                outboundTrip: selectedOutboundTrip,
                returnTrip: selectedReturnTrip,
                outboundSeats: selectedSeats,
                returnSeats: selectedReturnSeats,
                passengers: passengerDetails,
                outboundConnectionId,
                returnConnectionId,
              });
              if (Object.keys(ticketMap).length > 0) {
                assignTicketNumbers(ticketMap);
                const first = Object.values(ticketMap)[0];
                if (first) {
                  setBookingReference(first);
                  finalRef = first;
                }
              }
              await sendEmailAlertsInBackground(payment, finalRef, ticketMap);
              await saveTicketsInBackground(payment, finalRef, ticketMap);
            }

            setPaymentResult({
              monto: String(payment.monto),
              pagado: payment.pagado,
              token: String(payment.token),
              hash_pedido: String(payment.hash_pedido),
            });

            onReady(payment, false);
          } else if (payment.cancelado === true) {
            setStatus("cancelled");
          } else if (payment.fecha_pago === null && payment.pagado === false) {
            setStatus("pending");
          } else {
            setStatus("failed");
          }
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    };

    run();
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10">
          <BookingProgress />
          <div className="container mx-auto px-4 py-8 text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <Image
                src="/logos/logo-boletos.png"
                alt="Logo Boletos.la"
                width={56}
                height={30}
                priority
              />
            </div>
            <h1 className="text-3xl font-bold text-background mb-3">
              Verificando tu pago...
            </h1>
            <p className="text-background/60 mb-6">
              Estamos confirmando tu reserva, no cierres esta ventana.
            </p>
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Estados de error / pendiente
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10">
        <BookingProgress />
        <div className="container mx-auto px-4 py-8">
          {status === "pending" ? (
            <Card className="p-6 bg-yellow-500/10 backdrop-blur-sm border-yellow-500/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-yellow-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-300 mb-2">
                    Pago pendiente
                  </h3>
                  <p className="text-sm text-yellow-400 mb-4">
                    Tu pedido está esperando el pago. Completá el pago en
                    Pagopar para confirmar tu reserva.
                  </p>
                  <Button
                    onClick={() => {
                      if (pagoparHash)
                        window.location.href = `https://www.pagopar.com/pagos/${pagoparHash}`;
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Wallet className="h-4 w-4" />
                    Completar pago en Pagopar
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-amber-500/10 backdrop-blur-sm border-amber-500/30">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 text-amber-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-300 mb-2">
                    {status === "cancelled"
                      ? "Pago cancelado"
                      : "Pago no completado"}
                  </h3>
                  <p className="text-sm text-amber-400 mb-4">
                    {status === "cancelled"
                      ? "El pago fue cancelado."
                      : "No detectamos un pago exitoso para esta reserva."}
                  </p>
                  <Button
                    onClick={() => router.push("/booking/checkout")}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Wallet className="h-4 w-4" />
                    Intentar pago nuevamente
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
