// lib/booking-store.ts
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
  type: "standard" | "premium" | "vip";
  status: "available" | "occupied" | "selected";
  price: number;
}

export interface Passenger {
  seatId: string;
  seatNumber: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
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
      setSelectedOutboundTrip: (selectedOutboundTrip) =>
        set({ selectedOutboundTrip }),
      setSelectedReturnTrip: (selectedReturnTrip) =>
        set({ selectedReturnTrip }),

      addSeat: (seat) => {
        const { selectedSeats } = get();
        set({ selectedSeats: [...selectedSeats, seat] });
        get().calculateTotal();
      },

      removeSeat: (seatId) => {
        const { selectedSeats } = get();
        set({ selectedSeats: selectedSeats.filter((s) => s.id !== seatId) });
        get().calculateTotal();
      },

      addReturnSeat: (seat) => {
        const { selectedReturnSeats } = get();
        set({ selectedReturnSeats: [...selectedReturnSeats, seat] });
        get().calculateTotal();
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

// Datos para Paraguay
export const cities = [
  { id: "asu", name: "Asunción", department: "Capital" },
  { id: "cde", name: "Ciudad del Este", department: "Alto Paraná" },
  { id: "enc", name: "Encarnación", department: "Itapúa" },
  { id: "pjc", name: "Pedro Juan Caballero", department: "Amambay" },
  { id: "caz", name: "Caazapá", department: "Caazapá" },
  { id: "cor", name: "Coronel Oviedo", department: "Caaguazú" },
  { id: "sal", name: "Salto del Guairá", department: "Canindeyú" },
  { id: "pil", name: "Pilar", department: "Ñeembucú" },
  { id: "con", name: "Concepción", department: "Concepción" },
  { id: "vde", name: "Villa del Rosario", department: "San Pedro" },
  { id: "may", name: "Mayor Otaño", department: "Itapúa" },
  { id: "her", name: "Hernandarias", department: "Alto Paraná" },
];

export const generateTrips = (
  origin: string,
  destination: string,
  date: string,
): Trip[] => {
  const times = [
    "05:00",
    "07:30",
    "09:00",
    "11:30",
    "14:00",
    "17:00",
    "20:00",
    "22:30",
  ];
  const companies = [
    "Nuestra Señora de la Asunción",
    "Stel Turismo",
    "Rysa",
    "Sol del Paraguay",
    "La Encarnacena",
    "Catedral Turismo",
  ];
  const busTypes = ["Semi Cama", "Cama Ejecutivo", "Premium", "Clásico"];
  const amenities = [
    ["WiFi", "TV", "Baño", "Aire Acondicionado"],
    ["WiFi", "TV", "Baño", "Aire Acondicionado", "Enchufes USB"],
    [
      "WiFi",
      "TV",
      "Baño",
      "Aire Acondicionado",
      "Enchufes USB",
      "Refrigeración",
    ],
    ["TV", "Baño", "Aire Acondicionado"],
  ];

  return times.map((time, index) => {
    const departureHour = parseInt(time.split(":")[0]);
    const duration = Math.floor(Math.random() * 6) + 3; // 3-9 horas para viajes en Paraguay
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
      // price: Math.floor(Math.random() * 150000) + 50000, // En guaraníes (Gs. 50,000 - 200,000)
      price: 1000,
      busType: busTypes[index % busTypes.length],
      company: companies[index % companies.length],
      amenities: amenities[index % amenities.length],
      availableSeats: Math.floor(Math.random() * 25) + 5,
    };
  });
};

export const generateSeats = (tripId: string, floor: number = 1): Seat[] => {
  const seats: Seat[] = [];
  const rows = floor === 1 ? 10 : 8;
  const columns = 4;

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= columns; col++) {
      const isOccupied = Math.random() < 0.3; // 30% ocupados
      const isPremium = row <= 3;
      const isVip = floor === 2 && row <= 2;

      seats.push({
        id: `${tripId}-floor${floor}-${row}-${col}`,
        number: `${floor === 2 ? "S" : ""}${row}${String.fromCharCode(64 + col)}`,
        row,
        column: col,
        floor,
        type: isVip ? "vip" : isPremium ? "premium" : "standard",
        status: isOccupied ? "occupied" : "available",
        // price: isVip ? 250000 : isPremium ? 180000 : 150000, // En guaraníes
        price: 1000,
      });
    }
  }

  return seats;
};
