"use client";

import Image from "next/image";

interface OmnichannelSectionProps {
  country?: string;
}

export function OmnichannelSection({ country }: OmnichannelSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const content: Record<string, { title: string; description: string }> = {
    brasil: {
      title: "Onde quer que você esteja, nós também estamos.",
      description: "Descubra nossos pontos de venda físicos e totens de autoatendimento. Uma alternativa rápida e prática para comprar suas passagens diretamente na rodoviária.",
    },
    colombia: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y terminales de autoservicio interactivo. Una alternativa rápida y fácil para comprar tus pasajes directamente en la terminal.",
    },
    chile: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y tótems de autoservicio rápido. Una alternativa rápida y eficiente para comprar tus pasajes directamente en el terminal.",
    },
    paraguay: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta presenciales y terminales de autoservicio digital. Una alternativa ágil para comprar tus pasajes directamente en la terminal.",
    },
    default: {
      title: "Donde sea que estés, también estamos.",
      description: "Descubre nuestros puntos de venta físicos y tótems de autoservicio rápido. Una alternativa rápida y eficiente para comprar tus pasajes directamente en el terminal.",
    },
  };

  const currentContent = content[normalizedCountry] || content.default;

  return (
    <section className="bg-[#f8f9fa] text-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-20 text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#4a4a4a] tracking-tight mb-8 leading-tight">
            {currentContent.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed font-normal">
            {currentContent.description}
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="flex items-center justify-center bg-[#f2f2f2]/50 h-full w-full">
          <Image
            src="/images/layout/totem-kiosk.png"
            alt="Kiosko interactivo"
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
