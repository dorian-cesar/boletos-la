// /booking/pagopar-redirect/pagopar-content.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function PagoparRedirectContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get("pedidoId");
  const token = searchParams.get("token");
  const hash = searchParams.get("hash");
  const status = searchParams.get("status");

  useEffect(() => {
    // Manejar diferentes escenarios de Pagopar
    const handleRedirect = () => {
      // Si viene de Pagopar después del pago (con hash)
      if (hash) {
        console.log("🔗 Hash de Pagopar recibido:", hash);
        localStorage.setItem("pagopar_last_hash", hash);
        window.location.href = `/booking/confirmation?hash=${hash}`;
        return;
      }

      // Si viene con pedidoId y token (inicio del flujo)
      if (pedidoId && token) {
        console.log("🔄 Iniciando redirección a Pagopar...");
        localStorage.setItem("pagopar_pedido_id", pedidoId);
        localStorage.setItem("pagopar_token", token);

        // Redirigir directamente al portal de Pagopar
        window.location.href = `https://www.pagopar.com/pagos/${pedidoId}`;
        return;
      }

      // Si viene con estado (éxito/error)
      if (status) {
        console.log("📊 Estado de pago recibido:", status);
        setTimeout(() => {
          window.location.href = "/booking/confirmation";
        }, 2000);
        return;
      }

      // Si no hay parámetros válidos
      console.log("⚠️ No se encontraron parámetros válidos");
      setTimeout(() => {
        window.location.href = "/booking/checkout";
      }, 3000);
    };

    // Pequeño delay para mostrar el loading
    const timer = setTimeout(handleRedirect, 1500);
    return () => clearTimeout(timer);
  }, [pedidoId, token, hash, status]);

  // Determinar qué mensaje mostrar
  const getMessage = () => {
    if (hash) {
      return {
        title: "Pago Completado",
        message: "Redirigiendo a la confirmación de tu reserva...",
        icon: (
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ),
      };
    }

    if (pedidoId && token) {
      return {
        title: "Redirigiendo a Pagopar",
        message:
          "Por favor espera mientras te llevamos al portal de pago seguro.",
        icon: (
          <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
        ),
      };
    }

    if (status === "success") {
      return {
        title: "Pago Exitoso",
        message: "Tu pago ha sido procesado correctamente.",
        icon: (
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        ),
      };
    }

    if (status === "error") {
      return {
        title: "Error en el Pago",
        message:
          "Hubo un problema con tu transacción. Serás redirigido al checkout.",
        icon: <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />,
      };
    }

    return {
      title: "Redireccionando...",
      message: "Por favor espera un momento.",
      icon: (
        <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
      ),
    };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="mb-8">{message.icon}</div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          {message.title}
        </h1>

        <p className="text-gray-600 mb-8">{message.message}</p>

        {/* Mostrar información de depuración en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-sm font-mono text-gray-700">
              <strong>pedidoId:</strong> {pedidoId || "N/A"}
              <br />
              <strong>token:</strong> {token ? "✓" : "N/A"}
              <br />
              <strong>hash:</strong>{" "}
              {hash ? `${hash.substring(0, 20)}...` : "N/A"}
              <br />
              <strong>status:</strong> {status || "N/A"}
            </p>
          </div>
        )}

        {/* Loading animation */}
        <div className="mt-8 flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Instrucciones para el usuario */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Si la redirección no ocurre automáticamente:</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-primary hover:underline"
          >
            Haz clic aquí para reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
