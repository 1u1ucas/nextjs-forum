"use client";

import { useEffect } from "react";

export default function RegisterServiceWorker() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js")
                .then((registration) => {
                })
                .catch((error) => {
                    console.error("Erreur lors de l'enregistrement du SW:", error);
                });
        }
    }, []);

    return null;
}

