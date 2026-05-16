import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  guest?: { name: string; email: string };
  listing: { title: string; location: string; pricePerNight: number; photos?: { url: string }[]; rating?: number };
}

interface BookingsResponse {
  data: Booking[];
  meta: { total: number };
}

export function useMyBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings", "mine"],
    queryFn: async () => {
      const res = await api.get<BookingsResponse>("/bookings?limit=50");
      return res.data ?? [];
    },
  });
}

export function useHostBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings", "host"],
    queryFn: async () => {
      const res = await api.get<BookingsResponse>("/bookings?limit=50");
      return res.data ?? [];
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete("/bookings/" + id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}
