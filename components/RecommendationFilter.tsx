"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, ChevronDown, Search, Heart, TrendingUp, Star, User, Eye } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

interface RecommendationFilterProps {
  onFilterChange: (activeFilters: string[]) => void;
  filterOptions: FilterOption[];
  className?: string;
}

const RecommendationFilter: React.FC<RecommendationFilterProps> = ({
  onFilterChange,
  filterOptions,
  className = ""
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleFilterToggle = (filterId: string) => {
    let newActiveFilters: string[];

    if (filterId === "all") {
      newActiveFilters = ["all"];
    } else {
      const filteredActive = activeFilters.filter(f => f !== "all");
      
      if (filteredActive.includes(filterId)) {
        newActiveFilters = filteredActive.filter(f => f !== filterId);
        if (newActiveFilters.length === 0) {
          newActiveFilters = ["all"];
        }
      } else {
        newActiveFilters = [...filteredActive, filterId];
      }
    }

    setActiveFilters(newActiveFilters);
    onFilterChange(newActiveFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters(["all"]);
    onFilterChange(["all"]);
  };

  const totalCount = filterOptions.reduce((sum, option) => sum + option.count, 0);

  const allOption: FilterOption = {
    id: "all",
    label: "All Recommendations",
    icon: <Eye size={16} />,
    count: totalCount,
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  };

  const allOptions = [allOption, ...filterOptions];

  const activeCount = activeFilters.includes("all") ? 1 : activeFilters.length;

  return (
    <div className={`sticky top-16 z-10 ${className}`}>
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
        {isMobile && (
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Filter className="text-orange-600 dark:text-orange-400" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Filter Recommendations
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeCount} filter{activeCount !== 1 ? 's' : ''} active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronDown 
                className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                size={20}
                color="orange"
              />
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Filter className="text-orange-600 dark:text-orange-400" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter Your Recommendations
              </h3>
            </div>
            {!activeFilters.includes("all") && activeFilters.length > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        )}

        <div className={`${isMobile && !isExpanded ? 'hidden' : 'block'}`}>
          <div className="p-4 space-y-3">
            <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
              {allOptions.map((option) => {
                const isActive = activeFilters.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterToggle(option.id)}
                    className={`relative group flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 shadow-md'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' 
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate transition-colors ${
                          isActive 
                            ? 'text-orange-900 dark:text-orange-100' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {option.label}
                        </p>
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.count}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/5 to-pink-500/5 dark:from-orange-400/5 dark:to-pink-400/5 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {isMobile && !activeFilters.includes("all") && activeFilters.length > 0 && (
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={clearAllFilters}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={14} />
                  <span>Clear All Filters</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationFilter;

export const createFilterOptions = (
  trendingCount: number,
  interestCount: number,
  searchCount: number,
  favoritesCount: number,
  additionalCounts: { [key: string]: number } = {}
): FilterOption[] => {
  const baseOptions: FilterOption[] = [
    {
      id: "trending",
      label: "Trending & Popular",
      icon: <TrendingUp size={16} />,
      count: trendingCount,
      color: "bg-gradient-to-r from-red-500 to-orange-500"
    },
    {
      id: "interests",
      label: "Your Interests",
      icon: <User size={16} />,
      count: interestCount,
      color: "bg-gradient-to-r from-blue-500 to-purple-500"
    },
    {
      id: "searches",
      label: "Recent Searches",
      icon: <Search size={16} />,
      count: searchCount,
      color: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      id: "favorites",
      label: "Similar to Favorites",
      icon: <Heart size={16} />,
      count: favoritesCount,
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    }
  ];

  Object.entries(additionalCounts).forEach(([key, count]) => {
    baseOptions.push({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: <Star size={16} />,
      count,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    });
  });

  return baseOptions.filter(option => option.count > 0);
};