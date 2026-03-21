// ============================================================
// HomePage.jsx — Public landing page — konten dari Supabase
// ============================================================
import { useState, useEffect } from "react";
import Navbar  from "../components/Navbar.jsx";
import Footer  from "../components/Footer.jsx";
import Icon    from "../components/Icon.jsx";
import { supabase } from "../lib/supabase.js";

// ── Hook: ambil semua data landing page + site settings ───────
function useLandingData() {
  const [sections, setSections] = useState({});
  const [site,     setSite]     = useState({
    nama: "Al-Adzkiya", tagline: "Lembaga Bimbingan Belajar",
    logo: "🎓", wa: "", ig: "", fb: "", alamat: "", kontak: "", email: "",
    copyright: "Al-Adzkiya. All rights reserved.",
  });
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("landing_page").select("*"),
      supabase.from("site_settings").select("*").eq("id", "default").single(),
      supabase.from("artikel").select("id,title,author,date,category,img,excerpt").order("created_at", { ascending: false }).limit(5),
    ]).then(([{ data: lp }, { data: st }, { data: art }]) => {
      const sec = {};
      (lp || []).forEach(row => {
        sec[row.id] = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
      });
      setSections(sec);
      if (st) setSite(st);
      setArticles(art || []);
    }).catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  return { sections, site, articles, loading };
}

// ── Responsive hook ───────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [m, setM] = useState(window.innerWidth <= bp);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, [bp]);
  return m;
}

