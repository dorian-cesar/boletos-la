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
  type: "standard" | "vip" | "premium";
  status: "available" | "occupied" | "selected" | "blocked";
  price: number;
  qualityCode: string; // CÃ³digo de calidad del asiento (ej: "CA") â€” requerido por GDS /sell
  ticketNumber?: string; // NÃºmero de ticket asignado por el GDS tras /sell exitoso
}

export interface Passenger {
  seatId: string;
  seatNumber: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  docType?: { codigo: string; nombre: string };
  email: string;
  phone: string;
  occupation?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  country?: string;
}

export interface Stop {
  id: string;
  name: string;
}

export interface PaymentResult {
  monto: string;
  pagado: boolean;
  token: string;
  hash_pedido: string;
}

export interface BookingState {
  step: number;
  tripType: "one-way" | "round-trip";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  pax: number;
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
  outboundConnectionId: string | null;
  returnConnectionId: string | null;
  paymentResult: PaymentResult | null;
  failedSeats: Record<string, string[]>;
  bancardProcessId: string | null;
  bancardShopProcessId: string | null;
  bancardIsVisa: boolean | null;
  discountCode: string | null;
  discountPercentage: number | null;
  discountEmpresa: string | null;
  discountConvenio: string | null;
  discountCargoPorServicio: boolean | null;
  discountValorCargoServicio: number | null;
  serviceCharge: number;
  bookingExpiresAt: number | null;
  checkoutData: any;
  dynamicServiceCharge: number | null;
  appliedServiceChargeAmount: number;
  setStep: (step: number) => void;
  setTripType: (type: "one-way" | "round-trip") => void;
  setOrigin: (origin: string) => void;
  setDestination: (destination: string) => void;
  setDepartureDate: (date: string) => void;
  setReturnDate: (date: string) => void;
  setPax: (pax: number) => void;
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
  setOutboundConnectionId: (id: string | null) => void;
  setReturnConnectionId: (id: string | null) => void;
  setCheckoutData: (data: any) => void;
  setBookingExpiresAt: (time: number | null) => void;
  setPaymentResult: (result: PaymentResult | null) => void;
  setBancardProcessId: (id: string | null) => void;
  setBancardShopProcessId: (id: string | null) => void;
  setBancardIsVisa: (isVisa: boolean | null) => void;
  addFailedSeats: (tripId: string, seatNumbers: string[]) => void;
  clearFailedSeats: (tripId: string) => void;
  assignTicketNumbers: (ticketMap: Record<string, string>) => void;
  swapTitles: () => void;
  resetBooking: () => void;
  setDiscount: (
    code: string | null,
    percentage: number | null,
    empresa?: string | null,
    convenio?: string | null,
    cargoPorServicio?: boolean | null,
    valorCargoServicio?: number | null
  ) => void;
  fetchServiceCharge: () => Promise<void>;
}

