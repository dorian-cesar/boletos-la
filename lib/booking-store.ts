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
  type: "standard";
  status: "available" | "occupied" | "selected" | "blocked";
  price: number;
}

export interface Passenger {
  seatId: string;
  seatNumber: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  docType: { codigo: string; nombre: string };
  email: string;
  phone: string;
}

export interface Stop {
  id: string;
  name: string;
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
  originTitle: string;
  destinationTitle: string;
  connectionId: string | null;

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
  initPassengers: () => void;
  calculateTotal: () => void;
  setBookingReference: (ref: string) => void;
  setPaymentStatus: (
    status: "pending" | "processing" | "completed" | "failed",
  ) => void;
  setOriginTitle: (title: string) => void;
  setDestinationTitle: (title: string) => void;
  setConnectionId: (id: string | null) => void;
  swapTitles: () => void;
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
  originTitle: "",
  destinationTitle: "",
  connectionId: null,
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
        set({
          selectedSeats: [...selectedSeats, { ...seat, status: "selected" }],
        });
        get().calculateTotal();
      },

      removeSeat: (seatId) => {
        const { selectedSeats } = get();
        set({ selectedSeats: selectedSeats.filter((s) => s.id !== seatId) });
        get().calculateTotal();
      },

      addReturnSeat: (seat) => {
        const { selectedReturnSeats } = get();
        set({
          selectedReturnSeats: [
            ...selectedReturnSeats,
            { ...seat, status: "selected" },
          ],
        });
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

      initPassengers: () => {
        const { selectedSeats, selectedReturnSeats, passengerDetails } = get();

        // El array plano resultante: [outbound seats..., return seats...]
        const totalSlots = selectedSeats.length + selectedReturnSeats.length;
        if (totalSlots === 0) {
          set({ passengerDetails: [] });
          return;
        }

        const updated: Passenger[] = [];

        // Asientos de IDA
        for (let i = 0; i < selectedSeats.length; i++) {
          const seat = selectedSeats[i];
          const existing = passengerDetails[i];
          updated.push(
            existing && existing.seatId === seat.id
              ? existing
              : {
                  seatId: seat.id,
                  seatNumber: seat.number,
                  firstName: existing?.firstName ?? "",
                  lastName: existing?.lastName ?? "",
                  documentNumber: existing?.documentNumber ?? "",
                  docType: existing?.docType ?? { codigo: "", nombre: "" },
                  email: existing?.email ?? "",
                  phone: existing?.phone ?? "",
                }
          );
        }

        // Asientos de VUELTA — mismos datos del pasajero de ida (por orden)
        for (let i = 0; i < selectedReturnSeats.length; i++) {
          const retSeat = selectedReturnSeats[i];
          // El pasajero correspondiente ya está en updated[i] (el de ida)
          const outPassenger = updated[i];
          const existingRet = passengerDetails[selectedSeats.length + i];

          updated.push(
            existingRet && existingRet.seatId === retSeat.id
              ? {
                  ...existingRet,
                  firstName: outPassenger?.firstName ?? existingRet.firstName,
                  lastName: outPassenger?.lastName ?? existingRet.lastName,
                  documentNumber: outPassenger?.documentNumber ?? existingRet.documentNumber,
                  docType: outPassenger?.docType ?? existingRet.docType,
                  email: outPassenger?.email ?? existingRet.email,
                  phone: outPassenger?.phone ?? existingRet.phone,
                }
              : {
                  seatId: retSeat.id,
                  seatNumber: retSeat.number,
                  firstName: outPassenger?.firstName ?? "",
                  lastName: outPassenger?.lastName ?? "",
                  documentNumber: outPassenger?.documentNumber ?? "",
                  docType: outPassenger?.docType ?? { codigo: "", nombre: "" },
                  email: outPassenger?.email ?? "",
                  phone: outPassenger?.phone ?? "",
                }
          );
        }

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
      setOriginTitle: (originTitle) => set({ originTitle }),
      setDestinationTitle: (destinationTitle) => set({ destinationTitle }),
      setConnectionId: (connectionId) => set({ connectionId }),
      swapTitles: () => {
        const { originTitle, destinationTitle } = get();
        set({ originTitle: destinationTitle, destinationTitle: originTitle });
      },

      resetBooking: () => {
        // Limpiar localStorage al hacer reset
        if (typeof window !== "undefined") {
          localStorage.removeItem("booking-store");
        }
        set(initialState);
      },
    }),
    {
      name: "booking-store", // Nombre único en localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estos campos (excluir funciones)
      partialize: (state) => ({
        step: state.step,
        tripType: state.tripType,
        origin: state.origin,
        destination: state.destination,
        departureDate: state.departureDate,
        returnDate: state.returnDate,
        selectedOutboundTrip: state.selectedOutboundTrip,
        selectedReturnTrip: state.selectedReturnTrip,
        selectedSeats: state.selectedSeats,
        selectedReturnSeats: state.selectedReturnSeats,
        passengerDetails: state.passengerDetails,
        totalPrice: state.totalPrice,
        bookingReference: state.bookingReference,
        paymentStatus: state.paymentStatus,
        originTitle: state.originTitle,
        destinationTitle: state.destinationTitle,
        connectionId: state.connectionId,
      }),
      // Versión para migraciones futuras
      version: 1,
      // Migrar datos de versiones anteriores si es necesario
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrar de versión 0 a 1 si es necesario
          return {
            ...persistedState,
            paymentStatus: persistedState.paymentStatus || "pending",
          };
        }
        return persistedState;
      },
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
      price: 1000,
      busType: busTypes[index % busTypes.length],
      company: companies[index % companies.length],
      amenities: amenities[index % amenities.length],
      availableSeats: Math.floor(Math.random() * 25) + 5,
    };
  });
};
