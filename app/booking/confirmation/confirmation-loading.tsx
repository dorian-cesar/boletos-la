import { Loader2, Bus } from "lucide-react";
import { BookingProgress } from "@/components/booking-progress";
import Image from "next/image";

export default function ConfirmationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a2332] to-[#0f1419] text-background">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <BookingProgress />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
              <Image
                src="/logos/logo-boletos.png"
                alt="Logo Boletos.la"
                width={120}
                height={64}
                className="mx-auto mb-5 animate-bounce"
                priority
              />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-background mb-3">
              Cargando confirmación...
            </h1>
            <p className="text-lg text-background/60 mb-6">
              Estamos procesando los detalles de tu reserva
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Trip Details Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 border border-background/20 rounded-xl animate-pulse bg-background/5 backdrop-blur-sm"
                >
                  <div className="h-6 bg-background/10 rounded w-1/4 mb-4"></div>
                  <div className="space-y-4">
                    <div className="h-8 bg-background/10 rounded w-3/4"></div>
                    <div className="h-4 bg-background/10 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="p-6 border border-background/20 rounded-xl animate-pulse bg-background/5 backdrop-blur-sm">
                <div className="h-8 bg-background/10 rounded w-1/2 mb-6"></div>
                <div className="space-y-4">
                  <div className="h-14 bg-background/10 rounded"></div>
                  <div className="h-14 bg-background/10 rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-background/10 rounded flex-1"></div>
                    <div className="h-10 bg-background/10 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
