"use client";

import Image from "next/image";

import { FadeIn } from "./fade-in";

interface RegionalExpansionSectionProps {
  country?: string;
}

export function RegionalExpansionSection({ country }: RegionalExpansionSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const content: Record<string, { title: string; description: string }> = {
    brasil: {
      title: "Nossa rede continua crescendo, conectando toda a região.",
      description: "Ampliamos nossa tecnologia para simplificar suas viagens pela América Latina.",
    },
    default: {
      title: "Nuestra red sigue creciendo, conectando toda la región.",
      description: "Hemos ampliado nuestra tecnología para simplificar tus viajes por América Latina.",
    },
  };

  const currentContent = content[normalizedCountry] || content.default;

  return (
    <section className="bg-white border-b border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch md:min-h-[600px]">
        {/* Left Side: Image (Image first on desktop) */}
        <div className="relative min-h-[400px] w-full bg-[#f2f2f2] order-first">
          <FadeIn direction="right" delay={100} className="w-full h-full absolute inset-0">
            <Image
              src="/images/layout/global-map.jpg"
              alt="Expansión regional"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </FadeIn>
        </div>

        {/* Right Side: Text (Text last on desktop) */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 text-left bg-white order-last">
          <FadeIn direction="left" delay={200}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] tracking-tight mb-8 leading-[1.1]">
              {currentContent.title}
            </h2>
            <p className="text-xl md:text-2xl text-gray-800 leading-snug font-normal">
              {currentContent.description}
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
