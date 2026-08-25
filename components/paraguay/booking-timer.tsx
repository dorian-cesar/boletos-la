"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";

export function BookingTimer() {
  const { step, bookingExpiresAt, setBookingExpiresAt, selectedSeats, selectedReturnSeats } = useBookingStore();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (step > 1 && step < 5) {
      if (selectedSeats.length > 0 || selectedReturnSeats.length > 0) {
        if (!bookingExpiresAt) {
          const expiresAt = Date.now() + 10 * 60 * 1000;
          setBookingExpiresAt(expiresAt);
          setTimeLeft(10 * 60);
        } else {
          const remaining = Math.max(0, Math.floor((bookingExpiresAt - Date.now()) / 1000));
          setTimeLeft(remaining);
        }
      } else {
        setTimeLeft(null);
        if (bookingExpiresAt) {
          setBookingExpiresAt(null);
        }
      }
    } else {
      setTimeLeft(null);
      if (step === 1 || step === 5) {
        setBookingExpiresAt(null);
      }
    }
  }, [step, bookingExpiresAt, setBookingExpiresAt, selectedSeats.length, selectedReturnSeats.length]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      alert("El tiempo para reservar ha expirado. Serás redirigido al inicio.");
      setBookingExpiresAt(null);
      router.push("/paraguay/booking/services");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, router, setBookingExpiresAt]);

  if (timeLeft === null) return null;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold transition-colors duration-300 shrink-0",
        timeLeft < 180
          ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          : "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
      )}
      title="Tiempo restante para completar la reserva"
    >
      <Clock className="w-3.5 h-3.5 shrink-0" />
      <span className="tabular-nums font-bold">
        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
}
