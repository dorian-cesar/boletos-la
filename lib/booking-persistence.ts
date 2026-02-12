export const saveBookingToStorage = (bookingStore: any) => {
  const dataToSave = {
    tripType: bookingStore.tripType,
    departureDate: bookingStore.departureDate,
    returnDate: bookingStore.returnDate,
    selectedOutboundTrip: bookingStore.selectedOutboundTrip,
    selectedReturnTrip: bookingStore.selectedReturnTrip,
    selectedSeats: bookingStore.selectedSeats,
    selectedReturnSeats: bookingStore.selectedReturnSeats,
    passengerDetails: bookingStore.passengerDetails,
    totalPrice: bookingStore.totalPrice,
    bookingReference: bookingStore.bookingReference,
  };

  sessionStorage.setItem("boletos_booking_data", JSON.stringify(dataToSave));
};

export const loadBookingFromStorage = (setState: Function) => {
  const saved = sessionStorage.getItem("boletos_booking_data");
  if (saved) {
    try {
      const data = JSON.parse(saved);
      setState(data);
      sessionStorage.removeItem("boletos_booking_data");
      return true;
    } catch (error) {
      console.error("Error loading booking data:", error);
    }
  }
  return false;
};
