"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DistributionWidget } from "@/components/distribution-widget";
import Image from "next/image";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-[85vh] lg:min-h-[75vh] flex items-center justify-center overflow-hidden py-12 lg:py-20">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[#0f1419]">
        <Image
          src="/images/hero.jpg"
          alt="Vista aérea de una playa tropical"
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
          <div className="lg:col-span-6 text-left text-white max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight drop-shadow-sm">
              Cualquier sitio.
              <br />
              Un solo punto de partida
            </h1>
            <div className="space-y-1 mt-4">
              <p className="text-sm font-bold tracking-widest text-[#00c7cc] uppercase">
                VIAJES DE BUS Y ALOJAMIENTO
              </p>
              <p className="text-sm font-bold tracking-widest text-white/90 uppercase">
                PARA UNA MEJOR EXPERIENCIA DE VIAJE
              </p>
            </div>
          </div>

          {/* Right Column: White Card Container for the Search Widget */}
          <div className="lg:col-span-6 flex justify-end w-full">
            <div className="bg-white rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-visible p-5 w-full max-w-xl border border-gray-100/50">
              <DistributionWidget
                partnerNumber="830754"
                locale="es"
                currency="USD"
                layout="vertical"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
