import React from 'react';
import { DynamicIcon } from 'lucide-react/dynamic';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  showProgress?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showLoadMore = false,
  onLoadMore,
  showProgress = false,
  totalItems = 0,
  itemsPerPage = 1,
  className = ""
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="flex items-center space-x-2 flex-wrap justify-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
          aria-label="Previous page"
        >
          <DynamicIcon name="chevron-left" size={16} className="mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-sm font-medium text-gray-700">
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                  } border`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 transition-colors"
          aria-label="Next page"
        >
          Next
          <DynamicIcon name="chevron-right" size={16} className="ml-1" />
        </button>
      </div>

      {showLoadMore && currentPage < totalPages && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:scale-105 transition-transform shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <DynamicIcon name="plus" size={20} className="mr-2" />
          Load More ({totalPages - currentPage} remaining)
        </button>
      )}

      {showProgress && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>
              {currentPage} of {totalPages} pages
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
          {totalItems > 0 && (
            <div className="text-center text-xs text-gray-500 mt-2">
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
            </div>
          )}
        </div>
      )}

      <div className="text-sm text-gray-600 text-center">
        Page {currentPage} of {totalPages}
        {totalItems > 0 && ` • ${totalItems} total items`}
      </div>
    </div>
  );
};

export default PaginationComponent;