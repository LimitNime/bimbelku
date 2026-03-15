// ============================================================
// Footer.jsx — Public footer
// ============================================================
import Icon from "./Icon";
import { PACKAGES } from "../data";

export default function Footer({ onNav }) {
  return (
    <footer style={{
      background: "var(--sidebar)", color: "#94a3b8",
      padding: "60px 5% 30px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr 1fr 1fr",
        gap: 40, marginBottom: 40,
      }} className="footer-grid">

        {/* Brand */}
        <div>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#fff", marginBottom: 12 }}>BimbelKu</h3>
          <p style={{ fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 260 }}>
            Platform bimbingan belajar terpercaya yang membantu siswa meraih impian dan prestasi akademik terbaik.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {["📘", "📸", "🐦", "▶️"].map((s, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: 8, background: "#1e293b",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", cursor: "pointer",
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Navigasi</h4>
          {["Beranda", "Paket Belajar", "Artikel", "Tentang Kami"].map((l) => (
            <span key={l} onClick={() => onNav(l.toLowerCase().replace(/ /g, "-"))}
              style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "#94a3b8"}
            >{l}</span>
          ))}
        </div>

        {/* Packages */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Paket</h4>
          {PACKAGES.map((p) => (
            <span key={p.id} style={{ display: "block", fontSize: "0.82rem", marginBottom: 8, cursor: "pointer" }}>{p.name}</span>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: 14 }}>Kontak</h4>
          {[
            { icon: "phone", text: "+62 812-3456-7890" },
            { icon: "mail",  text: "info@bimbelku.id" },
            { icon: "map",   text: "Jl. Pendidikan No.1, Jakarta" },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem", marginBottom: 10 }}>
              <Icon name={c.icon} size={14} />{c.text}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: "1px solid #1e293b", paddingTop: 24,
        display: "flex", justifyContent: "space-between", fontSize: "0.78rem",
        flexWrap: "wrap", gap: 8,
      }}>
        <span>© 2026 BimbelKu. All rights reserved.</span>
        <span>Kebijakan Privasi · Syarat &amp; Ketentuan</span>
      </div>
    </footer>
  );
}
