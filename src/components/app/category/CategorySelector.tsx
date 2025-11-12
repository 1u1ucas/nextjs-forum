"use client";

import { useState, useEffect } from "react";
import { Category } from "@/generated/prisma";

interface CategorySelectorProps {
    value?: string;
    onChange: (categoryId: string | undefined) => void;
}

export default function CategorySelector({ value, onChange }: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-sm text-gray-500">Chargement...</div>;
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie (optionnel)
            </label>
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => onChange(undefined)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        !value
                            ? "bg-gray-800 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Aucune
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onChange(category.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            value === category.id
                                ? "text-white"
                                : "hover:opacity-80"
                        }`}
                        style={{
                            backgroundColor: value === category.id ? category.color : `${category.color}20`,
                            color: value === category.id ? "white" : category.color,
                        }}
                    >
                        {category.icon && <span className="mr-1">{category.icon}</span>}
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

