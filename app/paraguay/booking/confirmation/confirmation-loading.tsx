"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { BookingProgress } from "@/components/paraguay/booking-progress";
import { useBookingStore } from "@/lib/booking-store";
import { sellGdsSeats } from "@/lib/gds-sell";
import { trackPurchase } from "@/lib/meta-pixel";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import QRCode from "qrcode";

interface Props {
  hash: string;
  onReady: (paymentDetails: any, isTarjeta: boolean) => void;
}

type Status = "checking" | "pending" | "cancelled" | "failed" | "issue_failed";

export default function ConfirmationLoading({ hash, onReady }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processingRef = useRef(false);
  const trackedPurchaseRef = useRef(false);
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
    discountPercentage,
    discountEmpresa,
    discountConvenio,
    discountCargoPorServicio,
    discountValorCargoServicio,
    serviceCharge,
  } = useBookingStore();

  const appliedServiceCharge = discountCargoPorServicio === false ? 0 : (discountCargoPorServicio === true && discountValorCargoServicio !== null && discountValorCargoServicio !== undefined ? discountValorCargoServicio : (serviceCharge || 2500));

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

    const saveTripTickets = async (trip: any, seats: any[], label: string, offset: number, connectionId: string, origin: string, dest: string, date: string) => {
      const tasks = seats.map(async (seat, index) => {
        const passenger = passengerDetails[index + offset] || primaryPassenger;
        if (!passenger) return;

        const reservaCodigo = getTicketNumber(label, seat.number);
        const cdcValue = paymentDetails?.cdc || "";
        const qrContent = cdcValue ? `https://ekuatia.set.gov.py/consultas/${cdcValue}` : reservaCodigo;
        const qrBase64 = await QRCode.toDataURL(qrContent);


        const resolveCompany = (code: string | null | undefined) => {
          if (!code) return null;
          const upper = String(code).toUpperCase();
          if (upper === 'LSN') return 'La Santaniana';
          if (upper === 'LSA') return 'La Santaniana Argentina';
          if (upper === 'LSP') return 'La Sampedrana';
          if (upper === 'RYSA') return 'RYSA';
          if (upper === 'NSA') return 'Nuestra Señora de la Asunción';
          if (upper === 'SLT') return 'San Luis S.A.';
          return code;
        };

        const payload = {
          ticket_number: String(seat.ticketNumber || tickets[`${label}-${seat.number}`] || ""),
          connection_id: String(connectionId || ""),
          first_name: String(passenger.firstName || primaryPassenger?.firstName || ""),
          last_name: String(passenger.lastName || primaryPassenger?.lastName || ""),
          document_number: String(passenger.documentNumber || primaryPassenger?.documentNumber || ""),
          document_type_code: String(passenger.docType?.codigo || primaryPassenger?.docType?.codigo || "C"),
          document_type_name: String(passenger.docType?.nombre || primaryPassenger?.docType?.nombre || "Paraguay"),
          email: passenger.email || primaryPassenger?.email || null,
          phone: passenger.phone || primaryPassenger?.phone ? String(passenger.phone || primaryPassenger?.phone).replace(/\D/g, "") : null,
          occupation: passenger.occupation || null,
          birth_date: passenger.birthDate ? String(passenger.birthDate).replace(/\//g, "-") : null,
          gender: passenger.gender || null,
          nationality: passenger.nationality || null,
          country: passenger.country || "PY",
          seat_number: seat.number || null,
          seat_type: seat.type || null,
          seat_status: "occupied",
          quality_code: seat.qualityCode || "CA",
          trip_id: trip.id || null,
          origin_id: trip.origin || null,
          destination_id: trip.destination || null,
          origin_title: origin || null,
          destination_title: dest || null,
          departure_date: date || null,
          departure_time: trip.departureTime && trip.departureTime.includes(":") && trip.departureTime.split(":").length === 2 ? `${trip.departureTime}:00` : (trip.departureTime || null),
          arrival_time: trip.arrivalTime && trip.arrivalTime.includes(":") && trip.arrivalTime.split(":").length === 2 ? `${trip.arrivalTime}:00` : (trip.arrivalTime || null),
          duration: trip.duration || null,
          bus_type: trip.busType || null,
          company: trip.company || null,
          empresa_transporte: resolveCompany(trip.company),
          seat_price: Number(seat.price || trip.price || 0),
          total_booking_price: Number(totalPrice || 0),
          payment_status: "completed",
          payment_amount: Number(seat.price || trip.price || 0),
          payment_paid: Boolean(paymentDetails.pagado),
          payment_token: paymentDetails.token || paymentDetails.hash_pedido || null,
          payment_hash: paymentDetails.hash_pedido || paymentDetails.token || null,
          numero_factura: paymentDetails.numero_factura || null,
          cdc: paymentDetails.cdc || null,
          timbrado: paymentDetails.timbrado || null,
          origen_transaccion: "web",
          agencia_delta: "BO2",
          tipo_pago: "BANCARD",
          descuento: discountPercentage ? Math.round(Number(seat.price || trip.price || 0) * (discountPercentage / 100)) : 0,
          cargo_por_servicio: appliedServiceCharge,
          monto_final: Number(seat.price || trip.price || 0) - (discountPercentage ? Math.round(Number(seat.price || trip.price || 0) * (discountPercentage / 100)) : 0) + appliedServiceCharge,
          empresa_convenio: discountEmpresa || null,
          convenio: discountConvenio || null,
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
        const simCdc =
          "01801715709001001000" +
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 10)).join(
            "",
          );
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

          const expectedTicketsCount =
            selectedSeats.length +
            (selectedReturnTrip ? selectedReturnSeats.length : 0);
          const actualTicketsCount = Object.keys(ticketMap).length;

          if (actualTicketsCount < expectedTicketsCount) {
            console.error(
              "GDS sell failed in simulation: expected",
              expectedTicketsCount,
              "tickets but got",
              actualTicketsCount,
            );
            setStatus("issue_failed");
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
            simulatedPaymentDetails,
            finalRef,
            ticketMap,
          );
          await sendEmailAlertsInBackground(
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
          console.error(
            "El pago fue rechazado o cancelado en el iframe de Bancard.",
          );
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

          const isSuccess =
            paymentStatus === "payment_success" || !paymentStatus;

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
              console.log(
                `[Bancard Confirmation] Polling intento ${attempt}/${maxAttempts}...`,
              );
              try {
                const confirmRes = await fetch(
                  "/api/bancard/confirmar-transaccion",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "confirmation",
                      processId: processId,
                      shopProcessId: shopProcessId
                        ? parseInt(shopProcessId)
                        : 0,
                      amount: totalPrice.toFixed(2),
                    }),
                  },
                );

                if (confirmRes.ok) {
                  const rawData = await confirmRes.json();
                  confirmData = rawData;

                  if (!trackedPurchaseRef.current) {
                    trackedPurchaseRef.current = true;
                    trackPurchase({
                      value: totalPrice && totalPrice > 0 ? totalPrice : (rawData?.amount ? Number(rawData.amount) : 0),
                      currency: "PYG",
                      content_category: "paraguay",
                      content_ids: selectedOutboundTrip?.id
                        ? [selectedOutboundTrip.id]
                        : ["pasaje-paraguay"],
                    });
                  }

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
                    console.log(
                      `[Bancard Confirmation] CDC obtenido en intento ${attempt}: ${cdc}`,
                    );
                    break;
                  }
                }
              } catch (pollErr) {
                console.error(
                  `[Bancard Confirmation] Error en intento ${attempt}:`,
                  pollErr,
                );
              }

              if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, 2500));
              }
            }

            // if (!electronicBillCdc) {
            //   console.warn(
            //     "[Bancard Confirmation] No se obtuvo electronicBillCdc tras agotar los 5 reintentos. Ejecutando rollback...",
            //   );
            //   try {
            //     await fetch("/api/bancard/rollback-transaccion", {
            //       method: "POST",
            //       headers: { "Content-Type": "application/json" },
            //       body: JSON.stringify({
            //         shopProcessId: shopProcessId ? parseInt(shopProcessId) : 0,
            //         processId: processId,
            //       }),
            //     });
            //     console.log(
            //       "[Bancard Rollback] Rollback completado por falta de CDC.",
            //     );
            //   } catch (rollbackErr) {
            //     console.error(
            //       "[Bancard Rollback] Error al realizar rollback por falta de CDC:",
            //       rollbackErr,
            //     );
            //   }
            //   setStatus("failed");
            //   return;
            // }

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
              // if (actualTicketsCount < expectedTicketsCount) {
              //   console.error(
              //     "GDS sell failed for Bancard: expected",
              //     expectedTicketsCount,
              //     "tickets but got",
              //     actualTicketsCount,
              //   );

              //   try {
              //     console.log("Iniciando rollback por falla de emisión GDS...");
              //     await fetch("/api/bancard/rollback-transaccion", {
              //       method: "POST",
              //       headers: { "Content-Type": "application/json" },
              //       body: JSON.stringify({
              //         shopProcessId: shopProcessId ? parseInt(shopProcessId) : 0,
              //         processId: processId,
              //       }),
              //     });
              //     console.log("Rollback de Bancard completado con éxito.");
              //   } catch (rollbackErr) {
              //     console.error("Error al hacer rollback de Bancard:", rollbackErr);
              //   }

              //   setStatus("issue_failed");
              //   return;
              // }

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
              await sendEmailAlertsInBackground(
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
                setStatus("issue_failed");
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
              await sendEmailAlertsInBackground(payment, finalRef, ticketMap);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] text-slate-900 dark:text-white relative overflow-x-hidden">
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
              Verificando tu pago...
            </h1>
            <p className="text-slate-900 dark:text-white/60 mb-6">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] text-slate-900 dark:text-white relative overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10">
        <BookingProgress />
        <div className="container mx-auto px-4 py-8">
          {status === "issue_failed" ? (
            <Card className="p-6 sm:p-8 bg-white dark:bg-[#1a2332]/90 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-2xl text-left max-w-xl mx-auto">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/40 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-9 w-9 text-emerald-400" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full mb-2">
                    Pago Registrado Exitosamente
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Tu pago fue procesado correctamente
                  </h2>
                </div>

                <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-left my-2">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-amber-300 text-sm">
                        Inconveniente en la emisión del pasaje
                      </h3>
                      <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                        Tu pago fue recibido, pero ocurrió una demora técnica al
                        emitir los boletos en el sistema de transporte. No te
                        preocupes, tus pasajes y fondos están resguardados.
                      </p>
                    </div>
                  </div>
                </div>

                {bookingReference && (
                  <div className="w-full bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 text-xs space-y-2">
                    <div className="flex justify-between text-slate-300">
                      <span>Código de referencia:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {bookingReference}
                      </span>
                    </div>
                    {totalPrice > 0 && (
                      <div className="flex justify-between text-slate-300">
                        <span>Monto abonado:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          Gs. {totalPrice.toLocaleString("es-PY")}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <p className="text-sm text-slate-300 mt-1">
                  Por favor, contactate con nuestro equipo de soporte para la
                  emisión directa de tus boletos:
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                  <Button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Hola, mi pago fue procesado correctamente pero ocurrió un inconveniente en la emisión de boletos. Mi código de referencia es: ${bookingReference || "Sin código"}.`,
                      );
                      window.open(
                        `https://wa.me/595991224613?text=${msg}`,
                        "_blank",
                      );
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white font-medium flex-1 py-5 rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Contactar por WhatsApp
                  </Button>

                  <Button
                    onClick={() => {
                      const subject = encodeURIComponent(
                        `Soporte Emisión - Ref: ${bookingReference || ""}`,
                      );
                      const body = encodeURIComponent(
                        `Hola equipo de Soporte,\n\nMi pago fue confirmado pero ocurrió un error en la emisión automática de pasajes.\n\nCódigo de referencia: ${bookingReference || ""}\nMonto: Gs. ${totalPrice}\n\nQuedo a la espera de sus comentarios.`,
                      );
                      window.location.href = `mailto:soporte@boletos.la?subject=${subject}&body=${body}`;
                    }}
                    variant="outline"
                    className="bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 hover:text-slate-900 font-medium flex-1 py-5 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Mail className="h-5 w-5" />
                    Contactar por Email
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => router.push("/paraguay")}
                  className="text-xs text-slate-400 hover:text-slate-900 dark:text-white mt-2"
                >
                  Volver al inicio
                </Button>
              </div>
            </Card>
          ) : status === "pending" ? (
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
                      : "La confirmación del pasaje no se pudo realizar"}
                  </h3>
                  <p className="text-sm text-amber-400 mb-4">
                    {status === "cancelled"
                      ? "El pago fue cancelado."
                      : "No se pudo completar la reserva o emisión de los pasajes en el sistema. Por favor, intentá nuevamente."}
                  </p>
                  <Button
                    onClick={() => router.push("/paraguay/booking/checkout")}
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
