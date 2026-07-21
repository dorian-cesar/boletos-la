"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

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
    { name: "BUENOS AIRES / MENDOZA", image: "/images/destinations/argentina-mendoza.jpg" },
    { name: "BARILOCHE / BUENOS AIRES", image: "/images/destinations/argentina-bariloche.jpg" },
    { name: "CORDOBA / ROSARIO", image: "/images/destinations/argentina-mar-del-plata.jpg" },
    { name: "BUENOS AIRES / MAR DEL PLATA", image: "/images/buenos-aires.jpg" },
    { name: "MENDOZA / SANTIAGO", image: "/images/argentina.png" },
    { name: "ROSARIO / SANTA FE", image: "/images/destinations/argentina-bariloche.jpg" },
    { name: "SALTA / JUJUY", image: "/images/destinations/argentina-mendoza.jpg" },
    { name: "USHUAIA / EL CALAFATE", image: "/images/buenos-aires.jpg" },
    { name: "TUCUMÁN / SALTA", image: "/images/argentina.png" },
  ],
  brasil: [
    { name: "SÃO PAULO / RIO DE JANEIRO", image: "/images/destinations/brasil-rio.jpg" },
    { name: "RIO DE JANEIRO / BÚZIOS", image: "/images/destinations/brasil-sao-paulo.jpg" },
    { name: "SALVADOR / PORTO SEGURO", image: "/images/destinations/brasil-salvador.jpg" },
    { name: "BRASÍLIA / GOIÂNIA", image: "/images/brazil.png" },
    { name: "FORTALEZA / JERICOACOARA", image: "/images/brazil.png" },
    { name: "BELO HORIZONTE / CABO FRIO", image: "/images/destinations/brasil-rio.jpg" },
    { name: "CURITIBA / FLORIANÓPOLIS", image: "/images/destinations/brasil-sao-paulo.jpg" },
    { name: "RECIFE / NATAL", image: "/images/destinations/brasil-salvador.jpg" },
    { name: "MANAUS / BELÉM", image: "/images/brazil.png" },
  ],
  chile: [
    { name: "SANTIAGO / VALPARAÍSO", image: "/images/destinations/chile-valparaiso.jpg" },
    { name: "SANTIAGO / CONCEPCIÓN", image: "/images/destinations/chile-puerto-varas.jpg" },
    { name: "LA SERENA / COQUIMBO", image: "/images/destinations/chile-la-serena.jpg" },
    { name: "PUERTO MONTT / BARILOCHE", image: "/images/santiago.webp" },
    { name: "VALDIVIA / OSORNO", image: "/images/valdivia.jpg" },
    { name: "SANTIAGO / MENDOZA", image: "/images/destinations/chile-valparaiso.jpg" },
    { name: "ANTOFAGASTA / CALAMA", image: "/images/destinations/chile-puerto-varas.jpg" },
    { name: "IQUIQUE / ARICA", image: "/images/santiago.webp" },
    { name: "TEMUCO / PUERTO MONTT", image: "/images/valdivia.jpg" },
  ],
  colombia: [
    { name: "CALI / BOGOTÁ", image: "/images/destinations/colombia-cali.jpeg" },
    { name: "BARRANQUILLA / MEDELLÍN", image: "/images/destinations/colombia-medellin.jpg" },
    { name: "SANTA MARTA / CALI", image: "/images/destinations/colombia-santa-marta.jpeg" },
    { name: "CARTAGENA / CÚCUTA", image: "/images/destinations/colombia-cartagena.jpg" },
    { name: "BARRANQUILLA / PEREIRA", image: "/images/destinations/colombia-pereira.jpg" },
    { name: "BOGOTÁ / RIOHACHA", image: "/images/destinations/colombia-riohacha.jpg" },
    { name: "HUILA / SANTANDER", image: "/images/destinations/colombia-huila.jpg" },
    { name: "RIOHACHA / BARRANQUILLA", image: "/images/destinations/colombia-barranquilla.jpg" },
    { name: "SANTANDER / CALDAS", image: "/images/destinations/colombia-santander.jpg" },
  ],
  paraguay: [
    { name: "ASUNCIÓN / CIUDAD DEL ESTE", image: "/images/destinations/paraguay-ciudad-del-este.jpg" },
    { name: "ASUNCIÓN / ENCARNACIÓN", image: "/images/destinations/paraguay-encarnacion.jpg" },
    { name: "SAN BERNARDINO / ASUNCIÓN", image: "/images/destinations/paraguay-san-bernardino.jpg" },
    { name: "VILLARRICA / ASUNCIÓN", image: "/images/asuncion.png" },
    { name: "PEDRO JUAN CABALLERO / ASU", image: "/images/asuncion.png" },
    { name: "CORONEL OVIEDO / ASUNCIÓN", image: "/images/destinations/paraguay-ciudad-del-este.jpg" },
    { name: "SALTO DEL GUAIRÁ / ASU", image: "/images/destinations/paraguay-encarnacion.jpg" },
    { name: "CAAGUAZÚ / ASUNCIÓN", image: "/images/asuncion.png" },
    { name: "ASUNCIÓN / BUENOS AIRES", image: "/images/destinations/paraguay-san-bernardino.jpg" },
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

  const normalizedCountry = country?.toLowerCase() || "latam";

  const routesData: Record<string, { title: string; routes: string[] }> = {
    brasil: {
      title: "Explore o melhor da região: As rotas preferidas dos nossos usuários",
      routes: ["São Paulo / Rio de Janeiro", "São Paulo / Belo Horizonte", "Rio de Janeiro / Búzios", "Curitiba / Florianópolis", "Salvador / Porto Seguro", "Brasília / Goiânia", "São Paulo / Curitiba", "Fortaleza / Jericoacoara", "Belo Horizonte / Cabo Frio"],
    },
    colombia: {
      title: "Explore lo mejor de la región: Las rutas preferidas por nuestros usuarios",
      routes: ["Bogotá / Medellín", "Cartagena / Barranquilla", "Cali / Bogotá", "Bogotá / Bucaramanga", "Santa Marta / Bogotá", "Cali / Medellín", "Bogotá / Armenia", "Cartagena / Montería", "Barranquilla / Medellín", "Bogotá / Manizales", "Cartagena / Cúcuta", "Medellín / Barranquilla", "Medellín / Bogotá", "Santa Marta / Medellín", "Santa Marta / Cali", "Manizales / Barranquilla", "Barranquilla / Riohacha", "Santa Marta / Valledupar"],
    },
    chile: {
      title: "Explore lo mejor de la región: Las rutas preferidas por nuestros usuarios",
      routes: ["Santiago / Viña del Mar", "Santiago / Concepción", "Santiago / La Serena", "Puerto Montt / Temuco", "Santiago / Mendoza", "Antofagasta / Calama", "Santiago / Coquimbo", "Valparaíso / Santiago", "Puerto Montt / Bariloche"],
    },
    paraguay: {
      title: "Explore lo mejor de la región: Las rutas preferidas por nuestros usuarios",
      routes: ["Asunción / Ciudad del Este", "Asunción / Encarnación", "Asunción / Pedro Juan Caballero", "Ciudad del Este / Encarnación", "Asunción / Buenos Aires", "Asunción / Villarrica", "Asunción / Salto del Guairá", "Coronel Oviedo / Asunción"],
    },
    default: {
      title: "Explore lo mejor de la región: Las rutas preferidas por nuestros usuarios",
      routes: ["SANTIAGO - VALPARAÍSO", "BUENOS AIRES - MENDOZA", "BOGOTÁ - MEDELLÍN"],
    }
  };

  const currentRoutes = routesData[normalizedCountry] || routesData.default;

  const citiesToDisplay =
    (country && countryDestinations[normalizedCountry]) || popularCities;

  return (
    <section id="destinos" className="py-16 bg-[#f8f9fa] text-gray-800">
      <div className="container mx-auto px-4 max-w-[1400px]">
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

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 tracking-wide text-left">
            {currentRoutes.title}
          </h2>
        </div>

        {/* Popular Destinations Grid (Masonry 9 items) */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-3 gap-4 md:h-[760px] mb-12">
          {citiesToDisplay.slice(0, 9).map((city, idx) => {
            let spanClasses = "";
            if (idx === 0) spanClasses = "md:col-span-6 md:row-span-2";
            else if (idx >= 1 && idx <= 4) spanClasses = "md:col-span-3 md:row-span-1";
            else spanClasses = "md:col-span-3 md:row-span-1"; // items 5-8 go to row 3

            return (
            <div 
              key={idx} 
              className={cn(
                "group relative overflow-hidden rounded-md shadow-sm cursor-pointer w-full h-[250px] md:h-full transition-shadow duration-500 hover:shadow-2xl hover:z-10",
                spanClasses
              )}
              onClick={handleScrollToWidget}
            >
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/60 border border-white/50 backdrop-blur-sm px-4 py-2">
                  <p className="font-medium text-white tracking-wide text-[10px] md:text-xs uppercase">
                    {city.name}
                  </p>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Route Tags */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {currentRoutes.routes.map((route, i) => (
            <span
              key={i}
              onClick={handleScrollToWidget}
              className="px-6 py-3 bg-[#f2f2f2] text-[10px] md:text-xs font-semibold text-gray-700 tracking-wider cursor-pointer hover:bg-gray-200 transition-colors uppercase whitespace-nowrap"
            >
              {route}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
