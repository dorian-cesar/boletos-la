"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useBookingStore, cities } from "@/lib/booking-store";
import Aurora from "@/components/aurora";

const destinations = [
  {
    id: 0,
    name: "Paraguay",
    region: "Sudamérica",
    image: "/images/asuncion.png",
    price: 350000,
    currency: "PYG",
    symbol: "₲",
    locale: "es-PY",
    duration: "Múltiples opciones",
    popular: true,
  },
  {
    id: 1,
    name: "Colombia",
    region: "Suramérica",
    image: "/images/colombia.png",
    price: 600000,
    currency: "COP",
    symbol: "$",
    locale: "es-CO",
    duration: "Múltiples opciones",
    popular: true,
  },
  {
    id: 2,
    name: "Brasil",
    region: "Suramérica",
    image: "/images/brazil.png",
    price: 680,
    currency: "BRL",
    symbol: "R$",
    locale: "pt-BR",
    duration: "Múltiples opciones",
    popular: true,
  },
  {
    id: 3,
    name: "Argentina",
    region: "Suramérica",
    image: "/images/argentina.png",
    price: 95000,
    currency: "ARS",
    symbol: "$",
    locale: "es-AR",
    duration: "Múltiples opciones",
    popular: true,
  },
];

export function DestinationsSection() {
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

  // Función para manejar la búsqueda de servicios
  const handleSearchServices = (destinationName: string) => {
    // Scroll to the distribusion widget at the top of the page smoothly
    const widget = document.getElementById("distribusion-search");
    if (widget) {
      widget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="destinos"
      className="py-24 bg-[#0f1419] relative overflow-hidden"
    >
      {/* Aurora WebGL Animated Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <Aurora
          colorStops={["#ff7b00", "#ffaa00", "#00c7cc"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>

      {/* Subtle overlay to soften the background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f1419]/20 to-[#0f1419] pointer-events-none z-0" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span
              className={cn(
                "inline-block px-4 py-2 bg-[#ffaa00]/10 text-[#ffaa00] rounded-full text-sm font-medium mb-4 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              Destinos Populares
            </span>
            <h2
              className={cn(
                "text-3xl md:text-5xl font-bold text-white mb-4 transition-all duration-700 delay-100",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              <span className="text-balance">Explora </span>
              <span className="text-[#ffaa00]">Nuestros Destinos</span>
            </h2>
            <p
              className={cn(
                "text-lg text-white/70 max-w-xl transition-all duration-700 delay-200",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              Descubre los destinos más visitados y planifica tu próximo viaje
              con un solo clic.
            </p>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className={cn(
                "group relative rounded-3xl overflow-hidden transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
                index < 3 ? "lg:h-96" : "h-80",
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Contenedor clickeable para toda la tarjeta */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleSearchServices(destination.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSearchServices(destination.name);
                  }
                }}
                aria-label={`Buscar servicios de Asunción a ${destination.name} para hoy`}
              >
                {/* Image with enhanced effects */}
                <div className="absolute inset-0">
                  <img
                    src={destination.image}
                    alt={`Imagen de ${destination.name}`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {/* Multi-layer gradient overlay - Mejorado para fondo oscuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00c7cc]/10 via-transparent to-[#ffaa00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>

              {/* Popular Badge */}
              {destination.popular && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#ffaa00] text-black text-xs font-bold rounded-full z-10">
                  Popular
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                      <MapPin className="h-4 w-4" />
                      {destination.region}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00c7cc] transition-colors duration-300">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-4 text-white/70 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {destination.duration}
                      </span>
                    </div>
                  </div>
                  {/* Precio oculto */}
                </div>

                {/* Hover Button */}
                <div className="mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button
                    className="w-full bg-[#00c7cc] hover:bg-[#00c7cc]/90 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchServices(destination.name);
                    }}
                  >
                    Ver Servicios
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
