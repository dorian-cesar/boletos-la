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
    passengers,
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
    console.log("Seat clicked:", seat.number, "Status:", seat.status);

    if (seat.status === "occupied") {
      console.log("Seat is occupied");
      return;
    }

    const isSelected = currentSelectedSeats.some((s) => s.id === seat.id);
    console.log("Is already selected?", isSelected);

    if (isSelected) {
      console.log("Removing seat:", seat.id);
      isReturn ? removeReturnSeat(seat.id) : removeSeat(seat.id);
    } else {
      console.log("Attempting to add seat");
      if (currentSelectedSeats.length < passengers) {
        console.log("Adding seat:", seat.id);
        isReturn ? addReturnSeat(seat) : addSeat(seat);
      } else {
        console.log("Max capacity reached");
        alert(`Máximo ${passengers} asiento(s) para ${passengers} pasajero(s)`);
      }
    }
  };

  const floorSeats = seats.filter((s) => s.floor === activeFloor);
  const rows = [...new Set(floorSeats.map((s) => s.row))].sort((a, b) => a - b);

  return (
    <div className="bg-background rounded-2xl p-6 shadow-lg border border-border">
      {/* Floor Selector */}
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2].map((floor) => (
          <button
            key={floor}
            onClick={() => setActiveFloor(floor)}
            className={cn(
              "px-6 py-3 rounded-xl font-medium transition-all duration-300",
              activeFloor === floor
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {floor === 1 ? "Piso Inferior" : "Piso Superior"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted border-2 border-border" />
          <span className="text-sm text-muted-foreground">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary" />
          <span className="text-sm text-muted-foreground">Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-foreground/20" />
          <span className="text-sm text-muted-foreground">Ocupado</span>
        </div>
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-secondary" />
          <span className="text-sm text-muted-foreground">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Premium</span>
        </div>
      </div>

      {/* Bus Shape */}
      <div className="relative max-w-md mx-auto">
        {/* Bus Front */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-12 bg-foreground rounded-t-3xl flex items-center justify-center">
            <span className="text-background text-sm font-medium">
              Conductor
            </span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="bg-muted/50 rounded-3xl p-6 border-4 border-foreground/20">
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
                  <span className="text-xs text-muted-foreground">{row}</span>
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
          <div className="w-48 h-8 bg-foreground/20 rounded-b-xl flex items-center justify-center">
            <span className="text-muted-foreground text-xs">Parte trasera</span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      <div className="mt-8 p-4 bg-muted/50 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Asientos seleccionados
            </p>
            <p className="font-semibold text-foreground">
              {currentSelectedSeats.length} de {passengers}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSelectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium animate-scale-in"
              >
                {seat.number}
              </span>
            ))}
          </div>
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
        "relative w-12 h-12 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center",
        isOccupied && "bg-foreground/20 cursor-not-allowed",
        !isOccupied &&
          !isSelected &&
          "bg-muted border-2 border-border hover:border-primary hover:bg-primary/10",
        isSelected &&
          "bg-primary text-primary-foreground shadow-lg transform scale-110",
        seat.type === "vip" && !isOccupied && !isSelected && "border-secondary",
        seat.type === "premium" &&
          !isOccupied &&
          !isSelected &&
          "border-primary/50",
      )}
    >
      {isOccupied ? (
        <User className="h-5 w-5 text-muted-foreground" />
      ) : (
        <>
          {seat.number}
          {seat.type === "vip" && (
            <Crown className="absolute -top-1 -right-1 h-4 w-4 text-secondary" />
          )}
          {seat.type === "premium" && !isSelected && (
            <Star className="absolute -top-1 -right-1 h-3 w-3 text-primary" />
          )}
        </>
      )}
    </button>
  );
}
