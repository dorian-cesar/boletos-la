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
      // SIN LÍMITE - puede seleccionar todos los asientos que quiera
      isReturn ? addReturnSeat(seat) : addSeat(seat);
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
          <span className="text-sm text-muted-foreground">Ejecutivo VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Cama Ejecutivo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-muted/80 border-2 border-muted-foreground/30" />
          <span className="text-sm text-muted-foreground">Semi Cama</span>
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
          {/* Row Numbers on Left */}
          <div className="absolute left-4 top-6 flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row} className="h-12 flex items-center">
                <span className="text-xs text-muted-foreground font-medium">
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
                  <div className="w-full h-1 bg-muted-foreground/20 rounded" />
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
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-sm text-muted-foreground">Total seleccionado:</p>
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
        isOccupied && "bg-foreground/20 cursor-not-allowed",
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
          "bg-muted border-2 border-border hover:border-primary hover:bg-primary/10",
        isSelected &&
          seat.type === "vip" &&
          "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-lg shadow-secondary/30 transform scale-110",
        isSelected &&
          seat.type === "premium" &&
          "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30 transform scale-110",
        isSelected &&
          seat.type === "standard" &&
          "bg-primary text-primary-foreground shadow-lg transform scale-110",
      )}
      title={`Asiento ${seat.number} - ${seat.type === "vip" ? "Ejecutivo VIP" : seat.type === "premium" ? "Cama Ejecutivo" : "Semi Cama"} - Gs. ${seat.price.toLocaleString("es-PY")}`}
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
          {/* Price tooltip on hover */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
              Gs. {seat.price.toLocaleString("es-PY")}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground mx-auto"></div>
          </div>
        </>
      )}
    </button>
  );
}
