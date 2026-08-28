"use client";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "2216070672513633";

/**
 * Verifica si el Meta Pixel está permitido en el entorno actual.
 * Excluye entornos de prueba (localhost, 127.0.0.1, netlify.app)
 * y comprueba el consentimiento de cookies si existe en localStorage.
 */
export function isPixelAllowed(): boolean {
  if (typeof window === "undefined") return false;

  const hostname = window.location.hostname || "";

  // 1. Excluir entornos de prueba y desarrollo
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local") ||
    hostname.includes("netlify.app")
  ) {
    return false;
  }

  // 2. Verificar consentimiento de cookies si fue configurado previamente
  try {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "denied" || consent === "false") {
      return false;
    }
  } catch (e) {
    // Si hay restricciones para acceder a localStorage, continuar
  }

  return true;
}

/**
 * Envía el evento de seguimiento 'PageView'
 */
export function trackPageView(): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    window.fbq("track", "PageView");
  }
}

export interface ViewContentParams {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
}

/**
 * Envía el evento estándar 'ViewContent' (búsqueda de pasaje o detalle de pasaje)
 * Incluye obligatoriamente 'value' y 'currency' para solucionar errores de Prioridad Alta
 * en el Administrador de Eventos (Event Manager) de Meta.
 */
export function trackViewContent(params: ViewContentParams): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    const numericValue =
      typeof params.value === "number" && !isNaN(params.value) && isFinite(params.value)
        ? Math.max(0, params.value)
        : 0;

    const currencyCode = (params.currency || "PYG").trim().toUpperCase();

    window.fbq("track", "ViewContent", {
      content_name: params.content_name,
      content_category: params.content_category || "paraguay",
      content_type: params.content_type || "product",
      content_ids: params.content_ids || [],
      value: numericValue,
      currency: currencyCode,
    });
  }
}

/**
 * Envía el evento estándar 'InitiateCheckout' (clic en Comprar / Seleccionar asiento)
 */
export function trackInitiateCheckout(): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    window.fbq("track", "InitiateCheckout");
  }
}

export interface PurchaseParams {
  value: number;
  currency: string;
  content_category: string;
  content_ids: string[];
}

/**
 * Envía el evento estándar 'Purchase' al completar exitosamente una compra
 */
export function trackPurchase(params: PurchaseParams): void {
  if (!isPixelAllowed()) {
    console.log("[MetaPixel] Purchase tracking omitted (pixel disabled or test environment).");
    return;
  }
  if (typeof window.fbq === "function") {
    console.log("[MetaPixel] Firing Purchase event:", params);
    window.fbq("track", "Purchase", {
      value: params.value,
      currency: params.currency || "PYG",
      content_category: params.content_category || "paraguay",
      content_ids: params.content_ids || [],
    });
  } else {
    console.warn("[MetaPixel] window.fbq is not available.");
  }
}
