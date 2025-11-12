"use client";

import Image from "next/image";

interface UserAvatarProps {
    image?: string | null;
    name?: string | null;
    email?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

export default function UserAvatar({
    image,
    name,
    email,
    size = "md",
    className = "",
}: UserAvatarProps) {
    const initials = name
        ? name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
        : email?.[0]?.toUpperCase() || "U";

    const sizeClasses = {
        sm: "w-8 h-8 text-sm",
        md: "w-10 h-10 text-base",
        lg: "w-12 h-12 text-lg",
    };

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
            {image ? (
                <Image
                    src={image}
                    alt={name || "Avatar"}
                    width={size === "sm" ? 32 : size === "md" ? 40 : 48}
                    height={size === "sm" ? 32 : size === "md" ? 40 : 48}
                    className="w-full h-full object-cover"
                    unoptimized={image.startsWith('/')} // Désactiver l'optimisation pour les images locales
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold">{initials}</span>
                </div>
            )}
        </div>
    );
}

