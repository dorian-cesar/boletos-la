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
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/banner-boletos.mp4" type="video/mp4" />
          {/* Fallback image si el video no carga */}
          <img
            src="/images/hero-bus.jpg"
            alt="Bus viajando por Paraguay"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/60" />
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
