"use client";

import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { Check, Bus, Users, CreditCard, Ticket } from "lucide-react";

const steps = [
  { id: 1, name: "Seleccionar Servicio", icon: Bus },
  { id: 2, name: "Elegir Asientos", icon: Users },
  { id: 3, name: "Datos y Pago", icon: CreditCard },
  { id: 4, name: "Confirmación", icon: Ticket },
];

export function BookingProgress() {
  const { step } = useBookingStore();

  return (
    <div className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                    step > s.id
                      ? "bg-primary text-primary-foreground"
                      : step === s.id
                        ? "bg-secondary text-secondary-foreground animate-pulse-glow"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {step > s.id ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    <s.icon className="h-6 w-6" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center hidden sm:block transition-colors duration-300",
                    step >= s.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.name}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-12 sm:w-24 lg:w-32 h-1 mx-2 rounded-full overflow-hidden bg-muted">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-700 ease-out",
                      step > s.id ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
