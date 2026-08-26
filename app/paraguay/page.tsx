// app/page.tsx
"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/lib/booking-store";
import { ParaguayHeader } from "@/components/paraguay/header";
import { ParaguayHeroSection } from "@/components/paraguay/hero-section";
import { FeaturesSection } from "@/components/paraguay/features-section";
import { DestinationsSection } from "@/components/paraguay/destinations-section";
import { CompaniesSection } from "@/components/paraguay/companies-section";
import { ParaguayFooter } from "@/components/paraguay/footer";
import { PromoSection } from "@/components/paraguay/promo-section";

export default function ParaguayPage() {
  useEffect(() => {
    // Usar getState para acceder directamente sin suscribir al componente
    const storeState = useBookingStore.getState();
    const {
      outboundConnectionId,
      returnConnectionId,
      selectedSeats,
      selectedReturnSeats,
    } = storeState;

    // Función para desbloquear asientos en el GDS
    const unblockSeats = async () => {
      const unblockTasks = [];

      if (outboundConnectionId) {
        unblockTasks.push(
          fetch("/api/gds/unblock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId: outboundConnectionId }),
          }).catch((err) => console.error("Error unblocking outbound:", err)),
        );
      }

      if (returnConnectionId) {
        unblockTasks.push(
          fetch("/api/gds/unblock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ connectionId: returnConnectionId }),
          }).catch((err) => console.error("Error unblocking return:", err)),
        );
      }

      if (unblockTasks.length > 0) {
        await Promise.all(unblockTasks);
      }

      // Reset completo para nueva búsqueda después de intentar desbloquear
      storeState.resetBooking();
      localStorage.removeItem("pagopar_last_hash");
    };

    // Solo actuar si hay asientos seleccionados o IDs de conexión (bloqueos pendientes)
    if (
      selectedSeats.length > 0 ||
      selectedReturnSeats.length > 0 ||
      outboundConnectionId ||
      returnConnectionId
    ) {
      unblockSeats();
    }
  }, []); // Empty dependency array = solo se ejecuta una vez al montar

  return (
    <main className="min-h-screen">
      <ParaguayHeader />
      <ParaguayHeroSection />
      <FeaturesSection />
      <DestinationsSection />
      <PromoSection />
      <ParaguayFooter />
    </main>
  );
}
