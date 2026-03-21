import React, { useState, useMemo } from "react";
import Icon from "./Icon.jsx";

/**
 * Premium DataTable Component
 * Features: Search, Entries per page, Pagination, Info text.
 * 
 * Props:
 * - headers: Array of strings or objects { label, key, style }
 * - data: Array of objects (the full dataset)
 * - renderRow: Function to render <tr> based on a single item data
 * - searchPlaceholder: String
 */
export default function DataTable({ 
  headers = [], 
  data = [], 
  renderRow, 
  searchPlaceholder = "Cari data...",
  emptyMessage = "Tidak ada data ditemukan."
}) {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // ── Filter Data ──────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!search) return data;
    const s = search.toLowerCase();
    return data.filter(item => {
      // Search in all values of the object
      return Object.values(item).some(val => 
        String(val).toLowerCase().includes(s)
      );
    });
  }, [data, search]);

  // ── Pagination Logic ─────────────────────────────────────────
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / entries) || 1;
  
  // Reset page if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, entries]);

  const startIndex = (currentPage - 1) * entries;
  const paginatedData = filteredData.slice(startIndex, startIndex + entries);

  // ── Render Helpers ───────────────────────────────────────────
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key="1" onClick={() => setCurrentPage(1)} className={`page-btn ${currentPage === 1 ? 'active' : ''}`}>1</button>
      );
      if (startPage > 2) buttons.push(<span key="sep1" className="page-sep">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => setCurrentPage(i)} className={`page-btn ${currentPage === i ? 'active' : ''}`}>{i}</button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push(<span key="sep2" className="page-sep">...</span>);
      buttons.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}>{totalPages}</button>
      );
    }

    return buttons;
  };

  return (
    <div className="premium-datatable">
      {/* ── Top Controls ── */}
      <div className="dt-controls-top">
        <div className="dt-entries">
          Tampilkan 
          <select value={entries} onChange={e => setEntries(Number(e.target.value))}>
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
          data
        </div>
        <div className="dt-search">
          <i className="fa-solid fa-search" style={{ fontSize: 14, color: 'var(--muted)' }}></i>
          <input 
            type="text" 
            placeholder={searchPlaceholder} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="table-card" style={{ boxShadow: 'none', border: '1px solid var(--border)', margin: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                {headers.map((h, i) => {
                  const label = typeof h === 'string' ? h : h.label;
                  const align = typeof h === 'object' && h.align ? h.align : 'left';
                  const style = typeof h === 'object' && h.style ? h.style : {};
                  return (
                    <th key={i} style={{ textAlign: align, ...style }}>{label}</th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const rowData = renderRow(item, idx);
                  if (Array.isArray(rowData)) {
                    return (
                      <tr key={idx}>
                        {rowData.map((cell, cellIdx) => {
                          const h = headers[cellIdx];
                          const align = typeof h === 'object' && h.align ? h.align : 'left';
                          return (
                            <td key={cellIdx} style={{ textAlign: align }}>
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  }
                  return React.isValidElement(rowData) ? React.cloneElement(rowData, { key: idx }) : null;
                })
              ) : (
                <tr>
                  <td colSpan={headers.length} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: 16, opacity: 0.3 }}><i className="fa-regular fa-folder-open"></i></div>
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bottom Controls ── */}
      <div className="dt-controls-bottom">
        <div className="dt-info">
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entries, totalItems)} of {totalItems} entries
        </div>
        <div className="dt-pagination">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            className="page-nav-btn"
          >
            <Icon name="chevron-left" size={12} />
          </button>
          
          <div className="page-numbers">
            {renderPaginationButtons()}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            className="page-nav-btn"
          >
            <Icon name="chevron-right" size={12} />
          </button>
        </div>
      </div>

      <style>{`
        .premium-datatable {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .dt-controls-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .dt-entries {
          font-size: .82rem;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dt-entries select {
          padding: 4px 8px;
          border-radius: 8px;
          border: 1.5px solid var(--border);
          background: #fff;
          font-family: inherit;
          font-size: .82rem;
          cursor: pointer;
        }
        .dt-search {
          position: relative;
          display: flex;
          align-items: center;
        }
        .dt-search i, .dt-search .icon-component {
          position: absolute;
          left: 12px;
          color: var(--muted);
          pointer-events: none;
        }
        .dt-search input {
          padding: 9px 12px 9px 36px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          font-family: inherit;
          font-size: .82rem;
          width: 240px;
          transition: border-color .15s, box-shadow .15s;
        }
        .dt-search input:focus {
          outline: none;
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .dt-controls-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 4px 0;
        }
        .dt-info {
          font-size: .8rem;
          color: var(--muted);
        }
        .dt-pagination {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .page-numbers {
          display: flex;
          gap: 4px;
        }
        .page-btn, .page-nav-btn {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: #fff;
          cursor: pointer;
          font-size: .8rem;
          font-weight: 700;
          transition: all .15s cubic-bezier(0.4, 0, 0.2, 1);
          color: var(--text);
        }
        .page-btn:hover:not(.active), .page-nav-btn:hover:not(:disabled) {
          border-color: var(--blue);
          color: var(--blue);
          background: #f0f7ff;
          transform: translateY(-2px);
        }
        .page-btn.active {
          background: linear-gradient(135deg, var(--blue), #60a5fa);
          border-color: var(--blue);
          color: #fff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }
        .page-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: #f8fafc;
        }
        .page-sep {
          display: flex;
          align-items: center;
          padding: 0 4px;
          color: var(--muted);
          font-size: .8rem;
        }

        @media (max-width: 600px) {
          .dt-controls-top, .dt-controls-bottom {
            flex-direction: column;
            align-items: stretch;
          }
          .dt-search input {
            width: 100%;
          }
          .dt-pagination {
            justify-content: center;
          }
          .dt-info {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
