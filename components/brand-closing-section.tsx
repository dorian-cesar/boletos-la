"use client";

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
    <section className="py-20 bg-gray-50 text-center">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-5xl font-extrabold text-[#4a4a4a] tracking-tight mb-6">
          {currentContent.title}
        </h2>
        <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-3xl mx-auto">
          {currentContent.description}
        </p>
      </div>
    </section>
  );
}
