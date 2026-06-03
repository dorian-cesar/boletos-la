"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

interface DistribusionWidgetProps {
  partnerNumber: string | number;
  locale?: string;
  currency?: string;
  defaults?: {
    departureStation?: string;
    departureArea?: string;
    departureCity?: string;
    arrivalStation?: string;
    arrivalArea?: string;
    arrivalCity?: string;
    pax?: number;
  };
  layout?: "horizontal" | "vertical";
}

declare global {
  interface Window {
    Distribusion: any;
  }
}

export function DistribusionWidget({
  partnerNumber,
  locale = "es",
  currency = "PYG",
  defaults,
  layout = "horizontal",
}: DistribusionWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initWidget = () => {
    if (window.Distribusion && containerRef.current) {
      // Limpiar el contenedor antes de montar para evitar duplicados o estados inválidos
      containerRef.current.innerHTML = '';

      const config: any = {
        root: containerRef.current,
        partnerNumber: partnerNumber,
        locale: locale,
        currency: currency,
      };

      if (defaults) {
        config.defaults = defaults;
      }

      window.Distribusion.Search.mount(config);
    }
  };

  useEffect(() => {
    // Si el script ya está cargado (ej. al volver atrás con el navegador),
    // reinicializamos el widget manualmente.
    if (window.Distribusion) {
      initWidget();
    }
  }, [partnerNumber, locale, currency, defaults]);

  return (
    <>
      <link
        href="https://book.distribusion.com/sdk.1.0.0.css"
        rel="stylesheet"
      />
      <Script
        src="https://book.distribusion.com/sdk.1.0.0.js"
        onLoad={initWidget}
      />
      <div className="w-full flex justify-center px-4 animate-scale-in">
        <div className="w-full max-w-7xl relative overflow-hidden bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-2 lg:p-4">
          {/* Fondo sutil interno */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          
          <div
            id="distribusion-search"
            ref={containerRef}
            className="w-full min-h-[400px] relative z-10 rounded-2xl overflow-hidden bg-white/5"
          >
            {/* The widget will be mounted here and this content will be replaced */}
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white/90">
              <div className="w-8 h-8 border-4 border-white/50 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium tracking-wide">Cargando buscador...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
