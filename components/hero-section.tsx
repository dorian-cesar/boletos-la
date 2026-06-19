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
  };
  const heroImageSrc = (country && heroImages[country.toLowerCase()]) || "/images/hero.jpg";

  const normalizedCountry = country?.toLowerCase() || "chile";

  const heroData: Record<string, { title: string; subtitle1: string; subtitle2: string }> = {
    chile: {
      title: "Pasajes de bus a todo Chile",
      subtitle1: "COMPRA CON WEBPAY, ONEPAY",
      subtitle2: "Y RETIRO EN TERMINAL",
    },
    brasil: {
      title: "Passagens de ônibus no Brasil",
      subtitle1: "COMPARE PREÇOS, PAGUE COM PIX",
      subtitle2: "E EMBARQUE COM QR",
    },
    argentina: {
      title: "Viajá por Argentina en bus",
      subtitle1: "COMPARA +500 RUTAS.",
      subtitle2: "PAGA EN PESOS CON MERCADO PAGO Y QR",
    },
    colombia: {
      title: "Tiquetes de bus en Colombia al instante",
      subtitle1: "PAGA CON PSE, NEQUI O TARJETA.",
      subtitle2: "CONFIRMACIÓN INMEDIATA",
    },
  };

  const currentHero = heroData[normalizedCountry] || heroData.chile;

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
                  normalizedCountry === "colombia" ? "COP" : "USD"
                }
                layout="vertical"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
