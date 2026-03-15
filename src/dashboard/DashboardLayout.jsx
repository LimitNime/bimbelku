// ============================================================
// DashboardLayout.jsx — Shell for all dashboard views
// ============================================================
import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Icon from "../components/Icon.jsx";

const ALL_LABELS = {
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
  const pageTitle = ALL_LABELS[activeMenu] || "Dashboard";
  const color     = ROLE_COLORS[user.role];

  return (
    <div className="dashboard">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 190,
        }} />
      )}

      {/* Sidebar */}
      <div style={{
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 200, width: "var(--sidebar-w)",
        transform: sidebarOpen ? "none" : undefined,
      }}>
        <Sidebar
          user={user}
          activeMenu={activeMenu}
          onMenu={(key) => { onMenu(key); setSidebarOpen(false); }}
          onLogout={onLogout}
          isOpen={sidebarOpen}
        />
      </div>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icon name="menu" size={22} />
            </button>
            <h2>{pageTitle}</h2>
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
