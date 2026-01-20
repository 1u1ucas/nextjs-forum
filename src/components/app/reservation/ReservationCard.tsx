"use client";

import { ReservationWithUser, ReservationStatus } from "@/types/reservation.type";
import { reservationService } from "@/services/reservation.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, X, Loader2, Calendar, Euro } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface ReservationCardProps {
  reservation: ReservationWithUser;
  statusBadgeColors: Record<ReservationStatus, string>;
  statusLabels: Record<ReservationStatus, string>;
}

function formatDateFr(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAmountEur(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default function ReservationCard({
  reservation,
  statusBadgeColors,
  statusLabels,
}: ReservationCardProps) {
  const queryClient = useQueryClient();
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const payMutation = useMutation({
    mutationFn: () => reservationService.payReservation(reservation.id),
    onSuccess: () => {
      toast.success("Paiement effectué !");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setShowPayDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du paiement");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationService.cancelReservation(reservation.id),
    onSuccess: () => {
      toast.success("Réservation annulée");
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setShowCancelDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  const canPay = reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const canCancel = reservation.status !== "PAID" && reservation.status !== "CANCELLED";

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link
              href={`/reservations/${reservation.id}`}
              className="text-xl font-semibold text-gray-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
            >
              {reservation.title}
            </Link>
            {reservation.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {reservation.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateFr(reservation.date)}
              </span>
              <span className="flex items-center gap-1">
                <Euro className="w-4 h-4" />
                {formatAmountEur(reservation.amount)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusBadgeColors[reservation.status]
              }`}
            >
              {statusLabels[reservation.status]}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {canPay && (
            <button
              onClick={() => setShowPayDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Payer
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          )}
        </div>
      </div>

      {/* Pay Confirmation Dialog */}
      {showPayDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Confirmer le paiement
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Confirmer le paiement de{" "}
              <span className="font-semibold text-green-600">
                {formatAmountEur(reservation.amount)}
              </span>{" "}
              ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowPayDialog(false)}
                disabled={payMutation.isPending}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => payMutation.mutate()}
                disabled={payMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {payMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Confirmer le paiement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Annuler la réservation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir annuler cette réservation ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Non, garder
              </button>
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
