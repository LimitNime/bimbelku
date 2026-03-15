// ============================================================
// Sidebar.jsx — Dashboard sidebar navigation (responsive)
// ============================================================
import Icon from "./Icon.jsx";

const MENUS = {
  Admin: {
    "Data Master": [
      { key: "dashboard",     label: "Dashboard",         icon: "home"     },
      { key: "siswa",         label: "Manajemen Siswa",   icon: "users"    },
      { key: "guru",          label: "Manajemen Guru",    icon: "users"    },
      { key: "paket",         label: "Paket Belajar",     icon: "package"  },
    ],
    "Keuangan": [
      { key: "spp",           label: "SPP Siswa",         icon: "book"     },
      { key: "pemasukan",     label: "Pemasukan",         icon: "arrow"    },
      { key: "pengeluaran",   label: "Pengeluaran",       icon: "logout"   },
      { key: "saldo",         label: "Saldo & Laporan",   icon: "settings" },
      { key: "honor",         label: "Honor Guru",        icon: "star"     },
    ],
    "Absensi": [
      { key: "absen-siswa",   label: "Absen Siswa",       icon: "check"    },
      { key: "absen-guru",    label: "Absen Guru",        icon: "check"    },
    ],
    "Konten": [
      { key: "artikel-admin", label: "Manajemen Artikel", icon: "article"  },
      { key: "tutorial",      label: "Tutorial",          icon: "book"     },
      { key: "user-mgmt",     label: "Manajemen User",    icon: "user"     },
    ],
  },
  Guru: {
    "Menu Utama": [
      { key: "dashboard",     label: "Dashboard",         icon: "home"     },
      { key: "daftar-siswa",  label: "Daftar Siswa",      icon: "users"    },
      { key: "jadwal",        label: "Jadwal Mengajar",   icon: "calendar" },
      { key: "profil",        label: "Profil Guru",       icon: "user"     },
    ],
  },
  Siswa: {
    "Menu Utama": [
      { key: "dashboard",     label: "Dashboard",         icon: "home"     },
      { key: "paket-siswa",   label: "Paket Saya",        icon: "package"  },
      { key: "jadwal-siswa",  label: "Jadwal Belajar",    icon: "calendar" },
      { key: "artikel-siswa", label: "Artikel Bimbel",    icon: "book"     },
      { key: "profil-siswa",  label: "Profil Saya",       icon: "user"     },
    ],
  },
};

const ROLE_COLORS   = { Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };
const DISPLAY_NAMES = { Admin: "Administrator", Guru: "Drs. Budi Santoso", Siswa: "Andi Pratama" };

export default function Sidebar({ user, activeMenu, onMenu, onLogout }) {
  const color    = ROLE_COLORS[user.role];
  const sections = MENUS[user.role] || {};

  return (
    <aside style={{
      width: "var(--sidebar-w)",
      background: "var(--sidebar)",
      position: "fixed",
      left: 0, top: 0, bottom: 0,
      zIndex: 200,
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      transition: "transform .3s ease",
      // transform dikendalikan dari DashboardLayout via CSS class / inline
    }}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Sora',sans-serif", fontSize: "1.15rem", fontWeight: 800,
          background: "linear-gradient(135deg,var(--blue-light),var(--green-light))",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>BimbelKu</div>
        <span style={{
          fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 5,
          background: color + "22", color, marginTop: 6, display: "inline-block",
        }}>{user.role}</span>
      </div>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav style={{ padding: "12px", flex: 1, overflowY: "auto" }}>
        {Object.entries(sections).map(([sectionLabel, items]) => (
          <div key={sectionLabel}>
            {/* Section label */}
            <div style={{
              fontSize: "0.63rem", fontWeight: 700, color: "#475569",
              letterSpacing: 1, textTransform: "uppercase",
              padding: "0 8px", margin: "14px 0 5px",
            }}>{sectionLabel}</div>

            {/* Menu items */}
            {items.map((m) => {
              const active = activeMenu === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => onMenu(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 11,
                    padding: "9px 12px", borderRadius: 10, cursor: "pointer",
                    background: active ? "var(--blue)" : "transparent",
                    color: active ? "#fff" : "#94a3b8",
                    fontSize: "0.84rem", fontWeight: 500, marginBottom: 2,
                    border: "none", width: "100%", textAlign: "left",
                    fontFamily: "inherit", transition: ".2s",
                    boxShadow: active ? "0 4px 12px rgba(37,99,235,.35)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "#1e293b";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <Icon name={m.icon} size={15} />
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}

        {/* Logout */}
        <div style={{
          fontSize: "0.63rem", fontWeight: 700, color: "#475569",
          letterSpacing: 1, textTransform: "uppercase",
          padding: "0 8px", margin: "14px 0 5px",
        }}>Akun</div>

        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "9px 12px", borderRadius: 10, cursor: "pointer",
            background: "transparent", color: "#f87171",
            fontSize: "0.84rem", fontWeight: 500,
            border: "none", width: "100%", textAlign: "left",
            fontFamily: "inherit", transition: ".2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#450a0a"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f87171"; }}
        >
          <Icon name="logout" size={15} />Logout
        </button>
      </nav>

      {/* ── User footer ───────────────────────────────────── */}
      <div style={{ padding: "14px 20px", borderTop: "1px solid #1e293b", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.9rem", fontWeight: 700,
          }}>{user.email[0].toUpperCase()}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{
              fontSize: "0.82rem", fontWeight: 700, color: "#fff",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{DISPLAY_NAMES[user.role]}</div>
            <div style={{
              fontSize: "0.7rem", color: "#64748b",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{user.email}</div>
          </div>
        </div>
      </div>

    </aside>
  );
}