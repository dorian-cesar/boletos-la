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
    <div className="bg-gradient-to-b from-[#1a2332] to-[#0f1419] border-b border-background/10 sticky top-0 z-40">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-start justify-between max-w-3xl mx-auto">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              {/* Step */}
              <div className="flex flex-col items-center min-h-[72px]">
                {/* Circle wrapper con altura fija → baseline consistente */}
                <div className="h-12 flex items-center justify-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 border-background/20",
                      step > s.id
                        ? "bg-primary text-primary-foreground"
                        : step === s.id
                          ? "bg-secondary text-secondary-foreground animate-pulse-glow shadow-lg shadow-secondary/30"
                          : "bg-background/10 text-background/60",
                    )}
                  >
                    {step > s.id ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <s.icon className="h-6 w-6" />
                    )}
                  </div>
                </div>

                {/* Label con altura controlada */}
                <div className="h-5 mt-2 flex items-start">
                  <span
                    className={cn(
                      "text-xs font-medium text-center hidden sm:block transition-colors duration-300",
                      step >= s.id ? "text-background" : "text-background/60",
                    )}
                  >
                    {s.name}
                  </span>
                </div>
              </div>

              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="w-12 sm:w-24 lg:w-32 h-1 mx-2 rounded-full overflow-hidden bg-background/10">
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
