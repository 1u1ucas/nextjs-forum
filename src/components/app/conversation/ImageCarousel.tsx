"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageCarouselProps {
    images: string[];
    alt: string;
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Gérer la touche Escape pour fermer le plein écran
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };

        if (isFullscreen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isFullscreen]);

    if (!images || images.length === 0) return null;

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    if (isFullscreen) {
        return (
            <div 
                className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
                onClick={() => setIsFullscreen(false)}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFullscreen(false);
                    }}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full z-10"
                >
                    <X className="w-6 h-6" />
                </button>
                
                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-4 text-white hover:bg-white/20 p-2 rounded-full z-10"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-4 text-white hover:bg-white/20 p-2 rounded-full z-10"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>
                    </>
                )}

                <div 
                    className="relative w-full h-full flex items-center justify-center p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Image
                        src={images[currentIndex]}
                        alt={`${alt} - ${currentIndex + 1}/${images.length}`}
                        fill
                        className="object-contain"
                        unoptimized
                    />
                </div>

                {images.length > 1 && (
                    <div className="absolute bottom-8 flex gap-2">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`w-2 h-2 rounded-full ${
                                    idx === currentIndex ? 'bg-orange-500' : 'bg-white/50'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                <Image
                    src={images[currentIndex]}
                    alt={`${alt} - ${currentIndex + 1}/${images.length}`}
                    fill
                    className="object-contain cursor-pointer"
                    onClick={() => setIsFullscreen(true)}
                    unoptimized
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentIndex(idx);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        idx === currentIndex ? 'bg-orange-500' : 'bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {currentIndex + 1}/{images.length}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
