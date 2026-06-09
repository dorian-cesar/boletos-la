"use client";

import Image from "next/image";

const steps = [
  {
    iconPath: "/images/iconos-web/icono-web-1.png",
    value: "40 +",
    label: "EMPRESAS",
    sublabel: "Más opciones de ruta",
    colorClass: "bg-[#eb5b24]", // Orange
  },
  {
    iconPath: "/images/iconos-web/icono-web-2.png",
    value: "500K +",
    label: "VIAJEROS",
    sublabel: "Satisfechos",
    colorClass: "bg-[#e5a924]", // Yellow/gold
  },
  {
    iconPath: "/images/iconos-web/icono-web-3.png",
    value: "200 +",
    label: "DESTINOS",
    sublabel: "Amplia cobertura",
    colorClass: "bg-[#00c7cc]", // Teal
  },
  {
    iconPath: "/images/iconos-web/icono-web-4.png",
    value: "24/7",
    label: "SOPORTE",
    sublabel: "En tiempo real",
    colorClass: "bg-[#007b80]", // Dark teal
  },
];

export function FeaturesSection() {
  return (
    <section id="servicios" className="py-16 bg-white text-gray-800">
      <div className="container mx-auto px-4">
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#3a3a3a] tracking-tight">
            Cómo funciona boletos.la
          </h2>
          <div className="text-gray-600 space-y-3 text-sm md:text-base leading-relaxed font-normal">
            <p>
              <strong>Busca tu destino:</strong> Ingresa cualquier ciudad,
              dirección o punto de interés en Latinoamérica.
            </p>
            <p>
              <strong>Compara:</strong> Analizamos al instante buses y hoteles
              para mostrarte la combinación más rápida y la más económica.
            </p>
            <p>
              <strong>Reserva:</strong> Te conectamos con los operadores
              oficiales para que compres tus boletos de forma segura y rápido.
            </p>
          </div>
        </div>

        {/* Circular badges grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mt-12">
          {steps.map((step, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-col items-center text-center space-y-4"
              >
                {/* Icon Image (No Background) */}
                <div className="relative w-24 h-24 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <Image
                    src={step.iconPath}
                    alt={step.label}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Text and stats */}
                <div className="space-y-1">
                  <h4 className="text-xl md:text-2xl font-extrabold text-gray-800">
                    {step.value}
                  </h4>
                  <p className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {step.sublabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
