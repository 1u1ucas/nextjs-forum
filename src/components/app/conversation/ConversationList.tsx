"use client";

import { conversationService } from "@/services/conversation.service";
import { useEffect, useRef, useState } from "react";
import { ConversationWithExtend } from "@/types/conversation.type";
import ConversationCard from "./ConversationCard";
import CreateConversationModal from "./CreateConversationModal";
import { Loader2, TrendingUp, Clock, Flame, MessageSquare } from "lucide-react";
import { sortConversations } from "@/lib/sorting-algorithms";
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";

export default function ConversationList() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'hot' | 'top' | 'new' | 'controversial'>('hot');
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'all'>('all');
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    // Infinite query pour charger les conversations page par page
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['conversations'],
        queryFn: ({ pageParam = 1 }) =>
            conversationService.fetchConversations(pageParam, 10) as Promise<{
                conversations: ConversationWithExtend[];
                pagination: { page: number; totalPages: number };
            }>,
        getNextPageParam: (lastPage) => {
            if (lastPage.pagination.page < lastPage.pagination.totalPages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });

    // Récupérer toutes les conversations de toutes les pages
    const conversations = data?.pages.flatMap((page) => page.conversations) || [];

    // Mutation pour créer une nouvelle conversation
    const createMutation = useMutation({
        mutationFn: ({ title, content }: { title: string; content: string }) =>
            conversationService.createConversation(title, content),
        onSuccess: () => {
            // Invalider les queries pour refetch
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            setIsModalOpen(false);
        },
    });

    const sortedConversations = sortConversations(conversations, sortBy, timePeriod);

    // Observer pour le scroll infini
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const first = entries[0];
            if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { threshold: 1 });

        const current = sentinelRef.current;
        if (current) observer.observe(current);
        return () => {
            if (current) observer.unobserve(current);
            observer.disconnect();
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Main content */}
            <div className="max-w-5xl mx-auto px-4 py-5">
                {/* Tabs - Style Reddit */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm mb-3 flex-wrap">
                        <button 
                            onClick={() => setSortBy('hot')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-colors ${
                                sortBy === 'hot' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <Flame className="w-4 h-4" />
                            Hot
                        </button>
                        <button 
                            onClick={() => setSortBy('new')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-colors ${
                                sortBy === 'new' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            Nouveau
                        </button>
                        <button 
                            onClick={() => setSortBy('top')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-colors ${
                                sortBy === 'top' 
                                    ? 'bg-green-500 text-white' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            Top
                        </button>
                        <button 
                            onClick={() => setSortBy('controversial')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full font-bold transition-colors ${
                                sortBy === 'controversial' 
                                    ? 'bg-purple-500 text-white' 
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Controversé
                        </button>
                    </div>

                    {/* Time period selector for "top" */}
                    {sortBy === 'top' && (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">Période :</span>
                            {(['day', 'week', 'month', 'all'] as const).map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimePeriod(period)}
                                    className={`px-2 py-1 rounded ${
                                        timePeriod === period
                                            ? 'bg-green-500 text-white'
                                            : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    {period === 'day' && 'Jour'}
                                    {period === 'week' && 'Semaine'}
                                    {period === 'month' && 'Mois'}
                                    {period === 'all' && 'Tout'}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Posts list */}
                <div className="space-y-2.5">
                    {sortedConversations.length > 0 ? (
                        sortedConversations.map((conversation) => (
                            <ConversationCard key={conversation.id} conversation={conversation} />
                        ))
                    ) : (
                        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded p-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Aucune conversation disponible</p>
                        </div>
                    )}
                    {/* Sentinel for infinite scroll */}
                    {hasNextPage && (
                        <div ref={sentinelRef} className="py-8 text-center text-gray-500 dark:text-gray-400">
                            {isFetchingNextPage ? "Chargement..." : "Descendez pour charger plus"}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <CreateConversationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {}}
            />
        </div>
    );
}
