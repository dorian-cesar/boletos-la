"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
    selectedOutboundTrip,
    selectedReturnTrip,
    selectedSeats,
    selectedReturnSeats,
    passengerDetails,
    connectionId,
    totalPrice,
    bookingReference,
    setBookingReference,
    setPaymentStatus: setStorePaymentStatus,
    assignTicketNumbers,
  } = useBookingStore();

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

        if (selectedOutboundTrip) {
          const ticketMap = await sellGdsSeats({
            outboundTrip: selectedOutboundTrip,
            returnTrip: selectedReturnTrip,
            outboundSeats: selectedSeats,
            returnSeats: selectedReturnSeats,
            passengers: passengerDetails,
            connectionId,
          });
          if (Object.keys(ticketMap).length > 0) {
            assignTicketNumbers(ticketMap);
            const first = Object.values(ticketMap)[0];
            if (first) setBookingReference(first);
          }
        }

        onReady(
          {
            forma_pago: "Tarjeta de Crédito/Débito",
            fecha_pago: new Date().toISOString(),
            numero_pedido: `TARJ-${Date.now().toString(36).toUpperCase()}`,
            monto: totalPrice.toString(),
            pagado: true,
            cancelado: false,
          },
          true,
        );
        return;
      }

      // Pagopar
      let resolvedHash = hash;
      if (!resolvedHash || ["undefined", "null"].includes(resolvedHash)) {
        resolvedHash = localStorage.getItem("pagopar_last_hash") ?? "";
      }
      localStorage.removeItem("pagopar_last_hash");

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

        if (data.respuesta === true && data.resultado?.[0]) {
          const payment = data.resultado[0];

          if (payment.pagado === true) {
            if (!bookingReference) {
              const ref = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
              setBookingReference(ref);
            }
            setStorePaymentStatus("completed");

            if (selectedOutboundTrip) {
              const ticketMap = await sellGdsSeats({
                outboundTrip: selectedOutboundTrip,
                returnTrip: selectedReturnTrip,
                outboundSeats: selectedSeats,
                returnSeats: selectedReturnSeats,
                passengers: passengerDetails,
                connectionId,
              });
              if (Object.keys(ticketMap).length > 0) {
                assignTicketNumbers(ticketMap);
                const first = Object.values(ticketMap)[0];
                if (first) setBookingReference(first);
              }
            }

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
                    <Wallet className="h-4 w-4 mr-2" />
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
                    <Wallet className="h-4 w-4 mr-2" />
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
