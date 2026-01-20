"use client";

import { useQuery } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";
import { ReservationListResponse, ReservationStatus } from "@/types/reservation.type";
import { Calendar, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import CreateReservationModal from "@/components/app/reservation/CreateReservationModal";
import ReservationCard from "@/components/app/reservation/ReservationCard";

const statusBadgeColors: Record<ReservationStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PAID: "Payée",
  CANCELLED: "Annulée",
};

export default function ReservationsPage() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery<ReservationListResponse>({
    queryKey: ["reservations", page],
    queryFn: () => reservationService.fetchReservations(page, 20),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Erreur lors du chargement des réservations</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Calendar className="w-8 h-8" />
              Mes réservations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos réservations et paiements
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle réservation
          </button>
        </div>

        {data?.reservations.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Aucune réservation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Vous n&apos;avez pas encore de réservation.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Créer une réservation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                statusBadgeColors={statusBadgeColors}
                statusLabels={statusLabels}
              />
            ))}

            {data && data.pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                  Page {page} sur {data.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={page === data.pagination.totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
