import { useState, useEffect } from "react";
import { Seat, useBookingStore } from "@/lib/booking-store";
import { useSeats } from "@/lib/hooks/use-seats";
import { cn } from "@/lib/utils";
import { User, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SeatMapProps {
  tripId: string;
  isReturn?: boolean;
}

export function SeatMap({ tripId, isReturn = false }: SeatMapProps) {
  const [activeFloor, setActiveFloor] = useState(1);
  const [showMaxAlert, setShowMaxAlert] = useState(false);

  const {
    selectedSeats,
    selectedReturnSeats,
    addSeat,
    removeSeat,
    addReturnSeat,
    removeReturnSeat,
    selectedOutboundTrip,
    selectedReturnTrip,
    failedSeats,
  } = useBookingStore();

  const currentTrip = isReturn ? selectedReturnTrip : selectedOutboundTrip;

  const {
    seats: realSeats,
    loading,
    error,
  } = useSeats({
    serviceId: currentTrip?.id || "",
    originId: currentTrip?.origin || "",
    destinationId: currentTrip?.destination || "",
  });

  const currentSelectedSeats = isReturn ? selectedReturnSeats : selectedSeats;

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "occupied") {
      return;
    }

    const isSelected = currentSelectedSeats.some((s) => s.id === seat.id);

    if (isSelected) {
      isReturn ? removeReturnSeat(seat.id) : removeSeat(seat.id);
      if (showMaxAlert) setShowMaxAlert(false);
    } else {
      const maxAllowed = isReturn ? selectedSeats.length : 4;
      if (currentSelectedSeats.length >= maxAllowed) {
        setShowMaxAlert(true);
        setTimeout(() => setShowMaxAlert(false), 3000);
        return;
      }

      // Asegurar que el asiento tenga el precio del viaje si no viene del API
      const seatWithPrice = {
        ...seat,
        price: seat.price || currentTrip?.price || 0,
      };

      isReturn ? addReturnSeat(seatWithPrice) : addSeat(seatWithPrice);
    }
  };

  if (loading) {
    return (
      <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-12 flex flex-col items-center justify-center border border-black/10 dark:border-white/20">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-slate-900 dark:text-white/60">Cargando mapa de asientos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-black/10 dark:border-white/20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No se pudo cargar el mapa de asientos: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentTripFailed = currentTrip ? failedSeats[currentTrip.id] || [] : [];

  const floorSeats = realSeats
    .map((s) => {
      if (currentTripFailed.includes(s.number)) {
        return { ...s, status: "occupied" as const };
      }
      return s;
    })
    .filter((s) => s.floor === activeFloor);

  const rows = [...new Set(floorSeats.map((s) => s.row))].sort((a, b) => a - b);
  const maxColumns =
    floorSeats.length > 0 ? Math.max(...floorSeats.map((s) => s.column)) : 4;

  return (
    <div className="bg-black/5 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-black/10 dark:border-white/20">
      {/* Alert para límite máximo */}
      {showMaxAlert && (
        <Alert variant="destructive" className="mb-4 animate-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isReturn 
              ? `Solo puedes seleccionar un máximo de ${selectedSeats.length} asiento(s) de vuelta (igual a la ida).`
              : "Solo puedes seleccionar un máximo de 4 asientos por reserva."}
          </AlertDescription>
        </Alert>
      )}

      {/* Floor Selector */}
      {realSeats.some((s) => s.floor === 2) && (
        <div className="flex justify-center gap-3 mb-8">
          {[2, 1].map((floor) => (
            <button
              key={floor}
              onClick={() => setActiveFloor(floor)}
              className={cn(
                "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 border",
                activeFloor === floor
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-primary"
                  : "bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white/80 hover:bg-black/20 dark:bg-white/20 border-black/15 dark:border-white/30",
              )}
            >
              {floor === 1 ? "Piso Superior" : "Piso Inferior"}
            </button>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-8">
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-black/10 dark:bg-white/10 border border-black/15 dark:border-white/30" />
          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60">
            Disponible
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-primary border border-primary/50" />
          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60">
            Seleccionado
          </span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-orange-500/80 border border-orange-600" />
          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60">Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="w-4 h-4 md:w-6 md:h-6 rounded bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/20 opacity-50" />
          <span className="text-xs md:text-sm text-slate-900 dark:text-white/60">
            No disponible
          </span>
        </div>
      </div>

      {/* Bus Shape */}
      <div className="relative max-w-md mx-auto">
        {/* Bus Front */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-12 bg-black/20 dark:bg-white/20 rounded-t-3xl flex items-center justify-center border border-black/15 dark:border-white/30">
            <span className="text-slate-900 dark:text-white text-sm font-medium">
              Conductor
            </span>
          </div>
        </div>

        {/* Seats Grid */}
        <div className="bg-black/10 dark:bg-white/10 rounded-3xl p-6 border-4 border-black/15 dark:border-white/30 relative">
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
                <span className="text-xs font-medium text-slate-900 dark:text-white/60 w-4 text-center">
                  {row}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const rowSeats = floorSeats.filter((s) => s.row === row);

              return (
                <div
                  key={row}
                  className="grid gap-1.5 sm:gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`,
                    justifyItems: "center",
                  }}
                >
                  {rowSeats.map((seat) => (
                    <div key={seat.id} style={{ gridColumn: seat.column }}>
                      <SeatButton
                        seat={seat}
                        isSelected={currentSelectedSeats.some(
                          (s) => s.id === seat.id,
                        )}
                        isDisabled={
                          currentSelectedSeats.length >= (isReturn ? selectedSeats.length : 4) &&
                          !currentSelectedSeats.some((s) => s.id === seat.id)
                        }
                        maxLimit={isReturn ? selectedSeats.length : 4}
                        onClick={() => handleSeatClick(seat)}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bus Back */}
        <div className="flex justify-center mt-4">
          <div className="w-48 h-8 bg-black/20 dark:bg-white/20 rounded-b-xl flex items-center justify-center border border-black/15 dark:border-white/30">
            <span className="text-slate-900 dark:text-white/60 text-xs">Parte trasera</span>
          </div>
        </div>
      </div>

      {/* Selection Counter */}
      <div className="mt-8 p-4 bg-black/10 dark:bg-white/10 rounded-xl border border-black/10 dark:border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-900 dark:text-white/60">Asientos seleccionados</p>
            <p
              className={cn(
                "font-bold text-2xl text-primary transition-colors duration-300",
                currentSelectedSeats.length > (isReturn ? selectedSeats.length : 4) &&
                  "text-destructive animate-pulse",
              )}
            >
              {currentSelectedSeats.length}
              <span className="text-base font-normal text-slate-900 dark:text-white/60 ml-1">
                /{isReturn ? selectedSeats.length : 4}
              </span>
            </p>
          </div>
          {currentSelectedSeats.length > 0 && (
            <div className="text-right">
              <p className="text-sm text-slate-900 dark:text-white/60">Total seleccionado</p>
              <p className="font-bold text-lg text-secondary">
                Gs.{" "}
                {currentSelectedSeats
                  .reduce(
                    (acc, seat) =>
                      acc + (seat.price || currentTrip?.price || 0),
                    0,
                  )
                  .toLocaleString("es-PY")}
              </p>
            </div>
          )}
        </div>

        {/* Selected seats badges */}
        {currentSelectedSeats.length > 0 && (
          <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/20">
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
  maxLimit?: number;
  onClick: () => void;
}

function SeatButton({
  seat,
  isSelected,
  isDisabled = false,
  maxLimit = 4,
  onClick,
}: SeatButtonProps) {
  const isOccupied = seat.status === "occupied";
  const isBlocked = seat.status === "blocked";
  const { selectedOutboundTrip, selectedReturnTrip } = useBookingStore();

  // No podemos saber en el botón si es ida o vuelta fácilmente sin props,
  // pero podemos usar el precio que ya trae el objeto seat o el de los viajes
  const price =
    seat.price || selectedOutboundTrip?.price || selectedReturnTrip?.price || 0;

  return (
    <button
      onClick={onClick}
      disabled={isOccupied || isBlocked || (isDisabled && !isSelected)}
      className={cn(
        "relative w-10 h-10 md:w-12 md:h-12 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center group",
        isOccupied &&
          "bg-orange-500/80 cursor-not-allowed border border-orange-600",
        isBlocked &&
          "bg-black/5 dark:bg-white/5 cursor-not-allowed border border-black/10 dark:border-white/20 opacity-50",
        isDisabled &&
          !isOccupied &&
          !isBlocked &&
          !isSelected &&
          "bg-black/5 dark:bg-white/5 cursor-not-allowed border border-black/10 dark:border-white/20 opacity-50",
        !isOccupied &&
          !isBlocked &&
          !isSelected &&
          !isDisabled &&
          "bg-black/10 dark:bg-white/10 border-2 border-black/15 dark:border-white/30 hover:border-primary hover:bg-primary/10",
        isSelected && !isOccupied && !isBlocked &&
          "bg-primary text-primary-foreground shadow-lg transform scale-110 border border-primary",
      )}
      title={
        isBlocked
          ? "No disponible"
          : isDisabled && !isOccupied && !isSelected
            ? `Límite máximo alcanzado (${maxLimit} asientos)`
            : `Asiento ${seat.number} - Gs. ${price.toLocaleString("es-PY")}`
      }
    >
      {isOccupied ? (
        <User className="h-5 w-5 text-slate-900 dark:text-white" />
      ) : (
        <>
          <span
            className={cn(
              "font-medium",
              isSelected ? "text-primary-foreground" : "text-slate-900 dark:text-white",
            )}
          >
            {seat.number}
          </span>

          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="bg-accent text-slate-900 dark:text-white-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-black/10 dark:border-white/20">
              {isBlocked
                ? "No disponible"
                : isDisabled && !isOccupied && !isSelected
                  ? "Límite máximo"
                  : `Gs. ${price.toLocaleString("es-PY")}`}
            </div>
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background mx-auto" />
          </div>
        </>
      )}
    </button>
  );
}
