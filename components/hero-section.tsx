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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const imagesByCountry: Record<string, string[]> = {
    argentina: [
      "/images/carousel/argentina/arg-baires.jpg",
      "/images/carousel/argentina/arg-bariloche.jpg",
      "/images/carousel/argentina/arg-bs-as.jpg",
      "/images/carousel/argentina/arg-bsas.jpg",
      "/images/carousel/argentina/arg-cordoba.png",
      "/images/carousel/argentina/arg-mar-del-plata.jpg",
      "/images/carousel/argentina/arg-mendoza.jpg"
    ],
    brasil: [
      "/images/carousel/brasil/carrusel-brasil1.jpg",
      "/images/carousel/brasil/carrusel-brasil2.jpg",
      "/images/carousel/brasil/carrusel-brasil3.jpg",
      "/images/carousel/brasil/carrusel-brasil4.jpg"
    ],
    chile: [
      "/images/carousel/chile/chile-2.jpg",
      "/images/carousel/chile/chile-3.jpg",
      "/images/carousel/chile/chile-7.jpg",
      "/images/carousel/chile/chile-patagonia.jpg",
      "/images/carousel/chile/chile-puerto-varas.jpg",
      "/images/carousel/chile/chile-serena.jpg",
      "/images/carousel/chile/chile-valdi.jpg",
      "/images/carousel/chile/chile-valpo.jpg",
      "/images/carousel/chile/chile4.jpg",
      "/images/carousel/chile/chile5.jpg"
    ],
    colombia: [
      "/images/carousel/colombia/carrusel-colombia1.jpg",
      "/images/carousel/colombia/carrusel-colombia2.jpg",
      "/images/carousel/colombia/carrusel-colombia3.jpg",
      "/images/carousel/colombia/carrusel-colombia4.jpg"
    ],
    ecuador: [
      "/images/carousel/ecuador/ecuador-quito.png"
    ],
    paraguay: [
      "/images/carousel/paraguay/asuncion(1).jpg",
      "/images/carousel/paraguay/asuncion.jpg",
      "/images/carousel/paraguay/cde.jpg",
      "/images/carousel/paraguay/ciudad-del-este-paraguay.png",
      "/images/carousel/paraguay/concepción-py.png",
      "/images/carousel/paraguay/pedro-juan-caballero-py.png",
      "/images/carousel/paraguay/py-encarnacion.jpg",
      "/images/carousel/paraguay/py-san-ber.jpg"
    ]
  };

  const normalizedCountry = country?.toLowerCase() || "latam";
  
  // Use carousel images if available, otherwise fallback to the single hero image
  const backgroundImages = imagesByCountry[normalizedCountry] && imagesByCountry[normalizedCountry].length > 0 
    ? imagesByCountry[normalizedCountry] 
    : [
        normalizedCountry === "argentina" ? "/images/hero-argentina.webp" :
        normalizedCountry === "brasil" ? "/images/hero-brasil.webp" :
        normalizedCountry === "chile" ? "/images/hero-chile.webp" :
        normalizedCountry === "colombia" ? "/images/hero-colombia.webp" :
        normalizedCountry === "paraguay" ? "/images/hero-paraguay.webp" : "/images/hero.jpg"
      ];

  useEffect(() => {
    if (backgroundImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

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

  if (!mounted) return null;

  return (
    <section className="relative min-h-[calc(125vh-72px)] flex items-center justify-center overflow-hidden py-12 lg:py-20">
      {/* Background Image(s) with fading effect */}
      <div className="absolute inset-0 bg-[#0f1419]">
        {backgroundImages.map((src, index) => (
          <div 
            key={index}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000",
              index === currentImageIndex ? "opacity-100 z-0" : "opacity-0 -z-10"
            )}
          >
            <Image
              src={src}
              alt={`Vista aérea - Hero ${country || ""} ${index + 1}`}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />
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
