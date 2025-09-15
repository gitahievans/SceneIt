import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Film, Search, X } from "lucide-react";
import Image from "next/image";
import { QueryService } from "@/app/services/queryClient";
import { Genre, MovieItem } from "@/types/types";
import { renderDefaultContent } from "./Search/DefaultSearchContent";
import SpotLight from "./Search/SpotLight";
import SearchBar from "./Search/SearchBar";
import { getUserInterests } from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/client";
import SearchResults from "./Search/SearchResults";

interface SearchComponentProps {
    onSearchClick?: (event: React.MouseEvent) => void;
    isSpotlight?: boolean;
    onClose?: () => void;
}

export interface DefaultSection {
    genreId: number;
    movies: MovieItem[];
    name: string;
}

const SearchComponent: React.FC<SearchComponentProps> = ({
    onSearchClick,
    isSpotlight = false,
    onClose,
}) => {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<MovieItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchRef = useRef<HTMLDivElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const { getPoster, searchMovies } = QueryService;

    const [defaultSections, setDefaultSections] = useState<
        DefaultSection[]
    >([]);

    useEffect(() => {
        const loadInterests = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const genres = await getUserInterests(user.id);

            const results = await Promise.all(
                genres.map(async (genreId) => {
                    const res = await QueryService.getMoviesByGenre(genreId);
                    return { genreId, movies: res.results || [] };
                })
            );
            // add a section title (the genre name)
            const genreNames = await Promise.all(
                genres.map(async (genreId) => {
                    const res = await QueryService.getGenres();
                    return { genreId, name: res.genres.find((g: Genre) => g.id === genreId)?.name };
                })
            );

            setDefaultSections(genreNames.map((genreName) => ({
                genreId: genreName.genreId,
                movies: results.find((result) => result.genreId === genreName.genreId)?.movies || [],
                name: genreName.name,
            })));
        };

        loadInterests();
    }, []);
    console.log("defaultSections", defaultSections);



    const performSearch = useCallback(async (term: string) => {
        if (!term.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setIsSearching(true);
        setError(null);

        try {
            const response = await searchMovies(term);

            if (abortControllerRef.current?.signal.aborted) {
                return;
            }
            const movies: MovieItem[] = response.results?.map((movie: MovieItem) => ({
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                poster_path: movie.poster_path,
                release_date: movie.release_date,
                vote_average: movie.vote_average,
                genre_ids: movie.genre_ids,
                runtime: null,
            })) || [];

            setSearchResults(movies);
            setShowResults(true);
        } catch (err) {
            if (!abortControllerRef.current?.signal.aborted) {
                console.error("Search error:", err);
                setError("Failed to search movies. Please try again.");
                setSearchResults([]);
                setShowResults(true);
            }
        } finally {
            setIsSearching(false);
        }
    }, [searchMovies]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [searchTerm, performSearch]);

    useEffect(() => {
        if (isSpotlight && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSpotlight]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isSpotlight) {
                onClose?.();
            }
        };

        if (isSpotlight) {
            document.addEventListener("keydown", handleEscape);
            return () => document.removeEventListener("keydown", handleEscape);
        }
    }, [isSpotlight, onClose]);

    useEffect(() => {
        if (!isSpotlight) {
            const handleClickOutside = (event: MouseEvent) => {
                console.log("handleClickOutside", event);

                if (
                    searchRef.current &&
                    !searchRef.current.contains(event.target as Node) &&
                    resultsRef.current &&
                    !resultsRef.current.contains(event.target as Node)
                ) {
                    setShowResults(false);
                }
            };

            document.addEventListener("mousedown", handleClickOutside);
            return () =>
                document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isSpotlight]);

    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm("");
        setSearchResults([]);
        setShowResults(false);
        setError(null);
    };

    const handleResultClick = (id: number) => {
        setShowResults(false);
        setSearchTerm("");
        if (isSpotlight) {
            onClose?.();
        }
        router.push(`/details/${id}`);
    };

    const handleInputClick = (event: React.MouseEvent) => {
        if (!isSpotlight && onSearchClick) {
            onSearchClick(event);
        }
    };

    const truncateText = (text: string, maxLength: number): string => {
        if (!text) return "";
        return text.length > maxLength
            ? text.substring(0, maxLength) + "..."
            : text;
    };

    const formatReleaseDate = (dateString: string): string => {
        if (!dateString) return "";
        return new Date(dateString).getFullYear().toString();
    };


    const renderSearchResults = () => {
        if (!searchTerm.trim()) {
            return renderDefaultContent(defaultSections, handleResultClick, formatReleaseDate);
        }

        if (isSearching) {
            return (
                <div className="p-8 text-center text-gray-600 dark:text-gray-300">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-lg">Searching...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-8 text-center text-red-600 dark:text-red-400">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                        <X className="w-8 h-8 text-red-500 dark:text-red-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Search Error</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
                </div>
            );
        }

        if (searchResults.length > 0) {
            return (
                <div className="py-2">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Search Results for "{searchTerm}"
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                            {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
                        </p>
                    </div>

                    {searchResults.slice(0, 10).map((item) => (
                        <SearchResults
                            key={item.id}
                            item={item}
                            handleResultClick={handleResultClick}
                            formatReleaseDate={formatReleaseDate}
                            truncateText={truncateText}
                            getPoster={getPoster}
                        />
                    ))}

                    {searchResults.length > 10 && (
                        <div className="px-6 py-4 text-center text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700">
                            Showing first 10 of {searchResults.length} results
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Search className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">No results found</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">No movies found for &quot;{searchTerm}&quot;</p>
                <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">Try different keywords</p>
            </div>
        );
    };

    if (isSpotlight) {
        return (
            <SpotLight
                onClose={onClose}
                inputRef={inputRef}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                clearSearch={clearSearch}
                renderSearchResults={renderSearchResults}
                isSpotlight={isSpotlight}
                setShowResults={setShowResults}
                searchRef={searchRef}
                resultsRef={resultsRef}
            />
        );
    }

    return (
        <SearchBar
            onSearchClick={onSearchClick}
            searchTerm={searchTerm}
            handleSearchChange={handleSearchChange}
            clearSearch={clearSearch}
            showResults={showResults}
            setShowResults={setShowResults}
            renderSearchResults={renderSearchResults}
            handleInputClick={handleInputClick}
            resultsRef={resultsRef}
            searchRef={searchRef}
        />
    );
};

export default SearchComponent;