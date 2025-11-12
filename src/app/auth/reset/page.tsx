"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ResetPasswordRequestPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/password/reset/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error ?? "Une erreur est survenue");
            } else {
                setMessage(
                    data.message ??
                        "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé."
                );
                setEmail("");
            }
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
                        Réinitialiser votre mot de passe
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="votre@email.com"
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
                        Envoyer le lien
                    </button>
                </form>
            </div>
        </div>
    );
}


