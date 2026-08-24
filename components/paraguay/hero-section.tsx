"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { ParaguaySearchForm } from "@/components/paraguay/search-form";

export function ParaguayHeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background optimizado */}
      <div className="absolute inset-0 bg-black">
        {/* LCP optimizado usando next/image */}
        <Image
          src="/images/banner.avif"
          alt="Fondo de viajes boletos.la"
          fill
          priority
          fetchPriority="high"
          quality={100}
          sizes="100vw"
          className="object-cover opacity-100"
        />

        {/* Overlay oscuro para mejor legibilidad de los textos */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-8 sm:py-20 lg:py-24 flex flex-col items-center justify-center mt-12 sm:mt-0">
        <div className="text-center mb-6 animate-fade-in hidden md:block">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-balance">Viaja por todo </span>
            <span className="text-primary">Paraguay</span>
            <br className="hidden sm:block" />
            <span className="text-secondary sm:ml-2"> con nosotros</span>
          </h1>
        </div>

        {/* Search Form Component - Prominent */}
        <div className="w-full max-w-[1200px] animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <ParaguaySearchForm />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-slate-900 dark:text-white/50" />
      </div>
    </section>
  );
}
