// ============================================================
// Footer.jsx — Public footer (fully responsive)
// ============================================================
import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import { PACKAGES } from "../data/index.js";

export default function Footer({ onNav }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return (
    <footer style={{
      background: "var(--sidebar)", color: "#94a3b8",
      padding: isMobile ? "40px 5% 24px" : "60px 5% 30px",
    }}>
      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr 1fr 1fr",
        gap: isMobile ? 28 : 40,
        marginBottom: isMobile ? 28 : 40,
      }}>
        {/* Brand */}
        <div>
          <h3 style={{
            fontFamily: "'Sora',sans-serif", fontSize: "1.3rem",
            fontWeight: 800, color: "#fff", marginBottom: 10,
          }}>BimbelKu</h3>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 280 }}>
            Platform bimbingan belajar terpercaya yang membantu siswa meraih impian dan prestasi akademik terbaik.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            {["📘", "📸", "🐦", "▶️"].map((s, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: 8, background: "#1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", cursor: "pointer",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--blue)"}
                onMouseLeave={e => e.currentTarget.style.background = "#1e293b"}
              >{s}</div>
            ))}
          </div>
        </div>

        {/* On mobile: show 2-col grid for the 3 link sections */}
        {isMobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Navigasi */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>Navigasi</h4>
              {["Beranda", "Paket Belajar", "Artikel", "Tentang Kami"].map((l) => (
                <span key={l}
                  onClick={() => onNav(l.toLowerCase().replace(/ /g, "-"))}
                  style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "#94a3b8"}
                >{l}</span>
              ))}
            </div>
            {/* Paket */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>Paket</h4>
              {PACKAGES.map((p) => (
                <span key={p.id} style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}>{p.name}</span>
              ))}
            </div>
            {/* Kontak — full width */}
            <div style={{ gridColumn: "1 / -1" }}>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 12 }}>Kontak</h4>
              {[
                { icon: "phone", text: "+62 812-3456-7890" },
                { icon: "mail",  text: "info@bimbelku.id"  },
                { icon: "map",   text: "Jl. Pendidikan No.1, Jakarta" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", marginBottom: 8 }}>
                  <Icon name={c.icon} size={14} />{c.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Navigasi */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Navigasi</h4>
              {["Beranda", "Paket Belajar", "Artikel", "Tentang Kami"].map((l) => (
                <span key={l}
                  onClick={() => onNav(l.toLowerCase().replace(/ /g, "-"))}
                  style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}
                  onMouseEnter={e => e.target.style.color = "#fff"}
                  onMouseLeave={e => e.target.style.color = "#94a3b8"}
                >{l}</span>
              ))}
            </div>
            {/* Paket */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Paket</h4>
              {PACKAGES.map((p) => (
                <span key={p.id} style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}>{p.name}</span>
              ))}
            </div>
            {/* Kontak */}
            <div>
              <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Kontak</h4>
              {[
                { icon: "phone", text: "+62 812-3456-7890" },
                { icon: "mail",  text: "info@bimbelku.id"  },
                { icon: "map",   text: "Jl. Pendidikan No.1, Jakarta" },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", marginBottom: 10 }}>
                  <Icon name={c.icon} size={14} />{c.text}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom */}
      <div style={{
        borderTop: "1px solid #1e293b", paddingTop: 20,
        display: "flex", justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        gap: 8, fontSize: "0.78rem", textAlign: isMobile ? "center" : "left",
      }}>
        <span>© 2026 BimbelKu. All rights reserved.</span>
        <span>Kebijakan Privasi · Syarat &amp; Ketentuan</span>
      </div>
    </footer>
  );
}