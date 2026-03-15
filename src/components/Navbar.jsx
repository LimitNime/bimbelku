// ============================================================
// Navbar.jsx — Public navigation bar
// ============================================================
import { useState } from "react";
import Icon from "./Icon";

export default function Navbar({ onNav, onLogin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = ["Beranda", "Paket Belajar", "Artikel", "Tentang Kami"];

  const handleNav = (label) => {
    setMobileOpen(false);
    onNav(label.toLowerCase().replace(/ /g, "-"));
  };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border)", padding: "0 5%",
      height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      {/* Logo */}
      <div onClick={() => onNav("home")} style={{
        fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: "1.35rem",
        background: "linear-gradient(135deg,var(--blue),var(--green-light))",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", cursor: "pointer",
      }}>
        BimbelKu
      </div>

      {/* Desktop links */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="desktop-nav">
        {links.map((l) => (
          <button key={l} onClick={() => handleNav(l)} style={{
            padding: "8px 14px", borderRadius: 8, fontSize: "0.9rem",
            fontWeight: 500, color: "var(--muted)", cursor: "pointer",
            border: "none", background: "none", fontFamily: "inherit",
          }}
            onMouseEnter={e => { e.target.style.color = "var(--blue)"; e.target.style.background = "#eff6ff"; }}
            onMouseLeave={e => { e.target.style.color = "var(--muted)"; e.target.style.background = "none"; }}
          >{l}</button>
        ))}
        <button className="btn-login" onClick={onLogin} style={{
          padding: "8px 20px", borderRadius: 10, fontSize: "0.9rem", fontWeight: 600,
          color: "#fff", background: "linear-gradient(135deg,var(--blue),var(--blue-light))",
          cursor: "pointer", border: "none", fontFamily: "inherit",
          boxShadow: "0 2px 10px rgba(37,99,235,.25)",
        }}>Login</button>
      </div>

      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        <Icon name={mobileOpen ? "x" : "menu"} size={22} />
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 68, left: 0, right: 0, background: "#fff",
          borderBottom: "1px solid var(--border)", padding: "12px 5%", zIndex: 99,
        }}>
          {links.map((l) => (
            <button key={l} onClick={() => handleNav(l)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "10px 8px", borderRadius: 8, fontSize: "0.9rem",
              fontWeight: 500, color: "var(--muted)", cursor: "pointer",
              border: "none", background: "none", fontFamily: "inherit",
            }}>{l}</button>
          ))}
          <button className="btn-primary" onClick={() => { setMobileOpen(false); onLogin(); }}
            style={{ width: "100%", marginTop: 8, justifyContent: "center" }}>
            Login
          </button>
        </div>
      )}
    </nav>
  );
}
