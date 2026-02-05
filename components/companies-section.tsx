"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const companies = [
  {
    name: "La Santaniana",
    logo: "/logos/logo-la-santaniana.png",
    alt: "Logo La Santaniana",
    containerSize: "h-40", // Contenedor mediano
    scale: "scale-100", // Escala inicial
    hoverScale: "group-hover:scale-105", // Escala al hacer hover
  },
  {
    name: "Nuestra Señora de la Asunción",
    logo: "/logos/logo-nsa.png",
    alt: "Logo Nuestra Señora de la Asunción",
    containerSize: "h-16", // Contenedor más bajo para logo alargado
    scale: "scale-75", // Escala inicial
    hoverScale: "group-hover:scale-[0.8]", // Escala al hacer hover
  },
  {
    name: "Sol de Paraguay",
    logo: "/logos/logo-sol-de-paraguay.png",
    alt: "Logo Sol de Paraguay",
    containerSize: "h-24", // Contenedor más alto
    scale: "scale-100", // Escala inicial
    hoverScale: "group-hover:scale-105", // Escala al hacer hover
  },
];

export function CompaniesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="empresas"
      className="py-24 bg-gradient-to-b from-[#1a2332] to-[#0f1419] relative overflow-hidden"
    >
      {/* Background Effects - Simple como el FeaturesSection */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={cn(
              "inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4 transition-all duration-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Nuestros Partners
          </span>
          <h2
            className={cn(
              "text-3xl md:text-5xl font-bold text-white mb-4 transition-all duration-700 delay-100",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            <span className="text-balance">Las mejores </span>
            <span className="text-primary">empresas</span>
          </h2>
          <p
            className={cn(
              "text-lg text-white/60 max-w-2xl mx-auto transition-all duration-700 delay-200",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Trabajamos con las empresas de transporte más reconocidas de
            Paraguay para ofrecerte la mejor experiencia de viaje.
          </p>
        </div>

        {/* Companies Grid - Ajuste individual para cada logo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-center">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className={cn(
                "group flex items-center justify-center w-full cursor-pointer",
                company.containerSize, // Altura específica para cada contenedor
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={company.logo}
                  alt={company.alt || company.name}
                  fill
                  className={cn(
                    "object-contain transition-all duration-300",
                    "grayscale opacity-40",
                    company.scale, // Escala inicial específica
                    company.hoverScale, // Escala al hacer hover
                    "group-hover:grayscale-0 group-hover:opacity-100",
                  )}
                  sizes="(max-width: 768px) 150px, 250px"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div
          className={cn(
            "mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10",
          )}
          style={{ transitionDelay: "800ms" }}
        >
          {[
            { value: "40+", label: "Empresas Asociadas" },
            { value: "8K+", label: "Viajes Diarios" },
            { value: "200+", label: "Rutas Disponibles" },
            { value: "97%", label: "Satisfacción" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
