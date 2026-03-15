// ============================================================
// Sidebar.jsx — Dashboard sidebar navigation
// ============================================================
import Icon from "./Icon";

const MENUS = {
  Admin: [
    { key: "dashboard",    label: "Dashboard",           icon: "home"     },
    { key: "siswa",        label: "Manajemen Siswa",     icon: "users"    },
    { key: "guru",         label: "Manajemen Guru",      icon: "users"    },
    { key: "paket",        label: "Paket Belajar",       icon: "package"  },
    { key: "artikel-admin",label: "Manajemen Artikel",   icon: "article"  },
    { key: "user-mgmt",    label: "Manajemen User",      icon: "settings" },
  ],
  Guru: [
    { key: "dashboard",    label: "Dashboard",           icon: "home"     },
    { key: "daftar-siswa", label: "Daftar Siswa",        icon: "users"    },
    { key: "jadwal",       label: "Jadwal Mengajar",     icon: "calendar" },
    { key: "profil",       label: "Profil Guru",         icon: "user"     },
  ],
  Siswa: [
    { key: "dashboard",    label: "Dashboard",           icon: "home"     },
    { key: "paket-siswa",  label: "Paket Saya",          icon: "package"  },
    { key: "jadwal-siswa", label: "Jadwal Belajar",      icon: "calendar" },
    { key: "artikel-siswa",label: "Artikel Bimbel",      icon: "book"     },
    { key: "profil-siswa", label: "Profil Saya",         icon: "user"     },
  ],
};

const ROLE_COLORS = { Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };
const DISPLAY_NAMES = { Admin: "Administrator", Guru: "Drs. Budi Santoso", Siswa: "Andi Pratama" };

export default function Sidebar({ user, activeMenu, onMenu, onLogout, isOpen }) {
  const color = ROLE_COLORS[user.role];
  const menus = MENUS[user.role] || [];

  return (
    <aside style={{
      width: "var(--sidebar-w)", background: "var(--sidebar)",
      position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 200,
      display: "flex", flexDirection: "column", overflowY: "auto",
      transform: isOpen ? "none" : undefined,
      transition: ".3s",
    }}>
      {/* Header */}
      <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid #1e293b" }}>
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

      {/* Navigation */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", letterSpacing: 1, textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>
          Menu Utama
        </div>

        {menus.map((m) => {
          const active = activeMenu === m.key;
          return (
            <button key={m.key} onClick={() => onMenu(m.key)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              background: active ? "var(--blue)" : "transparent",
              color: active ? "#fff" : "#94a3b8",
              fontSize: "0.88rem", fontWeight: 500, marginBottom: 2,
              border: "none", width: "100%", textAlign: "left", fontFamily: "inherit",
              boxShadow: active ? "0 4px 12px rgba(37,99,235,.35)" : "none",
              transition: ".2s",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
            >
              <Icon name={m.icon} size={17} />{m.label}
            </button>
          );
        })}

        <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#475569", letterSpacing: 1, textTransform: "uppercase", padding: "0 8px", margin: "24px 0 6px" }}>
          Akun
        </div>
        <button onClick={onLogout} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 10, cursor: "pointer",
          background: "transparent", color: "#f87171",
          fontSize: "0.88rem", fontWeight: 500,
          border: "none", width: "100%", textAlign: "left", fontFamily: "inherit",
          transition: ".2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "#450a0a"; e.currentTarget.style.color = "#fca5a5"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f87171"; }}
        >
          <Icon name="logout" size={17} />Logout
        </button>
      </nav>

      {/* User info footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, background: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.9rem", fontWeight: 700, flexShrink: 0,
          }}>{user.email[0].toUpperCase()}</div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{DISPLAY_NAMES[user.role]}</div>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{user.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
