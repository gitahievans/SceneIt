'use client'

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/Providers';
import { getUserInterests } from '@/utils/supabase/queries';
import { QueryService } from '../services/queryClient';
import { Edit } from 'lucide-react';
import Loading from '@/components/Loader';

export default function ProfilePage() {
    const { user, loading } = useAuth();
    const [allGenres, setAllGenres] = useState<{ id: number; name: string }[]>([]);
    const [userInterests, setUserInterests] = useState<number[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        QueryService.getGenres().then((data) => setAllGenres(data.genres));
    }, []);

    useEffect(() => {
        const fetchInterests = async () => {
            if (user) {
                const selectedGenres = await getUserInterests(user.id);
                setUserInterests(selectedGenres);
                setSelectedGenres(selectedGenres);
            }
        };
        fetchInterests();
    }, [user]);

    const getUserGenreNames = (genreIds: number[]) => {
        return genreIds.map(id => {
            const genre = allGenres.find(g => g.id === id);
            return genre ? genre.name : `Genre ${id}`;
        });
    };

    const toggleGenre = (id: number) => {
        setSelectedGenres((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const handleSaveInterests = async () => {
        if (!user || selectedGenres.length === 0) return;

        setSaveLoading(true);
        try {
            await fetch("/api/interests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: user.id, genres: selectedGenres }),
            });

            setUserInterests(selectedGenres);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update interests:", error);
            alert("Failed to update preferences. Please try again.");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setSelectedGenres(userInterests);
        setIsEditing(false);
    };

    if (loading) {
        return <Loading message="Loading Your Profile..."/>
    }

    if (!user) {
        return <div className="p-4">You must log in to see your profile.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 p-4 md:p-8 mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-4">
                        Profile
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{user.email}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">SceneIt Member</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/40 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 dark:border-gray-700/50 p-4 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Your Interests
                        </h2>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                            >
                                <Edit className="w-4 h-4" />
                                <p className="text-sm">Edit Interests</p>
                            </button>
                        )}
                    </div>

                    {!isEditing ? (
                        <div>
                            {userInterests.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {getUserGenreNames(userInterests).map((genreName, index) => (
                                        <div
                                            key={userInterests[index]}
                                            className="px-4 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 dark:from-purple-500/10 dark:to-blue-500/10 backdrop-blur-sm rounded-xl border border-purple-300/30 dark:border-purple-500/20"
                                        >
                                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                                {genreName}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 2v12a2 2 0 002 2h8a2 2 0 002-2V6" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 dark:text-gray-400 text-lg">No interests selected yet.</p>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                                    >
                                        Add Your Interests
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="mb-6 flex items-center justify-center">
                                <div className="px-4 py-2 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-full border border-white/60 dark:border-gray-600/50">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                                {allGenres.map((genre) => (
                                    <button
                                        key={genre.id}
                                        onClick={() => toggleGenre(genre.id)}
                                        className={`
                                            group relative px-4 py-3 rounded-2xl font-semibold text-sm
                                            transition-all duration-300 transform hover:scale-105 active:scale-95
                                            border-2 backdrop-blur-sm shadow-lg hover:shadow-xl
                                            ${selectedGenres.includes(genre.id)
                                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 border-purple-400 text-white shadow-purple-500/25'
                                                : 'bg-white/30 dark:bg-gray-700/30 border-white/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                                            }
                                        `}
                                    >
                                        <span className="relative z-10">{genre.name}</span>

                                        {selectedGenres.includes(genre.id) && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                <button
                                    onClick={handleSaveInterests}
                                    disabled={saveLoading || selectedGenres.length === 0}
                                    className={`
                                        flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                                        transition-all duration-300 transform hover:scale-105 active:scale-95
                                        shadow-xl hover:shadow-2xl backdrop-blur-sm border-2 min-w-[200px] justify-center
                                        ${saveLoading || selectedGenres.length === 0
                                            ? 'bg-gray-300/50 dark:bg-gray-600/50 border-gray-400/30 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-green-400 text-white shadow-green-500/25'
                                        }
                                    `}
                                >
                                    {saveLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleCancelEdit}
                                    disabled={saveLoading}
                                    className="flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg
                                             bg-white/50 dark:bg-gray-700/50 border-2 border-gray-400/50 dark:border-gray-500/50
                                             text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70
                                             transition-all duration-300 transform hover:scale-105 min-w-[200px] justify-center
                                             disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>Cancel</span>
                                </button>
                            </div>

                            {selectedGenres.length === 0 && (
                                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm rounded-lg px-4 py-2 inline-block border border-white/40 dark:border-gray-600/40">
                                    💡 Select at least one genre to save
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}