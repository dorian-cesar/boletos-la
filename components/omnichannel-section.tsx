"use client";

import Image from "next/image";

import { FadeIn } from "./fade-in";

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
    <section className="bg-white border-b border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 items-stretch md:min-h-[600px]">
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 text-left bg-white order-last md:order-first">
          <FadeIn direction="right" delay={100}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] tracking-tight mb-8 leading-[1.1]">
              {currentContent.title}
            </h2>
            <p className="text-xl md:text-2xl text-gray-800 leading-snug font-normal">
              {currentContent.description}
            </p>
          </FadeIn>
        </div>

        {/* Right Side: Image */}
        <div className="relative min-h-[400px] w-full bg-[#f2f2f2] order-first md:order-last">
          <FadeIn direction="left" delay={200} className="w-full h-full absolute inset-0">
            <Image
              src="/images/layout/totem-kiosk.png"
              alt="Kiosko interactivo"
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
