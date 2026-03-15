// ============================================================
// DashboardLayout.jsx — Shell for all dashboard views
// ============================================================
import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Icon from "../components/Icon.jsx";

const ALL_LABELS = {
  "spp":           "SPP Siswa",
  "pemasukan":     "Pemasukan",
  "pengeluaran":   "Pengeluaran",
  "saldo":         "Saldo & Laporan Keuangan",
  "honor":         "Honor Guru",
  "absen-siswa":   "Absensi Siswa",
  "absen-guru":    "Absensi Guru",
  "tutorial":      "Tutorial",
  dashboard:     "Dashboard",
  siswa:         "Manajemen Siswa",
  guru:          "Manajemen Guru",
  paket:         "Paket Belajar",
  "artikel-admin":  "Manajemen Artikel",
  "user-mgmt":   "Manajemen User",
  "daftar-siswa":"Daftar Siswa",
  jadwal:        "Jadwal Mengajar",
  profil:        "Profil Guru",
  "paket-siswa": "Paket Saya",
  "jadwal-siswa":"Jadwal Belajar",
  "artikel-siswa":"Artikel Bimbel",
  "profil-siswa":"Profil Saya",
  "artikel-detail":"Detail Artikel",
};

const DISPLAY_NAMES = { Admin: "Admin", Guru: "Budi", Siswa: "Andi" };
const ROLE_COLORS   = { Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };

export default function DashboardLayout({ user, children, activeMenu, onMenu, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile,    setIsMobile]    = useState(window.innerWidth <= 900);
  const pageTitle = ALL_LABELS[activeMenu] || "Dashboard";
  const color     = ROLE_COLORS[user.role];

  // Listen to window resize
  useState(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  const handleMenuClick = (key) => {
    onMenu(key);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      {/* Mobile overlay — hanya muncul saat sidebar terbuka di mobile */}
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

      {/* Sidebar — selalu tampil di desktop, slide di mobile */}
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

      {/* Main content — margin kiri hanya di desktop */}
      <div style={{
        marginLeft: isMobile ? 0 : "var(--sidebar-w)",
        flex: 1, minHeight: "100vh",
        transition: "margin-left .3s ease",
      }}>
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* Tombol hamburger — selalu ada, tapi hanya berguna di mobile */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text)", display: "flex", padding: 4,
                }}
              >
                <Icon name={sidebarOpen ? "x" : "menu"} size={22} />
              </button>
            )}
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>{pageTitle}</h2>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>
              Halo, {DISPLAY_NAMES[user.role]} 👋
            </span>
            <div className="topbar-avatar" style={{ background: color }}>
              {user.email[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="page-body">{children}</div>
      </div>
    </div>
  );
}