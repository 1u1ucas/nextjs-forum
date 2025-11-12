"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }

        const passwordErrors: string[] = [];
        if (password.length < 8) {
            passwordErrors.push("au moins 8 caractères");
        }
        if (!/[A-Z]/.test(password)) {
            passwordErrors.push("une majuscule");
        }
        if (!/[a-z]/.test(password)) {
            passwordErrors.push("une minuscule");
        }
        if (!/\d/.test(password)) {
            passwordErrors.push("un chiffre");
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
            passwordErrors.push("un caractère spécial");
        }

        if (passwordErrors.length > 0) {
            setError(`Le mot de passe doit contenir ${passwordErrors.join(", ")}.`);
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Une erreur est survenue");
                return;
            }

            router.push("/auth/login?check-email=1");
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-8">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">F</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inscription</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Créez votre compte</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Social */}
                <div className="space-y-3">
                    <button
                        type="button"
                        onClick={() => {
                            setLoading(true);
                            void signIn("google", { callbackUrl: "/" });
                        }}
                        className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.1-.8 2.1-1.8 2.7v2.2h2.9c1.7-1.6 2.8-4 2.8-6.9 0-.7-.1-1.4-.2-2H12z" />
                                    <path fill="#34A853" d="M6.6 14.3l-.9.7-2.3 1.8C4.5 19.7 8 22 12 22c2.7 0 5-.9 6.6-2.4l-2.9-2.2c-.8.5-1.9.9-3.7.9-2.8 0-5.1-1.8-5.9-4.3z" />
                                    <path fill="#4A90E2" d="M3.4 6.2L1 8c-1 1.9-1 4.2-1 4.2s0 2.3 1 4.2l2.4-1.8c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7z" />
                                    <path fill="#FBBC05" d="M12 4.6c1.5 0 2.5.7 3 1.2l2.3-2.3C16.9 2 14.7 1 12 1 8 1 4.5 3.3 2.8 7l2.4 1.8c.7-2.5 3.1-4.2 5.8-4.2z" />
                                </svg>
                                Continuer avec Google
                            </>
                        )}
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs uppercase text-gray-400 dark:text-gray-500">ou</span>
                        <span className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Votre nom"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="votre@email.com"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirmer le mot de passe
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? "Inscription..." : "S'inscrire"}
                    </button>
                </form>

                {/* Login link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Déjà un compte ?{" "}
                    <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-medium">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
