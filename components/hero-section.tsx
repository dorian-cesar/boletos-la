"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DistributionWidget } from "@/components/distribusion-widget";

import Image from "next/image";

interface HeroSectionProps {
  country?: string;
}

export function HeroSection({ country }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const heroImages: Record<string, string> = {
    argentina: "/images/hero-argentina.webp",
    brasil: "/images/hero-brasil.webp",
    chile: "/images/hero-chile.webp",
    colombia: "/images/hero-colombia.webp",
    paraguay: "/images/hero-paraguay.webp",
  };
  const heroImageSrc = (country && heroImages[country.toLowerCase()]) || "/images/hero.jpg";

  const normalizedCountry = country?.toLowerCase() || "latam";

  const heroData: Record<string, { title: string; subtitle1: string; subtitle2: string }> = {
    latam: {
      title: "Cualquier sitio. Un solo punto de partida",
      subtitle1: "VIAJES DE BUS Y ALOJAMIENTO",
      subtitle2: "PARA UNA MEJOR EXPERIENCIA DE VIAJE",
    },
    chile: {
      title: "Todo Chile, a un solo clic de distancia.",
      subtitle1: "¡BUS + HOTEL CON UN SOLO CLIC!",
      subtitle2: "FÁCIL, SEGURO Y AL MEJOR PRECIO.",
    },
    brasil: {
      title: "Todo o Brasil, a apenas um clique de distância.",
      subtitle1: "ÔNIBUS + HOTEL COM APENAS UM CLIQUE!",
      subtitle2: "FÁCIL, SEGURO E AO MELHOR PREÇO.",
    },
    argentina: {
      title: "Viajá por Argentina en bus",
      subtitle1: "COMPARA +500 RUTAS.",
      subtitle2: "PAGA EN PESOS CON MERCADO PAGO Y QR",
    },
    colombia: {
      title: "Todo Colombia, a un solo clic de distancia.",
      subtitle1: "¡BUS + HOTEL EN UN SOLO CLIC!",
      subtitle2: "FÁCIL, SEGURO Y AL MEJOR PRECIO.",
    },
    paraguay: {
      title: "Todo Paraguay, a un solo clic de distancia.",
      subtitle1: "¡BUS + HOTEL CON UN SOLO CLIC!",
      subtitle2: "FÁCIL, SEGURO Y AL MEJOR PRECIO.",
    },
  };

  const widgetDefaults: Record<string, any> = {
    colombia: { departureCity: "COBOG", arrivalCity: "COCLO", pax: 1 },
    brasil: { departureCity: "BRSAO", arrivalCity: "BRRIO", pax: 1 },
    chile: { departureCity: "CLSCL", arrivalCity: "CLVNA", pax: 1 },
    paraguay: { departureCity: "PYASU", arrivalCity: "PYCDE", pax: 1 },
    argentina: { departureCity: "ARBUE", arrivalCity: "ARMDQ", pax: 1 },
    latam: { pax: 1 },
  };

  const buttonTexts: Record<string, string> = {
    colombia: "ENCONTRAR MI VIAJE",
    brasil: "ENCONTRAR MINHA VIAGEM",
    chile: "BUSCAR MI VIAJE",
    paraguay: "ENCONTRAR MI VIAJE",
    argentina: "BUSCAR MI VIAJE",
    latam: "BUSCAR MI VIAJE",
  };

  const currentHero = heroData[normalizedCountry] || heroData.latam;
  const currentDefaults = widgetDefaults[normalizedCountry] || widgetDefaults.latam;
  const currentButtonText = buttonTexts[normalizedCountry] || buttonTexts.latam;

  return (
    <section className="relative min-h-[calc(125vh-72px)] flex items-center justify-center overflow-hidden py-12 lg:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[#0f1419]">
        <Image
          src={heroImageSrc}
          alt={`Vista aérea - Hero ${country || ""}`}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Subtitles */}
          <div
            className="lg:col-span-6 text-left text-white max-w-2xl"
            style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)" }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
              {currentHero.title}
            </h1>
            <div className="space-y-2 mt-6">
              <p className="text-base md:text-lg font-bold tracking-widest text-white/95 uppercase">
                {currentHero.subtitle1}
              </p>
              <p className="text-base md:text-lg font-bold tracking-widest text-white/95 uppercase">
                {currentHero.subtitle2}
              </p>
            </div>
          </div>

          {/* Right Column: White Card Container for the Search Widget */}
          <div className="lg:col-span-6 flex justify-end w-full">
            <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-visible p-5 w-full max-w-2xl border border-gray-100/50">
              <DistributionWidget
                partnerNumber="830754"
                locale={normalizedCountry === "brasil" ? "pt" : "es"}
                currency={
                  normalizedCountry === "brasil" ? "BRL" :
                  normalizedCountry === "argentina" ? "ARS" :
                  normalizedCountry === "colombia" ? "COP" :
                  normalizedCountry === "chile" ? "CLP" :
                  normalizedCountry === "paraguay" ? "PYG" : "USD"
                }
                defaults={currentDefaults}
                layout="vertical"
                buttonText={currentButtonText}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
