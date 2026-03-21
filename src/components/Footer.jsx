// ============================================================
// Footer.jsx — Public footer (konten dari site_settings)
// ============================================================
import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";

const NAV_LINKS = ["Beranda", "Artikel", "Tentang Kami"];

export default function Footer({ onNav, site = {} }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const namaBimbel = site.nama      || "Al-Adzkiya";
  const tagline    = site.tagline   || "Lembaga bimbingan belajar terpercaya.";
  const copyright  = site.copyright || `© 2026 ${namaBimbel}. All rights reserved.`;
  const logo       = site.logo      || "🎓";
  const isImageUrl = typeof logo === "string" && (logo.startsWith("http") || logo.startsWith("/"));

  const kontak = [
    site.kontak && { icon: "phone", text: site.kontak },
    site.email  && { icon: "mail",  text: site.email  },
    site.alamat && { icon: "map",   text: site.alamat  },
  ].filter(Boolean);

  const sosmed = [
    site.fb && { emoji: "📘", url: site.fb },
    site.ig && { emoji: "📸", url: `https://instagram.com/${site.ig.replace("@","")}` },
    site.wa && { emoji: "💬", url: `https://wa.me/${site.wa.replace(/\D/g,"")}` },
  ].filter(Boolean);

  const headStyle = { fontSize: ".85rem", fontWeight: 700, color: "#fff", marginBottom: isMobile ? 12 : 14 };
  const linkStyle = { display: "block", fontSize: ".82rem", marginBottom: 8, cursor: "pointer", color: "#94a3b8" };

  return (
    <footer style={{ background: "var(--sidebar)", color: "#94a3b8", padding: isMobile ? "40px 5% 24px" : "60px 5% 30px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr",
        gap: isMobile ? 28 : 40, marginBottom: isMobile ? 28 : 40,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            {isImageUrl
              ? <img src={logo} alt="logo" style={{ width: 28, height: 28, objectFit: "contain", borderRadius: 6 }} />
              : <span style={{ fontSize: "1.4rem" }}>{logo}</span>
            }
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "#fff" }}>
              {namaBimbel}
            </h3>
          </div>
          <p style={{ fontSize: ".85rem", lineHeight: 1.7, maxWidth: 280 }}>{tagline}</p>
          {sosmed.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {sosmed.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer"
                  style={{
                    width: 34, height: 34, borderRadius: 8, background: "#1e293b",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: ".85rem", cursor: "pointer", textDecoration: "none",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--blue)"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
                >{s.emoji}</a>
              ))}
            </div>
          )}
        </div>

        {/* Navigasi */}
        <div>
          <h4 style={headStyle}>Navigasi</h4>
          {NAV_LINKS.map(l => (
            <span key={l}
              onClick={() => onNav(l.toLowerCase().replace(/ /g, "-"))}
              style={linkStyle}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "#94a3b8"}
            >{l}</span>
          ))}
        </div>

        {/* Kontak */}
        <div>
          <h4 style={headStyle}>Kontak</h4>
          {kontak.length > 0 ? kontak.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", marginBottom: 10 }}>
              <Icon name={c.icon} size={14} />{c.text}
            </div>
          )) : (
            <p style={{ fontSize: ".82rem", opacity: .6 }}>Belum diisi</p>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid #1e293b", paddingTop: 20,
        display: "flex", justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        gap: 8, fontSize: ".78rem", textAlign: isMobile ? "center" : "left",
      }}>
        <span>© {new Date().getFullYear()} {copyright}</span>
        <span>Kebijakan Privasi · Syarat &amp; Ketentuan</span>
      </div>
    </footer>
  );
}
