import React from "react";
import { DistributionWidget } from "@/components/distribusion-widget";


export default function DistributionTestPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Experimento Distribusion SDK
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Esta es una página de prueba para validar la integración del buscador de Distribusion.
          </p>
        </div>

        <div className="bg-background border rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Buscador de Viajes (Paraguay)</h2>
          <DistributionWidget
            partnerNumber="830754"
            locale="es"
            currency="USD"
            defaults={{ 
              departureCity: "PYASU",
              pax: 2
            }}
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-6 text-sm text-muted-foreground">
          <h3 className="font-semibold text-foreground mb-2">Notas de la integración:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Estamos usando el SDK v1.0.0 ajustado para <strong>Paraguay</strong>.</li>
            <li>La moneda está configurada en <strong>USD (Dólares)</strong>.</li>
            <li>El partnerNumber actual es un placeholder (222222).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
