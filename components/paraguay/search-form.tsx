"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
 Calendar,
 MapPin,
 ArrowRight,
 Bus,
 ChevronDown,
 ArrowRightLeft,
 X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
 Popover,
 PopoverContent,
 PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
 Command,
 CommandEmpty,
 CommandGroup,
 CommandItem,
 CommandList,
 CommandInput,
} from "@/components/ui/command";
import { useBookingStore } from "@/lib/booking-store";
import { useStops } from "@/lib/hooks/use-stops";
import { useAvailableDestinations } from "@/lib/hooks/use-available-destinations";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { createPortal } from "react-dom";
import Image from "next/image";

// Modal Component
function ComingSoonModal({
 isOpen,
 onClose,
}: {
 isOpen: boolean;
 onClose: () => void;
}) {
 if (!isOpen) return null;

 // Usamos portal para renderizar directamente en el body
 return createPortal(
 <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
 <div className="relative max-w-4xl w-full bg-gradient-to-br from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] rounded-2xl shadow-2xl border border-black/10 overflow-hidden animate-in zoom-in-95 duration-300">
 {/* Background Effects */}
 <div className="absolute inset-0 pointer-events-none">
 <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-primary/20 rounded-full blur-[80px]" />
 <div className="absolute bottom-0 right-1/4 w-[150px] h-[150px] bg-secondary/20 rounded-full blur-[60px]" />
 </div>

 {/* Content */}
 <div className="relative z-10 p-8 text-center">
 {/* Icon */}
 <div className="flex justify-center mb-8 mt-4">
 <Image
 src="/logos/logo-boletos.png"
 alt="Logo Boletos.la"
 width={135}
 height={100}
 />
 </div>

 {/* Title */}
 <h3 className="text-3xl font-bold text-gray-300 mb-4">
 ¡Próximamente en <span className="text-primary">Paraguay</span>!
 </h3>

 {/* Description */}
 <p className="text-gray-400 mb-8">
 Estamos trabajando para traerte la mejor experiencia de compra de
 boletos de bus. Muy pronto podrás reservar tus viajes por todo el
 país.
 </p>

 {/* Button */}
 <Button
 onClick={onClose}
 className="bg-primary hover:bg-primary/90 text-slate-900 px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
 >
 Entendido
 </Button>
 </div>
 </div>
 </div>,
 document.body, // Renderizamos directamente en el body
 );
}

