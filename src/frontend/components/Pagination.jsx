import React from "react";
import { Button } from "./Bouton";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Calcule la plage de pages à afficher (max 5)
  const MAX_PAGES = totalPages > 5  ? 5 : totalPages ;
  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + MAX_PAGES);

    // si on est à la fin, recule pour garder 5 pages affichées
    if (end - start < MAX_PAGES) {
      start = Math.max(1, end - MAX_PAGES - 1);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pages = getVisiblePages();

  return (
    <div className="flex items-center mt-8">
      {/* Précédent */}
      <Button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`h-10 flex items-center justify-center bg-white rounded-none px-3 py-1 border border-black text-md font-extrabold ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-black hover:bg-gray-100"
        }`}
      >
        Précédent
      </Button>

      {/* Pages */}
      {pages.map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          className={`h-10 flex items-center justify-center w-10 rounded-none px-3 py-1 text-sm border border-[#2871FA] ${
            page === currentPage
              ? "bg-blue-500 text-white font-semibold border "
              : "bg-white text-black font-semibold hover:bg-gray-100"
          }`}
        >
          {page}
        </Button>
      ))}

      {/* Suivant */}
      <Button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        disabled={currentPage === totalPages}
        className={`h-10 flex items-center justify-center rounded-none px-3 py-1 bg-white border border-black text-md font-bold ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-black hover:bg-gray-100"
        }`}
      >
        Suivant
      </Button>
    </div>
  );
};

export default Pagination;
