"use client";

import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { Check, Bus, Users, CreditCard, Ticket } from "lucide-react";

const steps = [
  { id: 1, name: "Servicio", icon: Bus },
  { id: 2, name: "Asientos", icon: Users },
  { id: 3, name: "Datos y Pago", icon: CreditCard },
  { id: 4, name: "Confirmación", icon: Ticket },
];

export function BookingProgress() {
  const { step } = useBookingStore();

  return (
    <div className="bg-gradient-to-b from-[#1a2332] to-[#0f1419] border-b border-background/10 sticky top-0 z-40 w-full overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-secondary/10 rounded-full blur-[60px] md:blur-[100px]" />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4 md:py-6 relative z-10 w-full">
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto gap-1 sm:gap-2">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center flex-1 min-w-0">
              {/* Step */}
              <div className="flex flex-col items-center w-full">
                {/* Circle - Tamaños responsive */}
                <div className="flex items-center justify-center">
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full transition-all duration-500 border-2 border-background/20",
                      "w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12",
                      step > s.id
                        ? "bg-primary text-primary-foreground"
                        : step === s.id
                          ? "bg-secondary text-secondary-foreground animate-pulse-glow shadow-lg shadow-secondary/30"
                          : "bg-background/10 text-background/60",
                    )}
                  >
                    {step > s.id ? (
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                    ) : (
                      <s.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                    )}
                  </div>
                </div>

                {/* Label - Visible solo desde sm en adelante, truncado */}
                <span
                  className={cn(
                    "text-[10px] sm:text-xs md:text-sm font-medium text-center transition-colors duration-300 mt-1 sm:mt-2",
                    "hidden sm:block truncate max-w-[60px] xs:max-w-[80px] md:max-w-[100px] lg:max-w-none",
                    step >= s.id ? "text-background" : "text-background/60",
                  )}
                >
                  {s.name}
                </span>
              </div>

              {/* Connector - Responsive */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-0.5 sm:mx-1 md:mx-2 min-w-[8px]">
                  <div className="h-0.5 sm:h-1 rounded-full overflow-hidden bg-background/10 w-full">
                    <div
                      className={cn(
                        "h-full bg-primary transition-all duration-700 ease-out",
                        step > s.id ? "w-full" : "w-0",
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Indicador de paso actual - Solo visible en mobile */}
        <div className="block sm:hidden text-center mt-2">
          <span className="text-xs text-background/80">
            Paso {step} de 4:{" "}
            <span className="text-secondary font-medium">
              {steps[step - 1]?.name}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
