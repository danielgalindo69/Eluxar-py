import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export const AdminPaginator = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: AdminPaginatorProps) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Build page numbers with ellipsis
  const getPages = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#EDEDED] dark:border-white/8">
      <span className="text-[10px] uppercase tracking-widest font-bold text-[#2B2B2B]/40 dark:text-white/30">
        Mostrando {start}–{end} de {totalItems} registros
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} className="text-[#2B2B2B] dark:text-white" />
        </button>

        {getPages().map((page, i) =>
          page === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[10px] text-[#2B2B2B]/30 dark:text-white/30"
            >
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 text-[10px] uppercase tracking-widest font-bold transition-colors ${
                currentPage === page
                  ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111]"
                  : "hover:bg-[#EDEDED] dark:hover:bg-white/8 text-[#2B2B2B] dark:text-white/60"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 hover:bg-[#EDEDED] dark:hover:bg-white/8 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} className="text-[#2B2B2B] dark:text-white" />
        </button>
      </div>
    </div>
  );
};
