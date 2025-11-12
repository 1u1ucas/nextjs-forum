import { Shield, Users, MessageCircle, Heart, Code, Zap } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-4xl">F</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        À propos de Forum
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Une plateforme communautaire moderne pour partager, discuter et apprendre ensemble
                    </p>
                </div>

                {/* Mission */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Notre Mission
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Forum est une plateforme créée pour faciliter les échanges constructifs et le partage de connaissances. 
                        Notre objectif est de construire une communauté bienveillante où chacun peut s'exprimer, apprendre et 
                        contribuer librement.
                    </p>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                            <MessageCircle className="w-6 h-6 text-orange-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Discussions riches
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Support Markdown, threads imbriqués et système de votes pour des conversations enrichissantes
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                            <Users className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Communauté active
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Rejoignez des milliers d'utilisateurs passionnés et partagez vos connaissances
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                            <Shield className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Modération active
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Un environnement sûr et respectueux grâce à notre équipe de modération
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Rapide et moderne
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Interface élégante, dark mode et performances optimales pour une expérience fluide
                        </p>
                    </div>
                </div>

                {/* Rules */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Règles de la communauté
                    </h2>
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold">1</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Soyez respectueux</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Traitez les autres membres avec respect et courtoisie, même en cas de désaccord.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold">2</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Pas de spam</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Évitez le spam, la publicité excessive et les contenus répétitifs.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold">3</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Contenu approprié</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Partagez uniquement du contenu approprié et légal. Pas de contenu offensant ou illégal.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold">4</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Utilisez les bonnes catégories</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Publiez dans la catégorie appropriée pour faciliter la navigation.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-orange-500 font-bold">5</span>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Contribuez positivement</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Apportez de la valeur à la communauté avec des contributions constructives.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Code className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Technologies utilisées
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['Next.js 15', 'React 19', 'TypeScript', 'Tailwind CSS', 'Prisma', 'PostgreSQL', 'NextAuth.js'].map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span>Fait avec passion pour la communauté</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

