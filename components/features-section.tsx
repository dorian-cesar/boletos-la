import React from "react";

import { useEffect, useRef, useState } from "react";
import { Shield, CreditCard, Clock, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Pago 100% Seguro",
    description: "Transacciones protegidas con encriptación SSL.",
    image: "/images/1.jpg",
  },
  {
    icon: CreditCard,
    title: "Múltiples Medios de Pago",
    description:
      "Paga con tarjeta de crédito, débito o transferencia bancaria.",
    image: "/images/2.jpg",
  },
  {
    icon: Clock,
    title: "Reserva Instantánea",
    description:
      "Confirma tu viaje en segundos y recibe tu boleto al instante.",
    image: "/images/3.jpg",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atención al cliente disponible todo el día, todos los días.",
    image: "/images/4.jpg",
  },
];

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="servicios"
      className="py-24 relative"
    >
      <div className="container mx-auto px-4 relative z-10">
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={cn(
              "inline-block text-[#00c7cc] font-semibold uppercase tracking-wider text-sm mb-4 transition-all duration-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Nuestros Servicios
          </span>
          <h2
            className={cn(
              "text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight transition-all duration-700 delay-100",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            <span className="text-balance">Es Hora de </span>
            <span className="text-[#00c7cc]">Viajar</span>
            <span className="text-balance"> Con Nosotros</span>
          </h2>

          {/* <Button
            className={cn(
              "bg-secondary text-white hover:bg-secondary/90 rounded-full px-8 py-6 font-semibold text-base transition-all duration-700 delay-200 hover:scale-105 hover:shadow-lg hover:shadow-secondary/30",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Ver Servicios
          </Button> */}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isVisible,
}: {
  feature: (typeof features)[0];
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border border-white/10",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
      style={{ transitionDelay: `${(index + 3) * 100}ms` }}
    >
      {/* Icon Badge */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-16 h-16 rounded-full bg-[#ffaa00] border-4 border-white/20 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#ffaa00]/50">
          <feature.icon className="w-7 h-7 text-black" />
        </div>
      </div>

      {/* Image */}
      <div className="relative h-[280px] overflow-hidden">
        <Image
          src={feature.image}
          alt={feature.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          style={{ objectPosition: "50% 20%" }}
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="p-6 pt-4 text-center">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00c7cc] transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          {feature.description}
        </p>

        <div className="mt-4 flex justify-center">
          <div className="h-1 w-12 bg-[#ffaa00] rounded-full transition-all duration-500 group-hover:w-24 group-hover:bg-[#00c7cc]" />
        </div>
      </div>
    </div>
  );
}
