"use client";

import Image from "next/image";
import { useState } from "react";
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

const popularCities: { name: string; image: string; available?: boolean }[] = [
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

const countryDestinations: Record<string, { name: string; image: string; available?: boolean }[]> = {
  argentina: [
    { name: "BUENOS AIRES / MENDOZA", image: "/images/destinations/arg-mendoza.jpg" },
    { name: "BUENOS AIRES / CÓRDOBA", image: "/images/destinations/arg-cordoba.png" },
    { name: "BUENOS AIRES / MAR DEL PLATA", image: "/images/destinations/arg-mar-del-plata.jpg" },
    { name: "BUENOS AIRES / BARILOCHE", image: "/images/destinations/arg-bariloche.jpg" },
    { name: "MENDOZA / CÓRDOBA", image: "/images/destinations/placeholder.svg", available: false },
    { name: "CÓRDOBA / MAR DEL PLATA", image: "/images/destinations/placeholder.svg", available: false },
    { name: "ROSARIO / BUENOS AIRES", image: "/images/destinations/placeholder.svg", available: false },
    { name: "SALTA / TUCUMÁN", image: "/images/destinations/placeholder.svg", available: false },
    { name: "MENDOZA / SANTIAGO", image: "/images/destinations/placeholder.svg", available: false }
  ],
  brasil: [
    { name: "SÃO PAULO / RIO DE JANEIRO", image: "/images/destinations/brasil-sao-paulo.jpg" },
    { name: "SÃO PAULO / BELO HORIZONTE", image: "/images/destinations/brasil-belo-horizonte.webp" },
    { name: "RIO DE JANEIRO / BÚZIOS", image: "/images/destinations/brasil-rio.jpeg", available: false },
    { name: "CURITIBA / FLORIANÓPOLIS", image: "/images/destinations/brasil-floripa.jpg" },
    { name: "SALVADOR / PORTO SEGURO", image: "/images/destinations/brasil-salvador.jpg", available: false },
    { name: "BRASÍLIA / GOIÂNIA", image: "/images/destinations/brasil-goiana.jpg", available: false },
    { name: "SÃO PAULO / CURITIBA", image: "/images/destinations/brasil-curitiba.jpg" },
    { name: "FORTALEZA / JERICOACOARA", image: "/images/destinations/brasil-jericoacoara.jpg" },
    { name: "BELO HORIZONTE / CABO FRIO", image: "/images/destinations/brasil-cabo-frio.webp" }
  ],
  colombia: [
    { name: "BOGOTÁ / MEDELLÍN", image: "/images/destinations/colombia-bogota.jpg" },
    { name: "CARTAGENA / BARRANQUILLA", image: "/images/destinations/colombia-barranquilla.jpg" },
    { name: "CALI / BOGOTÁ", image: "/images/destinations/colombia-cali.jpeg" },
    { name: "BOGOTÁ / BUCARAMANGA", image: "/images/destinations/colombia-santander.jpg" },
    { name: "SANTA MARTA / BOGOTÁ", image: "/images/destinations/colombia-santa-marta.jpeg" },
    { name: "CALI / MEDELLÍN", image: "/images/destinations/colombia-medellin.jpeg" },
    { name: "BOGOTÁ / ARMENIA", image: "/images/destinations/colombia-bogota.jpg", available: false },
    { name: "CARTAGENA / MONTERÍA", image: "/images/destinations/colombia-monteria.jpeg" },
    { name: "BARRANQUILLA / MEDELLÍN", image: "/images/destinations/colombia-medellin.jpg" },
    { name: "BOGOTÁ / MANIZALES", image: "/images/destinations/colombia-manizales.jpg" },
    { name: "CARTAGENA / CÚCUTA", image: "/images/destinations/colombia-cartagena.jpg", available: false },
    { name: "MEDELLÍN / BARRANQUILLA", image: "/images/destinations/colombia-barranquilla-2.jpg" },
    { name: "MEDELLÍN / BOGOTÁ", image: "/images/destinations/colombia-medellin.jpg" },
    { name: "SANTA MARTA / MEDELLÍN", image: "/images/destinations/colombia-santa-marta-.jpeg" },
    { name: "SANTA MARTA / CALI", image: "/images/destinations/colombia-cali.jpeg" },
    { name: "MANIZALES / BARRANQUILLA", image: "/images/destinations/colombia-barranquilla.jpg" },
    { name: "BARRANQUILLA / RIOHACHA", image: "/images/destinations/colombia-riohacha.jpg" },
    { name: "SANTA MARTA / VALLEDUPAR", image: "/images/destinations/colombia-valledupar.jpg" }
  ],
  chile: [
    { name: "SANTIAGO / VIÑA DEL MAR", image: "/images/destinations/chile-vina-del-mar.jpg" },
    { name: "SANTIAGO / CONCEPCIÓN", image: "/images/destinations/chile-concepcion.png" },
    { name: "SANTIAGO / LA SERENA", image: "/images/destinations/chile-serena.jpg" },
    { name: "PUERTO MONTT / TEMUCO", image: "/images/destinations/chile-temuco.jpeg", available: false },
    { name: "SANTIAGO / MENDOZA", image: "/images/destinations/chile-mendoza.jpg" },
    { name: "ANTOFAGASTA / CALAMA", image: "/images/destinations/chile-calama.webp" },
    { name: "SANTIAGO / COQUIMBO", image: "/images/destinations/chile-coquimbo.jpg" },
    { name: "VALPARAÍSO / SANTIAGO", image: "/images/destinations/chile-valpo.jpg" },
    { name: "PUERTO MONTT / BARILOCHE", image: "/images/destinations/chile-patagonia.jpg", available: false }
  ],
  paraguay: [
    { name: "ASUNCIÓN / CIUDAD DEL ESTE", image: "/images/destinations/ciudad-del-este-paraguay.png" },
    { name: "ASUNCIÓN / ENCARNACIÓN", image: "/images/destinations/py-encarnacion.jpg" },
    { name: "ASUNCIÓN / PEDRO JUAN CABALLERO", image: "/images/destinations/pedro-juan-caballero-py.png" },
    { name: "CIUDAD DEL ESTE / ENCARNACIÓN", image: "/images/destinations/cde.jpg" },
    { name: "ASUNCIÓN / BUENOS AIRES", image: "/images/destinations/asuncion.jpg", available: false },
    { name: "ASUNCIÓN / VILLARRICA", image: "/images/destinations/paraguay-villarrica.jpg" },
    { name: "ASUNCIÓN / SALTO DEL GUAIRÁ", image: "/images/destinations/paraguay-sd-guaira.jpg", available: false },
    { name: "CORONEL OVIEDO / ASUNCIÓN", image: "/images/destinations/paraguay-asuncion.jpg", available: false }
  ]
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

const locationCodes: Record<string, string> = {
  "BOGOTÁ": "COBOG", "MEDELLÍN": "COMDE", "CALI": "COCLO", "BUCARAMANGA": "COBGA",
  "SANTA MARTA": "COSMR", "ARMENIA": "COAXM", "MONTERÍA": "COMTR", "BARRANQUILLA": "COBAQ",
  "MANIZALES": "COMZL", "CÚCUTA": "COCUC", "RIOHACHA": "CORCH", "VALLEDUPAR": "COVUP",
  "CARTAGENA": "COCTG",

  "SÃO PAULO": "BRSAO", "RIO DE JANEIRO": "BRRIO", "BELO HORIZONTE": "BRBHZ", "BÚZIOS": "BRBZC",
  "CURITIBA": "BRCWB", "FLORIANÓPOLIS": "BRFLN", "SALVADOR": "BRSSA", "PORTO SEGURO": "BRBPS",
  "BRASÍLIA": "BRBSB", "GOIÂNIA": "BRGYN", "FORTALEZA": "BRFOR", "JERICOACOARA": "BRJJD",
  "CABO FRIO": "BRCFB",

  "SANTIAGO": "CLSCL", "VIÑA DEL MAR": "CLKNA", "CONCEPCIÓN": "CLCCP", "LA SERENA": "CLLSC",
  "PUERTO MONTT": "CLPMC", "TEMUCO": "CLZCO", "MENDOZA": "ARMDZ", "ANTOFAGASTA": "CLANF",
  "CALAMA": "CLCJC", "COQUIMBO": "CLCOQ", "VALPARAÍSO": "CLVAP", "BARILOCHE": "ARBRC",

  "ASUNCIÓN": "PYASU", "CIUDAD DEL ESTE": "PYAGT", "ENCARNACIÓN": "PYENO", "PEDRO JUAN CABALLERO": "PYPJC",
  "BUENOS AIRES": "ARBUE", "VILLARRICA": "PYVRC", "SALTO DEL GUAIRÁ": "PYSGK", "CORONEL OVIEDO": "PYCOV"
};

interface DestinationsSectionProps {
  country?: string;
}

export function DestinationsSection({ country }: DestinationsSectionProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleSelectRoute = (route: string, available: boolean = true) => {
    if (!available) return;

    const parts = route.split("/");
    if (parts.length >= 2) {
      const rawDep = parts[0].trim().toUpperCase();
      const rawArr = parts[1].trim().toUpperCase();
      
      const departureCity = locationCodes[rawDep] || rawDep;
      const arrivalCity = locationCodes[rawArr] || rawArr;

      // Scroll al widget
      const widget = document.getElementById("distribusion-search");
      if (widget) {
        widget.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Despachar evento para que el widget se actualice
      window.dispatchEvent(new CustomEvent('updateDistribusionRoute', { detail: { route, departureCity, arrivalCity } }));
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

  const totalPages = Math.ceil(citiesToDisplay.length / 9);
  const pagedCities = citiesToDisplay.slice(currentPage * 9, (currentPage + 1) * 9);

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
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-3 gap-4 md:h-[760px] mb-8">
          {pagedCities.map((city, idx) => {
            let spanClasses = "";
            if (idx === 0) spanClasses = "md:col-span-6 md:row-span-2";
            else if (idx >= 1 && idx <= 4) spanClasses = "md:col-span-3 md:row-span-1";
            else spanClasses = "md:col-span-3 md:row-span-1"; // items 5-8 go to row 3

            return (
              <div
                key={city.name + idx}
                className={cn(
                  "group relative overflow-hidden rounded-md shadow-sm w-full h-[250px] md:h-full transition-shadow duration-500",
                  spanClasses,
                  city.available === false ? "opacity-75" : "cursor-pointer hover:shadow-2xl hover:z-10"
                )}
                onClick={() => handleSelectRoute(city.name, city.available)}
              >
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className={cn("object-cover transition-transform duration-700", city.available !== false && "group-hover:scale-105")}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute bottom-4 left-4">
                  <div className="bg-black/60 border border-white/50 backdrop-blur-sm px-4 py-2">
                    <p className="font-medium text-white tracking-wide text-[10px] md:text-xs uppercase">
                      {city.name}
                    </p>
                    {city.available === false && (
                      <p className="text-[10px] text-red-300 font-bold mt-1">NO DISPONIBLE TEMPORALMENTE</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Buttons */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mb-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-6 py-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-[#ff6700] text-[#ff6700] hover:bg-[#ff6700] hover:text-white"
            >
              Anterior
            </button>
            <span className="text-gray-600 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-6 py-2 rounded-full font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[#ff6700] text-white border-2 border-[#ff6700] hover:bg-orange-600 hover:border-orange-600 hover:shadow-md"
            >
              Siguiente
            </button>
          </div>
        )}

        {/* Route Tags */}
        <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
          {currentRoutes.routes.map((route, i) => {
            const isAvailable = !pagedCities.find(c => c.name === route && c.available === false);
            return (
              <span
                key={i}
                onClick={() => handleSelectRoute(route, isAvailable)}
                className={cn(
                  "px-6 py-3 bg-[#f2f2f2] text-[10px] md:text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors",
                  isAvailable ? "text-gray-700 cursor-pointer hover:bg-gray-200" : "text-gray-400 cursor-not-allowed opacity-60"
                )}
              >
                {route}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
