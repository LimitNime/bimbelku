// ============================================================
// HomePage.jsx — Public landing page
// ============================================================
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PackageCard from "../components/PackageCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Icon from "../components/Icon.jsx";
import { PACKAGES, ARTICLES, FEATURES } from "../data";

/* ── Hero ─────────────────────────────────────────────────── */
function HeroSection({ onDaftar }) {
  return (
    <section style={{
      minHeight: "100vh", padding: "100px 5% 60px",
      display: "flex", alignItems: "center", gap: 40,
      background: "linear-gradient(135deg, #eff6ff 0%, #f0fdf4 50%, #fefce8 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Content */}
      <div className="fade-in" style={{ maxWidth: 600, position: "relative", zIndex: 1 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px", background: "#dbeafe", color: "var(--blue)",
          borderRadius: 100, fontSize: "0.8rem", fontWeight: 600, marginBottom: 20,
        }}>🎓 Platform Bimbel #1 di Indonesia</div>

        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
          Raih Prestasi{" "}
          <span style={{
            background: "linear-gradient(135deg,var(--blue),var(--green-light))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>Terbaik</span>{" "}
          Bersama Tentor Terpilih
        </h1>

        <p style={{ fontSize: "1.05rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: 32 }}>
          BimbelKu hadir dengan metode pembelajaran modern, tentor berpengalaman, dan program terstruktur
          untuk membantu siswa meraih nilai terbaik di setiap ujian.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={onDaftar}>
            Mulai Belajar Sekarang <Icon name="arrow" size={16} />
          </button>
          <button className="btn-outline" onClick={onDaftar}>Lihat Paket</button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 32, marginTop: 40 }}>
          {[
            { num: "2.500+", label: "Siswa Aktif" },
            { num: "150+",   label: "Tentor Pilihan" },
            { num: "98%",    label: "Tingkat Kepuasan" },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.6rem", fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card */}
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
        </div>
      </div>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
        {FEATURES.map((f, i) => (
          <div key={i} className="fade-in" style={{
            background: "#fff", borderRadius: 16, padding: "28px 24px",
            border: "1px solid var(--border)", transition: "all .25s",
            animationDelay: `${i * .1}s`,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 14, background: f.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
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
        <button className="btn-outline" style={{ padding: "10px 20px", fontSize: ".85rem" }} onClick={() => onArticle(null, "list")}>
          Lihat Semua
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
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
