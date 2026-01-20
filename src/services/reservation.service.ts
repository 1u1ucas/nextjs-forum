import { apiFetch } from "@/lib/api";
import {
  CreateReservationInput,
  ReservationListResponse,
  ReservationWithUser,
} from "@/types/reservation.type";

async function fetchReservations(
  page?: number,
  limit?: number
): Promise<ReservationListResponse> {
  const params = new URLSearchParams();
  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));
  const qs = params.toString();
  return apiFetch<ReservationListResponse>(
    `/api/reservations${qs ? `?${qs}` : ""}`
  );
}

async function createReservation(
  data: CreateReservationInput
): Promise<ReservationWithUser> {
  return apiFetch<ReservationWithUser>("/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function getReservation(id: string): Promise<ReservationWithUser> {
  return apiFetch<ReservationWithUser>(`/api/reservations/${id}`);
}

async function payReservation(id: string): Promise<ReservationWithUser> {
  return apiFetch<ReservationWithUser>(`/api/reservations/${id}/pay`, {
    method: "POST",
  });
}

async function cancelReservation(id: string): Promise<ReservationWithUser> {
  return apiFetch<ReservationWithUser>(`/api/reservations/${id}/cancel`, {
    method: "POST",
  });
}

async function deleteReservation(id: string): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/reservations/${id}`, {
    method: "DELETE",
  });
}

export const reservationService = {
  fetchReservations,
  createReservation,
  getReservation,
  payReservation,
  cancelReservation,
  deleteReservation,
};
