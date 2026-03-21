import React from "react";
import Icon from "./Icon.jsx";

/**
 * Standalone Pagination Component
 * 
 * Props:
 * - currentPage: Number
 * - totalPages: Number
 * - onPageChange: Function (page)
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // if (totalPages <= 1) return null; // Removed so user can see it's there

  // Default to at least 1 page if totalPages is 0
  const safeTotalPages = Math.max(1, totalPages);

  const renderPageNumbers = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(safeTotalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key="1" onClick={() => onPageChange(1)} className={`page-btn ${currentPage === 1 ? 'active' : ''}`}>1</button>
      );
      if (startPage > 2) buttons.push(<span key="sep1" className="page-sep">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => onPageChange(i)} className={`page-btn ${currentPage === i ? 'active' : ''}`}>{i}</button>
      );
    }

    if (endPage < safeTotalPages) {
      if (endPage < safeTotalPages - 1) buttons.push(<span key="sep2" className="page-sep">...</span>);
      buttons.push(
        <button key={safeTotalPages} onClick={() => onPageChange(safeTotalPages)} className={`page-btn ${currentPage === safeTotalPages ? 'active' : ''}`}>{safeTotalPages}</button>
      );
    }

    return buttons;
  };

  return (
    <div className="pagination-wrapper">
      <button 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        className="page-nav-btn"
        title="Sebelumnya"
      >
        <Icon name="chevron-left" size={14} />
      </button>
      
      <div className="page-numbers">
        {renderPageNumbers()}
      </div>

      <button 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        className="page-nav-btn"
        title="Selanjutnya"
      >
        <Icon name="chevron-right" size={14} />
      </button>

      <style>{`
        .pagination-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 30px;
          padding: 10px;
        }
        .page-numbers {
          display: flex;
          gap: 6px;
        }
        .page-btn, .page-nav-btn {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: 1.5px solid var(--border);
          background: #fff;
          cursor: pointer;
          font-size: .85rem;
          font-weight: 700;
          transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text);
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .page-btn:hover:not(.active), .page-nav-btn:hover:not(:disabled) {
          border-color: var(--blue);
          color: var(--blue);
          background: #f0f7ff;
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }
        .page-btn.active {
          background: linear-gradient(135deg, var(--blue), #60a5fa);
          border-color: var(--blue);
          color: #fff;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transform: scale(1.05);
        }
        .page-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f8fafc;
          box-shadow: none;
        }
        .page-sep {
          display: flex;
          align-items: center;
          padding: 0 4px;
          color: var(--muted);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