// ── Helper: bintang rating ────────────────────────────────────
function Stars({ count = 5 }) {
  return (
    <div style={{ color: "#f59e0b", display: "flex", gap: 2 }}>
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <Icon key={i} name="star" size={14} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────────────────────
function HeroSection({ data = {}, site = {}, onDaftar }) {
  const isMobile = useIsMobile();
  const {
    badge        = "Platform Bimbel #1 di Indonesia",
    judul        = `Raih Prestasi Terbaik Bersama ${site.nama || "Kami"}`,
    deskripsi    = "Hadir dengan metode pembelajaran modern dan tentor berpengalaman.",
    btn_utama    = "Mulai Belajar",
    btn_utama_link = "",
    btn_sekunder = "Lihat Paket",
    btn_sekunder_link = "",
    stat1_num = "2.500+", stat1_label = "Siswa Aktif",
    stat2_num = "150+",   stat2_label = "Tentor Pilihan",
    stat3_num = "98%",    stat3_label = "Tingkat Kepuasan",
    rating_num   = "4.9",
    rating_label = "Rata-rata kenaikan nilai",
    rating_nilai = "+32 Poin",
  } = data;

  const handleLink = (link, fallback) => {
    if (link) window.open(link.startsWith("http") ? link : `https://${link}`, "_blank");
    else fallback();
  };

  return (
    <section style={{
      minHeight: "100vh",
      padding: isMobile ? "90px 5% 50px" : "100px 5% 60px",
      display: "flex", flexDirection: isMobile ? "column" : "row",
      alignItems: "center", gap: isMobile ? 32 : 40,
      background: "linear-gradient(135deg,#eff6ff 0%,#f0fdf4 50%,#fefce8 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Konten kiri */}
      <div className="fade-in" style={{ maxWidth: isMobile ? "100%" : 600, flex: 1, position: "relative", zIndex: 1 }}>
        <div className="badge soft-blue" style={{ marginBottom: 18, fontSize: "0.85rem", padding: "8px 16px" }}><i className="fa-solid fa-graduation-cap" style={{marginRight: 6}}></i> {badge}</div>

        <h1 style={{
          fontSize: isMobile ? "1.9rem" : "clamp(2rem,5vw,3.2rem)",
          fontWeight: 800, lineHeight: 1.2, marginBottom: 16,
        }}>
          {judul.split("Terbaik").length > 1 ? (
            <>
              {judul.split("Terbaik")[0]}
              <span style={{
                background: "linear-gradient(135deg,var(--blue),var(--green-light))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>Terbaik</span>
              {judul.split("Terbaik")[1]}
            </>
          ) : judul}
        </h1>

        <p style={{ fontSize: isMobile ? ".95rem" : "1.05rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: 28 }}>
          {deskripsi}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => handleLink(btn_utama_link, onDaftar)}
            style={{ flex: isMobile ? 1 : "unset", justifyContent: "center" }}>
            {btn_utama} <Icon name="arrow" size={16} />
          </button>
          <button className="btn-outline" onClick={() => handleLink(btn_sekunder_link, onDaftar)}
            style={{ flex: isMobile ? 1 : "unset" }}>
            {btn_sekunder}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: isMobile ? 20 : 32, marginTop: 36, flexWrap: "wrap" }}>
          {[
            { num: stat1_num, label: stat1_label },
            { num: stat2_num, label: stat2_label },
            { num: stat3_num, label: stat3_label },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: isMobile ? "1.3rem" : "1.6rem", fontWeight: 800 }}>{s.num}</div>
              <div style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating card — desktop only */}
      {!isMobile && (
        <div className="fade-in" style={{ flex: 1, display: "flex", justifyContent: "flex-end", animationDelay: ".2s" }}>
          <div className="content-card" style={{ maxWidth: 300, padding: "20px 24px" }}>
            <h4 style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 12, fontWeight: 600 }}><i className="fa-solid fa-chart-simple" style={{marginRight: 6}}></i> Hasil Belajar Siswa</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Stars count={5} />
              <span style={{ fontSize: ".82rem", fontWeight: 600 }}>{rating_num} / 5.0</span>
            </div>
            <p style={{ fontSize: ".82rem", color: "var(--muted)", margin: "10px 0" }}>{rating_label}</p>
            <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>Nilai rata-rata</div>
              <div style={{ fontFamily: "Sora", fontSize: "1.4rem", fontWeight: 800, color: "var(--green)" }}>{rating_nilai}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ABOUT / FEATURES
// ─────────────────────────────────────────────────────────────
function FeaturesSection({ data = {} }) {
  const {
    label = "Keunggulan Kami",
    judul = "Mengapa Memilih Kami?",
    items = [
      { icon: "fa-trophy", color: "#fef9c3", title: "Tentor Berpengalaman",  desc: "Tentor kami telah berpengalaman 5–15 tahun." },
      { icon: "fa-mobile-screen", color: "#dbeafe", title: "Belajar Fleksibel",     desc: "Online maupun offline, jadwal fleksibel." },
      { icon: "fa-chart-pie", color: "#dcfce7", title: "Laporan Berkala",       desc: "Laporan perkembangan siswa setiap bulan." },
      { icon: "fa-bullseye", color: "#f3e8ff", title: "Kurikulum Terstruktur", desc: "Mengacu kurikulum terbaru dan ujian nasional." },
    ],
  } = data;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="section-header">
        <div className="section-label blue"><i className="fa-solid fa-sparkles" style={{marginRight: 6}}></i> {label}</div>
        <h2 className="section-title">{judul}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
        {items.map((f, i) => (
          <div key={i} className="content-card fade-in" style={{ padding: "24px 20px", animationDelay: `${i * .1}s` }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: f.color || "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 14 }}>
              {f.icon && f.icon.startsWith("fa-") ? <i className={`fa-solid ${f.icon}`}></i> : f.icon}
            </div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// TESTIMONI
// ─────────────────────────────────────────────────────────────
function TestimoniSection({ data = {} }) {
  const {
    label = "Testimoni",
    judul = "Kata Mereka",
    items = [
      { nama: "Andi Pratama", sekolah: "SMA Negeri 1", rating: 5, pesan: "Nilai saya naik drastis setelah bimbel di sini!" },
      { nama: "Siti Rahma",   sekolah: "SMP Negeri 3", rating: 5, pesan: "Metode belajarnya seru dan tidak membosankan." },
      { nama: "Budi Wijaya",  sekolah: "SMA Swasta",   rating: 5, pesan: "Berhasil masuk PTN impian berkat bimbingan di sini." },
    ],
  } = data;

  if (!items.length) return null;

  return (
    <section className="section" style={{ background: "#f8fafc" }}>
      <div className="section-header">
        <div className="section-label blue"><i className="fa-solid fa-sparkles" style={{marginRight: 6}}></i> {label}</div>
        <h2 className="section-title">{judul}</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
        {items.map((t, i) => (
          <div key={i} className="content-card" style={{ padding: "22px 20px" }}>
            <Stars count={t.rating || 5} />
            <p style={{ fontSize: ".88rem", color: "var(--text)", lineHeight: 1.65, margin: "12px 0 16px", fontStyle: "italic" }}>
              "{t.pesan}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%",
                background: `hsl(${i * 60 + 200},70%,50%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 700, fontSize: ".9rem",
              }}>{t.nama?.[0] || "?"}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: ".88rem" }}>{t.nama}</div>
                <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{t.sekolah}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// ARTIKEL PREVIEW (Horizontal Slider)
// ─────────────────────────────────────────────────────────────
function ArticlesPreview({ articles = [], onNav, onArticle }) {
  const [scrollPos, setScrollPos] = useState(0);
  if (!articles.length) return null;

  const handleScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    setScrollPos(scrollLeft / (scrollWidth - clientWidth));
  };

  return (
    <section className="section" style={{ background: "#fff", overflow: "hidden" }}>
      <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div className="section-label blue"><i className="fa-solid fa-sparkles" style={{marginRight: 6}}></i> Artikel Terbaru</div>
          <h2 className="section-title">Tips & Informasi Belajar</h2>
        </div>
        <button className="btn-outline" style={{ padding: "10px 20px", fontSize: ".85rem" }}
          onClick={() => onNav("artikel")}>Lihat Semua</button>
      </div>

      <div className="slider-outer">
        <div className="slider-container" onScroll={handleScroll}>
          {articles.map((a, i) => (
            <div key={a.id} className="slider-item content-card fade-in"
              onClick={() => onArticle && onArticle(a)}
              style={{ padding: 0, overflow: "hidden", animationDelay: `${i * .1}s`, cursor: "pointer" }}
            >
              <div className="slider-img-wrapper">
                {a.img && (a.img.startsWith("http") || a.img.startsWith("/")) ? (
                  <img src={a.img} alt={a.title} onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="slider-img-placeholder">
                    {a.img || <i className="fa-solid fa-newspaper"></i>}
                  </div>
                )}
              </div>
              <div style={{ padding: "16px 18px" }}>
                <span className="slider-badge">{a.category}</span>
                <h3 className="slider-title">{a.title}</h3>
                <p className="slider-excerpt">{a.excerpt}</p>
                <div className="slider-footer">{a.author} · {a.date}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Scroll Progress Bar */}
        <div className="slider-progress-track">
          <div className="slider-progress-bar" style={{ width: `${scrollPos * 100}%` }} />
        </div>
      </div>

      <style>{`
        .slider-outer {
          position: relative;
          margin: 0 -5%;
          padding: 10px 5%;
        }
        .slider-container {
          display: flex;
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 20px 0;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .slider-container::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .slider-item {
          min-width: 300px;
          max-width: 300px;
          scroll-snap-align: start;
          transition: transform .3s ease;
        }
        .slider-item:hover {
          transform: translateY(-8px);
        }
        .slider-img-wrapper {
          height: 180px;
          background: linear-gradient(135deg,#dbeafe,#dcfce7);
          overflow: hidden;
          position: relative;
        }
        .slider-img-wrapper img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .slider-badge {
          fontSize: .72rem; fontWeight: 700; color: var(--blue); background: #dbeafe; padding: 2px 8px; borderRadius: 6;
        }
        .slider-title {
          fontSize: .92rem; fontWeight: 700; margin: 8px 0 6px; lineHeight: 1.4;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .slider-excerpt {
          fontSize: .8rem; color: var(--muted); lineHeight: 1.6;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .slider-footer {
          fontSize: .75rem; color: var(--muted); marginTop: 10;
        }
        .slider-progress-track {
          width: 100px; height: 3px; background: #e2e8f0; margin: 20px auto 0; border-radius: 10px; overflow: hidden;
        }
        .slider-progress-bar {
          height: 100%; background: var(--blue); transition: width .1s ease-out;
        }
        @media (max-width: 600px) {
          .slider-item { min-width: 260px; max-width: 260px; }
        }
      `}</style>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ
// ─────────────────────────────────────────────────────────────
function FAQSection({ data = {} }) {
  const {
    label = "FAQ",
    judul = "Pertanyaan Umum",
    items = [],
  } = data;
  const [openIdx, setOpenIdx] = useState(null);

  if (!items.length) return null;

  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="section-header">
        <div className="section-label blue"><i className="fa-solid fa-sparkles" style={{marginRight: 6}}></i> {label}</div>
        <h2 className="section-title">{judul}</h2>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {items.map((item, i) => (
          <div key={i} style={{
            border: "1px solid var(--border)", borderRadius: 12,
            marginBottom: 10, overflow: "hidden",
          }}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: "100%", textAlign: "left", padding: "16px 20px",
                background: openIdx === i ? "#eff6ff" : "#fff",
                border: "none", cursor: "pointer", fontFamily: "inherit",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: ".92rem", fontWeight: 600, color: "var(--text)",
              }}>
              {item.pertanyaan}
              <span style={{ fontSize: "1.1rem", color: "var(--blue)", flexShrink: 0, marginLeft: 12 }}>
                {openIdx === i ? "−" : "+"}
              </span>
            </button>
            {openIdx === i && (
              <div style={{ padding: "0 20px 16px", fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.7 }}>
                {item.jawaban}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// CTA
// ─────────────────────────────────────────────────────────────
function CTASection({ data = {}, site = {}, onDaftar }) {
  const {
    judul       = "Siap Raih Prestasi Terbaik?",
    deskripsi   = "Daftarkan diri sekarang dan mulai perjalanan belajar yang menyenangkan.",
    btn_text    = "Daftar Sekarang",
    btn_link    = "",
    btn_wa_text = "Hubungi via WhatsApp",
    btn_wa_link = "",
  } = data;

  const handleLink = (link, fallback) => {
    if (link) window.open(link.startsWith("http") ? link : `https://${link}`, "_blank");
    else fallback();
  };

  const openWA = () => {
    if (btn_wa_link) { window.open(btn_wa_link.startsWith("http") ? btn_wa_link : `https://${btn_wa_link}`, "_blank"); return; }
    const nomor = (site.wa || "").replace(/\D/g, "");
    if (!nomor) { onDaftar(); return; }
    window.open(`https://wa.me/${nomor}`, "_blank");
  };

  return (
    <section style={{
      background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
      padding: "60px 5%", textAlign: "center", color: "#fff",
    }}>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, marginBottom: 14 }}>
        {judul}
      </h2>
      <p style={{ fontSize: "1.05rem", opacity: .9, marginBottom: 32, maxWidth: 560, margin: "0 auto 32px" }}>
        {deskripsi}
      </p>
      <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => handleLink(btn_link, onDaftar)} style={{
          padding: "13px 28px", borderRadius: 12, border: "none",
          background: "#fff", color: "var(--blue)", fontWeight: 700,
          fontSize: ".95rem", cursor: "pointer", fontFamily: "inherit",
        }}>{btn_text}</button>
        <button onClick={openWA} style={{
          padding: "13px 28px", borderRadius: 12, border: "2px solid rgba(255,255,255,.5)",
          background: "transparent", color: "#fff", fontWeight: 700,
          fontSize: ".95rem", cursor: "pointer", fontFamily: "inherit",
        }}><i className="fa-brands fa-whatsapp" style={{marginRight: 6}}></i> {btn_wa_text}</button>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────
export default function HomePage({ onNav, onLogin, onArticle }) {
  const { sections, site, articles, loading } = useLandingData();

  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", border: "4px solid #e2e8f0", borderTopColor: "#2563eb", animation: "spin .8s linear infinite" }} />
      <p style={{ color: "var(--muted)", fontSize: ".88rem" }}>Memuat halaman...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <>
      <Navbar onNav={onNav} onLogin={onLogin} site={site} />
      <HeroSection      data={sections.hero}        site={site} onDaftar={onLogin} />
      <FeaturesSection  data={sections.features} />
      <TestimoniSection data={sections.testimonial} />
      <ArticlesPreview  articles={articles} onNav={onNav} onArticle={onArticle} />
      <FAQSection       data={sections.faq} />
      <CTASection       data={sections.cta} site={site} onDaftar={onLogin} />
      <Footer           onNav={onNav} site={site} />
    </>
  );
}
