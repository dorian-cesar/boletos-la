"use client";

import { use, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ConfirmationLoading from "../confirmation-loading";
import ConfirmationPageContent from "./confirmation-content";
import { useBookingStore } from "@/lib/booking-store";

interface ConfirmationPageProps {
  params: Promise<{ hash: string }>;
}

export default function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { hash } = use(params);
  const searchParams = useSearchParams();
  const demo = searchParams.get("demo");

  const {
    selectedOutboundTrip,
    setSelectedOutboundTrip,
    setPassengerDetails,
    setBookingReference,
    setDepartureDate,
    setOriginTitle,
    setDestinationTitle,
  } = useBookingStore();

  const [ready, setReady] = useState<{
    paymentDetails: any;
    isTarjetaPayment: boolean;
  } | null>(null);

  useEffect(() => {
    if (demo === "success") {
      // Inyectar datos de prueba en el store si está vacío para previsualizar el diseño real completo
      if (!selectedOutboundTrip) {
        setSelectedOutboundTrip({
          id: "demo-trip-1",
          origin: "Asunción",
          destination: "Ciudad del Este",
          date: "2026-09-01",
          departureTime: "08:00",
          arrivalTime: "13:30",
          duration: "5h 30m",
          price: 120000,
          busType: "Ejecutivo",
          company: "NSA - Nuestra Señora de la Asunción",
          amenities: ["WiFi", "Aire Acondicionado", "Cargador USB"],
          availableSeats: 25,
        });
        setDepartureDate("2026-09-01");
        setOriginTitle("Asunción");
        setDestinationTitle("Ciudad del Este");
        useBookingStore.setState({
          selectedSeats: [
            {
              id: "s-12",
              number: "12",
              row: 3,
              column: 2,
              floor: 1,
              type: "standard",
              status: "selected",
              price: 120000,
              qualityCode: "CA",
              ticketNumber: "BOL-PY-84920-12",
            },
          ]
        });
        setPassengerDetails([
          {
            seatId: "s-12",
            seatNumber: "12",
            firstName: "Juan",
            lastName: "Pérez",
            documentNumber: "4567890",
            email: "juan.perez@example.com",
            phone: "+595 981 123456",
            birthDate: "1990-05-15",
          },
        ]);
        useBookingStore.setState({ totalPrice: 120000 });
        setBookingReference("BOL-PY-84920");
      }

      setReady({
        paymentDetails: {
          pagado: true,
          forma_pago: "Tarjeta Bancard (Crédito/Débito)",
          fecha_pago: new Date().toISOString(),
          monto: "120000.00",
          hash_pedido: "demo-hash-12345",
          numero_pedido: "5650643753",
          token: "demo-token",
          numero_factura: "001-001-0045892",
          cdc: "0180012667000100100012341202404221100000000",
          timbrado: "1731316",
        },
        isTarjetaPayment: true,
      });
    }
  }, [
    demo,
    selectedOutboundTrip,
    setSelectedOutboundTrip,
    setDepartureDate,
    setOriginTitle,
    setDestinationTitle,
    setPassengerDetails,
    setBookingReference,
  ]);

  if (!ready) {
    return (
      <ConfirmationLoading
        hash={hash}
        onReady={(paymentDetails, isTarjeta) =>
          setReady({ paymentDetails, isTarjetaPayment: isTarjeta })
        }
      />
    );
  }

  return (
    <ConfirmationPageContent
      hash={hash}
      paymentDetails={ready.paymentDetails}
      isTarjetaPayment={ready.isTarjetaPayment}
    />
  );
}
