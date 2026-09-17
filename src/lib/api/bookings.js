import { api } from "./client";

export const getMyBookings = async () => api.get("/bookings");

export const getBooking = async (id) => api.get(`/bookings/${id}`);

export const createBooking = async (payload) => api.post("/bookings", payload);

export const payBooking = async ({ id, paymentRef }) =>
  api.post(`/bookings/${id}/pay`, { paymentRef });

export const cancelBooking = async (id) => api.post(`/bookings/${id}/cancel`, {});

export const checkInTicket = async (code) => api.post(`/bookings/check-in/${code}`, {});

export const myBookingsQueryOptions = () => ({
  queryKey: ["bookings", "mine"],
  queryFn: getMyBookings,
});
