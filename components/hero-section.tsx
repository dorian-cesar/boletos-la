"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchForm } from "@/components/search-form";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* YouTube Video Background con mejor calidad */}
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          {/* Contenedor para centrar y ajustar el video */}
          <div className="absolute inset-0 flex items-center justify-center">
            <iframe
              src="https://www.youtube.com/embed/3Bl3auoqSu8?autoplay=1&mute=1&loop=1&playlist=3Bl3auoqSu8&controls=0&showinfo=0&rel=0&modestbranding=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&enablejsapi=1&origin=https://boletos.la"
              title="Viaja por Paraguay"
              className="absolute w-[177.77777778vh] min-w-full min-h-full max-w-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                width: "177.77777778vh" /* 16:9 ratio */,
                minWidth: "100%",
                minHeight: "100%",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                border: "none",
              }}
            />
          </div>

          {/* Overlay de degradado para ocultar bordes y marca de agua */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70" />

          {/* Overlay oscuro adicional para mejor legibilidad */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6 animate-bounce-in">
            Tu viaje comienza aquí
          </span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-balance">Viaja por todo </span>
            <span className="text-primary">Paraguay</span>
            <br />
            <span className="text-secondary">con nosotros</span>
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Reserva tus pasajes de bus de forma rápida y segura. Las mejores
            empresas, los mejores precios.
          </p>
        </div>

        {/* Search Form Component */}
        <SearchForm />

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { value: "200+", label: "Destinos" },
            { value: "40+", label: "Empresas" },
            { value: "500K+", label: "Viajeros" },
            { value: "24/7", label: "Soporte" },
          ].map((stat, index) => (
            <div key={index} className="text-center group cursor-default">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                {stat.value}
              </p>
              <p className="text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/50" />
      </div>
    </section>
  );
}
