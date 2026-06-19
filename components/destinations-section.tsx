"use client";

import Image from "next/image";

const regionDestinations = [
  {
    name: "ASUNCIÓN",
    country: "Paraguay",
    image: "/images/asuncion.png",
    size: "large",
  },
  {
    name: "COLOMBIA",
    country: "Sudamérica",
    image: "/images/colombia.png",
    size: "small",
  },
  {
    name: "BRASIL",
    country: "Sudamérica",
    image: "/images/brazil.png",
    size: "small",
  },
  {
    name: "ARGENTINA",
    country: "Sudamérica",
    image: "/images/argentina.png",
    size: "small",
  },
  {
    name: "ENCARNACIÓN",
    country: "Paraguay",
    image: "/images/encarnacion.png",
    size: "small",
  },
];

const popularCities = [
  {
    name: "SANTIAGO",
    image: "/images/santiago.webp",
  },
  {
    name: "BUENOS AIRES",
    image: "/images/buenos-aires.jpg",
  },
  {
    name: "LIMA",
    image: "/images/lima.jpg",
  },
];

const countryDestinations: Record<string, typeof popularCities> = {
  argentina: [
    { name: "BARILOCHE", image: "/images/argentina-1.webp" },
    { name: "MENDOZA", image: "/images/argentina-2.webp" },
    { name: "MAR DEL PLATA", image: "/images/argentina-3.webp" },
  ],
  brasil: [
    { name: "SALVADOR", image: "/images/brasil-1.webp" },
    { name: "SAO PAULO", image: "/images/brasil-2.webp" },
    { name: "FOZ DO IGUAÇU", image: "/images/brasil-3.jpg" },
  ],
  chile: [
    { name: "VALPARAISO", image: "/images/chile-1.webp" },
    { name: "PUERTO VARAS", image: "/images/chile-2.webp" },
    { name: "LA SERENA", image: "/images/chile-3.webp" },
  ],
  colombia: [
    { name: "CARTAGENA", image: "/images/colombia-1.webp" },
    { name: "MEDELLÍN", image: "/images/colombia-2.webp" },
    { name: "CALI", image: "/images/colombia-3.webp" },
  ],
};

const newRegionDestinations = [
  {
    name: "MEDELLÍN",
    country: "Colombia",
    image: "/images/medellin.jpg",
  },
  {
    name: "MONTEVIDEO",
    country: "Uruguay",
    image: "/images/montevideo.png",
  },
  {
    name: "QUITO",
    country: "Ecuador",
    image: "/images/quito.png",
  },
  {
    name: "VALDIVIA",
    country: "Chile",
    image: "/images/valdivia.jpg",
  },
];

const quickRoutes = [
  "ASUNCIÓN - CLORINDA",
  "LA PAZ - TARIJA",
  "ENCARNACIÓN - ARS",
  "MEDELLÍN - CALI",
  "BOGOTÁ - CARTAGENA",
  "ASUNCIÓN - CDE",
  "MONTEVIDEO - MZA",
  "CALI - PASTO",
  "SANTIAGO - VALPARAÍSO",
  "CDE - ASUNCIÓN",
  "QUITO - GUAYAQUIL",
  "VILLARRICA - ASU",
  "BOGOTÁ - BUCARAMANGA",
  "LIMA - ICA",
  "BUENOS AIRES - MDQ",
  "RIO - SAO PAULO",
  "ASUNCIÓN - BS AS",
  "CORDOBA - ROSARIO",
  "SANTIAGO - CONCEPCIÓN",
  "CONCEPCIÓN - VALPO",
  "SANTIAGO - TEMUCO",
  "LIMA - AREQUIPA",
  "SAN JOSÉ - ALAJUELA",
  "MENDOZA - SANTIAGO",
  "COCHABAMBA - LPB",
];

interface DestinationsSectionProps {
  country?: string;
}

export function DestinationsSection({ country }: DestinationsSectionProps) {
  const handleScrollToWidget = () => {
    const widget = document.getElementById("distribusion-search");
    if (widget) {
      widget.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const citiesToDisplay =
    (country && countryDestinations[country.toLowerCase()]) || popularCities;

  return (
    <section id="destinos" className="py-16 bg-[#f8f9fa] text-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Region Exploration Grid */}
        {/* <div className="space-y-6">
          <p className="text-sm md:text-base font-semibold text-gray-600">
            Explora lo mejor de la región: Las rutas más elegidas por nuestros
            viajeros.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {regionDestinations
              .filter((d) => d.size === "large")
              .map((d, i) => (
                <div
                  key={i}
                  className="relative h-[250px] lg:h-[416px] rounded-lg overflow-hidden group cursor-pointer"
                  onClick={handleScrollToWidget}
                >
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-3 left-4 text-white flex flex-col justify-end" style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)" }}>
                    <span className="text-xs uppercase tracking-wider text-white/80 leading-none">
                      {d.country}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight leading-tight mb-1">
                      {d.name}
                    </h3>
                  </div>
                </div>
              ))}

            <div className="grid grid-cols-2 gap-4">
              {regionDestinations
                .filter((d) => d.size === "small")
                .map((d, i) => (
                  <div
                    key={i}
                    className="relative h-[120px] lg:h-[200px] rounded-lg overflow-hidden group cursor-pointer"
                    onClick={handleScrollToWidget}
                  >
                    <Image
                      src={d.image}
                      alt={d.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 300px"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-2 left-3 text-white flex flex-col justify-end" style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)" }}>
                      <span className="text-[10px] uppercase tracking-wider text-white/80 leading-none">
                        {d.country}
                      </span>
                      <h3 className="text-sm lg:text-base font-bold tracking-tight leading-tight mb-1">
                        {d.name}
                      </h3>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newRegionDestinations.map((d, i) => (
              <div
                key={i}
                className="relative h-[120px] lg:h-[200px] rounded-lg overflow-hidden group cursor-pointer"
                onClick={handleScrollToWidget}
              >
                <Image
                  src={d.image}
                  alt={d.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 300px"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute bottom-2 left-3 text-white flex flex-col justify-end" style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.8)" }}>
                  <span className="text-[10px] uppercase tracking-wider text-white/80 leading-none">
                    {d.country}
                  </span>
                  <h3 className="text-sm lg:text-base font-bold tracking-tight leading-tight mb-1">
                    {d.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 pt-6">
            {quickRoutes.map((route, i) => (
              <span
                key={i}
                className="px-3 py-1.5 bg-gray-200/60 text-[10px] md:text-xs font-semibold text-gray-600 rounded-md tracking-wider select-none"
              >
                {route}
              </span>
            ))}
          </div>
        </div>

        <hr className="my-16 border-gray-200" /> */}

        {/* Popular Destinations */}
        <div className="space-y-8">
          <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase">
            DESTINOS POPULARES
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {citiesToDisplay.map((city, idx) => (
              <div key={idx} className="group">
                {/* Image Box */}
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src={city.image}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 400px"
                  />
                </div>
                {/* Title Below */}
                <p className="text-center mt-3 font-bold text-gray-800 tracking-wider text-sm">
                  {city.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
