"use client";

import Image from "next/image";
import Link from "next/link";

interface UserAvatarProps {
    image?: string | null;
    name?: string | null;
    email?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
    href?: string;
}

export default function UserAvatar({
    image,
    name,
    email,
    size = "md",
    className = "",
    href,
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

    const content = (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
            {image ? (
                <Image
                    src={image}
                    alt={name || "Avatar"}
                    width={size === "sm" ? 32 : size === "md" ? 40 : 48}
                    height={size === "sm" ? 32 : size === "md" ? 40 : 48}
                    className="w-full h-full object-cover"
                    unoptimized={image.startsWith("/")}
                />
            ) : (
                <div className="w-full h-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <span className="text-white font-bold">{initials}</span>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className={`inline-block ${className}`}>
                {content}
            </Link>
        );
    }

    return <div className={className}>{content}</div>;
}

