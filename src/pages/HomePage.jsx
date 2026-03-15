// ============================================================
// HomePage.jsx — Public landing page (fully responsive)
// ============================================================
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PackageCard from "../components/PackageCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Icon from "../components/Icon.jsx";
import { PACKAGES, ARTICLES, FEATURES } from "../data/index.js";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [breakpoint]);
  return isMobile;
}

/* ── Hero ─────────────────────────────────────────────────── */
function HeroSection({ onDaftar }) {
  const isMobile = useIsMobile();

  return (
    <section style={{
      minHeight: "100vh",
      padding: isMobile ? "90px 5% 50px" : "100px 5% 60px",
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: "center",
      gap: isMobile ? 32 : 40,
      background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 50%, #fefce8 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Content */}
      <div className="fade-in" style={{
        maxWidth: isMobile ? "100%" : 600,
        position: "relative", zIndex: 1, flex: 1,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px", background: "#dbeafe", color: "var(--blue)",
          borderRadius: 100, fontSize: "0.8rem", fontWeight: 600, marginBottom: 18,
        }}>🎓 Platform Bimbel #1 di Indonesia</div>

        <h1 style={{
          fontSize: isMobile ? "1.9rem" : "clamp(2rem,5vw,3.2rem)",
          fontWeight: 800, lineHeight: 1.2, marginBottom: 16,
        }}>
          Raih Prestasi{" "}
          <span style={{
            background: "linear-gradient(135deg,var(--blue),var(--green-light))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Terbaik</span>{" "}
          Bersama Tentor Terpilih
        </h1>

        <p style={{
          fontSize: isMobile ? "0.95rem" : "1.05rem",
          color: "var(--muted)", lineHeight: 1.7, marginBottom: 28,
        }}>
          BimbelKu hadir dengan metode pembelajaran modern, tentor berpengalaman,
          dan program terstruktur untuk membantu siswa meraih nilai terbaik.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onDaftar} style={{ flex: isMobile ? 1 : "unset", justifyContent: "center" }}>
            Mulai Belajar <Icon name="arrow" size={16} />
          </button>
          <button className="btn-outline" onClick={onDaftar} style={{ flex: isMobile ? 1 : "unset" }}>
            Lihat Paket
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: isMobile ? 20 : 32, marginTop: 36,
          flexWrap: "wrap",
        }}>
          {[
            { num: "2.500+", label: "Siswa Aktif"       },
            { num: "150+",   label: "Tentor Pilihan"     },
            { num: "98%",    label: "Tingkat Kepuasan"   },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: isMobile ? "1.3rem" : "1.6rem", fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card — hidden on mobile */}
      {!isMobile && (
        <div className="fade-in" style={{ flex: 1, display: "flex", justifyContent: "flex-end", animationDelay: ".2s" }}>
          <div style={{
            background: "#fff", borderRadius: 20, padding: "20px 24px",
            boxShadow: "0 20px 60px rgba(0,0,0,.1)", border: "1px solid var(--border)",
            maxWidth: 300,
          }}>
            <h4 style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 12, fontWeight: 600 }}>📊 Hasil Belajar Siswa</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ color: "#f59e0b", display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map(i => <Icon key={i} name="star" size={14} />)}
              </div>
              <span style={{ fontSize: ".82rem", fontWeight: 600 }}>4.9 / 5.0</span>
            </div>
            <p style={{ fontSize: ".82rem", color: "var(--muted)", margin: "10px 0" }}>Rata-rata kenaikan nilai siswa</p>
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>Nilai rata-rata</div>
              <div style={{ fontFamily: "Sora", fontSize: "1.4rem", fontWeight: 800, color: "var(--green)" }}>+32 Poin</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dcfce7", color: "#16a34a" }}>Matematika ✓</span>
              <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dbeafe", color: "#2563eb" }}>Fisika ✓</span>
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
              {["A","B","C","D"].map((l, i) => (
                <div key={l} style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: ["#3b82f6","#22c55e","#f59e0b","#8b5cf6"][i],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: ".72rem", fontWeight: 700,
                  marginLeft: i > 0 ? -8 : 0, border: "2px solid #fff",
                }}>{l}</div>
              ))}
              <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>+2.4k siswa</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ── Features ─────────────────────────────────────────────── */
function FeaturesSection() {
  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="section-header">
        <div className="section-label blue">✦ Keunggulan Kami</div>
        <h2 className="section-title">Mengapa Memilih BimbelKu?</h2>
        <p className="section-sub">Kami berkomitmen memberikan layanan pendidikan terbaik dengan metode yang terbukti efektif.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="fade-in" style={{
            background: "#fff", borderRadius: 16, padding: "24px 20px",
            border: "1px solid var(--border)", transition: "all .25s",
            animationDelay: `${i * .1}s`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Packages preview ─────────────────────────────────────── */
function PackagesPreview({ onDaftar }) {
  return (
    <section className="section">
      <div className="section-header">
        <div className="section-label green">✦ Paket Belajar</div>
        <h2 className="section-title">Pilih Paket Sesuai Kebutuhan</h2>
        <p className="section-sub">Tersedia berbagai pilihan paket pembelajaran yang dapat disesuaikan dengan kebutuhan dan anggaran kamu.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
        {PACKAGES.map((pkg, i) => (
          <div key={pkg.id} className="fade-in" style={{ animationDelay: `${i * .1}s` }}>
            <PackageCard pkg={pkg} onDaftar={onDaftar} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Articles preview ─────────────────────────────────────── */
function ArticlesPreview({ onArticle }) {
  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="section-label blue">✦ Artikel Terbaru</div>
          <h2 className="section-title">Tips &amp; Informasi Belajar</h2>
        </div>
        <button className="btn-outline" style={{ padding: "10px 20px", fontSize: ".85rem" }}
          onClick={() => onArticle(null, "list")}>Lihat Semua</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
        {ARTICLES.slice(0, 3).map((a, i) => (
          <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .1}s` }}>
            <ArticleCard article={a} index={i} onClick={() => onArticle(a, "detail")} />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Main export ──────────────────────────────────────────── */
export default function HomePage({ onNav, onLogin, onArticle }) {
  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} />
      <HeroSection onDaftar={onLogin} />
      <FeaturesSection />
      <PackagesPreview onDaftar={onLogin} />
      <ArticlesPreview onArticle={onArticle} />
      <Footer onNav={onNav} />
    </>
  );
}