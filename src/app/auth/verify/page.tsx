"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "loading" | "success" | "error" | "idle";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        let redirectTimeout: NodeJS.Timeout | undefined;

        const verify = async () => {
            if (!token) {
                setStatus("error");
                setMessage("Aucun token de vérification fourni.");
                return;
            }

            setStatus("loading");
            try {
                const response = await fetch("/api/auth/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await response.json();

                if (!response.ok) {
                    setStatus("error");
                    setMessage(data.error || "Impossible de confirmer votre email.");
                    return;
                }

                setStatus("success");
                setMessage("Votre email a été confirmé avec succès. Vous pouvez maintenant vous connecter.");
                redirectTimeout = setTimeout(() => {
                    router.push("/auth/login?verified=true");
                }, 4000);
            } catch (error) {
                console.error(error);
                setStatus("error");
                setMessage("Une erreur est survenue lors de la confirmation.");
            }
        };

        void verify();

        return () => {
            if (redirectTimeout) {
                clearTimeout(redirectTimeout);
            }
        };
    }, [token, router]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-8 text-center space-y-4">
                <div className="flex flex-col items-center gap-3">
                    {status === "loading" && (
                        <>
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Confirmation de votre email en cours...
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                            >
                                Aller à la connexion
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Retour à la connexion
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}


