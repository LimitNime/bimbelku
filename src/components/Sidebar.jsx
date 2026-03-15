// ============================================================
// Sidebar.jsx — Dashboard sidebar navigation (responsive)
// Versi terbaru sesuai spesifikasi sistem bimbel
// ============================================================
import Icon from "./Icon.jsx";

const MENUS = {
  Admin: {
    "Utama": [
      { key: "dashboard",      label: "Dashboard",          icon: "home"    },
    ],
    "Data": [
      { key: "siswa",          label: "Data Siswa",         icon: "users"   },
      { key: "guru",           label: "Data Guru",          icon: "users"   },
    ],
    "Keuangan": [
      { key: "spp",            label: "SPP Siswa",          icon: "book"    },
      { key: "pemasukan",      label: "Pemasukan",          icon: "arrow"   },
      { key: "pengeluaran",    label: "Pengeluaran",        icon: "trash"   },
      { key: "saldo",          label: "Saldo & Laporan",    icon: "article" },
      { key: "honor",          label: "Honor Guru",         icon: "star"    },
    ],
    "Konten": [
      { key: "artikel-admin",  label: "Manajemen Artikel",  icon: "article" },
      { key: "tutorial",       label: "Tutorial",           icon: "book"    },
    ],
    "Pengaturan": [
      { key: "user-mgmt",      label: "Manajemen User",     icon: "settings"},
    ],
  },

  Guru: {
    "Utama": [
      { key: "dashboard",      label: "Dashboard",          icon: "home"    },
    ],
    "Siswa": [
      { key: "daftar-siswa",   label: "Daftar Siswa",       icon: "users"   },
    ],
    "Absensi": [
      { key: "input-absensi",  label: "Input Absensi",      icon: "check"   },
      { key: "rekap-absensi",  label: "Rekap Absensi",      icon: "calendar"},
    ],
    "Keuangan": [
      { key: "honor-guru",     label: "Honor Saya",         icon: "star"    },
    ],
    "Akun": [
      { key: "profil-guru",    label: "Profil Saya",        icon: "user"    },
    ],
  },

  Siswa: {
    "Utama": [
      { key: "dashboard",      label: "Dashboard",          icon: "home"    },
    ],
    "Akademik": [
      { key: "absensi-siswa",  label: "Absensi Saya",       icon: "check"   },
      { key: "pembayaran",     label: "Pembayaran SPP",     icon: "book"    },
    ],
    "Informasi": [
      { key: "artikel-siswa",  label: "Artikel",            icon: "article" },
    ],
    "Akun": [
      { key: "profil-siswa",   label: "Profil Saya",        icon: "user"    },
    ],
  },
};

const ROLE_COLORS   = { Admin: "#8b5cf6", Guru: "#3b82f6", Siswa: "#22c55e" };
const ROLE_LABELS   = { Admin: "Administrator", Guru: "Tentor", Siswa: "Siswa" };

export default function Sidebar({ user, activeMenu, onMenu, onLogout }) {
  const color    = ROLE_COLORS[user.role];
  const sections = MENUS[user.role] || {};

  // Ambil nama tampilan dari email
  const displayName = user.email.split("@")[0]
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

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
    }}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div style={{
        padding: "20px 20px 14px",
        borderBottom: "1px solid #1e293b",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "'Sora',sans-serif",
          fontSize: "1.15rem",
          fontWeight: 800,
          background: "linear-gradient(135deg,var(--blue-light),var(--green-light))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 6,
        }}>BimbelKu</div>

        {/* Role badge */}
        <span style={{
          fontSize: "0.68rem", fontWeight: 700,
          padding: "3px 10px", borderRadius: 100,
          background: color + "22", color,
          display: "inline-block",
        }}>{ROLE_LABELS[user.role]}</span>
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav style={{ padding: "10px 12px", flex: 1, overflowY: "auto" }}>
        {Object.entries(sections).map(([sectionLabel, items]) => (
          <div key={sectionLabel}>
            {/* Section label */}
            <div style={{
              fontSize: "0.62rem", fontWeight: 700, color: "#334155",
              letterSpacing: "0.8px", textTransform: "uppercase",
              padding: "0 8px", margin: "12px 0 4px",
            }}>{sectionLabel}</div>

            {/* Menu items */}
            {items.map((m) => {
              const active = activeMenu === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => onMenu(m.key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: 9, cursor: "pointer",
                    background: active ? "var(--blue)" : "transparent",
                    color: active ? "#fff" : "#94a3b8",
                    fontSize: "0.83rem", fontWeight: active ? 600 : 500,
                    marginBottom: 1,
                    border: "none", width: "100%", textAlign: "left",
                    fontFamily: "inherit", transition: "all .15s",
                    boxShadow: active ? "0 4px 12px rgba(37,99,235,.3)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.background = "#1e293b";
                      e.currentTarget.style.color = "#e2e8f0";
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
                  <span style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        ))}

        {/* ── Logout ───────────────────────────────────── */}
        <div style={{
          fontSize: "0.62rem", fontWeight: 700, color: "#334155",
          letterSpacing: "0.8px", textTransform: "uppercase",
          padding: "0 8px", margin: "12px 0 4px",
        }}>Sesi</div>

        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: 9, cursor: "pointer",
            background: "transparent", color: "#f87171",
            fontSize: "0.83rem", fontWeight: 500,
            border: "none", width: "100%", textAlign: "left",
            fontFamily: "inherit", transition: "all .15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#450a0a";
            e.currentTarget.style.color = "#fca5a5";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#f87171";
          }}
        >
          <Icon name="logout" size={15} />Logout
        </button>
      </nav>

      {/* ── User footer ───────────────────────────────── */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #1e293b",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.88rem", fontWeight: 700,
          }}>
            {user.email[0].toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{
              fontSize: "0.8rem", fontWeight: 700, color: "#f1f5f9",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{displayName}</div>
            <div style={{
              fontSize: "0.68rem", color: "#475569",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{user.email}</div>
          </div>
        </div>
      </div>

    </aside>
  );
}