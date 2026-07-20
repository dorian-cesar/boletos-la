"use client";

import Image from "next/image";

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
    <section className="bg-white text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-[#f2f2f2]">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-20 text-left">
          <div className="mb-6">
             {/* Text Logo fallback */}
             <span className="text-xl font-bold tracking-widest text-[#00c7cc]">BOLETOS.LA</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#4a4a4a] tracking-tight mb-8 leading-tight">
            {currentContent.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-normal">
            {currentContent.description}
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="flex items-center justify-center bg-white/50 h-full w-full">
          <Image
            src="/images/layout/couch-user.png"
            alt="Boletos desde el celular"
            width={1195}
            height={896}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
}
