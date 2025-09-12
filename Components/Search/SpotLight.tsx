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
        // Only close if clicking the backdrop itself, not its children
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
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleBackdropClick}
            />
            <div
                className="relative w-full max-w-2xl bg-black rounded-lg shadow-2xl border border-gray-800"
                ref={searchRef}
            >
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Search movies..."
                            className="w-full pl-12 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-lg"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {renderSearchResults()}
                </div>
            </div>
        </div>
    )
}

export default SpotLight