"use client";

import { useState, useEffect } from "react";
import { Seat, generateSeats, useBookingStore } from "@/lib/booking-store";
import { cn } from "@/lib/utils";
import { User, Crown, Star } from "lucide-react";

interface SeatMapProps {
  tripId: string;
  isReturn?: boolean;
}

export function SeatMap({ tripId, isReturn = false }: SeatMapProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [activeFloor, setActiveFloor] = useState(1);

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
    console.log("Asiento clickeado:", seat.number, "Estado:", seat.status);

    if (seat.status === "occupied") {
      console.log("Asiento está ocupado");
      return;
    }

    const isSelected = currentSelectedSeats.some((s) => s.id === seat.id);
    console.log("¿Ya está seleccionado?", isSelected);

    if (isSelected) {
      console.log("Removiendo asiento:", seat.id);
      isReturn ? removeReturnSeat(seat.id) : removeSeat(seat.id);
    } else {
      console.log("Agregando asiento:", seat.id);
      isReturn ? addReturnSeat(seat) : addSeat(seat);
    }
  };

  const floorSeats = seats.filter((s) => s.floor === activeFloor);
  const rows = [...new Set(floorSeats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-background/20">
      {/* Floor Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2].map((floor) => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300 border",
              activeFloor === floor
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105 border-primary"
                : "bg-background/10 text-background/80 hover:bg-background/20 border-background/30",
            )}
          >
            {floor === 1 ? "Piso Inferior" : "Piso Superior"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background/10 border-2 border-background/30" />
          <span className="text-sm text-background/60">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary border border-primary/50" />
          <span className="text-sm text-background/60">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background/20 border border-background/40" />
          <span className="text-sm text-background/60">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-secondary" />
          <span className="text-sm text-background/60">Ejecutivo VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-sm text-background/60">Cama Ejecutivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-background/20 border-2 border-background/40" />
          <span className="text-sm text-background/60">Semi Cama</span>
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
        <div className="bg-background/10 rounded-3xl p-6 border-4 border-background/30">
          {/* Row Numbers on Left */}
          <div className="absolute left-4 top-6 flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row} className="h-12 flex items-center">
                <span className="text-xs text-background/60 font-medium">
                  Fila {row}
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

      {/* Selection Summary */}
      <div className="mt-8 p-4 bg-background/10 rounded-xl border border-background/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-background/60">Asientos seleccionados</p>
            <p className="font-semibold text-background">
              {currentSelectedSeats.length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSelectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium animate-scale-in"
              >
                {seat.number} - Gs. {seat.price.toLocaleString("es-PY")}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-background/20">
          <p className="text-sm text-background/60">Total seleccionado:</p>
          <p className="font-bold text-lg text-secondary">
            Gs.{" "}
            {currentSelectedSeats
              .reduce((acc, seat) => acc + seat.price, 0)
              .toLocaleString("es-PY")}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  onClick: () => void;
}

function SeatButton({ seat, isSelected, onClick }: SeatButtonProps) {
  const isOccupied = seat.status === "occupied";

  return (
    <button
      onClick={onClick}
      disabled={isOccupied}
      className={cn(
        "relative w-12 h-12 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center group",
        isOccupied &&
          "bg-background/20 cursor-not-allowed border border-background/40",
        !isOccupied &&
          !isSelected &&
          seat.type === "vip" &&
          "bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/50 hover:border-secondary hover:bg-secondary/20",
        !isOccupied &&
          !isSelected &&
          seat.type === "premium" &&
          "bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/50 hover:border-primary hover:bg-primary/20",
        !isOccupied &&
          !isSelected &&
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
      title={`Asiento ${seat.number} - ${seat.type === "vip" ? "Ejecutivo VIP" : seat.type === "premium" ? "Cama Ejecutivo" : "Semi Cama"} - Gs. ${seat.price.toLocaleString("es-PY")}`}
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
          {/* Price tooltip on hover */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-background text-background-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-background/20">
              Gs. {seat.price.toLocaleString("es-PY")}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background mx-auto"></div>
          </div>
        </>
      )}
    </button>
  );
}
