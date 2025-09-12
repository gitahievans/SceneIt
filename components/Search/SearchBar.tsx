import { Search, X } from 'lucide-react';
import React from 'react'

const SearchBar = ({ onSearchClick,
    searchTerm,
    handleSearchChange,
    clearSearch,
    showResults,
    setShowResults,
    renderSearchResults,
    handleInputClick,
    searchRef,
    resultsRef }: {
        onSearchClick?: (event: React.MouseEvent) => void;
        searchTerm: string;
        handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        clearSearch: () => void;
        showResults: boolean;
        setShowResults: (show: boolean) => void;
        renderSearchResults: () => React.ReactNode,
        handleInputClick: (event: React.MouseEvent) => void,
        searchRef: React.RefObject<HTMLDivElement | null>,
        resultsRef: React.RefObject<HTMLDivElement | null>,
    }) => {
    return (
        <div className="relative">
            <div className="relative max-w-md mx-auto" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onClick={handleInputClick}
                        placeholder="Search movies..."
                        className="w-full pl-10 pr-10 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                        readOnly={!!onSearchClick}
                    />
                    {searchTerm && !onSearchClick && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {!onSearchClick && showResults && (
                    <div
                        ref={resultsRef}
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
                    >
                        {renderSearchResults()}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchBar