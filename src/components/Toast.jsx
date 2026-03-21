// ============================================================
// Toast.jsx — Sistem notifikasi toast global
// Usage: import { useToast } dari './Toast'
//        const toast = useToast()
//        toast.success("Berhasil disimpan!")
//        toast.error("Gagal menyimpan!")
//        toast.info("Data dimuat...")
//        toast.warning("Perhatian!")
// ============================================================
import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = "info", duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
    }, duration);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400);
  }, []);

  const toast = {
    success: (msg, dur)  => add(msg, "success", dur),
    error:   (msg, dur)  => add(msg, "error",   dur || 5000),
    info:    (msg, dur)  => add(msg, "info",     dur),
    warning: (msg, dur)  => add(msg, "warning",  dur),
    loading: (msg)       => add(msg, "loading",  999999),
    dismiss: remove,
  };

  const CONFIGS = {
    success: { icon: "fa-circle-check",      bg: "#f0fdf4", border: "#86efac", color: "#16a34a", iconColor: "#22c55e" },
    error:   { icon: "fa-circle-xmark",      bg: "#fef2f2", border: "#fca5a5", color: "#dc2626", iconColor: "#ef4444" },
    info:    { icon: "fa-circle-info",        bg: "#eff6ff", border: "#93c5fd", color: "#2563eb", iconColor: "#3b82f6" },
    warning: { icon: "fa-triangle-exclamation", bg: "#fffbeb", border: "#fcd34d", color: "#d97706", iconColor: "#f59e0b" },
    loading: { icon: "fa-spinner fa-spin",    bg: "#f8fafc", border: "#cbd5e1", color: "#475569", iconColor: "#64748b" },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      <div style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 10,
        maxWidth: 360, width: "calc(100vw - 40px)",
        pointerEvents: "none",
      }}>
        {toasts.map(t => {
          const cfg = CONFIGS[t.type] || CONFIGS.info;
          return (
            <div key={t.id}
              onClick={() => remove(t.id)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                background: cfg.bg,
                border: `1.5px solid ${cfg.border}`,
                borderRadius: 14, padding: "14px 16px",
                boxShadow: "0 8px 32px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.08)",
                cursor: "pointer", pointerEvents: "all",
                transform: t.leaving ? "translateX(110%)" : "translateX(0)",
                opacity: t.leaving ? 0 : 1,
                transition: "transform .35s cubic-bezier(.4,0,.2,1), opacity .35s ease",
                animation: t.leaving ? "none" : "toastIn .35s cubic-bezier(.34,1.56,.64,1)",
              }}>
              {/* Icon */}
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: `${cfg.iconColor}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <i className={`fa-solid ${cfg.icon}`}
                  style={{ fontSize: 16, color: cfg.iconColor }} />
              </div>
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: ".85rem", fontWeight: 600, color: cfg.color,
                  lineHeight: 1.4, wordBreak: "break-word",
                }}>
                  {t.message}
                </div>
              </div>
              {/* Close */}
              <button onClick={() => remove(t.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: cfg.color, opacity: .5, padding: 2, flexShrink: 0,
                  fontSize: 12, lineHeight: 1,
                }}>
                <i className="fa-solid fa-xmark" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx;
};
