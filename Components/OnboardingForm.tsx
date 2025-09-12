"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./Providers";
import { QueryService } from "@/app/services/queryClient";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {
    const { user } = useAuth();
    const router = useRouter();
    const [selected, setSelected] = useState<number[]>([]);
    const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // fetch genres from TMDB
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
            
            // Force navigation to home after successful save
            router.push("/");
            router.refresh(); // Refresh the page to update server components
        } catch (error) {
            console.error("Failed to save interests:", error);
            alert("Failed to save preferences. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Pick your favorite genres</h1>
            <div className="grid grid-cols-2 gap-2">
                {genres.map((g) => (
                    <button
                        key={g.id}
                        onClick={() => toggleGenre(g.id)}
                        className={`p-2 rounded border ${selected.includes(g.id) ? "bg-blue-600 text-white" : "bg-gray-200"
                            }`}
                    >
                        {g.name}
                    </button>
                ))}
            </div>
            <button
                onClick={saveInterests}
                disabled={loading || selected.length === 0}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Saving..." : "Save Interests"}
            </button>
        </div>
    );
}