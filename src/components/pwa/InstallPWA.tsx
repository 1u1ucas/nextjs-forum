"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            
            // Ne montrer le bouton que si l'utilisateur n'a pas refusé avant
            const dismissed = localStorage.getItem("pwa-install-dismissed");
            if (!dismissed) {
                setShowInstall(true);
            }
        };

        window.addEventListener("beforeinstallprompt", handler);

        // Vérifier si l'app est déjà installée
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setShowInstall(false);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
        }

        setDeferredPrompt(null);
        setShowInstall(false);
    };

    const handleDismiss = () => {
        setShowInstall(false);
        localStorage.setItem("pwa-install-dismissed", "true");
    };

    if (!showInstall) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 animate-slide-up">
            <button
                onClick={handleDismiss}
                className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>

            <div className="flex gap-3">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-2xl">F</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Installer l'application
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Installez Forum sur votre appareil pour un accès rapide et hors ligne
                    </p>
                    <button
                        onClick={handleInstall}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Installer
                    </button>
                </div>
            </div>
        </div>
    );
}

