// En /booking/pagopar-redirect/page.tsx
"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

// Esto fuerza a que la página sea dinámica
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Componente principal que usa useSearchParams
function PagoparRedirectContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const token = searchParams.get("token");

  useEffect(() => {
    if (pedidoId && token) {
      // Guardar en localStorage temporalmente
      localStorage.setItem("pagopar_pedido_id", pedidoId);
      localStorage.setItem("pagopar_token", token);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/booking/confirmation";
      }, 2000);
    } else {
      // Si no hay parámetros, redirigir a home después de un tiempo
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  }, [pedidoId, token]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold mb-2">Redirigiendo a PagoPar...</h1>
        <p className="text-muted-foreground">
          Por favor espera mientras te llevamos al portal de pago seguro.
        </p>
        {pedidoId && (
          <p className="text-sm text-muted-foreground mt-2">
            ID de transacción: {pedidoId.substring(0, 10)}...
          </p>
        )}
      </div>
    </div>
  );
}

// Componente de fallback para Suspense
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
        <h1 className="text-2xl font-bold mb-2">Cargando...</h1>
        <p className="text-muted-foreground">Preparando redirección...</p>
      </div>
    </div>
  );
}

// Componente principal con Suspense
export default function PagoparRedirectPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PagoparRedirectContent />
    </Suspense>
  );
}
