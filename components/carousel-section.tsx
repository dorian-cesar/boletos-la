"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface CarouselSectionProps {
  country?: string;
}

export function CarouselSection({ country }: CarouselSectionProps) {
  const normalizedCountry = country?.toLowerCase() || "latam";

  const imagesByCountry: Record<string, string[]> = {
    argentina: [
      "/images/carousel/argentina/arg-baires.jpg",
      "/images/carousel/argentina/arg-bariloche.jpg",
      "/images/carousel/argentina/arg-bs-as.jpg",
      "/images/carousel/argentina/arg-bsas.jpg",
      "/images/carousel/argentina/arg-cordoba.png",
      "/images/carousel/argentina/arg-mar-del-plata.jpg",
      "/images/carousel/argentina/arg-mendoza.jpg"
    ],
    brasil: [
      "/images/carousel/brasil/carrusel-brasil1.jpg",
      "/images/carousel/brasil/carrusel-brasil2.jpg",
      "/images/carousel/brasil/carrusel-brasil3.jpg",
      "/images/carousel/brasil/carrusel-brasil4.jpg"
    ],
    chile: [
      "/images/carousel/chile/chile-2.jpg",
      "/images/carousel/chile/chile-3.jpg",
      "/images/carousel/chile/chile-7.jpg",
      "/images/carousel/chile/chile-patagonia.jpg",
      "/images/carousel/chile/chile-puerto-varas.jpg",
      "/images/carousel/chile/chile-serena.jpg",
      "/images/carousel/chile/chile-valdi.jpg",
      "/images/carousel/chile/chile-valpo.jpg",
      "/images/carousel/chile/chile4.jpg",
      "/images/carousel/chile/chile5.jpg"
    ],
    colombia: [
      "/images/carousel/colombia/carrusel-colombia1.jpg",
      "/images/carousel/colombia/carrusel-colombia2.jpg",
      "/images/carousel/colombia/carrusel-colombia3.jpg",
      "/images/carousel/colombia/carrusel-colombia4.jpg"
    ],
    ecuador: [
      "/images/carousel/ecuador/ecuador-quito.png"
    ],
    paraguay: [
      "/images/carousel/paraguay/asuncion(1).jpg",
      "/images/carousel/paraguay/asuncion.jpg",
      "/images/carousel/paraguay/cde.jpg",
      "/images/carousel/paraguay/ciudad-del-este-paraguay.png",
      "/images/carousel/paraguay/concepción-py.png",
      "/images/carousel/paraguay/pedro-juan-caballero-py.png",
      "/images/carousel/paraguay/py-encarnacion.jpg",
      "/images/carousel/paraguay/py-san-ber.jpg"
    ]
  };

  const images = imagesByCountry[normalizedCountry];

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="w-full relative overflow-hidden bg-white">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {images.map((src, index) => (
            <CarouselItem key={index} className="pl-0 relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px]">
              <Image
                src={src}
                alt={`Carrusel ${normalizedCountry} - Imagen ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-800 border-0 h-10 w-10 md:h-12 md:w-12 shadow-lg" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/70 hover:bg-white text-gray-800 border-0 h-10 w-10 md:h-12 md:w-12 shadow-lg" />
          </>
        )}
      </Carousel>
    </section>
  );
}
