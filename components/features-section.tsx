import Image from "next/image";

interface FeaturesSectionProps {
  country?: string;
}

export function FeaturesSection({ country }: FeaturesSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "chile";

  const featuresText: Record<string, { title: string; description: string }> = {
    brasil: {
      title: "Viaje de ônibus sem filas!",
      description: "Boletos.la é a plataforma web ideal para comprar suas passagens online de forma rápida em qualquer dispositivo.",
    },
    colombia: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma web líder para comprar tus pasajes y tiquetes en línea desde cualquier dispositivo.",
    },
    chile: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma digital para comprar tus pasajes en línea de manera segura desde cualquier dispositivo.",
    },
    paraguay: {
      title: "¡Viaja en colectivo sin filas!",
      description: "Boletos.la es la plataforma web preferida para comprar tus pasajes y boletos en línea desde tu celular o computadora.",
    },
    default: {
      title: "¡Viaja en bus sin filas!",
      description: "Boletos.la es la plataforma líder para comprar tus pasajes en línea de manera segura desde cualquier dispositivo.",
    },
  };

  const currentText = featuresText[normalizedCountry] || featuresText.default;

  return (
    <section id="servicios" className="bg-white text-gray-850 pb-16 pt-8">
      {/* Lifestyle Banner Image (Edge-to-edge) */}
      <div className="w-full mb-12">
        <Image
          src="/images/layout/lifestyle-banner.png"
          alt="Viajeros usando dispositivos"
          width={2085}
          height={768}
          className="w-full h-auto object-cover"
          sizes="100vw"
          priority
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#4a4a4a] tracking-tight">
            {currentText.title}
          </h2>
          <div className="text-gray-500 space-y-4 text-base md:text-lg lg:text-xl leading-relaxed font-normal">
            <p>{currentText.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
