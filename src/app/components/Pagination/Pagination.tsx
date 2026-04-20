"use client"

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
export const Pagination = (props: {
  pagination: Pagination
}) => {
  const router = useRouter();
  const param = useSearchParams();
  const { pagination } = props;
  const { page, pageSize, totalPages } = pagination;
  const [currentPage, setCurrentPage] = useState<number>(parseInt(`${param.get("page")}`) || 1);


  const handleEnterKeyDownOnInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const value = parseInt(`${event.currentTarget.value}`) || 1;

    if (event.key === "Enter" && value > 0 && value < totalPages) {
      handlePageChange(value);
    }
  }
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    router.push(`?page=${pageNumber}`);
  }
  const getPagination = (currentPage: number, totalPages: number) => {
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= 3 || // đầu
        i > totalPages - 3 || // cuối
        Math.abs(i - currentPage) <= 1 // xung quanh current
      ) {
        pages.push(i);
      } else {
        if (pages[pages.length - 1] !== "...") {
          pages.push("...");
        }
      }
    }

    return pages;
  };
  const pages = getPagination(currentPage, totalPages);

  return (
    <div className="flex gap-2 items-center justify-center mt-4">
      {/* Previous */}
      <button
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
        className=" w-10 h-10 border rounded disabled:opacity-50 hover:bg-oj-orange hover:text-white"
      >
        <GrPrevious className="justify-self-center-safe"/>
      </button>

      {/* Page numbers */}
        {pages.map((page, index) =>
          page === "..." ? (
            <input key={index} type="number" min={0} max={totalPages} maxLength={totalPages} className=" text-center px-2 w-10 h-10 border rounded placeholder:text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" placeholder="..."
              onKeyDown={(event) => handleEnterKeyDownOnInput(event)}
            >
            </input>
          ) : (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 border rounded hover:bg-oj-orange hover:text-white ${currentPage === page
                ? "bg-oj-orange text-white"
                : "bg-white"
                }`}
            >
              {page}
            </button>
          )
        )}

      {/* Next */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
        className="h-10 px-3 py-1 border rounded disabled:opacity-50 hover:bg-oj-orange hover:text-white"
      >
        <GrNext />
      </button>
    </div>
  );
}