const initialState = {
  step: 1,
  tripType: "one-way" as const,
  origin: "",
  destination: "",
  departureDate: "",
  returnDate: "",
  pax: 1,
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
  outboundConnectionId: null,
  returnConnectionId: null,
  checkoutData: null,
  bookingExpiresAt: null,
  paymentResult: null,
  failedSeats: {},
  bancardProcessId: null,
  bancardShopProcessId: null,
  bancardIsVisa: null,
  discountCode: null,
  discountPercentage: null,
  discountEmpresa: null,
  discountConvenio: null,
  discountCargoPorServicio: null,
  discountValorCargoServicio: null,
  serviceCharge: 2500,
  dynamicServiceCharge: null,
  appliedServiceChargeAmount: 0,
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
      setPax: (pax) => set({ pax }),
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
                  occupation: existing?.occupation ?? "",
                  birthDate: existing?.birthDate ?? "",
                  gender: existing?.gender ?? "M",
                  nationality: existing?.nationality ?? "",
                  country: existing?.country ?? "",
                },
          );
        }

        // Asientos de VUELTA â€” mismos datos del pasajero de ida (por orden)
        for (let i = 0; i < selectedReturnSeats.length; i++) {
          const retSeat = selectedReturnSeats[i];
          // El pasajero correspondiente ya estÃ¡ en updated[i] (el de ida)
          const outPassenger = updated[i];
          const existingRet = passengerDetails[selectedSeats.length + i];

          updated.push(
            existingRet && existingRet.seatId === retSeat.id
              ? {
                  ...existingRet,
                  firstName: outPassenger?.firstName ?? existingRet.firstName,
                  lastName: outPassenger?.lastName ?? existingRet.lastName,
                  documentNumber:
                    outPassenger?.documentNumber ?? existingRet.documentNumber,
                  docType: outPassenger?.docType ?? existingRet.docType,
                  email: outPassenger?.email ?? existingRet.email,
                  phone: outPassenger?.phone ?? existingRet.phone,
                  occupation:
                    outPassenger?.occupation ?? existingRet.occupation,
                  birthDate: outPassenger?.birthDate ?? existingRet.birthDate,
                  gender: outPassenger?.gender ?? existingRet.gender,
                  nationality:
                    outPassenger?.nationality ?? existingRet.nationality,
                  country: outPassenger?.country ?? existingRet.country,
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
                  occupation: outPassenger?.occupation ?? "",
                  birthDate: outPassenger?.birthDate ?? "",
                  gender: outPassenger?.gender ?? "M",
                  nationality: outPassenger?.nationality ?? "",
                  country: outPassenger?.country ?? "",
                },
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

        const { discountPercentage, serviceCharge, discountCargoPorServicio, discountValorCargoServicio } = get();
        if (discountPercentage && discountPercentage > 0) {
          total = Math.round(total - (total * (discountPercentage / 100)));
        }

        const totalPassengers = selectedSeats.length + selectedReturnSeats.length;
        let calculatedServiceCharge = 0;
        if (totalPassengers > 0) {
          const { dynamicServiceCharge } = get();
          if (dynamicServiceCharge !== null) {
            calculatedServiceCharge = Math.round(total * (dynamicServiceCharge / 100));
          } else {
            calculatedServiceCharge = totalPassengers * 2500;
          }
          total += calculatedServiceCharge;
        }

        set({ totalPrice: total, appliedServiceChargeAmount: calculatedServiceCharge });
      },

      setDiscount: (code, percentage, empresa = null, convenio = null, cargoPorServicio = null, valorCargoServicio = null) => {
        set({
          discountCode: code,
          discountPercentage: percentage,
          discountEmpresa: empresa,
          discountConvenio: convenio,
          discountCargoPorServicio: cargoPorServicio,
          discountValorCargoServicio: valorCargoServicio,
        });
        get().calculateTotal();
      },

      setBookingReference: (bookingReference) => set({ bookingReference }),
      setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
      setOriginTitle: (originTitle) => set({ originTitle }),
      setDestinationTitle: (destinationTitle) => set({ destinationTitle }),
      setOutboundConnectionId: (outboundConnectionId) => set({ outboundConnectionId }),
      setReturnConnectionId: (returnConnectionId) => set({ returnConnectionId }),
      setCheckoutData: (data) => set({ checkoutData: data }),
      setBookingExpiresAt: (time) => set({ bookingExpiresAt: time }),
      setPaymentResult: (paymentResult) => set({ paymentResult }),
      setBancardProcessId: (bancardProcessId) => set({ bancardProcessId }),
      setBancardShopProcessId: (bancardShopProcessId) => set({ bancardShopProcessId }),
      setBancardIsVisa: (bancardIsVisa) => set({ bancardIsVisa }),
      addFailedSeats: (tripId, seatNumbers) => {
        const { failedSeats } = get();
        const currentFailed = failedSeats[tripId] || [];
        set({
          failedSeats: {
            ...failedSeats,
            [tripId]: [...new Set([...currentFailed, ...seatNumbers])],
          },
        });
      },
      clearFailedSeats: (tripId) => {
        const { failedSeats } = get();
        const updated = { ...failedSeats };
        delete updated[tripId];
        set({ failedSeats: updated });
      },
      assignTicketNumbers: (ticketMap) => {
        const { selectedSeats, selectedReturnSeats } = get();
        set({
          selectedSeats: selectedSeats.map((seat) => ({
            ...seat,
            ticketNumber: ticketMap[`Ida-${seat.number}`] ?? seat.ticketNumber,
          })),
          selectedReturnSeats: selectedReturnSeats.map((seat) => ({
            ...seat,
            ticketNumber:
              ticketMap[`Vuelta-${seat.number}`] ?? seat.ticketNumber,
          })),
        });
      },
      swapTitles: () => {
        const { originTitle, destinationTitle } = get();
        set({ originTitle: destinationTitle, destinationTitle: originTitle });
      },

      fetchServiceCharge: async () => {
        try {
          const response = await fetch("/api/cargos-servicio?empresa_id=1");
          const data = await response.json();
          if (data && data.status === "success" && data.data && data.data.length > 0) {
            const charge = data.data[0];
            set({ dynamicServiceCharge: parseFloat(charge.porcentaje) });
          } else {
            set({ dynamicServiceCharge: null });
          }
        } catch (error) {
          console.error("Error fetching service charge:", error);
          set({ dynamicServiceCharge: null });
        }
        get().calculateTotal();
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
      name: "booking-store", // Nombre Ãºnico en localStorage
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
        outboundConnectionId: state.outboundConnectionId,
        returnConnectionId: state.returnConnectionId,
        paymentResult: state.paymentResult,
        failedSeats: state.failedSeats,
        bancardProcessId: state.bancardProcessId,
        bancardShopProcessId: state.bancardShopProcessId,
        bancardIsVisa: state.bancardIsVisa,
        discountCode: state.discountCode,
        discountPercentage: state.discountPercentage,
        discountEmpresa: state.discountEmpresa,
        discountConvenio: state.discountConvenio,
        discountCargoPorServicio: state.discountCargoPorServicio,
        discountValorCargoServicio: state.discountValorCargoServicio,
        serviceCharge: state.serviceCharge,
        appliedServiceChargeAmount: state.appliedServiceChargeAmount,
      }),
      // VersiÃ³n para migraciones futuras
      version: 1,
      // Migrar datos de versiones anteriores si es necesario
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migrar de versiÃ³n 0 a 1 si es necesario
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
  { id: "asu", name: "AsunciÃ³n", department: "Capital", distribusionCode: "PYASU" },
  { id: "cde", name: "Ciudad del Este", department: "Alto ParanÃ¡", distribusionCode: "PYAGT" },
  { id: "enc", name: "EncarnaciÃ³n", department: "ItapÃºa", distribusionCode: "PYENO" },
  { id: "pjc", name: "Pedro Juan Caballero", department: "Amambay", distribusionCode: "PYPJC" },
  { id: "caz", name: "CaazapÃ¡", department: "CaazapÃ¡", distribusionCode: "PYCAZ" },
  { id: "cor", name: "Coronel Oviedo", department: "CaaguazÃº", distribusionCode: "PYCOO" },
  { id: "sal", name: "Salto del GuairÃ¡", department: "CanindeyÃº", distribusionCode: "PYSG" },
  { id: "pil", name: "Pilar", department: "Ã‘eembucÃº", distribusionCode: "PYPIL" },
  { id: "con", name: "ConcepciÃ³n", department: "ConcepciÃ³n", distribusionCode: "PYCIO" },
  { id: "vde", name: "Villa del Rosario", department: "San Pedro", distribusionCode: "PYVDR" },
  { id: "may", name: "Mayor OtaÃ±o", department: "ItapÃºa", distribusionCode: "PYMOT" },
  { id: "her", name: "Hernandarias", department: "Alto ParanÃ¡", distribusionCode: "PYHER" },
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
    "Nuestra SeÃ±ora de la AsunciÃ³n",
    "Stel Turismo",
    "Rysa",
    "Sol del Paraguay",
    "La Encarnacena",
    "Catedral Turismo",
  ];
  const busTypes = ["Semi Cama", "Cama Ejecutivo", "Premium", "ClÃ¡sico"];
  const amenities = [
    ["WiFi", "TV", "BaÃ±o", "Aire Acondicionado"],
    ["WiFi", "TV", "BaÃ±o", "Aire Acondicionado", "Enchufes USB"],
    [
      "WiFi",
      "TV",
      "BaÃ±o",
      "Aire Acondicionado",
      "Enchufes USB",
      "RefrigeraciÃ³n",
    ],
    ["TV", "BaÃ±o", "Aire Acondicionado"],
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
      price: 6549, // Equivalent to 1000 CLP
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
      const isOccupied = Math.random() < 0.3;
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
        price: 1000,
        qualityCode: "CA",
      });
    }
  }

  return seats;
};


