import { Search, X } from 'lucide-react';
import React, { useEffect } from 'react'

const SpotLight = ({ onClose, inputRef, searchTerm, handleSearchChange, clearSearch, renderSearchResults, isSpotlight, setShowResults, searchRef, resultsRef }: {
    onClose?: () => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    searchTerm: string,
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    clearSearch: () => void,
    renderSearchResults: () => React.ReactNode,
    isSpotlight: boolean,
    setShowResults: (show: boolean) => void,
    searchRef: React.RefObject<HTMLDivElement | null>,
    resultsRef: React.RefObject<HTMLDivElement | null>,
}) => {
    console.log("SpotLight", isSpotlight);

    const handleBackdropClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target as Node)
            ) {
                onClose?.();
            }
        };

        if (isSpotlight) {
            const timer = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside);
            }, 100);

            return () => {
                clearTimeout(timer);
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [isSpotlight, onClose, searchRef]);

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <div
                className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700"
                ref={searchRef}
            >
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search movies..."
                            className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto border-t border-gray-200 dark:border-gray-700">
                    {renderSearchResults()}
                </div>
            </div>
        </div>
    )
}

export default SpotLight