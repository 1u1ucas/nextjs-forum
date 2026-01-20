"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";
import { ReservationWithUser, ReservationStatus } from "@/types/reservation.type";
import {
  Calendar,
  Euro,
  ArrowLeft,
  CreditCard,
  X,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: reservation, isLoading, error } = useQuery<ReservationWithUser>({
    queryKey: ["reservation", id],
    queryFn: () => reservationService.getReservation(id),
  });

  const payMutation = useMutation({
    mutationFn: () => reservationService.payReservation(id),
    onSuccess: () => {
      toast.success("Paiement effectué !");
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setShowPayDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du paiement");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => reservationService.cancelReservation(id),
    onSuccess: () => {
      toast.success("Réservation annulée");
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setShowCancelDialog(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Réservation non trouvée
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Cette réservation n&apos;existe pas ou vous n&apos;y avez pas accès.
            </p>
            <Link
              href="/reservations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux réservations
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canPay = reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const canCancel = reservation.status !== "PAID" && reservation.status !== "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/reservations"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux réservations
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {reservation.title}
                </h1>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    statusBadgeColors[reservation.status]
                  }`}
                >
                  {statusLabels[reservation.status]}
                </span>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatAmountEur(reservation.amount)}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {reservation.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </h3>
                <p className="text-gray-900 dark:text-white">{reservation.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Date de la réservation
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {formatDateFr(reservation.date)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Date de création
                </h3>
                <p className="text-gray-900 dark:text-white">
                  {formatDateFr(reservation.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            {canPay && (
              <button
                onClick={() => setShowPayDialog(true)}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Payer {formatAmountEur(reservation.amount)}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Annuler la réservation
              </button>
            )}
          </div>
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
    </div>
  );
}
