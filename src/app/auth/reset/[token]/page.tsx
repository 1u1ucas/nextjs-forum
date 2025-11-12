"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordConfirmPage() {
    const { token } = useParams<{ token: string }>();
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        const passwordErrors: string[] = [];
        if (password.length < 8) passwordErrors.push("au moins 8 caractères");
        if (!/[A-Z]/.test(password)) passwordErrors.push("une majuscule");
        if (!/[a-z]/.test(password)) passwordErrors.push("une minuscule");
        if (!/\d/.test(password)) passwordErrors.push("un chiffre");
        if (!/[^A-Za-z0-9]/.test(password)) passwordErrors.push("un caractère spécial");

        if (passwordErrors.length > 0) {
            setError(`Le mot de passe doit contenir ${passwordErrors.join(", ")}.`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/password/reset/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Une erreur est survenue");
                return;
            }

            setSuccess("Votre mot de passe a été réinitialisé avec succès.");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                router.push("/auth/login?reset=1");
            }, 2000);
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Définir un nouveau mot de passe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Choisissez un mot de passe sécurisé pour votre compte.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm">{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nouveau mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        Définir le mot de passe
                    </button>
                </form>
            </div>
        </div>
    );
}


