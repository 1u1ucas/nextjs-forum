"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Role = "USER" | "MODERATOR" | "ADMIN";

interface RoleManagerProps {
    userId: string;
    initialRole: Role;
}

const roleLabels: Record<Role, string> = {
    USER: "Utilisateur",
    MODERATOR: "Modérateur",
    ADMIN: "Administrateur",
};

export default function RoleManager({ userId, initialRole }: RoleManagerProps) {
    const router = useRouter();
    const [role, setRole] = useState<Role>(initialRole);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (nextRole: Exclude<Role, "ADMIN">) => {
        setError(null);
        setSuccess(null);

        startTransition(async () => {
            try {
                const response = await fetch(`/api/users/${userId}/role`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ role: nextRole }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setError(data?.message ?? "Impossible de mettre à jour le rôle");
                    return;
                }

                if (data?.user?.role) {
                    setRole(data.user.role as Role);
                }

                setSuccess(
                    nextRole === "MODERATOR"
                        ? "Utilisateur promu au rôle de modérateur."
                        : "Modérateur rétrogradé au rôle d'utilisateur."
                );

                router.refresh();
            } catch (e) {
                console.error("Erreur de mise à jour du rôle:", e);
                setError("Une erreur est survenue lors de la mise à jour du rôle.");
            }
        });
    };

    if (role === "ADMIN") {
        return null;
    }

    return (
        <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/40 space-y-3">
            <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Rôle actuel</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {roleLabels[role]}
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                {role === "USER" ? (
                    <button
                        type="button"
                        onClick={() => handleUpdate("MODERATOR")}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        Promouvoir en modérateur
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleUpdate("USER")}
                        disabled={isPending}
                        className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        Rétrograder en utilisateur
                    </button>
                )}
                {isPending && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Mise à jour en cours...
                    </span>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500" role="alert">
                    {error}
                </p>
            )}
            {success && (
                <p className="text-sm text-green-600 dark:text-green-400" role="status">
                    {success}
                </p>
            )}
        </div>
    );
}


