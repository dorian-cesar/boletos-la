import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  busType: string;
  company: string;
  amenities: string[];
  availableSeats: number;
}

export interface Seat {
  id: string;
  number: string;
  row: number;
  column: number;
  floor: number;
  type: "normal" | "premium" | "vip";
  status: "available" | "occupied" | "selected";
  price: number;
}

export interface Passenger {
  seatId: string;
  seatNumber: string;
  firstName: string;
  lastName: string;
  rut: string;
  email: string;
  phone: string;
}

export interface BookingState {
  step: number;
  tripType: "one-way" | "round-trip";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  selectedOutboundTrip: Trip | null;
  selectedReturnTrip: Trip | null;
  selectedSeats: Seat[];
  selectedReturnSeats: Seat[];
  passengerDetails: Passenger[];
  totalPrice: number;
  bookingReference: string;
  paymentStatus: "pending" | "processing" | "completed" | "failed";

  setStep: (step: number) => void;
  setTripType: (type: "one-way" | "round-trip") => void;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  setDepartureDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPassengers: (count: number) => void;
  setSelectedOutboundTrip: (trip: Trip | null) => void;
  setSelectedReturnTrip: (trip: Trip | null) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  addReturnSeat: (seat: Seat) => void;
  removeReturnSeat: (seatId: string) => void;
  setPassengerDetails: (details: Passenger[]) => void;
  updatePassenger: (index: number, data: Partial<Passenger>) => void;
  calculateTotal: () => void;
  setBookingReference: (ref: string) => void;
  setPaymentStatus: (
    status: "pending" | "processing" | "completed" | "failed",
  ) => void;
  resetBooking: () => void;
}

