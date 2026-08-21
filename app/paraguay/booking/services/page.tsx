"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trackViewContent, trackInitiateCheckout } from "@/lib/meta-pixel";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowRight,
  Clock,
  Bus,
  Wifi,
  Tv,
  Coffee,
  Plug,
  ChevronDown,
  ChevronUp,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/paraguay/booking-progress";
import { AlternateDatesInline } from "@/components/paraguay/alternate-dates-inline";
import { ParaguaySearchForm } from "@/components/paraguay/search-form";
import { DateNavbar } from "@/components/paraguay/date-navbar";
import { useBookingStore, Trip } from "@/lib/booking-store";
import { useSearch } from "@/lib/hooks/use-search";
import { cn } from "@/lib/utils";
import Image from "next/image";

const amenityIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  WiFi: Wifi,
  TV: Tv,
  Refrigeración: Coffee,
  "Enchufes USB": Plug,
  Baño: Coffee,
  "Aire Acondicionado": Coffee,
};

export default function ServicesPage() {
  const router = useRouter();
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const {
    origin,
    destination,
    departureDate,
    returnDate,
    tripType,
    selectedOutboundTrip,
    setSelectedOutboundTrip,
    selectedReturnTrip,
    setSelectedReturnTrip,
    setStep,
    originTitle,
    destinationTitle,
    setDepartureDate,
    setReturnDate,
  } = useBookingStore();

  const [showingReturn, setShowingReturn] = useState(false);

  const {
    trips: currentTrips,
    loading: searchLoading,
    error: searchError,
  } = useSearch({
    originId: showingReturn ? destination : origin,
    destinationId: showingReturn ? origin : destination,
    date: showingReturn ? returnDate || departureDate : departureDate,
  });

  useEffect(() => {
    setMounted(true);
    setStep(1);
  }, [setStep]);

  useEffect(() => {
    if (!searchLoading && currentTrips && currentTrips.length > 0) {
      trackViewContent({
        content_name: `${originTitle || origin} - ${destinationTitle || destination}`,
        content_category: "paraguay",
        content_ids: currentTrips.slice(0, 10).map((t) => t.id),
      });
    }
  }, [searchLoading, currentTrips, originTitle, destinationTitle, origin, destination]);

  const handleSelectTrip = (trip: Trip) => {
    trackInitiateCheckout();
    if (!showingReturn) {
      setSelectedOutboundTrip(trip);
      if (tripType === "round-trip") {
        setShowingReturn(true);
      } else {
        router.push("/paraguay/booking/seats");
      }
    } else {
      setSelectedReturnTrip(trip);
      router.push("/paraguay/booking/seats");
    }
  };

  const originCityName = showingReturn ? destinationTitle : originTitle;
  const destinationCityName = showingReturn ? originTitle : destinationTitle;
  const trips = currentTrips;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419]">
        <div className="text-center text-slate-900 dark:text-white">
          <Image
            src="/logos/logo-boletos.png"
            alt="Logo Boletos.la"
            width={120}
            height={64}
            className="mx-auto mb-5 animate-pulse"
            priority
          />
          <p className="text-muted-foreground">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  if (!origin || !destination || !departureDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419]">
        <div className="text-center text-slate-900 dark:text-white">
          <Bus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">No hay datos de búsqueda</p>
          <p className="text-muted-foreground mb-4">
            Por favor, realiza una búsqueda desde la página principal
          </p>
          <Button
            onClick={() => router.push("/paraguay")}
            className="bg-primary hover:bg-primary/90"
          >
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 dark:from-[#1a2332] dark:to-[#0f1419] text-slate-900 dark:text-white w-full overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full">
        <BookingProgress />



        {/* Trips List */}
        <div className="w-full px-4 py-8 relative z-10">
          <div className="container mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8 items-start">
              
              {/* Sidebar Search Form */}
              <div className="hidden lg:block sticky top-8">
                <ParaguaySearchForm orientation="vertical" />
              </div>

              {/* Main Content Area */}
              <div className="flex flex-col min-w-0 w-full">
                {/* Mobile Search Form (Optional) */}
                <div className="lg:hidden mb-6">
                  <ParaguaySearchForm orientation="vertical" />
                </div>

                <div className="mb-6">
                  <DateNavbar 
                    currentDate={
                      showingReturn
                        ? returnDate || departureDate || ""
                        : departureDate || ""
                    }
                    onSelectDate={(newDate) => {
                      if (showingReturn) {
                        setReturnDate(newDate);
                      } else {
                        setDepartureDate(newDate);
                      }
                    }} 
                  />
                </div>

                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {searchLoading
                  ? "Buscando servicios..."
                  : `${trips.length} servicios disponibles`}
              </h2>
            </div>

            {searchLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    className="p-6 bg-white/5 border-black/10 dark:border-white/10 animate-pulse h-32"
                  >
                    <div className="flex gap-6 h-full items-center">
                      <div className="w-16 h-16 bg-white/10 rounded-xl" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-white/10 rounded w-1/4" />
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : searchError ? (
              <div className="text-center py-12 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/10 dark:border-white/10">
                <p className="text-destructive mb-4">{searchError}</p>
                <Button variant="outline" onClick={() => router.refresh()}>
                  Reintentar
                </Button>
              </div>
            ) : trips.length === 0 ? (
              <AlternateDatesInline
                originalDate={
                  showingReturn
                    ? returnDate
                      ? parse(returnDate, "yyyy-MM-dd", new Date())
                      : null
                    : departureDate
                      ? parse(departureDate, "yyyy-MM-dd", new Date())
                      : null
                }
                originId={showingReturn ? destination : origin}
                destinationId={showingReturn ? origin : destination}
                onSelectDate={(newDate) => {
                  const formatted = format(newDate, "yyyy-MM-dd");
                  if (showingReturn) {
                    setReturnDate(formatted);
                  } else {
                    setDepartureDate(formatted);
                  }
                }}
              />
            ) : (
              <div className="space-y-4">
                {trips.map((trip, index) => (
                  <Card
                    key={trip.id}
                    className={cn(
                      "overflow-hidden transition-all duration-500 animate-fade-in hover:shadow-lg bg-black/5 dark:bg-white/5 backdrop-blur-sm border-black/10 dark:border-white/20",
                      selectedOutboundTrip?.id === trip.id ||
                        selectedReturnTrip?.id === trip.id
                        ? "ring-2 ring-primary"
                        : "",
                    )}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Company Info */}
                        <div className="flex items-center gap-4 lg:w-48">
                          {(() => {
                            const code = (trip.company || '').toUpperCase();
                            let name = trip.company;
                            let logo = null;
                            let isObjectFitContain = false;
                            
                            if (code === 'LSN' || code === 'LSA' || code.includes('SANTANIANA')) {
                              name = code === 'LSA' ? 'La Santaniana Argentina' : 'La Santaniana';
                              logo = '/logos/santaniana-color.jpeg';
                            } else if (code === 'LSP' || code.includes('SAMPEDRANA')) {
                              name = 'La Sampedrana';
                              logo = '/logos/logo-la-sampedrana.original.png';
                              isObjectFitContain = true;
                            }
                            
                            return (
                              <>
                                <div className="w-16 h-16 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {logo ? (
                                    <Image src={logo} alt={name} width={64} height={64} className={cn("w-full h-full", isObjectFitContain ? "object-contain scale-150" : "object-cover")} />
                                  ) : (
                                    <Bus className="h-8 w-8 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white leading-tight">
                                    {name}
                                  </p>
                                  <p className="text-sm text-slate-900 dark:text-white/60 mt-1">
                                    {trip.busType}
                                  </p>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Time Info */}
                        <div className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
                          <div className="flex w-full md:w-auto justify-between md:justify-start md:flex-1">
                            <div className="text-center flex-1 md:flex-none">
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {trip.departureTime}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white/60">
                                {originCityName}
                              </p>
                            </div>

                            <div className="flex flex-col items-center px-4">
                              <p className="text-xs text-slate-900 dark:text-white/60 mb-1">
                                {trip.duration}
                              </p>
                              <div className="relative w-24 lg:w-32">
                                <div className="h-0.5 bg-black/20 dark:bg-white/20 w-full" />
                                <div className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-primary -translate-y-1/2" />
                                <div className="absolute top-1/2 right-0 w-2 h-2 rounded-full bg-secondary -translate-y-1/2" />
                                <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                              </div>
                            </div>

                            <div className="text-center flex-1 md:flex-none">
                              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {trip.arrivalTime}
                              </p>
                              <p className="text-sm text-slate-900 dark:text-white/60">
                                {destinationCityName}
                              </p>
                            </div>
                          </div>

                          {/* Seats Available */}
                          <div className="flex items-center gap-2 lg:w-32">
                            <Users className="h-5 w-5 text-slate-900 dark:text-white/60" />
                            <span
                              className={cn(
                                "text-sm font-medium whitespace-nowrap",
                                trip.availableSeats < 10
                                  ? "text-destructive"
                                  : "text-primary",
                              )}
                            >
                              {trip.availableSeats} asientos
                            </span>
                          </div>

                          {/* Price & Action */}
                          <div className="flex items-center justify-between lg:flex-col lg:items-end gap-4 lg:w-40 w-full">
                            <div className="text-left lg:text-right">
                              <p className="text-2xl font-bold text-secondary">
                                Gs. {trip.price.toLocaleString("es-PY")}
                              </p>
                              <p className="text-xs text-slate-900 dark:text-white/60">
                                por asiento
                              </p>
                            </div>
                            <Button
                              onClick={() => handleSelectTrip(trip)}
                              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                            >
                              Seleccionar
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Details */}
                      <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/20">
                        <button
                          onClick={() =>
                            setExpandedTrip(
                              expandedTrip === trip.id ? null : trip.id,
                            )
                          }
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                          Ver detalles
                          {expandedTrip === trip.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>

                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-500",
                            expandedTrip === trip.id
                              ? "max-h-40 mt-4"
                              : "max-h-0",
                          )}
                        >
                          <div className="flex flex-wrap gap-2">
                            {trip.amenities.map((amenity) => {
                              const Icon = amenityIcons[amenity];
                              return (
                                <Badge
                                  key={amenity}
                                  variant="secondary"
                                  className="flex items-center gap-1.5 bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white"
                                >
                                  {Icon && <Icon className="h-3.5 w-3.5" />}
                                  {amenity}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Botones de navegación */}
            {/* Botón para volver a seleccionar servicio en viaje de ida */}
            {!showingReturn && !selectedOutboundTrip && (
              <div className="mt-8 flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/paraguay");
                  }}
                  className="border-black/10 dark:border-white/20 text-slate-900 dark:text-white bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a buscar servicios
                </Button>
              </div>
            )}

            {/* Botón para volver a seleccionar ida en viaje de vuelta */}
            {showingReturn && (
              <div className="mt-8 flex justify-start">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowingReturn(false);
                    setSelectedOutboundTrip(null);
                  }}
                  className="border-black/10 dark:border-white/20 text-slate-900 dark:text-white bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a seleccionar ida
                </Button>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
