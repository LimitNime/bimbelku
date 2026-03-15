// ============================================================
// PublicPages.jsx — Packages / Articles / ArticleDetail / About
// ============================================================
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import PackageCard from "../components/PackageCard.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Icon from "../components/Icon.jsx";
import { PACKAGES, ARTICLES, TEACHERS_DATA } from "../data";

/* ── Packages page ────────────────────────────────────────── */
export function PackagesPage({ onNav, onLogin }) {
  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} />
      <div style={{ paddingTop: 88 }}>
        <section className="section">
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label green" style={{ margin: "0 auto 12px" }}>✦ Paket Belajar</div>
            <h2 className="section-title">Pilih Paket yang Tepat Untukmu</h2>
            <p className="section-sub" style={{ margin: "0 auto" }}>
              Semua paket sudah termasuk akses modul belajar, grup diskusi, dan evaluasi berkala.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={pkg.id} className="fade-in" style={{ animationDelay: `${i * .1}s` }}>
                <PackageCard pkg={pkg} onDaftar={onLogin} />
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer onNav={onNav} />
    </>
  );
}

/* ── Articles list page ───────────────────────────────────── */
export function ArticlesPage({ onNav, onLogin, onArticle }) {
  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} />
      <div style={{ paddingTop: 88 }}>
        <section className="section">
          <div className="section-header">
            <div className="section-label blue">✦ Blog &amp; Artikel</div>
            <h2 className="section-title">Tips, Info &amp; Pengumuman</h2>
            <p className="section-sub">Temukan artikel edukatif, tips belajar, dan informasi terbaru dari BimbelKu.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
            {ARTICLES.map((a, i) => (
              <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .08}s` }}>
                <ArticleCard article={a} index={i} onClick={() => onArticle(a)} />
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer onNav={onNav} />
    </>
  );
}

/* ── Article detail page ──────────────────────────────────── */
export function ArticleDetailPage({ article, onBack, onNav, onLogin }) {
  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} />
      <div style={{ paddingTop: 88 }}>
        <section className="section">
          <button onClick={onBack} style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
            background: "none", border: "1px solid var(--border)", padding: "8px 14px",
            borderRadius: 8, cursor: "pointer", fontSize: ".85rem", color: "var(--muted)",
            fontFamily: "inherit",
          }}>
            <Icon name="back" size={16} />Kembali ke Artikel
          </button>

          <div style={{ maxWidth: 720, margin: "0 auto" }} className="fade-in">
            {/* Hero image */}
            <div style={{
              height: 200, borderRadius: 20, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "5rem",
              background: "linear-gradient(135deg,#dbeafe,#dcfce7)", marginBottom: 28,
            }}>{article.img}</div>

            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
              {article.title}
            </h1>

            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 28, flexWrap: "wrap" }}>
              <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dbeafe", color: "#2563eb" }}>{article.category}</span>
              <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>📅 {article.date}</span>
              <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>✍️ {article.author}</span>
            </div>

            <div style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "#334155", whiteSpace: "pre-line" }}>
              {article.content || article.excerpt}
            </div>
          </div>
        </section>
      </div>
      <Footer onNav={onNav} />
    </>
  );
}

/* ── About page ───────────────────────────────────────────── */
export function AboutPage({ onNav, onLogin }) {
  const values = [
    { icon: "🎯", color: "#dbeafe", title: "Visi Kami",   desc: "Menjadi platform bimbel terpercaya yang menghasilkan generasi berprestasi dan berkarakter." },
    { icon: "💡", color: "#dcfce7", title: "Misi Kami",   desc: "Menyediakan layanan belajar berkualitas dengan tentor terbaik, metode inovatif, dan harga terjangkau." },
    { icon: "❤️", color: "#fef9c3", title: "Nilai Kami",  desc: "Integritas, inovasi, dan kepedulian terhadap perkembangan setiap siswa menjadi landasan kerja kami." },
  ];
  const teacherEmojis = ["👨‍🏫", "👩‍🏫", "👨‍🔬"];
  const teacherBg     = ["#dbeafe", "#dcfce7", "#fef9c3"];

  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} />
      <div style={{ paddingTop: 88 }}>
        {/* Vision, mission, values */}
        <section className="section" style={{ background: "#fff" }}>
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label blue" style={{ margin: "0 auto 12px" }}>✦ Tentang Kami</div>
            <h2 className="section-title">Kisah di Balik BimbelKu</h2>
            <p className="section-sub" style={{ margin: "0 auto", maxWidth: 600 }}>
              BimbelKu didirikan pada 2018 dengan misi sederhana: menjadikan pendidikan berkualitas dapat diakses oleh semua siswa Indonesia.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid var(--border)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: v.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="section">
          <div className="section-header" style={{ textAlign: "center" }}>
            <h2 className="section-title">Tim Pengajar Kami</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
            {TEACHERS_DATA.map((t, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: teacherBg[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 14px" }}>{teacherEmojis[i]}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{t.name}</h3>
                <p style={{ color: "var(--blue)", fontWeight: 600, marginBottom: 4, fontSize: ".88rem" }}>{t.subject}</p>
                <p style={{ fontSize: ".82rem", color: "var(--muted)" }}>{t.students} siswa diajar</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <Footer onNav={onNav} />
    </>
  );
}
