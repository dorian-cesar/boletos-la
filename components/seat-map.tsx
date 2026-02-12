"use client";

import { useState, useEffect } from "react";
import { Seat, generateSeats, useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { User, Crown, Star, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SeatMapProps {
  tripId: string;
  isReturn?: boolean;
}

export function SeatMap({ tripId, isReturn = false }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [activeFloor, setActiveFloor] = useState(1);
  const [showMaxAlert, setShowMaxAlert] = useState(false);

  const {
    selectedSeats,
    selectedReturnSeats,
    addSeat,
    removeSeat,
    addReturnSeat,
    removeReturnSeat,
  } = useBookingStore();

  const currentSelectedSeats = isReturn ? selectedReturnSeats : selectedSeats;

  useEffect(() => {
    const floor1Seats = generateSeats(tripId, 1);
    const floor2Seats = generateSeats(tripId, 2);
    setSeats([...floor1Seats, ...floor2Seats]);
  }, [tripId]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "occupied") {
      return;
    }

    const isSelected = currentSelectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      isReturn ? removeReturnSeat(seat.id) : removeSeat(seat.id);
      if (showMaxAlert) setShowMaxAlert(false);
    } else {
      if (currentSelectedSeats.length >= 4) {
        setShowMaxAlert(true);
        setTimeout(() => setShowMaxAlert(false), 3000);
        return;
      }

      isReturn ? addReturnSeat(seat) : addSeat(seat);
    }
  };

  const floorSeats = seats.filter((s) => s.floor === activeFloor);
  const rows = [...new Set(floorSeats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-background/20">
      {/* Alert para límite máximo */}
      {showMaxAlert && (
        <Alert variant="destructive" className="mb-4 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Solo puedes seleccionar un máximo de 4 asientos por reserva.
          </AlertDescription>
        </Alert>
      )}

      {/* Floor Selector */}
      <div className="flex justify-center gap-3 mb-8">
        {[1, 2].map((floor) => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 border",
              activeFloor === floor
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-primary"
                : "bg-background/10 text-background/80 hover:bg-background/20 border-background/30",
            )}
          >
            {floor === 1 ? "Piso Inferior" : "Piso Superior"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-background/10 border border-background/30" />
          <span className="text-xs md:text-sm text-background/60">
            Disponible
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-primary border border-primary/50" />
          <span className="text-xs md:text-sm text-background/60">
            Seleccionado
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-background/20 border border-background/40" />
          <span className="text-xs md:text-sm text-background/60">Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Crown className="h-3.5 w-3.5 md:h-5 md:w-5 text-secondary" />
          <span className="text-xs md:text-sm text-background/60">VIP</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <Star className="h-3.5 w-3.5 md:h-5 md:w-5 text-primary" />
          <span className="text-xs md:text-sm text-background/60">Cama</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-background/20 border border-background/40" />
          <span className="text-xs md:text-sm text-background/60">Semi</span>
        </div>
      </div>

      {/* Bus Shape */}
      <div className="relative max-w-md mx-auto">
        {/* Bus Front */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-12 bg-background/20 rounded-t-3xl flex items-center justify-center border border-background/30">
            <span className="text-background text-sm font-medium">
              Conductor
            </span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="bg-background/10 rounded-3xl p-6 border-4 border-background/30 relative">
          {/* Row Numbers */}
          <div className="absolute left-0 top-0 h-full flex flex-col pt-6 pb-6 pl-2">
            {rows.map((row, index) => (
              <div
                key={row}
                className="flex items-center"
                style={{
                  height: "48px",
                  marginBottom: index === rows.length - 1 ? "0" : "12px",
                }}
              >
                <span className="text-xs font-medium text-background/60 w-4 text-center">
                  {row}
                </span>
              </div>
            ))}
          </div>

          {rows.map((row) => {
            const rowSeats = floorSeats
              .filter((s) => s.row === row)
              .sort((a, b) => a.column - b.column);
            const leftSeats = rowSeats.filter((s) => s.column <= 2);
            const rightSeats = rowSeats.filter((s) => s.column > 2);

            return (
              <div
                key={row}
                className="flex items-center justify-center gap-8 mb-3"
              >
                {/* Left Side */}
                <div className="flex gap-2">
                  {leftSeats.map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={currentSelectedSeats.some(
                        (s) => s.id === seat.id,
                      )}
                      isDisabled={
                        currentSelectedSeats.length >= 4 &&
                        !currentSelectedSeats.some((s) => s.id === seat.id)
                      }
                      onClick={() => handleSeatClick(seat)}
                    />
                  ))}
                </div>

                {/* Aisle */}
                <div className="w-8 flex items-center justify-center">
                  <div className="w-full h-1 bg-background/30 rounded" />
                </div>

                {/* Right Side */}
                <div className="flex gap-2">
                  {rightSeats.map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      isSelected={currentSelectedSeats.some(
                        (s) => s.id === seat.id,
                      )}
                      isDisabled={
                        currentSelectedSeats.length >= 4 &&
                        !currentSelectedSeats.some((s) => s.id === seat.id)
                      }
                      onClick={() => handleSeatClick(seat)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bus Back */}
        <div className="flex justify-center mt-4">
          <div className="w-48 h-8 bg-background/20 rounded-b-xl flex items-center justify-center border border-background/30">
            <span className="text-background/60 text-xs">Parte trasera</span>
          </div>
        </div>
      </div>

      {/* Selection Counter - AHORA ABAJO */}
      <div className="mt-8 p-4 bg-background/10 rounded-xl border border-background/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-background/60">Asientos seleccionados</p>
            <p
              className={cn(
                "font-bold text-2xl text-background transition-colors duration-300",
                currentSelectedSeats.length > 4
                  ? "text-destructive animate-pulse"
                  : "text-primary",
              )}
            >
              {currentSelectedSeats.length}
              <span className="text-base font-normal text-background/60 ml-1">
                /4
              </span>
            </p>
          </div>
          {currentSelectedSeats.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-background/60">Total seleccionado</p>
              <p className="font-bold text-lg text-secondary">
                Gs.{" "}
                {currentSelectedSeats
                  .reduce((acc, seat) => acc + seat.price, 0)
                  .toLocaleString("es-PY")}
              </p>
            </div>
          )}
        </div>

        {/* Selected seats badges */}
        {currentSelectedSeats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-background/20">
            <div className="flex flex-wrap gap-2">
              {currentSelectedSeats.map((seat) => (
                <button
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/80 transition-colors duration-200 flex items-center gap-1 group"
                  title="Haz clic para deseleccionar"
                >
                  <span>{seat.number}</span>
                  <span className="opacity-80 group-hover:opacity-100">×</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

function SeatButton({
  seat,
  isSelected,
  isDisabled = false,
  onClick,
}: SeatButtonProps) {
  const isOccupied = seat.status === "occupied";

  return (
    <button
      onClick={onClick}
      disabled={isOccupied || (isDisabled && !isSelected)}
      className={cn(
        "relative w-12 h-12 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center group",
        isOccupied &&
          "bg-background/20 cursor-not-allowed border border-background/40",
        isDisabled &&
          !isOccupied &&
          !isSelected &&
          "bg-background/5 cursor-not-allowed border border-background/20 opacity-50",
        !isOccupied &&
          !isSelected &&
          !isDisabled &&
          seat.type === "vip" &&
          "bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/20",
        !isOccupied &&
          !isSelected &&
          !isDisabled &&
          seat.type === "premium" &&
          "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/50 hover:border-primary hover:bg-primary/20",
        !isOccupied &&
          !isSelected &&
          !isDisabled &&
          seat.type === "standard" &&
          "bg-background/10 border-2 border-background/30 hover:border-primary hover:bg-primary/10",
        isSelected &&
          seat.type === "vip" &&
          "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/30 transform scale-110 border border-secondary",
        isSelected &&
          seat.type === "premium" &&
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 transform scale-110 border border-primary",
        isSelected &&
          seat.type === "standard" &&
          "bg-primary text-primary-foreground shadow-lg transform scale-110 border border-primary",
      )}
      title={
        isDisabled && !isOccupied && !isSelected
          ? "Límite máximo alcanzado (4 asientos)"
          : `Asiento ${seat.number} - ${seat.type === "vip" ? "VIP" : seat.type === "premium" ? "Cama" : "Semi"} - Gs. ${seat.price.toLocaleString("es-PY")}`
      }
    >
      {isOccupied ? (
        <User className="h-5 w-5 text-background/60" />
      ) : (
        <>
          <span
            className={cn(
              "font-medium",
              isSelected ? "text-primary-foreground" : "text-background",
            )}
          >
            {seat.number}
          </span>
          {seat.type === "vip" && (
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-secondary" />
          )}
          {seat.type === "premium" && !isSelected && (
            <Star className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
          )}

          {isDisabled && !isOccupied && !isSelected && (
            <div className="absolute inset-0 bg-black/20 rounded-lg" />
          )}

          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-accent text-background-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-background/20">
              {isDisabled && !isOccupied && !isSelected
                ? "Límite máximo"
                : `Gs. ${seat.price.toLocaleString("es-PY")}`}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background mx-auto" />
          </div>
        </>
      )}
    </button>
  );
}
