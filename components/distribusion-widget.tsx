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

function detectCurrency(
  propCurrency: string,
  defaults?: { departureCity?: string; departureStation?: string },
): string {
  if (typeof window === "undefined") return propCurrency;

  // 1. Detectar desde URL query parameters (?currency=XXX o ?country=XX)
  const searchParams = new URLSearchParams(window.location.search);
  const urlCurrency = searchParams.get("currency")?.toUpperCase();
  if (urlCurrency && urlCurrency.length === 3) {
    return urlCurrency;
  }
  
  const urlCountry = searchParams.get("country")?.toUpperCase();
  if (urlCountry) {
    const countryCurrencyMap: { [key: string]: string } = {
      PY: "PYG",
      CO: "COP",
      CL: "CLP",
      BR: "BRL",
      AR: "ARS",
      PE: "PEN",
      MX: "MXN",
      UY: "UYU",
      BO: "BOB",
      EC: "USD",
    };
    if (countryCurrencyMap[urlCountry]) {
      return countryCurrencyMap[urlCountry];
    }
  }

  // 2. Detectar desde los defaults de partida (ej. PYASU -> PY -> PYG)
  const departureCode = defaults?.departureCity || defaults?.departureStation;
  if (departureCode && departureCode.length >= 2) {
    const prefix = departureCode.substring(0, 2).toUpperCase();
    const prefixCurrencyMap: { [key: string]: string } = {
      PY: "PYG",
      CO: "COP",
      CL: "CLP",
      BR: "BRL",
      AR: "ARS",
      PE: "PEN",
      MX: "MXN",
      UY: "UYU",
      BO: "BOB",
      EC: "USD",
    };
    if (prefixCurrencyMap[prefix]) {
      return prefixCurrencyMap[prefix];
    }
  }

  // 3. Detectar desde la zona horaria del navegador
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      if (timeZone.includes("Asuncion")) return "PYG";
      if (timeZone.includes("Bogota")) return "COP";
      if (timeZone.includes("Santiago")) return "CLP";
      if (timeZone.includes("Lima")) return "PEN";
      if (timeZone.includes("Montevideo")) return "UYU";
      if (timeZone.includes("La_Paz")) return "BOB";
      if (timeZone.includes("Argentina")) return "ARS";
      if (
        timeZone.includes("Sao_Paulo") ||
        timeZone.includes("Manaus") ||
        timeZone.includes("Fortaleza") ||
        timeZone.includes("Recife") ||
        timeZone.includes("Bahia")
      ) {
        return "BRL";
      }
      if (
        timeZone.includes("Mexico_City") ||
        timeZone.includes("Monterrey") ||
        timeZone.includes("Tijuana")
      ) {
        return "MXN";
      }
    }
  } catch (e) {
    console.error("Error al detectar zona horaria:", e);
  }

  // 4. Default a la moneda pasada por prop o guardada en localStorage
  try {
    const savedCurrency = localStorage.getItem("selected-currency");
    if (savedCurrency && savedCurrency.length === 3) {
      return savedCurrency;
    }
  } catch (e) {}

  return propCurrency;
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

      const detectedCurrency = detectCurrency(currency, defaults);

      const config: any = {
        root: containerRef.current,
        partnerNumber: partnerNumber,
        locale: locale,
        currency: detectedCurrency,
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
