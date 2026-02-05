"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const companies = [
  { name: "Ñandutí", logo: "Ñ" },
  { name: "Stel Turismo", logo: "ST" },
  { name: "Nuestra Señora de la Asunción", logo: "NSA" },
  { name: "La Encarnacena", logo: "LE" },
];

export function CompaniesSection() {
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
      id="empresas"
      className="py-24 bg-gradient-to-br from-[#0f1419] via-[#1a2332] to-[#0f1419] relative overflow-hidden"
    >
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-secondary/10 to-transparent" />
        </div>

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Large gradient orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className={cn(
              "inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4 transition-all duration-700",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Nuestros Partners
          </span>
          <h2
            className={cn(
              "text-3xl md:text-5xl font-bold text-background mb-4 transition-all duration-700 delay-100",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            <span className="text-balance">Las mejores </span>
            <span className="text-primary">empresas</span>
          </h2>
          <p
            className={cn(
              "text-lg text-background/60 max-w-2xl mx-auto transition-all duration-700 delay-200",
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10",
            )}
          >
            Trabajamos con las empresas de transporte más reconocidas de
            Paraguay para ofrecerte la mejor experiencia de viaje.
          </p>
        </div>
        {/* Companies Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {companies.map((company, index) => (
            <div
              key={company.name}
              className={cn(
                "group relative bg-background/5 backdrop-blur-sm rounded-2xl p-8 border border-background/10 hover:border-primary/50 transition-all duration-500 hover:bg-background/10 cursor-pointer",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Logo Placeholder */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-background/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                  <span className="text-2xl font-bold text-background/80 group-hover:text-primary transition-colors duration-300">
                    {company.logo}
                  </span>
                </div>
                <h3 className="text-background/80 font-medium text-center group-hover:text-background transition-colors duration-300">
                  {company.name}
                </h3>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/20 opacity-0 blur-xl group-hover:opacity-50 transition-opacity duration-500" />
            </div>
          ))}
        </div>
        {/* Stats */}
        <div
          className={cn(
            "mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10",
          )}
          style={{ transitionDelay: "800ms" }}
        >
          {[
            { value: "40+", label: "Empresas Asociadas" },
            { value: "8K+", label: "Viajes Diarios" },
            { value: "200+", label: "Rutas Disponibles" },
            { value: "97%", label: "Satisfacción" },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </p>
              <p className="text-background/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
