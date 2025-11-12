"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ConversationWithExtend } from "@/types/conversation.type";

export default function SearchBar() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ConversationWithExtend[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const searchConversations = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data.conversations || []);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchConversations, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelectConversation = (id: string) => {
        router.push(`/conversation/${id}`);
        setIsOpen(false);
        setQuery("");
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Rechercher des conversations..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Results dropdown */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((conversation) => (
                                <button
                                    key={conversation.id}
                                    onClick={() => handleSelectConversation(conversation.id)}
                                    className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                                >
                                    <div className="font-medium text-gray-900 line-clamp-1">
                                        {conversation.title}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {conversation.messages.length} commentaires • {conversation.votes} votes
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            Aucun résultat trouvé
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

