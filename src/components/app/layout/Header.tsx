"use client";

import { Plus, User, LogOut, Menu, Bookmark } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import CreateConversationModal from "@/components/app/conversation/CreateConversationModal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import NotificationBell from "@/components/app/layout/NotificationBell";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import UserAvatar from "@/components/app/user/UserAvatar";
import { ProfileResponse } from "@/types/profile.type";

interface HeaderProps {
    onCreateClick?: () => void;
}

export default function Header({ onCreateClick }: HeaderProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showMenu, setShowMenu] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: profileData } = useQuery<ProfileResponse>({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await fetch("/api/user/profile");
            if (!response.ok) throw new Error("Erreur lors du chargement du profil");
            return response.json() as Promise<ProfileResponse>;
        },
        enabled: !!session?.user,
        staleTime: 1000 * 60,
    });

    const avatarImage = useMemo(() => {
        return profileData?.user?.image ?? session?.user?.image ?? null;
    }, [profileData?.user?.image, session?.user?.image]);

    const handleSignOut = async () => {
        await signOut({ redirect: false });
        router.push("/");
        router.refresh();
    };

    return (
        <header className="bg-white dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 sticky top-0 z-12">
            <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">F</span>
                    </div>
                    <span className="text-xl font-bold dark:text-white">Forum</span>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {session && <NotificationBell />}
                    {session ? (
                        <>
                            <button
                                onClick={() => (onCreateClick ? onCreateClick() : setIsModalOpen(true))}
                                className="hidden sm:flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Créer
                            </button>

                            {/* Mobile create button */}
                            <button
                                onClick={() => (onCreateClick ? onCreateClick() : setIsModalOpen(true))}
                                className="sm:hidden p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <UserAvatar
                                        image={avatarImage}
                                        name={session.user?.name || undefined}
                                        email={session.user?.email || undefined}
                                        size="sm"
                                    />
                                    <div className="hidden sm:flex flex-col items-start">
                                        <span className="font-medium text-sm dark:text-white">
                                            {session.user?.name}
                                        </span>
                                        {session.user?.role && session.user.role !== "USER" && (
                                            <span className="text-[10px] uppercase font-semibold text-orange-500">
                                                {session.user.role}
                                            </span>
                                        )}
                                    </div>
                                    <Menu className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </button>

                                {showMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                                            <button
                                                onClick={() => {
                                                    router.push(`/users/${session.user?.id}`);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm dark:text-white"
                                            >
                                                <User className="w-4 h-4" />
                                                Profil public
                                            </button>
                                            <button
                                                onClick={() => {
                                                    router.push("/saved");
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm dark:text-white"
                                            >
                                                <Bookmark className="w-4 h-4" />
                                                Sauvegardés
                                            </button>
                                            <button
                                                onClick={() => {
                                                    router.push("/account");
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm dark:text-white"
                                            >
                                                <User className="w-4 h-4" />
                                                Paramètres
                                            </button>
                                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm text-red-600 dark:text-red-400"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Déconnexion
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push("/auth/login")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                Connexion
                            </button>
                            <button
                                onClick={() => router.push("/auth/register")}
                                className="px-4 py-2 text-sm font-medium bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                            >
                                Inscription
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <CreateConversationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreated={() => {
                    setIsModalOpen(false);
                    // Invalider les queries pour rafraîchir la liste des conversations
                    queryClient.invalidateQueries({ queryKey: ['conversations'] });
                }}
            />
        </header>
    );
}

