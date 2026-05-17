"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GrNext, GrPrevious } from "react-icons/gr";

export interface PaginationData {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

interface PaginationProps {
  pagination: PaginationData;
  /** Đường dẫn trang (vd. `/problem`, `/admin/announcement`). Mặc định: pathname hiện tại */
  basePath?: string;
}

export function Pagination({ pagination, basePath }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { page, totalPages } = pagination;

  const handleEnterKeyDownOnInput = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const value = parseInt(event.currentTarget.value, 10) || 1;
    if (event.key === "Enter" && value >= 1 && value <= totalPages) {
      handlePageChange(value);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(pageNumber));
    const path = basePath ?? pathname;
    const query = params.toString();
    router.push(query ? `${path}?${query}` : path);
  };

  const getPagination = (currentPage: number, pages: number) => {
    const result: (number | "...")[] = [];

    for (let i = 1; i <= pages; i++) {
      if (i <= 3 || i > pages - 3 || Math.abs(i - currentPage) <= 1) {
        result.push(i);
      } else if (result[result.length - 1] !== "...") {
        result.push("...");
      }
    }

    return result;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pages = getPagination(page, totalPages);

  return (
    <div className="flex gap-2 items-center justify-center mt-4">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
        className="w-10 h-10 border rounded disabled:opacity-50 hover:bg-oj-orange hover:text-white"
        aria-label="Trang trước"
      >
        <GrPrevious className="justify-self-center-safe" />
      </button>

      {pages.map((pageNum, index) =>
        pageNum === "..." ? (
          <input
            key={`ellipsis-${index}`}
            type="number"
            min={1}
            max={totalPages}
            className="text-center px-2 w-10 h-10 border rounded placeholder:text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="..."
            onKeyDown={handleEnterKeyDownOnInput}
            aria-label="Nhập số trang"
          />
        ) : (
          <button
            key={pageNum}
            type="button"
            onClick={() => handlePageChange(pageNum)}
            className={`w-10 h-10 border rounded hover:bg-oj-orange hover:text-white ${
              page === pageNum ? "bg-oj-orange text-white" : "bg-white"
            }`}
          >
            {pageNum}
          </button>
        ),
      )}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
        className="h-10 px-3 py-1 border rounded disabled:opacity-50 hover:bg-oj-orange hover:text-white"
        aria-label="Trang sau"
      >
        <GrNext />
      </button>
    </div>
  );
}