function CityMarqueeText({
 text,
 placeholder,
 orientation,
}: {
 text?: string;
 placeholder: string;
 orientation?: "horizontal" | "vertical";
}) {
 const containerRef = useRef<HTMLDivElement>(null);
 const textRef = useRef<HTMLSpanElement>(null);
 const [shouldAnimate, setShouldAnimate] = useState(false);
 const [scrollDistance, setScrollDistance] = useState(0);

 const displayText = text || placeholder;
 const isPlaceholder = !text;

 useEffect(() => {
 const checkOverflow = () => {
 if (containerRef.current && textRef.current) {
 const containerWidth = containerRef.current.clientWidth;
 const textWidth = textRef.current.scrollWidth;
 if (textWidth > containerWidth + 2) {
 setShouldAnimate(true);
 setScrollDistance(textWidth - containerWidth + 14);
 } else {
 setShouldAnimate(false);
 setScrollDistance(0);
 }
 }
 };

 // Timeout allows DOM layout calculation after render
 const timeout = setTimeout(checkOverflow, 50);
 window.addEventListener("resize", checkOverflow);
 
 let observer: ResizeObserver | null = null;
 if (containerRef.current) {
   observer = new ResizeObserver(() => checkOverflow());
   observer.observe(containerRef.current);
 }

 return () => {
   clearTimeout(timeout);
   window.removeEventListener("resize", checkOverflow);
   if (observer) {
     observer.disconnect();
   }
 };
 }, [displayText]);

 return (
 <div
 ref={containerRef}
 className="overflow-hidden min-w-0 flex-1 relative flex items-center"
 >
 <span
 ref={textRef}
 title={displayText}
 style={
 shouldAnimate
 ? ({
 "--scroll-dist": `-${scrollDistance}px`,
 } as React.CSSProperties)
 : undefined
 }
 className={cn(
 cn("text-lg lg:text-base font-semibold whitespace-nowrap inline-block transition-transform", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-gray-900"),
 isPlaceholder && "text-gray-400 font-normal",
 shouldAnimate && "animate-dynamic-marquee"
 )}
 >
 {displayText}
 </span>
 </div>
 );
}


// Función helper para obtener la fecha/hora actual en Paraguay
const getParaguayDate = () => {
  const asuncionTimeStr = new Date().toLocaleString("en-US", { timeZone: "America/Asuncion" });
  return new Date(asuncionTimeStr);
};

export function ParaguaySearchForm({ orientation = 'horizontal' }: { orientation?: 'horizontal' | 'vertical' }) {
 const router = useRouter();
 const [mounted, setMounted] = useState(false);
 const [originOpen, setOriginOpen] = useState(false);
 const [destinationOpen, setDestinationOpen] = useState(false);
 const [departureDateOpen, setDepartureDateOpen] = useState(false);
 const [returnDateOpen, setReturnDateOpen] = useState(false);
 const [showModal, setShowModal] = useState(false);

 useEffect(() => {
 setMounted(true);
 }, []);

 const {
 tripType,
 origin,
 destination,
 departureDate,
 returnDate,
 setTripType,
 setOrigin,
 setDestination,
 setOriginTitle,
 setDestinationTitle,
 swapTitles,
 setDepartureDate,
 setReturnDate,
 originTitle,
 destinationTitle,
 } = useBookingStore();

 const { stops, loading: stopsLoading, error: stopsError } = useStops();
 const { availableDestinations, loading: destLoading } = useAvailableDestinations(
 origin || null,
 departureDate || null
 );

 const getStopDynamicCount = (stopId: string | number) => {
 const destData = availableDestinations.find(d => {
 if (typeof d === 'string') return d === String(stopId);
 return String((d as any).destinationId) === String(stopId);
 });
 const isObject = destData && typeof destData === 'object';
 if (!isObject) return 0;

 if ((destData as any).times && departureDate) {
 const times = (destData as any).times;
 const todayDate = new Date();
 const tzOffset = todayDate.getTimezoneOffset() * 60000;
 const localISOToday = (new Date(todayDate.getTime() - tzOffset)).toISOString().slice(0, 10);
 const selectedISODate = new Date(departureDate).toISOString().slice(0, 10);

 if (selectedISODate === localISOToday) {
 const hours = String(todayDate.getHours()).padStart(2, '0');
 const minutes = String(todayDate.getMinutes()).padStart(2, '0');
 const currentHourMinute = `${hours}:${minutes}`;
 return times.filter((t: string) => t >= currentHourMinute).length;
 } else if (selectedISODate > localISOToday) {
 return times.length;
 }
 }
 return (destData as any).serviceCount || 0;
 };

 const filteredStops = useMemo(() => {
  if (orientation === "vertical") return stops;
  if (!origin || !departureDate) return stops;
  if (destLoading) return [];

  // Si llega vacío (0), no filtramos agresivamente
  if (availableDestinations.length === 0) return stops;

  // Filtramos comparando los IDs
  return stops
  .filter(stop => {
  return availableDestinations.some(d => {
  if (typeof d === 'string') return d === String(stop.id);
  return String((d as any).destinationId) === String(stop.id);
  });
  })
  .sort((a, b) => {
  const countA = getStopDynamicCount(a.id);
  const countB = getStopDynamicCount(b.id);

  // 1. Destinos con servicios disponibles primero
  if (countA > 0 && countB === 0) return -1;
  if (countA === 0 && countB > 0) return 1;

  // 2. Destinos con "salidas finalizadas" luego
  const hasFinishedA = (availableDestinations.find(d => String((d as any).destinationId) === String(a.id)) as any)?.times?.length > 0;
  const hasFinishedB = (availableDestinations.find(d => String((d as any).destinationId) === String(b.id)) as any)?.times?.length > 0;
  
  if (hasFinishedA && !hasFinishedB) return -1;
  if (!hasFinishedA && hasFinishedB) return 1;

  // 3. Alfabético por nombre
  return a.name.localeCompare(b.name);
  });
  }, [stops, origin, departureDate, destLoading, availableDestinations, orientation]);



 const hasInitializedDefault = useRef(false);

 // Forzar Asunción y fecha actual obligatoriamente al cargar la página (ignorar persistencia anterior)
 useEffect(() => {
 if (!mounted || stops.length === 0) return;

 if (!hasInitializedDefault.current) {
 const asuncion = stops.find(s => s.name.toLowerCase().includes('asunción') || s.name.toLowerCase().includes('asuncion'));
 if (asuncion) {
 setOrigin(asuncion.id);
 setOriginTitle(asuncion.name);
 }

 const d = new Date();
 const tzOffset = d.getTimezoneOffset() * 60000;
 const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 10);
 setDepartureDate(localISOTime);

 hasInitializedDefault.current = true;
 } else {
 if (origin && !originTitle) {
 const stop = stops.find((s) => String(s.id) === String(origin));
 if (stop) setOriginTitle(stop.name);
 }

 if (destination && !destinationTitle) {
 const stop = stops.find((s) => String(s.id) === String(destination));
 if (stop) setDestinationTitle(stop.name);
 }
 }
 }, [
 mounted,
 stops,
 origin,
 departureDate,
 destination,
 originTitle,
 destinationTitle,
 setOrigin,
 setDepartureDate,
 setOriginTitle,
 setDestinationTitle,
 ]);

 const handleSearch = () => {
 if (origin && destination && departureDate) {
 router.push("/paraguay/booking/services");
 }
 };

 const swapCities = () => {
 const tempOrigin = origin;
 setOrigin(destination);
 setDestination(tempOrigin);
 swapTitles();
 };

 // Función helper para parsear fechas sin problemas de zona horaria
 const parseDate = (dateString: string) => {
 return parse(dateString, "yyyy-MM-dd", new Date());
 };

 // Helper para obtener hoy sin hora (medianoche local)
 const today = () => {
 const d = new Date();
 d.setHours(0, 0, 0, 0);
 return d;
 };

 if (!mounted) {
 return (
 <div className="w-full flex justify-center px-4">
 <div className={cn(
   "backdrop-blur-md rounded-3xl shadow-2xl p-6 lg:p-8 border w-full max-w-7xl h-[400px] flex items-center justify-center",
   orientation === "vertical" ? "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700/50" : "bg-white/20 border-black/15 dark:border-white/30"
 )}>
 <div className="animate-pulse flex flex-col items-center gap-4 text-gray-400">
 <Bus className="h-12 w-12 text-gray-400" />
 <p>Preparando buscador...</p>
 </div>
 </div>
 </div>
 );
 }

 return (
 <>
 <div
 className="w-full flex justify-center px-4 animate-scale-in"
 style={{ animationDelay: "0.6s" }}
 >
 <div className={cn(
    "backdrop-blur-md rounded-3xl lg:rounded-[1.5rem] shadow-2xl p-6 sm:p-8 lg:px-6 lg:py-6 border relative overflow-hidden lg:overflow-visible w-full max-w-[85rem] mx-auto",
    orientation === "vertical" ? "bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-700/50" : "bg-white/90 border-white/60"
  )}>
  {/* Efecto de vidrio con gradiente sutil */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl pointer-events-none" />

  {/* Trip Type Toggle */}
  <div className="flex lg:hidden justify-center mb-8 relative z-10">
  <div className={cn("inline-flex backdrop-blur-sm rounded-full p-1 border", orientation === "vertical" ? "bg-slate-200/50 dark:bg-slate-800/80 border-slate-300/50 dark:border-slate-700/50" : "bg-white/80 border-slate-300/50")}>
  <button
  onClick={() => setTripType("one-way")}
  className={cn(
  "px-6 py-2 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 relative",
  tripType === "one-way"
 ? "bg-secondary text-black shadow-md font-bold"
  : orientation === "vertical" ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50" : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
  )}
  >
  Solo Ida
  </button>
  <button
  onClick={() => setTripType("round-trip")}
  className={cn(
  "px-6 py-2 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 relative",
  tripType === "round-trip"
 ? "bg-secondary text-black shadow-md font-bold"
  : orientation === "vertical" ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50" : "text-slate-600 hover:text-slate-900 hover:bg-white/50",
  )}
  >
  Ida y Vuelta
  </button>
  </div>
  </div>

  {/* Search Fields - Responsive con mismo ancho */}
  <div className={cn("flex flex-col gap-4 relative z-10 items-stretch w-full", orientation === 'horizontal' ? "lg:flex-row lg:gap-3 lg:items-end" : "")}>
  {/* Trip Type Selector - Desktop inline */}
  <div className={cn("hidden flex-col flex-shrink-0", orientation === 'horizontal' ? "lg:flex" : "")}>
  <Label className={cn("text-[13px] font-bold mb-1 block", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-slate-900")}>
  Tipo de viaje
  </Label>
  <div className={cn("inline-flex h-14 items-center rounded-xl p-1 border shadow-sm", orientation === "vertical" ? "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700" : "bg-white/80 border-slate-300")}>
  <button
  type="button"
  onClick={() => setTripType("one-way")}
  className={cn(
  "px-3.5 h-full text-sm rounded-lg font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center",
  tripType === "one-way"
  ? "bg-secondary text-black shadow-sm font-bold"
  : orientation === "vertical" ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" : "text-slate-600 hover:text-slate-900"
  )}
  >
  Solo Ida
  </button>
  <button
  type="button"
  onClick={() => setTripType("round-trip")}
  className={cn(
  "px-3.5 h-full text-sm rounded-lg font-semibold transition-all duration-200 whitespace-nowrap flex items-center justify-center",
  tripType === "round-trip"
  ? "bg-secondary text-black shadow-sm font-bold"
  : orientation === "vertical" ? "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white" : "text-slate-600 hover:text-slate-900"
  )}
  >
  Ida y Vuelta
  </button>
  </div>
  </div>

  {/* Origin */}
  <div className="flex-1 min-w-0">
  <Label className={cn("text-lg sm:text-xl lg:text-[13px] font-extrabold lg:font-bold mb-2 lg:mb-1 block lg:[text-shadow:none]", orientation === "horizontal" && "[text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-slate-900")}>
  Origen
  </Label>
 <Popover
 open={originOpen && !stopsLoading}
 onOpenChange={(open) => {
 if (!stopsLoading) setOriginOpen(open);
 }}
 >
 <PopoverTrigger asChild>
  <Button
  variant="outline"
  role="combobox"
  disabled={stopsLoading}
  className={cn(
  "w-full justify-between h-14 text-left font-normal transition-all duration-300 shadow-sm hover:border-primary/50",
  orientation === "vertical" ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white" : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
  stopsLoading ? "cursor-not-allowed opacity-60" : "",
  )}
  >
  <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
  <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
  <CityMarqueeText
   text={
   origin
   ? stops.find((c) => String(c.id) === String(origin))?.name
   : undefined
   }
   placeholder={stopsLoading ? "Cargando ciudades..." : "Selecciona origen"}
   orientation={orientation}
   />
  </div>
   <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
   </Button>
   </PopoverTrigger>
  <PopoverContent
  className={cn("w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 shadow-2xl rounded-2xl overflow-hidden", orientation === "vertical" ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800")}
  align="start"
 >
 <Command className="bg-transparent">
 <CommandInput
 placeholder="Buscá ciudad..."
 className={cn("h-12 bg-transparent border-b transition-colors px-3 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700 placeholder:text-slate-400")}
 />
 <CommandList className="max-h-72 overflow-y-auto p-1">
 <CommandEmpty className={cn("text-gray-500 p-4 text-sm text-center", orientation === "vertical" && "dark:text-slate-400")}>
 {stopsLoading || destLoading
 ? "Cargando ciudades..."
 : stopsError
 ? "Error al cargar ciudades"
 : filteredStops.length === 0 && origin
 ? "No hay rutas disponibles para esta fecha"
 : availableDestinations.length === 0
 ? "No existen servicios disponibles para fechas cercanas desde este origen."
 : "No se encontró la ciudad."}
 </CommandEmpty>
 <CommandGroup className="bg-transparent">
 {stops.map((city) => (
 <CommandItem
 key={city.id}
 value={city.name}
 onSelect={() => {
 setOrigin(city.id);
 setOriginTitle(city.name);
 setDestination("");
 setDestinationTitle("");
 setOriginOpen(false);
 }}
 className={cn("cursor-pointer py-3 group transition-colors duration-150 rounded-lg px-3 flex items-center", orientation === "vertical" ? "text-slate-900 dark:text-slate-200 data-[selected=true]:bg-primary data-[selected=true]:text-slate-900 hover:bg-primary hover:text-slate-900" : "text-slate-900 dark:text-slate-200 data-[selected=true]:bg-primary data-[selected=true]:text-slate-900 hover:bg-primary hover:text-slate-900")}
 >
 <MapPin className="h-4 w-4 mr-2.5 text-primary shrink-0 group-hover:text-slate-900 group-data-[selected=true]:text-slate-900 transition-colors" strokeWidth={2.2} />
 <div className="min-w-0 flex-1">
 <p className="font-bold truncate tracking-wide transition-all text-slate-900 dark:text-slate-100 group-hover:text-slate-900 group-data-[selected=true]:text-slate-900">
 {city.name}
 </p>
 </div>
 </CommandItem>
 ))}
 </CommandGroup>
 </CommandList>
 </Command>
 </PopoverContent>
 </Popover>
 </div>

 {/* Swap Button - Mobile (debajo de origen) */}
 <div className={cn("flex items-center justify-center mt-3", orientation === 'horizontal' ? "lg:hidden" : "")}>
 <button
 onClick={swapCities}
 disabled={stopsLoading}
 className={cn(
 cn("w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 border", orientation === "vertical" ? "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" : "bg-white text-slate-600 border-slate-300"),
 stopsLoading
 ? "cursor-not-allowed opacity-50"
 : "hover:scale-110 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50",
 )}
 aria-label="Intercambiar origen y destino"
 >
 <ArrowRightLeft className="h-5 w-5 rotate-90" />
 </button>
 </div>

 {/* Swap Button - Desktop */}
 <div className={cn("hidden items-center justify-center w-[52px] flex-shrink-0", orientation === 'horizontal' ? "lg:flex" : "")}>
 <div className="h-14 flex items-center">
 <button
 onClick={swapCities}
 disabled={stopsLoading}
 className={cn(
 cn("w-10 h-10 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 border", orientation === "vertical" ? "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700" : "bg-white text-slate-600 border-slate-300"),
 stopsLoading
 ? "cursor-not-allowed opacity-50"
 : "hover:scale-110 hover:text-secondary hover:border-secondary/40 hover:bg-slate-50",
 )}
 aria-label="Intercambiar origen y destino"
 >
 <ArrowRightLeft className="h-5 w-5" />
 </button>
 </div>
 </div>

 {/* Destination */}
 <div className="flex-1 min-w-0">
 <Label className={cn("text-lg sm:text-xl lg:text-[13px] font-extrabold lg:font-bold mb-2 lg:mb-1 block lg:[text-shadow:none]", orientation === "horizontal" && "[text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-slate-900")}>
 Destino
 </Label>
 <Popover
 open={destinationOpen && !stopsLoading}
 onOpenChange={(open) => {
 if (!stopsLoading) setDestinationOpen(open);
 }}
 >
 <PopoverTrigger asChild>
  <Button
  variant="outline"
  role="combobox"
  disabled={stopsLoading}
  className={cn(
  "w-full justify-between h-14 text-left font-normal transition-all duration-300 shadow-sm hover:border-secondary/50",
  orientation === "vertical" ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white" : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50",
  stopsLoading ? "cursor-not-allowed opacity-60" : "",
  )}
  >
  <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
  <MapPin className="h-5 w-5 text-secondary flex-shrink-0" />
   <CityMarqueeText
   text={
   destination
   ? stops.find((c) => String(c.id) === String(destination))?.name
   : undefined
   }
   placeholder={
   stopsLoading ? "Cargando ciudades..." : "Selecciona destino"
   }
   orientation={orientation}
   />
  </div>
  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
  </Button>
  </PopoverTrigger>
  <PopoverContent
  className={cn("w-[var(--radix-popover-trigger-width)] min-w-[280px] p-0 shadow-2xl rounded-2xl overflow-hidden", orientation === "vertical" ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800")}
  align="start"
  >
  <Command className="bg-transparent">
  <CommandInput
  placeholder="Buscá ciudad..."
  className="h-12 bg-transparent border-b transition-colors px-3 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-slate-700 placeholder:text-slate-400"
  />
  <CommandList className="max-h-72 overflow-y-auto p-1">
  <CommandEmpty className={cn("text-gray-500 p-4 text-sm text-center", orientation === "vertical" && "dark:text-slate-400")}>
  {stopsLoading
  ? "Cargando ciudades..."
  : stopsError
  ? "Error al cargar ciudades"
  : "No se encontró la ciudad."}
  </CommandEmpty>
  <CommandGroup className="bg-transparent">
  {originTitle && orientation === "horizontal" && (
 <div className="px-3 py-2 text-xs font-semibold backdrop-blur-sm rounded-lg mb-1 flex items-center gap-2 border shadow-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
  <MapPin className="h-3.5 w-3.5 text-secondary" />
  Rutas disponibles desde {originTitle}
  </div>
  )}
  {filteredStops
  .filter((c) => String(c.id) !== String(origin))
  .map((city) => (
  <CommandItem
  key={city.id}
  value={city.name}
  onSelect={() => {
  setDestination(city.id);
  setDestinationTitle(city.name);
  setDestinationOpen(false);
  }}
 className={cn("cursor-pointer py-3 group transition-colors duration-150 rounded-lg px-3 flex items-center", orientation === "vertical" ? "text-slate-900 dark:text-slate-200 data-[selected=true]:bg-secondary data-[selected=true]:text-black hover:bg-secondary hover:text-black" : "text-slate-900 dark:text-slate-200 data-[selected=true]:bg-secondary data-[selected=true]:text-black hover:bg-secondary hover:text-black")}
  >
  <MapPin className="h-4 w-4 mr-2.5 text-secondary shrink-0 group-hover:text-black group-data-[selected=true]:text-black transition-colors" strokeWidth={2.2} />
  <div className="min-w-0 flex-1">
  <p className="font-bold truncate tracking-wide transition-all text-slate-900 dark:text-slate-100 group-hover:text-black group-data-[selected=true]:text-black">
  {city.name}
  </p>
  {(() => {
   if (orientation === "vertical") return null;
   const destData = availableDestinations.find(d => {
   if (typeof d === 'string') return d === String(city.id);
   return String((d as any).destinationId) === String(city.id);
   });
   const isObject = destData && typeof destData === 'object';
   const dynamicCount = getStopDynamicCount(city.id);

   if (isObject) {
   if (dynamicCount > 0) {
   return (
   <p className="text-xs font-medium mt-0.5 transition-all text-slate-600 dark:text-slate-400 group-hover:text-black group-data-[selected=true]:text-black">
   {dynamicCount} {dynamicCount === 1 ? 'servicio' : 'servicios'}
   </p>
   );
   } else if ((destData as any).times?.length > 0) {
   return (
   <p className="text-xs font-semibold mt-0.5 transition-all text-red-600 dark:text-red-400 group-hover:text-red-900 group-data-[selected=true]:text-red-900">
   Salidas finalizadas por hoy
   </p>
   );
   }
   }
   return null;
   })()}
  </div>
  </CommandItem>
  ))}
  </CommandGroup>
  </CommandList>
  </Command>
  </PopoverContent>
  </Popover>
  </div>

  {/* Fecha de Ida */}
  <div className="flex-1 min-w-0">
  <Label className={cn("text-lg sm:text-xl lg:text-[13px] font-extrabold lg:font-bold mb-2 lg:mb-1 block lg:[text-shadow:none]", orientation === "horizontal" && "[text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-slate-900")}>
  Fecha de Ida
  </Label>
  <Popover
  open={departureDateOpen}
  onOpenChange={setDepartureDateOpen}
  >
  <PopoverTrigger asChild>
  <Button
  variant="outline"
  className={cn(
  "w-full justify-between h-14 text-left font-normal transition-all duration-300 shadow-sm hover:border-secondary/50",
  orientation === "vertical" ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white" : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
  )}
  >
  <div className="flex items-center gap-3 min-w-0">
  <Calendar className="h-5 w-5 text-secondary flex-shrink-0" />
  <span
  className={cn(
  !departureDate && "text-gray-400 dark:text-slate-400",
  cn("text-lg lg:text-base font-semibold truncate", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-gray-900")
  )}
  >
  {departureDate
  ? format(parseDate(departureDate), "dd MMM yyyy", {
  locale: es,
  })
  : "Selecciona fecha"}
  </span>
  </div>
  </Button>
  </PopoverTrigger>
  <PopoverContent
  className={cn("w-auto p-0 shadow-2xl", orientation === "vertical" ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" : "bg-white/95 border-black/20 text-slate-900 dark:text-slate-900")}
  align="start"
  >
  <CalendarComponent
  locale={es}
  mode="single"
  selected={
  departureDate ? parseDate(departureDate) : undefined
  }
  onSelect={(date) => {
  if (date) {
  setDepartureDate(format(date, "yyyy-MM-dd"));
  setDepartureDateOpen(false);
  }
  }}
  disabled={(date) => date < today()}
  initialFocus
  className="bg-transparent"
  />
  </PopoverContent>
  </Popover>
  </div>

  {/* Fecha de Vuelta */}
  {tripType === "round-trip" && (
  <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-5 duration-500">
  <Label className={cn("text-lg sm:text-xl lg:text-[13px] font-extrabold lg:font-bold mb-2 lg:mb-1 block lg:[text-shadow:none]", orientation === "horizontal" && "[text-shadow:_0_1px_3px_rgb(255_255_255_/_90%)]", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-slate-900")}>
  Fecha de Vuelta
  </Label>
  <Popover open={returnDateOpen} onOpenChange={setReturnDateOpen}>
  <PopoverTrigger asChild>
  <Button
  variant="outline"
  className={cn(
  "w-full justify-between h-14 text-left font-normal transition-all duration-300 shadow-sm hover:border-secondary/50",
  orientation === "vertical" ? "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-white" : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50"
  )}
  >
  <div className="flex items-center gap-3 min-w-0">
  <Calendar className="h-5 w-5 text-secondary flex-shrink-0" />
  <span
  className={cn(
  !returnDate && "text-gray-400 dark:text-slate-400",
  cn("text-lg lg:text-base font-semibold truncate", orientation === "vertical" ? "text-slate-900 dark:text-white" : "text-gray-900")
  )}
  >
  {returnDate
  ? format(parseDate(returnDate), "dd MMM yyyy", {
  locale: es,
  })
  : "Selecciona fecha"}
  </span>
  </div>
  </Button>
  </PopoverTrigger>
  <PopoverContent
  className={cn("w-auto p-0 shadow-2xl", orientation === "vertical" ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" : "bg-white/95 border-black/20 text-slate-900 dark:text-slate-900")}
  align="start"
  >
  <CalendarComponent
  locale={es}
  mode="single"
  selected={returnDate ? parseDate(returnDate) : undefined}
  onSelect={(date) => {
  if (date) {
  setReturnDate(format(date, "yyyy-MM-dd"));
  setReturnDateOpen(false);
  }
  }}
  disabled={(date) =>
  date <
  (departureDate ? parseDate(departureDate) : today())
  }
  initialFocus
  className="bg-transparent"
  />
  </PopoverContent>
  </Popover>
  </div>
  )}

 {/* Desktop Search Button inline */}
 <div className={cn("hidden flex-shrink-0 items-end ml-auto", orientation === 'horizontal' ? "lg:flex" : "")}>
 <Button
 onClick={handleSearch}
 disabled={
 stopsLoading ||
 !origin ||
 !destination ||
 !departureDate ||
 (tripType === "round-trip" && !returnDate)
 }
 className="bg-secondary hover:bg-secondary/90 text-black h-14 px-8 text-lg font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
 >
 Buscar Viajes
 <ArrowRight className="h-5 w-5 shrink-0 text-black ml-2" />
 </Button>
 </div>
 </div>

 {/* Search Button */}
 <div className={cn("mt-8 flex justify-center relative z-10", orientation === 'horizontal' ? "lg:hidden" : "")}>
 <Button
 onClick={handleSearch}
 disabled={
 stopsLoading ||
 !origin ||
 !destination ||
 !departureDate ||
 (tripType === "round-trip" && !returnDate)
 }
className="bg-secondary hover:bg-secondary/90 text-black h-14 px-12 text-lg sm:text-xl lg:text-lg font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:hover:bg-secondary"
 >
 Buscar Viajes
 <ArrowRight className="h-5 w-5 shrink-0 text-black" />
 </Button>
 </div>
 </div>
 </div>
 <ComingSoonModal isOpen={showModal} onClose={() => setShowModal(false)} />
 </>
 );
}
