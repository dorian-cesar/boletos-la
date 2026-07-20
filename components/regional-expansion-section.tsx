"use client";

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
    <section className="py-20 bg-white text-center">
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
