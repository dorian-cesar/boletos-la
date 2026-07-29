"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { BookingProgress } from "@/components/booking-progress";
import { useBookingStore } from "@/lib/booking-store";
import { sellGdsSeats } from "@/lib/gds-sell";
import { AlertCircle, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import QRCode from "qrcode";

interface Props {
  hash: string;
  onReady: (paymentDetails: any, isTarjeta: boolean) => void;
}

type Status = "checking" | "pending" | "cancelled" | "failed";

export default function ConfirmationLoading({ hash, onReady }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    bancardProcessId,
    setBancardProcessId,
    bancardShopProcessId,
    setBancardShopProcessId,
    bancardIsVisa,
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
      const reservaCodigo = getTicketNumber(label, seat.number);
      const cdcValue = paymentDetails?.cdc || "";
      const qrContent = cdcValue
        ? `https://ekuatia.set.gov.py/consultas/${cdcValue}`
        : reservaCodigo;

      // Generar QR en base64
      const qrBase64 = await QRCode.toDataURL(qrContent);

      const payload = {
        emailDestino: primaryPassenger.email,
        reservaCodigo,
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
        pasajeroNombre: `${passenger.firstName} ${passenger.lastName}`,
        documento: passenger.documentNumber || "Sin documento",
        email: passenger.email || "Sin email",
        fechaNacimiento: passenger.birthDate || "01/01/1990",
        telefono: passenger.phone || "Sin teléfono",
        total: `Gs. ${seat.price.toLocaleString("es-PY")}`,
        pagoFecha: format(new Date(), "dd/MM/yyyy HH:mm"),
        metodoPago: paymentDetails?.forma_pago || "Tarjeta de Crédito/Débito",
        numeroFactura: paymentDetails?.numero_factura || "",
        timbrado: paymentDetails?.timbrado || "",
        fechaVenta: format(new Date(), "dd/MM/yyyy HH:mm"),
        asiento: seat.number,
        servicio: trip.busType,
        qrBase64: qrBase64,
        cdc: paymentDetails?.cdc || "",
      };

      try {
        const response = await fetch("/api/tickets/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errData = await response.json();
          console.error(
            "Error al enviar email (status code no exitoso):",
            response.status,
            errData,
          );
        } else {
          console.log(
            "Email enviado exitosamente para el asiento:",
            seat.number,
          );
        }
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
      date: string,
    ) => {
      const tasks = seats.map(async (seat, idx) => {
        const passenger = passengerDetails[passengerStartIndex + idx];
        if (!passenger) return;

        const ticketNumber =
          tickets[`${label}-${seat.number}`] || `${activeRef}-${seat.number}`;

        const payload = {
          ticket_number: String(ticketNumber),
          connection_id: String(connId || ""),
          first_name: String(passenger.firstName || "").trim(),
          last_name: String(passenger.lastName || "").trim(),
          document_number: String(passenger.documentNumber || "").replace(/[.\-\s]/g, ""),
          document_type_code: String(passenger.docType?.codigo || "C"),
          document_type_name: String(passenger.docType?.nombre || "C.I. Paraguaya"),
          email: String(passenger.email || primaryPassenger?.email || ""),
          phone: String(passenger.phone || primaryPassenger?.phone || "").replace(/\D/g, ""),
          occupation: String(passenger.occupation || "EMPLEADO"),
          birth_date: passenger.birthDate
            ? String(passenger.birthDate).replace(/\//g, "-")
            : "1990-01-01",
          gender: String(passenger.gender || "M"),
          nationality: String(passenger.nationality || "PY"),
          country: String(passenger.country || "PY"),
          seat_number: String(seat.number),
          seat_type: String(seat.type || "standard"),
          seat_status: "occupied",
          quality_code: String(seat.qualityCode || "CA"),
          trip_id: String(trip.id),
          origin_id: String(trip.origin),
          destination_id: String(trip.destination),
          origin_title: String(origin || ""),
          destination_title: String(dest || ""),
          departure_date: String(date || ""),
          departure_time:
            trip.departureTime &&
            trip.departureTime.includes(":") &&
            trip.departureTime.split(":").length === 2
              ? `${trip.departureTime}:00`
              : String(trip.departureTime || "00:00:00"),
          arrival_time:
            trip.arrivalTime &&
            trip.arrivalTime.includes(":") &&
            trip.arrivalTime.split(":").length === 2
              ? `${trip.arrivalTime}:00`
              : String(trip.arrivalTime || "00:00:00"),
          duration: String(trip.duration || ""),
          bus_type: String(trip.busType || ""),
          company: String(trip.company || ""),
          seat_price: Number(seat.price || trip.price || 0),
          total_booking_price: Number(totalPrice || 0),
          payment_status: "completed",
          payment_amount: Number(seat.price || trip.price || 0),
          payment_paid: Boolean(paymentDetails.pagado),
          payment_token: String(paymentDetails.token || paymentDetails.hash_pedido || ""),
          payment_hash: String(paymentDetails.hash_pedido || paymentDetails.token || ""),
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
      departureDate || "",
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
        returnDate || "",
      );
    }
  };

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hasHydrated = useBookingStore.persist.hasHydrated();
    if (hasHydrated) {
      setIsHydrated(true);
    } else {
      const unsub = useBookingStore.persist.onFinishHydration(() => {
        setIsHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
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
        const simHash = Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("");
        const simToken = Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16),
        ).join("");

        const simBillNum = `001-001-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const simCdc = `01801715709001001000${Math.floor(100000000000000000000000 + Math.random() * 900000000000000000000000)}`;
        const simTimbrado = "18903263";

        const simulatedPaymentDetails = {
          pagado: true,
          forma_pago: "Tarjetas de crédito",
          fecha_pago: simDate,
          monto: totalPrice.toFixed(2),
          fecha_maxima_pago: simDate,
          hash_pedido: simHash,
          numero_pedido: Math.floor(
            10000000 + Math.random() * 90000000,
          ).toString(),
          cancelado: false,
          forma_pago_identificador: "9",
          token: simToken,
          numero_factura: simBillNum,
          cdc: simCdc,
          timbrado: simTimbrado,
          mensaje_resultado_pago: {
            titulo: "Pedido pagado exitosamente",
            descripcion: "",
          },
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

      if (hash === "bancard") {
        const paymentStatus = searchParams.get("status");
        if (paymentStatus === "payment_fail") {
          console.error("El pago fue rechazado o cancelado en el iframe de Bancard.");
          setStatus("failed");
          return;
        }

        const shopProcessId =
          bancardShopProcessId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("bancard_shop_process_id")
            : null) ||
          "";
        const processId =
          bancardProcessId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("bancard_process_id")
            : null) ||
          "";
        const primaryPassenger = passengerDetails[0];
        const docNum = primaryPassenger?.documentNumber || "1234567";

        try {
          const isVisa =
            bancardIsVisa ||
            (typeof window !== "undefined"
              ? localStorage.getItem("bancard_is_visa") === "true"
              : false);

          const isSuccess = paymentStatus === "payment_success" || !paymentStatus;

          if (isSuccess) {
            setBancardProcessId(null);
            setBancardShopProcessId(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("bancard_shop_process_id");
              localStorage.removeItem("bancard_process_id");
              localStorage.removeItem("bancard_is_visa");
            }
            let finalRef = bookingReference;
            if (!finalRef) {
              finalRef = `TB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
              setBookingReference(finalRef);
            }
            setStorePaymentStatus("completed");
            
            // 1. Polling (Reintentos) en la confirmación para obtener el electronicBillCdc
            let electronicBillCdc: string | null = null;
            let electronicBillNumber: string | null = null;
            let electronicBillStamp: string | null = null;
            let confirmData: any = null;

            const maxAttempts = 5;
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
              console.log(`[Bancard Confirmation] Polling intento ${attempt}/${maxAttempts}...`);
              try {
                const confirmRes = await fetch("/api/bancard/confirmar-transaccion", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "confirmation",
                    processId: processId,
                    shopProcessId: shopProcessId ? parseInt(shopProcessId) : 0,
                    amount: totalPrice.toFixed(2),
                  }),
                });

                if (confirmRes.ok) {
                  const rawData = await confirmRes.json();
                  confirmData = rawData;

                  const cdc =
                    rawData?.data?.confirmation?.electronicBillCdc ||
                    rawData?.confirmation?.electronicBillCdc;
                  const billNum =
                    rawData?.data?.confirmation?.electronicBillNumber ||
                    rawData?.confirmation?.electronicBillNumber;
                  const stamp =
                    rawData?.data?.confirmation?.commerceStamp ||
                    rawData?.confirmation?.commerceStamp;

                  if (cdc) {
                    electronicBillCdc = cdc;
                    electronicBillNumber = billNum || "";
                    electronicBillStamp = stamp || "";
                    console.log(`[Bancard Confirmation] CDC obtenido en intento ${attempt}: ${cdc}`);
                    break;
                  }
                }
              } catch (pollErr) {
                console.error(`[Bancard Confirmation] Error en intento ${attempt}:`, pollErr);
              }

              if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 2500));
              }
            }

            if (!electronicBillCdc) {
              console.warn("[Bancard Confirmation] No se obtuvo electronicBillCdc tras agotar los 5 reintentos. Ejecutando rollback...");
              try {
                await fetch("/api/bancard/rollback-transaccion", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    shopProcessId: shopProcessId ? parseInt(shopProcessId) : 0,
                    processId: processId,
                  }),
                });
                console.log("[Bancard Rollback] Rollback completado por falta de CDC.");
              } catch (rollbackErr) {
                console.error("[Bancard Rollback] Error al realizar rollback por falta de CDC:", rollbackErr);
              }
              setStatus("failed");
              return;
            }

            const realPaymentDetails = {
              pagado: true,
              forma_pago: isVisa ? "Bancard (VISA)" : "Bancard",
              fecha_pago: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
              monto: totalPrice.toFixed(2),
              hash_pedido: processId || shopProcessId || "bancard-payment",
              numero_pedido: shopProcessId || "bancard-payment",
              token: processId || shopProcessId || "bancard-payment",
              numero_factura: electronicBillNumber || "",
              cdc: electronicBillCdc || "",
              timbrado: electronicBillStamp || "",
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

              const expectedTicketsCount =
                selectedSeats.length +
                (selectedReturnTrip ? selectedReturnSeats.length : 0);
              const actualTicketsCount = Object.keys(ticketMap).length;

              // 3. Manejo de Rollback si el GDS falla en la emisión del pasaje
              if (actualTicketsCount < expectedTicketsCount) {
                console.error(
                  "GDS sell failed for Bancard: expected",
                  expectedTicketsCount,
                  "tickets but got",
                  actualTicketsCount,
                );

                try {
                  console.log("Iniciando rollback por falla de emisión GDS...");
                  await fetch("/api/bancard/rollback-transaccion", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      shopProcessId: shopProcessId ? parseInt(shopProcessId) : 0,
                      processId: processId,
                    }),
                  });
                  console.log("Rollback de Bancard completado con éxito.");
                } catch (rollbackErr) {
                  console.error("Error al hacer rollback de Bancard:", rollbackErr);
                }

                setStatus("failed");
                return;
              }

              if (Object.keys(ticketMap).length > 0) {
                assignTicketNumbers(ticketMap);
                const first = Object.values(ticketMap)[0];
                if (first) {
                  setBookingReference(first);
                  finalRef = first;
                }
              }
              await sendEmailAlertsInBackground(
                realPaymentDetails,
                finalRef,
                ticketMap,
              );
              await saveTicketsInBackground(
                realPaymentDetails,
                finalRef,
                ticketMap,
              );
            }

            setPaymentResult({
              monto: realPaymentDetails.monto,
              pagado: realPaymentDetails.pagado,
              token: realPaymentDetails.token,
              hash_pedido: realPaymentDetails.hash_pedido,
            });

            onReady(realPaymentDetails, false);
          } else {
            setStatus("failed");
          }
        } catch (error) {
          console.error("Error confirmando pago Bancard:", error);
          setStatus("failed");
        }
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

              const expectedTicketsCount =
                selectedSeats.length +
                (selectedReturnTrip ? selectedReturnSeats.length : 0);
              const actualTicketsCount = Object.keys(ticketMap).length;

              if (actualTicketsCount < expectedTicketsCount) {
                console.error(
                  "GDS sell failed for Pagopar: expected",
                  expectedTicketsCount,
                  "tickets but got",
                  actualTicketsCount,
                );
                setStatus("failed");
                return;
              }

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
  }, [isHydrated]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background relative overflow-x-hidden">
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
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background relative overflow-x-hidden">
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
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
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
                    className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
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
