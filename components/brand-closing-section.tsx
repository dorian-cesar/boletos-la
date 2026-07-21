"use client";

import Image from "next/image";

import { FadeIn } from "./fade-in";

interface BrandClosingSectionProps {
  country?: string;
}

export function BrandClosingSection({ country }: BrandClosingSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const content: Record<string, { title: string; description: string }> = {
    brasil: {
      title: "Sua rota completa pela América Latina, tudo em um só lugar.",
      description: "Da Patagônia ao Caribe, nós traçamos a rota. Você escolhe o caminho.",
    },
    default: {
      title: "Tu ruta completa por América Latina, todo en un mismo lugar.",
      description: "Desde la Patagonia hasta el Caribe, nosotros trazamos la ruta. Tú eliges el camino.",
    },
  };

  const currentContent = content[normalizedCountry] || content.default;

  return (
    <section className="bg-white border-b border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch md:min-h-[600px]">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 text-left bg-white order-last md:order-first">
          <FadeIn direction="right" delay={100}>
            <div className="mb-6">
              <Image
                src="/images/layout/logo-boletos.png"
                alt="Boletos.la Logo"
                width={800}
                height={100}
                className="h-16 md:h-24 lg:h-32 w-auto object-contain"
              />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] tracking-tight mb-8 leading-[1.1]">
              {currentContent.title}
            </h2>
            <div className="text-xl md:text-2xl text-gray-800 leading-snug font-normal space-y-6">
              <p>{currentContent.description.split('.')[0]}.</p>
              <p>{currentContent.description.split('.').slice(1).join('.').trim()}</p>
            </div>
          </FadeIn>
        </div>

        {/* Right Side: Image */}
        <div className="relative min-h-[400px] w-full bg-[#f2f2f2] order-first md:order-last">
          <FadeIn direction="left" delay={200} className="w-full h-full absolute inset-0">
            <Image
              src="/images/layout/couch-user.png"
              alt="Boletos desde el celular"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
