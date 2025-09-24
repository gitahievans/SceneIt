"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./Common/Providers";
import { QueryService } from "@/app/services/queryClient";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [selected, setSelected] = useState<number[]>([]);
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        QueryService.getGenres().then((data) => setGenres(data.genres));
    }, []);

    const toggleGenre = (id: number) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const saveInterests = async () => {
        if (!user || selected.length === 0) return;
        
        setLoading(true);
        try {
            await fetch("/api/interests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, genres: selected }),
            });
            
            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Failed to save interests:", error);
            alert("Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-purple-400/20 dark:bg-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-blue-400/20 dark:bg-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/20 dark:bg-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative w-full max-w-4xl">
                <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                    Welcome to SceneIt!
                                </h1>
                                <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mx-auto mt-2"></div>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                            Help us personalize your movie experience by selecting your favorite genres
                        </p>
                        
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full border border-white/60 dark:border-gray-600/50">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {selected.length} genre{selected.length !== 1 ? 's' : ''} selected
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                            {genres.map((g) => (
                                <button
                                    key={g.id}
                                    onClick={() => toggleGenre(g.id)}
                                    className={`
                                        group relative px-4 py-3 md:px-6 md:py-4 rounded-2xl font-semibold text-sm md:text-base
                                        transition-all duration-300 transform hover:scale-105 active:scale-95
                                        border-2 backdrop-blur-sm shadow-lg hover:shadow-xl
                                        ${selected.includes(g.id)
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-400 text-white shadow-purple-500/25' 
                                            : 'bg-white/30 dark:bg-gray-700/30 border-white/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:border-white/70 dark:hover:border-gray-600/70'
                                        }
                                    `}
                                >
                                    <span className="relative z-10">{g.name}</span>
                                    
                                    {selected.includes(g.id) && (
                                        <div className="absolute top-2 right-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-gray-300/10 to-transparent 
                                                  -translate-x-full group-hover:translate-x-full transition-transform duration-1000 
                                                  pointer-events-none rounded-2xl" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <button
                            onClick={saveInterests}
                            disabled={loading || selected.length === 0}
                            className={`
                                group relative inline-flex items-center justify-center gap-3 
                                px-8 py-4 md:px-12 md:py-5 rounded-2xl font-bold text-lg md:text-xl
                                transition-all duration-300 transform hover:scale-105 active:scale-95
                                shadow-xl hover:shadow-2xl backdrop-blur-sm border-2
                                ${loading || selected.length === 0
                                    ? 'bg-gray-300/50 dark:bg-gray-600/50 border-gray-400/30 dark:border-gray-500/30 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-green-400 text-white shadow-green-500/25'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving Your Preferences...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-6 h-6 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Start My Movie Journey</span>
                                </>
                            )}
                            
                            {!loading && selected.length > 0 && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/30 to-emerald-400/30 
                                              opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            )}
                        </button>
                        
                        {selected.length === 0 && (
                            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg px-4 py-2 inline-block border border-white/40 dark:border-gray-600/40">
                                💡 Select at least one genre to continue
                            </p>
                        )}
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't worry, you can always change your preferences later in your profile settings
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}