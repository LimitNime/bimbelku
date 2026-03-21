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
  "setting-mapel":  "Setting Mata Pelajaran",
  "raport-admin":   "Data Raport Siswa",

  // Guru
  "daftar-siswa":   "Daftar Siswa",
  "input-absensi":  "Input Absensi",
  "rekap-absensi":  "Rekap Absensi",
  "honor-guru":     "Honor Saya",
  "profil-guru":    "Profil Saya",
  "raport-guru":    "Input Raport",

  // Siswa
  "absensi-siswa":  "Absensi Saya",
  "pembayaran":     "Pembayaran SPP",
  "artikel-siswa":  "Artikel Bimbel",
  "profil-siswa":   "Profil Saya",
  "raport-siswa":   "Raport Saya",
};

const DISPLAY_NAMES = { admin: "Admin", guru: "Tentor", siswa: "Siswa", Admin: "Admin", Guru: "Tentor", Siswa: "Siswa" };
const ROLE_COLORS   = { admin: "#8b5cf6", guru: "#3b82f6", siswa: "#22c55e", Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };

export default function DashboardLayout({ user, children, menu: activeMenu, onMenu, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 900);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const pageTitle   = ALL_LABELS[activeMenu] || "Dashboard";
  const role        = (user.role || "").toLowerCase();
  const color       = ROLE_COLORS[role] || "#8b5cf6";
  const displayName = user.nama || user.email?.split("@")[0] || "User";

  const handleMenuClick = (key) => {
    onMenu(key);
    if (isMobile) setSidebarOpen(false);
  };

  const sidebarW = isMobile ? "var(--sidebar-w)" : (isCollapsed ? "var(--sidebar-collapsed-w)" : "var(--sidebar-w)");

  return (
    <div className="dashboard">

      {/* ── Mobile overlay ──────────────────────────────── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 190,
          }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0,
        zIndex: 200, width: sidebarW,
        transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
        transition: "width .3s cubic-bezier(0.16, 1, 0.3, 1), transform .3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <Sidebar
          user={user}
          activeMenu={activeMenu}
          onMenu={handleMenuClick}
          onLogout={onLogout}
          isCollapsed={!isMobile && isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* ── Main content ────────────────────────────────── */}
      <div className="main-content" style={{
        marginLeft: isMobile ? 0 : sidebarW,
        transition: "margin-left .3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>

        {/* Topbar */}
        <div className="topbar">
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
              Halo, {displayName} <i className="fa-solid fa-hand-sparkles" style={{marginLeft: 6, color:"#f59e0b"}}></i>
            </span>
            <div className="topbar-avatar" style={{ background: color }}>
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-body">
          {children}
        </div>
      </div>
    </div>
  );
}