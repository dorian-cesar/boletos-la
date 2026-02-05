"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchForm } from "@/components/search-form";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setMounted(true);

    // Precarga del video
    const preloadVideo = () => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.src = "/videos/banner-boletos.mp4";

      video.onloadeddata = () => {
        setIsVideoLoaded(true);

        // Intenta reproducir el video principal
        setTimeout(() => {
          if (videoRef.current) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Si falla el autoplay, intentamos con user gesture más tarde
                console.log(
                  "Autoplay bloqueado, se necesitará interacción del usuario",
                );
              });
            }
          }
        }, 500);
      };
    };

    preloadVideo();
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background optimizado */}
      <div className="absolute inset-0">
        {/* Placeholder mientras carga */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black/70 to-secondary/20">
            <img
              src="/images/hero-bus.jpg"
              alt="Bus viajando por Paraguay"
              className="w-full h-full object-cover opacity-50"
              loading="eager"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          </div>
        )}

        {/* Video optimizado */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            isVideoLoaded ? "opacity-100" : "opacity-0",
          )}
          onCanPlayThrough={() => {
            // Backup para asegurar que se marque como cargado
            if (!isVideoLoaded) {
              setIsVideoLoaded(true);
            }
          }}
        >
          <source src="/videos/banner-boletos.mp4" type="video/mp4" />

          {/* Fallback image si el video no carga */}
          <img
            src="/images/hero-bus.jpg"
            alt="Bus viajando por Paraguay"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Preload hidden para asegurar caché */}
      <link
        rel="preload"
        href="/videos/banner-boletos.mp4"
        as="video"
        type="video/mp4"
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6 animate-bounce-in">
            Tu viaje comienza aquí
          </span>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="text-balance">Viaja por todo </span>
            <span className="text-primary">Paraguay</span>
            <br />
            <span className="text-secondary">con nosotros</span>
          </h1>
          <p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            Reserva tus pasajes de bus de forma rápida y segura. Las mejores
            empresas, los mejores precios.
          </p>
        </div>

        {/* Search Form Component */}
        <SearchForm />

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { value: "200+", label: "Destinos" },
            { value: "40+", label: "Empresas" },
            { value: "500K+", label: "Viajeros" },
            { value: "24/7", label: "Soporte" },
          ].map((stat, index) => (
            <div key={index} className="text-center group cursor-default">
              <p className="text-3xl md:text-4xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                {stat.value}
              </p>
              <p className="text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/50" />
      </div>
    </section>
  );
}
