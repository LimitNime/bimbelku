// ============================================================
// Navbar.jsx — Public navigation bar (fully responsive)
// Menerima prop `site` untuk nama & logo dinamis
// ============================================================
import { useState } from "react";
import Icon from "./Icon.jsx";

export default function Navbar({ onNav, onLogin, site = {} }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ["Beranda", "Artikel", "Tentang Kami"];

  const namaBimbel = site.nama || "Al-Adzkiya";
  const logo       = site.logo || "🎓";
  // Cek apakah logo adalah URL gambar atau emoji
  const isImageUrl = typeof logo === "string" && (logo.startsWith("http") || logo.startsWith("/"));

  const handleNav = (label) => {
    setMobileOpen(false);
    onNav(label.toLowerCase().replace(/ /g, "-"));
  };

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border)", padding: "0 5%",
        height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo + nama */}
        <div onClick={() => { setMobileOpen(false); onNav("home"); }}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
          {isImageUrl ? (
            <img src={logo} alt="logo" style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 8 }} />
          ) : (
            <span style={{ fontSize: "1.4rem" }}>{logo}</span>
          )}
          <span style={{
            fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.2rem",
            background: "linear-gradient(135deg,var(--blue),var(--green-light))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{namaBimbel}</span>
        </div>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {links.map(l => (
            <button key={l} onClick={() => handleNav(l)} style={{
              padding: "8px 12px", borderRadius: 8, fontSize: ".88rem",
              fontWeight: 500, color: "var(--muted)", cursor: "pointer",
              border: "none", background: "none", fontFamily: "inherit", whiteSpace: "nowrap",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--blue)"; e.currentTarget.style.background = "#eff6ff"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "none"; }}
            >{l}</button>
          ))}
          <button onClick={onLogin} style={{
            padding: "8px 18px", borderRadius: 10, fontSize: ".88rem", fontWeight: 600,
            color: "#fff", background: "linear-gradient(135deg,var(--blue),var(--blue-light))",
            cursor: "pointer", border: "none", fontFamily: "inherit", marginLeft: 4,
            boxShadow: "0 2px 10px rgba(37,99,235,.25)", whiteSpace: "nowrap",
          }}>Login</button>
        </div>

        {/* Hamburger */}
        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text)", padding: 6, display: "none" }}>
          <Icon name={mobileOpen ? "x" : "menu"} size={24} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 98, top: 64 }} />
          <div style={{
            position: "fixed", top: 64, left: 0, right: 0,
            background: "#fff", zIndex: 99, padding: "12px 5% 20px",
            borderBottom: "1px solid var(--border)", boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          }}>
            {links.map(l => (
              <button key={l} onClick={() => handleNav(l)} style={{
                display: "flex", width: "100%", textAlign: "left",
                padding: "12px 10px", borderRadius: 10, fontSize: ".95rem",
                fontWeight: 500, color: "var(--text)", cursor: "pointer",
                border: "none", background: "none", fontFamily: "inherit",
                borderBottom: "1px solid #f1f5f9",
              }}>{l}</button>
            ))}
            <button onClick={() => { setMobileOpen(false); onLogin(); }} style={{
              width: "100%", marginTop: 12, padding: "13px", borderRadius: 12,
              fontSize: ".95rem", fontWeight: 700, color: "#fff",
              background: "linear-gradient(135deg,var(--blue),var(--blue-light))",
              cursor: "pointer", border: "none", fontFamily: "inherit",
            }}>Login</button>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
}
