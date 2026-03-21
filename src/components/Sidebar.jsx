// ============================================================
// Sidebar.jsx — Dashboard sidebar navigation (Redesigned)
// ============================================================
import { useState, useEffect } from "react";
import { getSiteSettings } from "../lib/db.js";

const MENUS = {
  admin: {
    "Utama": [
      { key: "dashboard",           label: "Dashboard",           icon: "house"     },
    ],
    "Data": [
      { key: "siswa",               label: "Data Siswa",          icon: "user-graduate" },
      { key: "guru",                label: "Data Guru",           icon: "chalkboard-user" },
      { key: "raport-admin",        label: "Data Raport",         icon: "file-signature" },
    ],
    "Absensi": [
      { key: "rekap-absensi-admin", label: "Rekap Absensi",       icon: "calendar-check" },
    ],
    "Keuangan": [
      { key: "spp",                 label: "SPP Siswa",           icon: "file-invoice-dollar" },
      { key: "pemasukan",           label: "Pemasukan",           icon: "wallet"    },
      { key: "pengeluaran",         label: "Pengeluaran",         icon: "money-bill-transfer" },
      { key: "saldo",               label: "Saldo & Laporan",     icon: "chart-line" },
      { key: "honor",               label: "Honor Guru",          icon: "hand-holding-dollar" },
    ],
    "Konten": [
      { key: "artikel-admin",       label: "Manajemen Artikel",   icon: "newspaper" },
      { key: "tutorial",            label: "Tutorial",            icon: "video"     },
      { key: "landing-editor",      label: "Edit Landing Page",   icon: "clapperboard" },
    ],
    "Pengaturan": [
      { key: "setting-honor",       label: "Setting Honor Guru",  icon: "sliders"   },
      { key: "program",             label: "Program Bimbel",      icon: "layer-group" },
      { key: "template-wa",         label: "Template WA",         icon: "whatsapp"  },
      { key: "setting-web",         label: "Setting Web",         icon: "gears"      },
      { key: "user-mgmt",           label: "Manajemen User",      icon: "user-gear"  },
    ],
  },
  guru: {
    "Utama": [
      { key: "dashboard",           label: "Dashboard",           icon: "house"     },
    ],
    "Akademik": [
      { key: "input-absensi",       label: "Input Absensi",       icon: "calendar-plus" },
      { key: "rekap-absensi",       label: "Rekap Absensi",       icon: "calendar-days" },
      { key: "raport-guru",         label: "Input Raport",        icon: "feather-pointed" },
      { key: "rekap-raport-guru",   label: "Rekap Raport",        icon: "clipboard-list" },
    ],
    "Keuangan": [
      { key: "honor-guru",          label: "Honor Saya",          icon: "medal"     },
    ],
    "Akun": [
      { key: "profil-guru",         label: "Profil Saya",         icon: "user-pen"  },
    ],
  },
  siswa: {
    "Utama": [
      { key: "dashboard",           label: "Dashboard",           icon: "house"     },
    ],
    "Akademik": [
      { key: "absensi-siswa",       label: "Absensi Saya",        icon: "calendar-check" },
      { key: "pembayaran",          label: "Pembayaran SPP",      icon: "file-invoice-dollar" },
      { key: "raport-siswa",        label: "Raport Saya",         icon: "award" },
    ],
    "Informasi": [
      { key: "artikel-siswa",       label: "Artikel",             icon: "newspaper" },
    ],
    "Akun": [
      { key: "profil-siswa",        label: "Profil Saya",         icon: "user-pen"  },
    ],
  },
};

const ROLE_COLORS = { admin: "#8b5cf6", guru: "#3b82f6", siswa: "#22c55e" };
const ROLE_LABELS = { admin: "Administrator", guru: "Tentor", siswa: "Siswa" };

