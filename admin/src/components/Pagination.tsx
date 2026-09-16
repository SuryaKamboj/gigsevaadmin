import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemLabel = 'records',
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 bg-[#F4F6F8] border-t border-[#D5DCE3]">
      <div className="text-xs text-[#5B6573] text-center sm:text-left font-mono">
        Showing <span className="font-bold text-[#1F2933]">{startItem}</span>–<span className="font-bold text-[#1F2933]">{endItem}</span> of{' '}
        <span className="font-bold text-[#1F2933]">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded-xs border border-[#D5DCE3] bg-white text-[#5B6573] hover:bg-[#EAF2F8] hover:text-[#12355B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`min-w-[28px] h-7 px-1.5 rounded-xs text-xs font-mono font-semibold transition-colors cursor-pointer ${
                currentPage === page
                  ? 'bg-[#12355B] text-white'
                  : 'text-[#1F2933] bg-white border border-[#D5DCE3] hover:bg-[#EAF2F8]'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 text-[#5B6573] text-xs font-mono">
              {page}
            </span>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded-xs border border-[#D5DCE3] bg-white text-[#5B6573] hover:bg-[#EAF2F8] hover:text-[#12355B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
