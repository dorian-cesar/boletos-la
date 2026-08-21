"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useBookingStore, cities } from "@/lib/booking-store";
import { useStops } from "@/lib/hooks/use-stops";

const destinations = [
  {
    id: 1,
    name: "Azotey",
    region: "Capital",
    image: "/images/azotey.jpg",
    price: 25000,
    duration: "3h 45m",
    popular: true,
  },
  {
    id: 2,
    name: "Ciudad del Este",
    region: "Alto Paraná",
    image: "/images/ciudad-del-este.png",
    price: 35000,
    duration: "4h 30min",
    popular: true,
  },
  {
    id: 3,
    name: "Caacupé",
    region: "Itapúa",
    image: "/images/caacupe.jpg",
    price: 40000,
    duration: "2h 10m",
    popular: true,
  },
  {
    id: 4,
    name: "Pedro Juan Caballero",
    region: "Amambay",
    image: "/images/pedro-juan-caballero.png",
    price: 50000,
    duration: "6h",
    popular: false,
  },
  {
    id: 5,
    name: "Coronel Oviedo",
    region: "Caaguazú",
    image: "/images/coronel-oviedo.png",
    price: 20000,
    duration: "2h",
    popular: false,
  },
  {
    id: 6,
    name: "Ypacaraí",
    region: "Canindeyú",
    image: "/images/ypacarai.jpg",
    price: 45000,
    duration: "5h 30min",
    popular: false,
  },
];

export function DestinationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const {
    setOrigin,
    setDestination,
    setDepartureDate,
    setTripType,
    setSelectedOutboundTrip,
    setSelectedReturnTrip,
    setReturnDate,
  } = useBookingStore();

  // Obtener las paradas reales de la API para no hardcodear IDs
  const { stops } = useStops();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Función para manejar la búsqueda de servicios
  const handleSearchServices = (destinationName: string) => {
    // Obtener la fecha actual en formato yyyy-MM-dd
    const today = new Date();
    const formattedDate = format(today, "yyyy-MM-dd");

    // Buscar Asunción en el array de ciudades
    const asuncion = cities.find((c) => c.name === "Asunción");

    // Buscar la ciudad de destino
    const destino = cities.find((c) => c.name === destinationName);

    // Limpiar selecciones previas
    setSelectedOutboundTrip(null);
    setSelectedReturnTrip(null);
    setReturnDate("");

    // Buscar Asunción en las paradas reales (API) para el origen por defecto
    const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    const asuncionReal = stops.find((s) => normalizeStr(s.name).includes("asunci"));
    const asuncionId = asuncionReal ? String(asuncionReal.id) : "184"; // Fallback a 184 si aún no cargó

    // Por defecto, asumir que salen desde Asunción, 
    // a menos que el destino sea la propia Asunción.
    let finalOriginId = asuncionId; 
    const normalizedDestName = normalizeStr(destinationName);

    if (normalizedDestName.includes("asuncion")) {
      finalOriginId = "";
    }
    
    setOrigin(finalOriginId);

    // Establecer el destino buscando en las paradas reales (API)
    let finalDestinationId = "";
    const destinoReal = stops.find((s) => {
      const normalizedStopName = normalizeStr(s.name);
      return normalizedStopName.includes(normalizedDestName) || normalizedDestName.includes(normalizedStopName);
    });

    if (destinoReal) {
      finalDestinationId = String(destinoReal.id);
      setDestination(finalDestinationId);
    } else {
      // Si por alguna razón no encuentra en stops, hace fallback a los IDs quemados / store
      const cityIdMap: Record<string, string> = {
        "Asunción": "184",
        "Ciudad del Este": "218",
        "Encarnación": "200",
        "Pedro Juan Caballero": "244",
        "Coronel Oviedo": "173",
        "Salto del Guairá": "251",
      };

      if (cityIdMap[destinationName]) {
        finalDestinationId = cityIdMap[destinationName];
        setDestination(finalDestinationId);
      } else if (destino) {
        finalDestinationId = String(destino.id);
        setDestination(String(destino.id));
      } else {
        const cityId = destinationName.toLowerCase().replace(/\s+/g, "-");
        finalDestinationId = cityId;
        setDestination(cityId);
      }
    }

    setDepartureDate(formattedDate);
    setTripType("one-way"); // Solo ida

    // Redirigir a la página de servicios con query params
    const queryParams = new URLSearchParams({
      destinationId: finalDestinationId
    });
    
    if (finalOriginId) {
      queryParams.set("originId", finalOriginId);
    }

    router.push(`/paraguay/booking/services?${queryParams.toString()}`);
  };

  return (
    <section
      ref={sectionRef}
      id="destinos"
      className="py-24 bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] relative overflow-hidden"
    >
      {/* Decorative Background - Actualizado para fondo oscuro */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00c7cc]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ffaa00]/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <span
              className={cn(
                "inline-block px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              Destinos Populares desde Asunción
            </span>
            <h2
              className={cn(
                "text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 transition-all duration-700 delay-100",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              <span className="text-balance">Explora </span>
              <span className="text-secondary">Paraguay</span>
            </h2>
            <p
              className={cn(
                "text-lg text-slate-900 dark:text-white/70 max-w-xl transition-all duration-700 delay-200",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
              )}
            >
              Descubre los destinos más visitados y planifica tu próximo viaje
              con un solo clic.
            </p>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className={cn(
                "group relative rounded-3xl overflow-hidden transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10",
                index < 3 ? "lg:h-96" : "h-80",
              )}
              style={{ transitionDelay: `${(index + 3) * 100}ms` }}
            >
              {/* Contenedor clickeable para toda la tarjeta */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => handleSearchServices(destination.name)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSearchServices(destination.name);
                  }
                }}
                aria-label={`Buscar servicios de Asunción a ${destination.name} para hoy`}
              >
                {/* Image with enhanced effects */}
                <div className="absolute inset-0">
                  <Image
                    src={destination.image}
                    alt={`Imagen de ${destination.name}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {/* Multi-layer gradient overlay - Mejorado para fondo oscuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00c7cc]/10 via-transparent to-[#ffaa00]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>

              {/* Popular Badge */}
              {destination.popular && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#ffaa00] text-black text-xs font-bold rounded-full z-10">
                  Popular
                </div>
              )}

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#00c7cc] transition-colors duration-300">
                      {destination.name}
                    </h3>
                    <div className="flex items-center gap-4 text-white/90 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {destination.duration}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/90">Desde</p>
                    <p className="text-2xl font-bold text-[#ffaa00]">
                      ₲{destination.price.toLocaleString("es-PY")}
                    </p>
                  </div>
                </div>

                {/* Hover Button */}
                <div className="mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <Button
                    className="w-full bg-[#00c7cc] hover:bg-[#00c7cc]/90 text-slate-900"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchServices(destination.name);
                    }}
                  >
                    Ver Servicios
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
