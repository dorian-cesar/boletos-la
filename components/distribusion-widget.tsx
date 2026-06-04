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
  currency = "USD",
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
        layout: layout === "horizontal" ? "row" : "column",
      };

      if (defaults) {
        config.defaults = defaults;
      }

      window.Distribusion.Search.mount(config);
    }
  };

  const serializedDefaults = defaults ? JSON.stringify(defaults) : "";

  useEffect(() => {
    // Si el script ya está cargado (ej. al volver atrás con el navegador),
    // reinicializamos el widget manualmente.
    if (window.Distribusion) {
      initWidget();
    }
  }, [partnerNumber, locale, currency, serializedDefaults, layout]);

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
      <div className="w-full flex justify-center px-4 py-2">
        <div
          id="distribusion-search"
          ref={containerRef}
          className="w-full max-w-5xl p-4 overflow-hidden text-black"
        >
          {/* The widget will be mounted here */}
          <div className="flex flex-col items-center justify-center h-48 text-black/60">
            <div className="w-8 h-8 border-4 border-black/20 border-t-black/80 rounded-full animate-spin mb-4"></div>
            <p>Cargando buscador de Distribusion...</p>
          </div>
        </div>
      </div>
    </>
  );
}
