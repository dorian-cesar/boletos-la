"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { cn } from "@/lib/utils";

interface DistributionWidgetProps {
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
  buttonText?: string;
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
  } catch (e) { }

  return propCurrency;
}

export function DistributionWidget({
  partnerNumber,
  locale = "es",
  currency = "USD",
  defaults,
  layout = "horizontal",
  buttonText,
}: DistributionWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);

  const getCountryFromPath = () => {
    if (typeof window === "undefined") return undefined;
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/colombia')) return 'CO';
    if (path.includes('/brasil')) return 'BR';
    if (path.includes('/chile')) return 'CL';
    if (path.includes('/paraguay')) return 'PY';
    if (path.includes('/argentina')) return 'AR';
    return undefined;
  };

  const initWidget = () => {
    if (window.Distribusion && containerRef.current) {
      // Limpiar el contenedor antes de montar para evitar duplicados o estados inválidos
      containerRef.current.innerHTML = '';

      const detectedCurrency = detectCurrency(currency, defaults);
      const countryCode = getCountryFromPath();

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
      if (countryCode) {
        // Fallback for different versions of the SDK filter params
        config.filter = { country: countryCode };
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

  useEffect(() => {
    const handleUpdateRoute = (e: CustomEvent) => {
      const { route, departureCity, arrivalCity } = e.detail;
      if (!route || !window.Distribusion || !containerRef.current) return;
      
      const parts = route.split("/");
      if (parts.length >= 2) {
        const departure = departureCity || parts[0].trim();
        const arrival = arrivalCity || parts[1].trim();

        // Limpiar contenedor
        containerRef.current.innerHTML = '';
        const detectedCurrency = detectCurrency(currency, defaults);
        const countryCode = getCountryFromPath();
        
        const newDefaults = {
           ...defaults,
           departureCity: departure,
           arrivalCity: arrival
        };
        
        const config: any = {
          root: containerRef.current,
          partnerNumber: partnerNumber,
          locale: locale,
          currency: detectedCurrency,
          layout: layout === "horizontal" ? "row" : "column",
          defaults: newDefaults
        };

        if (countryCode) {
          config.filter = { country: countryCode };
        }
        
        window.Distribusion.Search.mount(config);

        // Auto-search after a short delay to allow widget to render
        setTimeout(() => {
          if (containerRef.current) {
            const searchBtn = containerRef.current.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (searchBtn) {
              searchBtn.click();
            }
          }
        }, 300);
      }
    };

    window.addEventListener('updateDistribusionRoute' as any, handleUpdateRoute);
    return () => window.removeEventListener('updateDistribusionRoute' as any, handleUpdateRoute);
  }, [partnerNumber, locale, currency, layout, defaults]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateCurrencyFromDOM = () => {
      const inputs = Array.from(container.querySelectorAll("input"));
      let departureCode = "";

      // 1. Intentamos detectar el código de partida de 5 letras (ej. COBOG, PYASU)
      for (const input of inputs) {
        const val = input.value?.trim().toUpperCase();
        if (val && val.length === 5 && /^[A-Z]{5}$/.test(val)) {
          const prefix = val.substring(0, 2);
          if (["CO", "PY", "CL", "BR", "AR", "PE", "MX", "UY", "BO", "EC"].includes(prefix)) {
            departureCode = val;
            break;
          }
        }
      }

      // 2. Fallback: Detectar por el texto visible si el código de 5 letras no está o es genérico
      if (!departureCode) {
        const visibleInput = inputs.find(
          (input) =>
            input.type === "text" &&
            (input.name.toLowerCase().includes("departure") ||
              input.name.toLowerCase().includes("origin") ||
              input.placeholder.toLowerCase().includes("origen") ||
              input.placeholder.toLowerCase().includes("desde") ||
              input.id.toLowerCase().includes("departure") ||
              input.id.toLowerCase().includes("origin") ||
              input.className.toLowerCase().includes("departure") ||
              input.className.toLowerCase().includes("origin"))
        );

        if (visibleInput && visibleInput.value) {
          const text = visibleInput.value.toLowerCase();
          if (text.includes("colombia") || text.includes("bogota") || text.includes("bogotá") || text.includes("medellin") || text.includes("cali")) {
            departureCode = "CO";
          } else if (text.includes("paraguay") || text.includes("asuncion") || text.includes("asunción") || text.includes("ciudad del este")) {
            departureCode = "PY";
          } else if (text.includes("chile") || text.includes("santiago") || text.includes("valparaiso")) {
            departureCode = "CL";
          } else if (text.includes("argentina") || text.includes("buenos aires") || text.includes("mendoza")) {
            departureCode = "AR";
          } else if (text.includes("brasil") || text.includes("brazil") || text.includes("sao paulo") || text.includes("rio de janeiro")) {
            departureCode = "BR";
          } else if (text.includes("peru") || text.includes("perú") || text.includes("lima")) {
            departureCode = "PE";
          } else if (text.includes("mexico") || text.includes("méxico") || text.includes("cancun")) {
            departureCode = "MX";
          } else if (text.includes("uruguay") || text.includes("montevideo")) {
            departureCode = "UY";
          } else if (text.includes("bolivia") || text.includes("la paz")) {
            departureCode = "BO";
          } else if (text.includes("ecuador") || text.includes("quito")) {
            departureCode = "EC";
          }
        }
      }

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
        const targetCurrency = prefixCurrencyMap[prefix];
        if (targetCurrency) {
          // Guardamos en localStorage para persistencia
          localStorage.setItem("selected-currency", targetCurrency);

          // Buscamos el input de currency y lo actualizamos en caliente si es diferente
          const currencyInput = inputs.find(
            (input) =>
              ["currency", "currency_code", "currencycode"].includes(input.name.toLowerCase()) ||
              input.id.toLowerCase().includes("currency")
          );

          if (currencyInput && currencyInput.value !== targetCurrency) {
            currencyInput.value = targetCurrency;
            // Disparamos los eventos correspondientes para que el SDK procese el cambio
            currencyInput.dispatchEvent(new Event("change", { bubbles: true }));
            currencyInput.dispatchEvent(new Event("input", { bubbles: true }));
            console.log(`[DistributionWidget] Moneda cambiada dinámicamente a ${targetCurrency} por origen ${prefix}`);
          }
        }
      }
    };

    // Escuchamos múltiples eventos para cubrir cualquier interacción con los inputs de búsqueda
    const events = ["input", "change", "click", "focusout", "submit"];
    events.forEach((eventType) => {
      container.addEventListener(eventType, updateCurrencyFromDOM);
    });

    // MutationObserver para capturar inserciones o actualizaciones asíncronas del DOM del SDK
    const observer = new MutationObserver(() => {
      try {
        updateCurrencyFromDOM();

        // Forzar color a blanco en el botón de búsqueda y TODOS sus hijos
        const buttons = Array.from(container.querySelectorAll('button, [role="button"], .mantine-Button-root'));
        // Buscar el botón principal (suele ser el último o tener clase filled/primary)
        let submitBtn = buttons.find(b => 
          (b as HTMLButtonElement).type === 'submit' || 
          b.classList.contains('mantine-Button-filled') ||
          b.textContent?.toLowerCase().includes('buscar') || 
          b.textContent?.toLowerCase().includes('search') ||
          b.textContent?.toLowerCase().includes('pesquisar') ||
          b.textContent?.toLowerCase().includes('procurar')
        ) as HTMLElement;
        
        if (!submitBtn && buttons.length > 0) {
          submitBtn = buttons[buttons.length - 1] as HTMLElement; // Fallback al último botón
        }

        if (submitBtn) {
          // Cambiar el texto si buttonText está definido
          if (buttonText) {
            const spanInside = submitBtn.querySelector('span');
            if (spanInside) {
              if (spanInside.innerText !== buttonText) spanInside.innerText = buttonText;
            } else if (submitBtn.innerText !== buttonText) {
              submitBtn.innerText = buttonText;
            }
          }

          // Forzar color blanco incondicionalmente a todos los niveles
          submitBtn.style.setProperty('color', '#ffffff', 'important');
          const children = submitBtn.querySelectorAll('*');
          children.forEach(child => {
            (child as HTMLElement).style.setProperty('color', '#ffffff', 'important');
          });
        }
      } catch (e) {
        console.error("Error updating widget DOM:", e);
      }
    });
    observer.observe(container, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["value"]
    });

    // Usar un intervalo para detectar de manera segura cuando el SDK se haya montado por completo
    let intervalCount = 0;
    const readyInterval = setInterval(() => {
      intervalCount++;
      // Chequeo 1: Ver si ya hay inputs (el widget cargó por completo)
      const hasInputs = container.querySelectorAll("input").length > 0 || container.querySelector("form");
      // Chequeo 2: Ver si el SDK ya metió mucho contenido interno
      const hasContent = container.children.length > 0 && container.innerHTML.length > 500;

      if (hasInputs || hasContent || intervalCount > 15) { // 15 * 200ms = 3 segundos máximo
        setIsWidgetReady(true);
        clearInterval(readyInterval);
      }
    }, 200);

    return () => {
      events.forEach((eventType) => {
        container.removeEventListener(eventType, updateCurrencyFromDOM);
      });
      observer.disconnect();
      clearInterval(readyInterval);
    };
  }, []);

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
      <div className="w-full flex justify-center px-4 py-2 relative">

        {/* Esqueleto Personalizado (Mantiene el espacio correcto en el DOM) */}
        {!isWidgetReady && (
          <div className="w-full max-w-5xl p-4">
            <div className="animate-pulse w-full px-2 py-4">
              <div className="flex flex-col md:flex-row gap-3">
                {/* Origen */}
                <div className="h-14 bg-gray-200 rounded-lg w-full md:flex-1"></div>
                {/* Destino */}
                <div className="h-14 bg-gray-200 rounded-lg w-full md:flex-1"></div>
                {/* Fechas */}
                <div className="h-14 bg-gray-200 rounded-lg w-full md:flex-[1.5]"></div>
                {/* Pasajeros */}
                <div className="h-14 bg-gray-200 rounded-lg w-full md:flex-[0.8]"></div>
                {/* Botón Buscar */}
                <div className="h-14 bg-gray-300 rounded-lg w-full md:w-32"></div>
              </div>
              <div className="mt-4 flex justify-center">
                <p className="text-xs text-black/40 font-medium tracking-wide uppercase">Cargando Buscador...</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor que Controlamos Nosotros (El SDK no puede borrar sus clases) */}
        <div
          className={cn(
            "w-full max-w-5xl transition-opacity duration-500",
            !isWidgetReady ? "absolute opacity-0 pointer-events-none" : "opacity-100 relative z-20"
          )}
        >
          <div
            id="distribusion-search"
            ref={containerRef}
            className="w-full p-4 overflow-visible text-black"
          >
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            #distribusion-search button,
            #distribusion-search button *,
            #distribusion-search .mantine-Button-root,
            #distribusion-search .mantine-Button-root *,
            #distribusion-search [class*="Button"],
            #distribusion-search [class*="Button"] * {
              color: #ffffff !important;
              -webkit-text-fill-color: #ffffff !important;
            }
          `}} />
        </div>
      </div>
    </>
  );
}
