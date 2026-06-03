// app/page.tsx
"use client";

import { useEffect } from "react";
import { useBookingStore } from "@/lib/booking-store";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { DestinationsSection } from "@/components/destinations-section";
import { CompaniesSection } from "@/components/companies-section";
import { Footer } from "@/components/footer";

export default function HomePage() {
  useEffect(() => {
    // Usar getState para acceder directamente sin suscribir al componente
    const storeState = useBookingStore.getState();

    // Solo limpiar si hay asientos seleccionados
    if (
      storeState.selectedSeats.length > 0 ||
      storeState.selectedReturnSeats.length > 0
    ) {
      console.log("🏠 Home Page - Limpiando booking store para nueva búsqueda");

      // Reset completo para nueva búsqueda
      storeState.resetBooking();

      // Verificar que se limpió
      const newState = useBookingStore.getState();
      console.log("✅ Estado después de limpiar:");
      console.log("- selectedSeats:", newState.selectedSeats.length);
      console.log(
        "- selectedReturnSeats:",
        newState.selectedReturnSeats.length,
      );
      console.log("- step:", newState.step);
    }
  }, []); // Empty dependency array = solo se ejecuta una vez al montar

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <DestinationsSection />
      <CompaniesSection />
      <Footer />
    </main>
  );
}
