"use client";

import Image from "next/image";

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
    <section className="bg-white text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Left Side: Image */}
        <div className="flex items-center justify-center h-full w-full order-last md:order-first bg-white/50">
          <Image
            src="/images/layout/global-map.jpg"
            alt="Expansión regional"
            width={6000}
            height={4000}
            className="w-full h-auto object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Right Side: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-20 text-left bg-teal-50/50">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#4a4a4a] tracking-tight mb-8 leading-tight">
            {currentContent.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-normal">
            {currentContent.description}
          </p>
        </div>
      </div>
    </section>
  );
}
