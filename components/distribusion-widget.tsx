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
  };
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
}: DistribusionWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initWidget = () => {
    if (window.Distribusion && containerRef.current) {
      window.Distribusion.Search.mount({
        root: containerRef.current,
        partnerNumber: partnerNumber,
        locale: locale,
        currency: currency,
        defaults: defaults,
      });
    }
  };

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
      <div
        id="distribusion-search"
        ref={containerRef}
        className="w-full min-h-[400px] bg-card rounded-lg shadow-lg p-4"
      >
        {/* The widget will be mounted here */}
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Cargando buscador de Distribusion...
        </div>
      </div>
    </>
  );
}
