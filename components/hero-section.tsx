"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchForm } from "@/components/search-form";
import { DistributionWidget } from "@/components/distribution-widget";
import Image from "next/image";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const carouselImages = [
    "/images/carrousel/C1.jpg",
    "/images/carrousel/C2.jpg",
    "/images/carrousel/C3.jpg",
    "/images/carrousel/C4.jpg",
    "/images/carrousel/C5.jpg",
    "/images/carrousel/C6.jpg",
    "/images/carrousel/C7.jpeg",
    "/images/carrousel/C8.jpg",
    "/images/carrousel/C9.JPG",
    "/images/carrousel/C10.jpg",
    "/images/carrousel/C11.jpg",
    "/images/carrousel/C12.jpg",
    "/images/carrousel/C13.jpg",
    "/images/carrousel/C14.jpg",
  ];

  useEffect(() => {
    setMounted(true);
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 bg-[#0f1419]">
        {carouselImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Bus viajando a tu destino ${index + 1}`}
            fill
            sizes="100vw"
            className={cn(
              "object-cover transition-opacity duration-1000",
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            )}
            priority={index === 0}
          />
        ))}

        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-[#00c7cc]/20 text-[#00c7cc] rounded-full text-sm font-medium mb-6 animate-bounce-in">
            Tu viaje comienza aquí
          </span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-balance">Viaja por toda </span>
            <span className="text-[#00c7cc]">Latinoamérica</span>
            <br />
            <span className="text-[#ffaa00]">con nosotros</span>
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Reserva tus pasajes de bus de forma rápida y segura. Las mejores
            empresas, los mejores precios.
          </p>
        </div>

        {/* Search Form Component (Oculto a petición) */}
        {/* <SearchForm /> */}

        {/* Distribusion Widget */}
        <div className="bg-white/95 rounded-xl shadow-2xl overflow-visible mt-8 max-w-5xl mx-auto relative z-20 w-full">
          <DistributionWidget
            partnerNumber="830754"
            locale="es"
            currency="USD"
          />
        </div>

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
              <p className="text-3xl md:text-4xl font-bold text-[#00c7cc] group-hover:text-[#ffaa00] transition-colors duration-300">
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