export default function Sidebar({ user, activeMenu, onMenu, onLogout, isCollapsed, setIsCollapsed }) {
  const role     = (user.role || "").toLowerCase();
  const color    = ROLE_COLORS[role] || "#8b5cf6";
  const sections = MENUS[role] || {};

  const [siteName, setSiteName] = useState("Al-Adzkiya");
  const [siteLogo, setSiteLogo] = useState(<i className="fa-solid fa-graduation-cap" style={{color: "var(--primary)"}}></i>);

  useEffect(() => {
    getSiteSettings()
      .then(s => {
        if (s?.nama) setSiteName(s.nama);
        if (s?.logo) setSiteLogo(s.logo);
      })
      .catch(() => {});
  }, []);

  const isImageUrl = typeof siteLogo === "string" && (siteLogo.startsWith("http") || siteLogo.startsWith("/"));

  const displayName = (user.nama || user.email?.split("@")[0] || "User")
    .replace(/[._]/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase());

  return (
    <aside style={{
      width: isCollapsed ? "var(--sidebar-collapsed-w)" : "var(--sidebar-w)",
      background: "var(--sidebar)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      position: "fixed", left: 0, top: 0, bottom: 0,
      zIndex: 200, display: "flex", flexDirection: "column",
      overflowY: "auto", overflowX: "hidden",
      transition: "width .3s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>

      {/* ── Logo Area ───────────────────────────────────── */}
      <div style={{ 
        padding: isCollapsed ? "24px 0" : "24px 20px 20px", 
        borderBottom: "1px solid rgba(255,255,255,0.05)", 
        flexShrink: 0, position: "relative" 
      }}>
        <div style={{ 
          display: "flex", alignItems: "center", 
          gap: 12, width: "100%", 
          justifyContent: isCollapsed ? "center" : "flex-start" 
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            {isImageUrl
              ? <img src={siteLogo} alt="logo" style={{ width: 24, height: 24, objectFit: "contain" }} />
              : <span style={{ fontSize: "1.2rem" }}>{siteLogo}</span>
            }
          </div>
          {!isCollapsed && (
            <div className="fade-in" style={{ flex: 1, overflow: "hidden" }}>
              <div style={{
                fontFamily: "'Sora',sans-serif", fontSize: "1.1rem", fontWeight: 800,
                color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
              }}>{siteName}</div>
              <div style={{ fontSize: ".65rem", fontWeight: 700, color: color, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {ROLE_LABELS[role] || role}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button Inside Header */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: "absolute", right: isCollapsed ? "calc(50% - 12px)" : "10px", 
            bottom: isCollapsed ? "-12px" : "18px",
            width: 24, height: 24, borderRadius: 8,
            background: "rgba(255,255,255,0.08)", color: "#94a3b8",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", 
            zIndex: 300, transition: ".3s",
            transform: isCollapsed ? "rotate(180deg)" : "none",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#94a3b8"; }}
        >
          <i className="fa-solid fa-chevron-left" style={{ fontSize: 10 }}></i>
        </button>
      </div>

      {/* ── Navigasi ─────────────────────────────────────── */}
      <nav style={{ padding: isCollapsed ? "16px 8px" : "16px 12px", flex: 1, overflowY: "auto" }}>
        {Object.entries(sections).map(([sectionLabel, items]) => (
          <div key={sectionLabel} style={{ marginBottom: 20 }}>
            {!isCollapsed && (
              <div className="fade-in" style={{
                fontSize: ".62rem", fontWeight: 700, color: "#475569",
                letterSpacing: ".8px", textTransform: "uppercase",
                padding: "0 10px", margin: "0 0 8px",
              }}>{sectionLabel}</div>
            )}
            {isCollapsed && <div style={{ height: 1, background: "rgba(255,255,255,0.05)", margin: "0 8px 10px" }} />}

            {items.map(m => {
              const active = activeMenu === m.key;
              return (
                <button key={m.key} onClick={() => onMenu(m.key)} title={isCollapsed ? m.label : ""} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: isCollapsed ? "12px 0" : "10px 14px", 
                  borderRadius: 12, cursor: "pointer",
                  background: active ? "linear-gradient(135deg, var(--primary), var(--primary-light))" : "transparent",
                  color: active ? "#fff" : "#94a3b8",
                  fontSize: ".88rem", fontWeight: active ? 600 : 500,
                  marginBottom: 4, border: "none", width: "100%", 
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  fontFamily: "inherit", transition: "all .2s linear",
                  boxShadow: active ? "0 8px 20px -6px rgba(79, 70, 229, 0.4)" : "none",
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#f8fafc"; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
                >
                  <i className={m.icon === "whatsapp" ? "fa-brands fa-whatsapp" : `fa-solid fa-${m.icon}`} 
                    style={{ width: 22, textAlign: "center", fontSize: "1.1rem", transition: ".2s" }}></i>
                  {!isCollapsed && (
                    <span className="fade-in" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Logout Section */}
        <div style={{ marginTop: 20, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button onClick={onLogout} title={isCollapsed ? "Logout" : ""} style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: isCollapsed ? "12px 0" : "10px 14px", 
            borderRadius: 12, cursor: "pointer",
            background: "transparent", color: "#f87171",
            fontSize: ".88rem", fontWeight: 500,
            border: "none", width: "100%", 
            justifyContent: isCollapsed ? "center" : "flex-start",
            fontFamily: "inherit", transition: "all .2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#fca5a5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
          >
            <i className="fa-solid fa-right-from-bracket" style={{ width: 22, textAlign: "center", fontSize: "1.1rem" }}></i>
            {!isCollapsed && <span className="fade-in">Logout</span>}
          </button>
        </div>
      </nav>

      {/* ── User Footer ─────────────────────────────────── */}
      <div style={{ 
        padding: isCollapsed ? "16px 0" : "16px 20px", 
        background: "rgba(0,0,0,0.1)",
        flexShrink: 0 
      }}>
        <div style={{ 
          display: "flex", alignItems: "center", 
          gap: 12, justifyContent: isCollapsed ? "center" : "flex-start" 
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, 
            background: `linear-gradient(135deg, ${color}, ${color}dd)`, 
            flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "1.1rem", fontWeight: 800,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            border: "2px solid rgba(255,255,255,0.1)"
          }}>
            {(user.nama || user.email || "?")[0].toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="fade-in" style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: ".85rem", fontWeight: 700, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {displayName}
              </div>
              <div style={{ fontSize: ".7rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user.email}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
