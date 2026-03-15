// ============================================================
// DashboardLayout.jsx — Shell for all dashboard views
// ============================================================
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Icon from "../components/Icon.jsx";

const ALL_LABELS = {
  // Shared
  "dashboard":      "Dashboard",
  "artikel-detail": "Detail Artikel",

  // Admin
  "siswa":          "Data Siswa",
  "guru":           "Data Guru",
  "setting-honor":  "Setting Honor Guru",
  "rekap-absensi-admin": "Rekap Absensi Siswa",
  "program":        "Program Bimbel",
  "spp":            "SPP Siswa",
  "pemasukan":      "Pemasukan",
  "pengeluaran":    "Pengeluaran",
  "saldo":          "Saldo & Laporan",
  "honor":          "Honor Guru",
  "artikel-admin":  "Manajemen Artikel",
  "tutorial":       "Tutorial",
  "user-mgmt":      "Manajemen User",

  // Guru
  "daftar-siswa":   "Daftar Siswa",
  "input-absensi":  "Input Absensi",
  "rekap-absensi":  "Rekap Absensi",
  "honor-guru":     "Honor Saya",
  "profil-guru":    "Profil Saya",

  // Siswa
  "absensi-siswa":  "Absensi Saya",
  "pembayaran":     "Pembayaran SPP",
  "artikel-siswa":  "Artikel Bimbel",
  "profil-siswa":   "Profil Saya",
};

const DISPLAY_NAMES = { Admin: "Admin", Guru: "Tentor", Siswa: "Siswa" };
const ROLE_COLORS   = { Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };

export default function DashboardLayout({ user, children, activeMenu, onMenu, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 900);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const pageTitle = ALL_LABELS[activeMenu] || "Dashboard";
  const color     = ROLE_COLORS[user.role];

  // Ambil nama dari email
  const displayName = user.email.split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  const handleMenuClick = (key) => {
    onMenu(key);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* ── Mobile overlay ──────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,.55)",
            zIndex: 190,
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        zIndex: 200, width: "var(--sidebar-w)",
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "transform .3s ease",
      }}>
        <Sidebar
          user={user}
          activeMenu={activeMenu}
          onMenu={handleMenuClick}
          onLogout={onLogout}
        />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div style={{
        marginLeft: isMobile ? 0 : "var(--sidebar-w)",
        flex: 1, minHeight: "100vh",
        transition: "margin-left .3s ease",
        background: "var(--bg)",
      }}>

        {/* Topbar */}
        <div style={{
          background: "#fff",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Hamburger — mobile only */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none", border: "none",
                  cursor: "pointer", color: "var(--text)",
                  display: "flex", padding: 4,
                }}
              >
                <Icon name={sidebarOpen ? "x" : "menu"} size={22} />
              </button>
            )}
            <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>
              {pageTitle}
            </h2>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
              Halo, {displayName} 👋
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: color, display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: ".85rem", fontWeight: 700,
            }}>
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 24 }}>
          {children}
        </div>
      </div>
    </div>
  );
}