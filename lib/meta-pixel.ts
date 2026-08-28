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
 * Obtiene o crea un Identificador Externo (external_id) persistente en el navegador
 * para optimizar la coincidencia avanzada (Advanced Matching) de Meta.
 */
export function getOrCreateExternalId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    let extId = localStorage.getItem("meta_external_id");
    if (!extId) {
      extId = "ext_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
      localStorage.setItem("meta_external_id", extId);
    }
    return extId;
  } catch (e) {
    return undefined;
  }
}

/**
 * Genera un event_id único para deduplicación entre Meta Pixel y Conversions API
 */
export function generateEventId(prefix = "evt"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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
 * Envía el evento de seguimiento 'PageView' con identificador de evento único (event_id)
 */
export function trackPageView(eventId?: string): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    const eventID = eventId || generateEventId("pv");
    window.fbq("track", "PageView", {}, { eventID });
  }
}

export interface ViewContentParams {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  event_id?: string;
}

/**
 * Envía el evento estándar 'ViewContent' (búsqueda de pasaje o detalle de pasaje)
 * Incluye obligatoriamente 'value', 'currency' y 'eventID' para solucionar errores de Prioridad Alta
 * y aumentar la cobertura de identificador de eventos en el Administrador de Eventos de Meta.
 */
export function trackViewContent(params: ViewContentParams): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    const numericValue =
      typeof params.value === "number" && !isNaN(params.value) && isFinite(params.value)
        ? Math.max(0, params.value)
        : 0;

    const currencyCode = (params.currency || "PYG").trim().toUpperCase();
    const eventID = params.event_id || generateEventId("vc");

    window.fbq(
      "track",
      "ViewContent",
      {
        content_name: params.content_name,
        content_category: params.content_category || "paraguay",
        content_type: params.content_type || "product",
        content_ids: params.content_ids || [],
        value: numericValue,
        currency: currencyCode,
      },
      { eventID }
    );
  }
}

export interface InitiateCheckoutParams {
  event_id?: string;
  content_ids?: string[];
  value?: number;
  currency?: string;
}

/**
 * Envía el evento estándar 'InitiateCheckout' (clic en Comprar / Seleccionar asiento)
 */
export function trackInitiateCheckout(params?: InitiateCheckoutParams | string): void {
  if (!isPixelAllowed()) return;
  if (typeof window.fbq === "function") {
    const eventID =
      typeof params === "string"
        ? params
        : params?.event_id || generateEventId("ic");
    const extraData = typeof params === "object" ? params : {};

    window.fbq(
      "track",
      "InitiateCheckout",
      {
        content_category: "paraguay",
        content_type: "product",
        content_ids: extraData.content_ids || [],
        ...(extraData.value ? { value: extraData.value, currency: extraData.currency || "PYG" } : {}),
      },
      { eventID }
    );
  }
}

export interface PurchaseParams {
  value: number;
  currency: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  order_id?: string;
  event_id?: string;
}

/**
 * Envía el evento estándar 'Purchase' al completar exitosamente una compra.
 * Incluye order_id y event_id obligatorios para cobertura del pedido y deduplicación.
 */
export function trackPurchase(params: PurchaseParams): void {
  if (!isPixelAllowed()) {
    console.log("[MetaPixel] Purchase tracking omitted (pixel disabled or test environment).");
    return;
  }
  if (typeof window.fbq === "function") {
    const numericValue =
      typeof params.value === "number" && !isNaN(params.value) && isFinite(params.value)
        ? Math.max(0, params.value)
        : Number(params.value) || 0;

    const currencyCode = (params.currency || "PYG").trim().toUpperCase();
    const orderId = params.order_id || params.event_id || generateEventId("ord");
    const eventID = params.event_id || orderId;

    console.log("[MetaPixel] Firing Purchase event:", { ...params, order_id: orderId, event_id: eventID });

    window.fbq(
      "track",
      "Purchase",
      {
        content_name: "Compra de pasaje",
        content_category: params.content_category || "paraguay",
        content_type: params.content_type || "product",
        content_ids: params.content_ids || [],
        value: numericValue,
        currency: currencyCode,
        order_id: orderId,
      },
      { eventID }
    );
  } else {
    console.warn("[MetaPixel] window.fbq is not available.");
  }
}
