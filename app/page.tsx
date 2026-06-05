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
import { ScrollToTop } from "@/components/scroll-to-top";
import Aurora from "@/components/aurora";

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
      
      <div className="relative overflow-hidden bg-[#0f1419]">
        {/* Shared Aurora Background for Features and Destinations */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <Aurora
            colorStops={["#ff7b00", "#ffaa00", "#00c7cc"]}
            blend={0.5}
            amplitude={2.8}
            speed={0.8}
          />
        </div>
        {/* Seamless transition gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2332]/30 via-transparent to-[#0f1419]/40 pointer-events-none z-0" />
        
        <div className="relative z-10">
          <FeaturesSection />
          <DestinationsSection />
          <CompaniesSection />
        </div>
      </div>

      <Footer />
      <ScrollToTop />
    </main>
  );
}
