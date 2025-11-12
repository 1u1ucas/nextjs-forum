"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Lock, Palette, Save, Loader2 } from "lucide-react";
import AvatarUpload from "@/components/app/user/AvatarUpload";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function AccountPage() {
    const { data: session, update } = useSession();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    // Profile form
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    
    // Password form
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Récupérer les statistiques du profil
    const { data: profileData } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const response = await fetch("/api/user/profile");
            if (!response.ok) throw new Error("Erreur lors du chargement");
            return response.json();
        },
        enabled: !!session?.user,
    });

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
        }
        if (profileData?.user) {
            setBio(profileData.user.bio || "");
        }
    }, [session, profileData]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, bio }),
            });

            if (!response.ok) throw new Error("Erreur lors de la mise à jour");

            await update({ name });
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch("/api/user/password", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Erreur");
            }

            setMessage({ type: 'success', text: 'Mot de passe changé avec succès !' });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">Veuillez vous connecter</div>
            </div>
        );
    }

    const stats = profileData?.user?.stats || {
        posts: 0,
        comments: 0,
        badges: 0,
        karma: 0,
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Paramètres du compte
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Gérez vos informations personnelles et vos préférences
                    </p>
                </div>

                {/* Message d'alerte */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Profil
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Mettez à jour vos informations publiques
                        </p>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
                        {/* Avatar */}
                        <div className="flex justify-center">
                            <AvatarUpload
                                currentAvatar={session.user.image || profileData?.user?.image}
                                userName={session.user.name || undefined}
                                onUploadComplete={async (imageUrl) => {
                                    if (imageUrl) {
                                        await update({ image: imageUrl });
                                    } else {
                                        await update();
                                    }
                                    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="Votre nom"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={session.user.email || ""}
                                disabled
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                L'email ne peut pas être modifié
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Bio
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                                placeholder="Parlez-nous de vous..."
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Sécurité
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Changez votre mot de passe
                        </p>
                    </div>
                    <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Mot de passe actuel
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Lock className="w-4 h-4" />
                                )}
                                Changer le mot de passe
                            </button>
                        </div>
                    </form>
                </div>

                {/* Stats Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Statistiques
                            </h2>
                        </div>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-orange-500">{stats.posts}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Posts</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-blue-500">{stats.comments}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Commentaires</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-green-500">{stats.karma}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Karma</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <div className="text-2xl font-bold text-purple-500">{stats.badges}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Badges</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
