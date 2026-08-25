"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
import { useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function BookingTimer() {
  const { step, bookingExpiresAt, setBookingExpiresAt, selectedSeats, selectedReturnSeats } = useBookingStore();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

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
      if (!showExpiredModal) {
        setShowExpiredModal(true);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showExpiredModal]);

  const handleExpireModalClose = () => {
    setShowExpiredModal(false);
    setBookingExpiresAt(null);
    router.push("/paraguay/booking/services");
  };

  if (timeLeft === null && !showExpiredModal) return null;

  return (
    <>
      {timeLeft !== null && timeLeft > 0 && (
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
      )}

      <AlertDialog open={showExpiredModal} onOpenChange={setShowExpiredModal}>
        <AlertDialogContent className="max-w-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl">Tiempo Expirado</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base">
              El tiempo de 10 minutos asignado para realizar tu reserva ha expirado. Por seguridad y para liberar los asientos, serás redirigido al inicio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center mt-6">
            <AlertDialogAction onClick={handleExpireModalClose} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
