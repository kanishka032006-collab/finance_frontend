import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total, limit } = pagination;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F4] bg-white px-4 py-3.5 sm:px-6 rounded-b-2xl">
      <div className="text-xs text-[#718096] text-center sm:text-left">
        Showing <span className="font-num font-bold text-[#17233C]">{startItem}</span> to{' '}
        <span className="font-num font-bold text-[#17233C]">{endItem}</span> of{' '}
        <span className="font-num font-bold text-[#17233C]">{total}</span> results
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center justify-center gap-1 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#E2E8F4] text-xs font-semibold text-[#17233C] bg-[#F5F7FC] hover:bg-[#EEF2FC] hover:text-[#2446A8] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <span className="text-xs text-[#718096] px-2 font-semibold whitespace-nowrap">
          Page <span className="font-num text-[#17233C]">{page}</span> of{' '}
          <span className="font-num text-[#17233C]">{totalPages}</span>
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center justify-center gap-1 min-h-[40px] px-3.5 py-1.5 rounded-xl border border-[#E2E8F4] text-xs font-semibold text-[#17233C] bg-[#F5F7FC] hover:bg-[#EEF2FC] hover:text-[#2446A8] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