const initialState = {
  step: 1,
  tripType: "one-way" as const,
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  passengers: 1,
  selectedOutboundTrip: null,
  selectedReturnTrip: null,
  selectedSeats: [],
  selectedReturnSeats: [],
  passengerDetails: [],
  totalPrice: 0,
  bookingReference: "",
  paymentStatus: "pending" as const,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      setTripType: (tripType) => set({ tripType }),
      setOrigin: (origin) => set({ origin }),
      setDestination: (destination) => set({ destination }),
      setDepartureDate: (departureDate) => set({ departureDate }),
      setReturnDate: (returnDate) => set({ returnDate }),
      setPassengers: (passengers) => set({ passengers }),
      setSelectedOutboundTrip: (selectedOutboundTrip) =>
        set({ selectedOutboundTrip }),
      setSelectedReturnTrip: (selectedReturnTrip) =>
        set({ selectedReturnTrip }),

      addSeat: (seat) => {
        const { selectedSeats, passengers } = get();
        if (selectedSeats.length < passengers) {
          set({ selectedSeats: [...selectedSeats, seat] });
          get().calculateTotal();
        }
      },

      removeSeat: (seatId) => {
        const { selectedSeats } = get();
        set({ selectedSeats: selectedSeats.filter((s) => s.id !== seatId) });
        get().calculateTotal();
      },

      addReturnSeat: (seat) => {
        const { selectedReturnSeats, passengers } = get();
        if (selectedReturnSeats.length < passengers) {
          set({ selectedReturnSeats: [...selectedReturnSeats, seat] });
          get().calculateTotal();
        }
      },

      removeReturnSeat: (seatId) => {
        const { selectedReturnSeats } = get();
        set({
          selectedReturnSeats: selectedReturnSeats.filter(
            (s) => s.id !== seatId,
          ),
        });
        get().calculateTotal();
      },

      setPassengerDetails: (passengerDetails) => set({ passengerDetails }),

      updatePassenger: (index, data) => {
        const { passengerDetails } = get();
        const updated = [...passengerDetails];
        updated[index] = { ...updated[index], ...data };
        set({ passengerDetails: updated });
      },

      calculateTotal: () => {
        const {
          selectedOutboundTrip,
          selectedReturnTrip,
          selectedSeats,
          selectedReturnSeats,
        } = get();
        let total = 0;

        if (selectedOutboundTrip) {
          total += selectedSeats.reduce((acc, seat) => acc + seat.price, 0);
        }

        if (selectedReturnTrip) {
          total += selectedReturnSeats.reduce(
            (acc, seat) => acc + seat.price,
            0,
          );
        }

        set({ totalPrice: total });
      },

      setBookingReference: (bookingReference) => set({ bookingReference }),
      setPaymentStatus: (paymentStatus) => set({ paymentStatus }),

      resetBooking: () => set(initialState),
    }),
    {
      name: "booking-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Sample data
export const cities = [
  { id: "asu", name: "Asunción", department: "Capital" },
  { id: "cde", name: "Ciudad del Este", department: "Alto Paraná" },
  { id: "enc", name: "Encarnación", department: "Itapúa" },
  { id: "pjc", name: "Pedro Juan Caballero", department: "Amambay" },
  { id: "caz", name: "Caazapá", department: "Caazapá" },
  { id: "cor", name: "Coronel Oviedo", department: "Caaguazú" },
  { id: "sal", name: "Salto del Guairá", department: "Canindeyú" },
  { id: "pil", name: "Pilar", department: "Ñeembucú" },
];

export const generateTrips = (
  origin: string,
  destination: string,
  date: string,
): Trip[] => {
  const times = [
    "06:00",
    "08:30",
    "10:00",
    "12:30",
    "15:00",
    "18:00",
    "21:00",
    "23:30",
  ];
  const companies = [
    "Turbus",
    "Pullman Bus",
    "Buses JAC",
    "Eme Bus",
    "Condor Bus",
  ];
  const busTypes = ["Semi Cama", "Salón Cama", "Premium", "Clásico"];
  const amenities = [
    ["WiFi", "TV", "Baño", "Aire Acondicionado"],
    ["WiFi", "TV", "Baño", "Aire Acondicionado", "Enchufes USB"],
    [
      "WiFi",
      "TV",
      "Baño",
      "Aire Acondicionado",
      "Enchufes USB",
      "Comida incluida",
    ],
    ["TV", "Baño"],
  ];

  return times.map((time, index) => {
    const departureHour = parseInt(time.split(":")[0]);
    const duration = Math.floor(Math.random() * 4) + 4;
    const arrivalHour = (departureHour + duration) % 24;
    const arrivalMinute = Math.random() > 0.5 ? "30" : "00";

    return {
      id: `trip-${origin}-${destination}-${date}-${index}`,
      origin,
      destination,
      date,
      departureTime: time,
      arrivalTime: `${arrivalHour.toString().padStart(2, "0")}:${arrivalMinute}`,
      duration: `${duration}h ${Math.random() > 0.5 ? "30" : "00"}min`,
      price: Math.floor(Math.random() * 20000) + 8000,
      busType: busTypes[index % busTypes.length],
      company: companies[index % companies.length],
      amenities: amenities[index % amenities.length],
      availableSeats: Math.floor(Math.random() * 30) + 5,
    };
  });
};

export const generateSeats = (tripId: string, floor: number = 1): Seat[] => {
  const seats: Seat[] = [];
  const rows = floor === 1 ? 10 : 8;
  const columns = 4;

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      // Skip aisle (between columns 2 and 3)
      const isOccupied = Math.random() > 0.7;
      const isPremium = row <= 3;
      const isVip = floor === 2 && row <= 2;

      seats.push({
        id: `${tripId}-floor${floor}-${row}-${col}`,
        number: `${floor === 2 ? "S" : ""}${row}${String.fromCharCode(64 + col)}`,
        row,
        column: col,
        floor,
        type: isVip ? "vip" : isPremium ? "premium" : "normal",
        status: isOccupied ? "occupied" : "available",
        price: isVip ? 15000 : isPremium ? 12000 : 10000,
      });
    }
  }

  return seats;
};
