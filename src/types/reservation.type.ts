import { Pagination } from "@/types/pagination.type";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED";

export interface Reservation {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: Date;
  status: ReservationStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationUserSummary {
  id: string;
  name: string | null;
  email?: string | null;
  image: string | null;
}

export interface ReservationWithUser extends Reservation {
  user: ReservationUserSummary;
}

export interface CreateReservationInput {
  title: string;
  description?: string;
  date: string;
  amount: number;
}

export interface ReservationListResponse {
  reservations: ReservationWithUser[];
  pagination: Pagination;
}
