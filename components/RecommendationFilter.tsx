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
    label: "All",
    icon: <Eye size={14} />,
    count: totalCount,
    color: "bg-gradient-to-r from-purple-500 to-pink-500"
  };

  const allOptions = [allOption, ...filterOptions];

  const activeCount = activeFilters.includes("all") ? 1 : activeFilters.length;
  const hasActiveFilters = !activeFilters.includes("all") && activeFilters.length > 0;

  const getActiveFilterSummary = () => {
    if (activeFilters.includes("all")) return "All";
    if (activeFilters.length === 1) {
      const filter = allOptions.find(f => f.id === activeFilters[0]);
      return filter?.label || "Custom Filter";
    }
    return `${activeFilters.length} filters active`;
  };

  return (
    <div className={`sticky top-16 z-10 ${className}`}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Filter className="text-orange-600 dark:text-orange-400" size={16} />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {getActiveFilterSummary()}
              </span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium">
                  {activeCount}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Clear filters"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title={isExpanded ? "Hide filters" : "Show filters"}
            >
              <ChevronDown 
                className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                size={20}
                color="orange"
              />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className={`grid gap-2 ${
              isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            }`}>
              {allOptions.map((option) => {
                const isActive = activeFilters.includes(option.id);
                
                return (
                  <button
                    key={option.id}
                    onClick={() => handleFilterToggle(option.id)}
                    className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 text-left text-sm ${
                      isActive
                        ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                        : 'bg-gray-50 dark:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <div className={`flex-shrink-0 p-1 rounded transition-colors ${
                        isActive 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {option.icon}
                      </div>
                      <span className={`font-medium truncate ${
                        isActive 
                          ? 'text-orange-900 dark:text-orange-100' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {option.label}
                      </span>
                    </div>
                    
                    <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                      isActive
                        ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {option.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
      label: "Trending",
      icon: <TrendingUp size={14} />,
      count: trendingCount,
      color: "bg-gradient-to-r from-red-500 to-orange-500"
    },
    {
      id: "interests",
      label: "Interests",
      icon: <User size={14} />,
      count: interestCount,
      color: "bg-gradient-to-r from-blue-500 to-purple-500"
    },
    {
      id: "searches",
      label: "Searches",
      icon: <Search size={14} />,
      count: searchCount,
      color: "bg-gradient-to-r from-green-500 to-teal-500"
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart size={14} />,
      count: favoritesCount,
      color: "bg-gradient-to-r from-pink-500 to-rose-500"
    }
  ];

  Object.entries(additionalCounts).forEach(([key, count]) => {
    baseOptions.push({
      id: key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      icon: <Star size={14} />,
      count,
      color: "bg-gradient-to-r from-indigo-500 to-purple-500"
    });
  });

  return baseOptions.filter(option => option.count > 0);
};