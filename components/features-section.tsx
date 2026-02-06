"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  CreditCard,
  Clock,
  Headphones,
  Bus,
  MapPin,
  Users,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Pago 100% Seguro",
    description: "Transacciones protegidas con Pagopar y encriptación SSL.",
    image: "/images/1.jpg",
    color: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-400",
  },
  {
    icon: CreditCard,
    title: "Múltiples Medios de Pago",
    description: "Paga con tarjeta, transferencia o en efectivo con Pagopar.",
    image: "/images/2.jpg",
    color: "from-green-500/20 to-green-600/10",
    iconColor: "text-green-400",
  },
  {
    icon: Clock,
    title: "Reserva Instantánea",
    description:
      "Confirma tu viaje en segundos y recibe tu boleto al instante.",
    image: "/images/3.jpg",
    color: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-400",
  },
  {
    icon: Headphones,
    title: "Soporte 24/7",
    description: "Atención al cliente disponible todo el día, todos los días.",
    image: "/images/4.jpg",
    color: "from-purple-500/20 to-purple-600/10",
    iconColor: "text-purple-400",
  },
  {
    icon: Bus,
    title: "Flota Moderna",
    description:
      "Autobuses equipados con WiFi, aire acondicionado y asientos premium.",
    image: "/images/5.jpg",
    color: "from-red-500/20 to-red-600/10",
    iconColor: "text-red-400",
  },
  {
    icon: MapPin,
    title: "Cobertura Nacional",
    description: "Viaja a más de 50 destinos en todo Paraguay.",
    image: "/images/6.jpg",
    color: "from-teal-500/20 to-teal-600/10",
    iconColor: "text-teal-400",
  },
];

const benefits = [
  "Cancelación gratuita hasta 24 horas antes",
  "Asistencia médica incluida",
  "Seguro de viaje básico",
  "Puntos acumulables por cada reserva",
  "Descuentos para estudiantes y tercera edad",
  "Programa de fidelización",
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
      className="py-24 bg-gradient-to-b from-[#0a0f1a] via-[#0f172a] to-[#0a0f1a] relative overflow-hidden"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#00c7cc]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#ffaa00]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 via-transparent to-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00c7cc] animate-pulse" />
            <span className="text-sm font-medium text-[#00c7cc] tracking-wider">
              POR QUÉ ELEGIRNOS
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            <span className="block">Tu Viaje,</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c7cc] to-[#ffaa00]">
              Nuestra Pasión
            </span>
          </h2>

          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Ofrecemos la mejor experiencia de viaje en autobús en Paraguay con
            tecnología de vanguardia, seguridad garantizada y un servicio
            excepcional.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={cn(
              "transition-all duration-700",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10",
            )}
          >
            <h3 className="text-3xl font-bold text-white mb-6">
              Beneficios <span className="text-[#00c7cc]">Exclusivos</span>
            </h3>
            <p className="text-white/60 mb-8 leading-relaxed">
              Cuando viajas con nosotros, no solo llegas a tu destino, sino que
              disfrutas de una experiencia completa con beneficios diseñados
              para tu comodidad y tranquilidad.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20",
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-4",
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-[#00c7cc] flex-shrink-0" />
                  <span className="text-sm text-white/80">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div
            className={cn(
              "transition-all duration-700",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10",
            )}
          >
            <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <h4 className="text-2xl font-bold text-white mb-8">
                Nuestros <span className="text-[#ffaa00]">Números</span>
              </h4>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#00c7cc] mb-2">
                    50+
                  </div>
                  <div className="text-sm text-white/60">Destinos</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#00c7cc] mb-2">
                    200+
                  </div>
                  <div className="text-sm text-white/60">Autobuses</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#ffaa00] mb-2">
                    98%
                  </div>
                  <div className="text-sm text-white/60">
                    Clientes Satisfechos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-[#ffaa00] mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-white/60">Soporte</div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-white/60 text-center">
                  Más de{" "}
                  <span className="text-white font-semibold">
                    100,000 viajeros
                  </span>{" "}
                  confían en nosotros cada año
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={cn(
            "text-center mt-20 transition-all duration-700 delay-300",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10",
          )}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 p-8 rounded-2xl bg-gradient-to-r from-[#00c7cc]/10 via-[#ffaa00]/10 to-[#00c7cc]/10 border border-white/10 backdrop-blur-sm">
            <div className="text-left">
              <h4 className="text-2xl font-bold text-white mb-2">
                ¿Listo para tu próximo viaje?
              </h4>
              <p className="text-white/60">
                Reserva ahora y disfruta de nuestros beneficios exclusivos
              </p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#00c7cc] to-[#00a8b0] hover:from-[#00a8b0] hover:to-[#00c7cc] text-white rounded-full px-8 py-6 font-semibold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00c7cc]/30"
            >
              <Bus className="w-5 h-5 mr-2" />
              Reservar Ahora
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        className={cn(
          "fixed bottom-8 right-8 w-14 h-14 rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white flex items-center justify-center transition-all duration-500 hover:bg-[#00c7cc] hover:border-[#00c7cc] hover:text-white hover:scale-110 z-50",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
        )}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Volver arriba"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
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
        "group relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-30 group-hover:opacity-50 transition-opacity duration-500`}
      />

      {/* Content Container */}
      <div className="relative p-6 z-10">
        {/* Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-white/20">
            <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00c7cc] transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-white/60 text-sm leading-relaxed mb-6">
          {feature.description}
        </p>

        {/* Learn More Link */}
        <div className="inline-flex items-center gap-2 text-sm font-medium text-[#00c7cc] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span>Conocer más</span>
          <svg
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>

      {/* Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-[#00c7cc] to-[#ffaa00] transition-all duration-700" />
      </div>
    </div>
  );
}
