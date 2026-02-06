import { Loader2, Bus } from "lucide-react";
import { BookingProgress } from "@/components/booking-progress";

export default function ConfirmationLoading() {
  return (
    <div className="min-h-screen">
      <BookingProgress />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="h-14 w-14 text-primary animate-spin" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Cargando confirmación...
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Estamos procesando los detalles de tu reserva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Trip Details Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 border border-border rounded-xl animate-pulse"
              >
                <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <div className="p-6 border border-border rounded-xl animate-pulse">
              <div className="h-8 bg-muted rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-14 bg-muted rounded"></div>
                <div className="h-14 bg-muted rounded"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-muted rounded flex-1"></div>
                  <div className="h-10 bg-muted rounded flex-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
