// ============================================================
// Modal.jsx — Modal dialog & confirm
// Usage:
//   <Modal open={open} onClose={...} title="..." icon="fa-trash">
//     <p>Konten modal</p>
//   </Modal>
//
//   <ConfirmModal open={open} onClose={...} onConfirm={...}
//     title="Hapus Data?" message="Data tidak bisa dikembalikan"
//     type="danger" confirmText="Ya, Hapus" />
// ============================================================
import { useEffect } from "react";

// ── Base Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, icon, iconColor, children, maxWidth = 480 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "modalBgIn .2s ease",
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth,
          boxShadow: "0 24px 64px rgba(0,0,0,.2)",
          animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1)",
          overflow: "hidden",
        }}>
        {/* Header */}
        {(title || icon) && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 22px 16px",
            borderBottom: "1px solid #f1f5f9",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {icon && (
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `${iconColor || "#3b82f6"}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <i className={`fa-solid ${icon}`} style={{ color: iconColor || "#3b82f6", fontSize: 15 }} />
                </div>
              )}
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: "1rem", margin: 0 }}>
                {title}
              </h3>
            </div>
            <button onClick={onClose} style={{
              background: "#f1f5f9", border: "none", borderRadius: 8,
              width: 30, height: 30, cursor: "pointer", color: "#64748b",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
        )}
        {/* Body */}
        <div style={{ padding: "20px 22px" }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalBgIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn {
          from { transform: scale(.92) translateY(12px); opacity:0 }
          to   { transform: scale(1)   translateY(0);    opacity:1 }
        }
      `}</style>
    </div>
  );
}

// ── Confirm Modal ─────────────────────────────────────────────
const CONFIRM_TYPES = {
  danger:  { icon: "fa-triangle-exclamation", color: "#dc2626", bg: "#fef2f2", btnBg: "linear-gradient(135deg,#dc2626,#ef4444)" },
  warning: { icon: "fa-circle-exclamation",   color: "#d97706", bg: "#fffbeb", btnBg: "linear-gradient(135deg,#d97706,#f59e0b)" },
  info:    { icon: "fa-circle-question",       color: "#2563eb", bg: "#eff6ff", btnBg: "linear-gradient(135deg,#2563eb,#3b82f6)" },
  success: { icon: "fa-circle-check",          color: "#16a34a", bg: "#f0fdf4", btnBg: "linear-gradient(135deg,#16a34a,#22c55e)" },
};

export function ConfirmModal({
  open, onClose, onConfirm,
  title = "Konfirmasi",
  message = "Apakah kamu yakin?",
  type = "danger",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  loading = false,
}) {
  const cfg = CONFIRM_TYPES[type] || CONFIRM_TYPES.danger;

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, animation: "modalBgIn .2s ease",
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,.2)",
          animation: "modalIn .25s cubic-bezier(.34,1.56,.64,1)",
          overflow: "hidden", textAlign: "center",
        }}>
        {/* Icon area */}
        <div style={{ padding: "28px 28px 16px" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, margin: "0 auto 16px",
            background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className={`fa-solid ${cfg.icon}`} style={{ fontSize: 28, color: cfg.color }} />
          </div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.05rem", margin: "0 0 8px", color: "#0f172a" }}>
            {title}
          </h3>
          <p style={{ color: "#64748b", fontSize: ".88rem", lineHeight: 1.6, margin: 0 }}>
            {message}
          </p>
        </div>
        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, padding: "0 22px 22px" }}>
          <button onClick={onClose} disabled={loading} style={{
            flex: 1, padding: "11px 0", borderRadius: 12, border: "1.5px solid #e2e8f0",
            background: "#fff", color: "#475569", fontFamily: "inherit",
            fontWeight: 600, fontSize: ".88rem", cursor: "pointer",
            transition: ".15s",
          }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={loading} style={{
            flex: 1, padding: "11px 0", borderRadius: 12, border: "none",
            background: cfg.btnBg, color: "#fff", fontFamily: "inherit",
            fontWeight: 700, fontSize: ".88rem", cursor: "pointer",
            boxShadow: `0 4px 14px ${cfg.color}40`,
            opacity: loading ? .7 : 1, transition: ".15s",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            {loading && <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 13 }} />}
            {loading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalBgIn { from { opacity:0 } to { opacity:1 } }
        @keyframes modalIn {
          from { transform: scale(.88) translateY(16px); opacity:0 }
          to   { transform: scale(1)   translateY(0);    opacity:1 }
        }
      `}</style>
    </div>
  );
}

// ── useConfirm hook ───────────────────────────────────────────
import { useState } from "react";

export function useConfirm() {
  const [state, setState] = useState({ open: false, resolve: null, options: {} });

  const confirm = (options = {}) => new Promise(resolve => {
    setState({ open: true, resolve, options });
  });

  const handleConfirm = () => {
    state.resolve(true);
    setState({ open: false, resolve: null, options: {} });
  };

  const handleCancel = () => {
    state.resolve(false);
    setState({ open: false, resolve: null, options: {} });
  };

  const ConfirmDialog = () => (
    <ConfirmModal
      open={state.open}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.options.title}
      message={state.options.message}
      type={state.options.type}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
    />
  );

  return { confirm, ConfirmDialog };
}
