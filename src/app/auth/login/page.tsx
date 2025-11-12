"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, MailCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get("check-email")) {
            setInfo("Votre compte est créé ! Vérifiez votre boîte mail pour confirmer votre adresse avant de vous connecter.");
        } else if (searchParams.get("verified")) {
            setInfo("Votre email est confirmé. Vous pouvez à présent vous connecter.");
        } else if (searchParams.get("reset")) {
            setInfo("Votre mot de passe a été mis à jour. Vous pouvez vous connecter.");
        } else {
            setInfo("");
        }

        const errorParam = searchParams.get("error");
        if (errorParam === "EmailNotVerified") {
            setError("Veuillez vérifier votre email avant de vous connecter.");
        } else if (errorParam === "CredentialsSignin") {
            setError("Email ou mot de passe incorrect.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                if (result.error === "EmailNotVerified") {
                    setError("Veuillez vérifier votre email avant de vous connecter.");
                } else {
                    setError("Email ou mot de passe incorrect.");
                }
            } else {
                router.push("/");
                router.refresh();
            }
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
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connexion</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Bienvenue sur le Forum</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}
                {info && !error && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center gap-2 text-green-700 dark:text-green-300">
                        {searchParams.get("check-email") ? (
                            <MailCheck className="w-5 h-5" />
                        ) : (
                            <CheckCircle2 className="w-5 h-5" />
                        )}
                        <span className="text-sm">{info}</span>
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
                                    <path
                                        fill="#EA4335"
                                        d="M12 10.2v3.6h5.1c-.2 1.1-.8 2.1-1.8 2.7v2.2h2.9c1.7-1.6 2.8-4 2.8-6.9 0-.7-.1-1.4-.2-2H12z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M6.6 14.3l-.9.7-2.3 1.8C4.5 19.7 8 22 12 22c2.7 0 5-.9 6.6-2.4l-2.9-2.2c-.8.5-1.9.9-3.7.9-2.8 0-5.1-1.8-5.9-4.3z"
                                    />
                                    <path
                                        fill="#4A90E2"
                                        d="M3.4 6.2L1 8c-1 1.9-1 4.2-1 4.2s0 2.3 1 4.2l2.4-1.8c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M12 4.6c1.5 0 2.5.7 3 1.2l2.3-2.3C16.9 2 14.7 1 12 1 8 1 4.5 3.3 2.8 7l2.4 1.8c.7-2.5 3.1-4.2 5.8-4.2z"
                                    />
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
                        />
                        <div className="text-right mt-2">
                            <Link
                                href="/auth/reset"
                                className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>

                {/* Register link */}
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/register" className="text-orange-500 hover:text-orange-600 font-medium">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}

