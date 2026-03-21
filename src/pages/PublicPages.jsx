// ============================================================
// PublicPages.jsx — Articles / ArticleDetail / About
// Semua konten dari Supabase, bukan dummy data
// ============================================================
import React, { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import Navbar from "../components/Navbar.jsx";
import Footer      from "../components/Footer.jsx";
import ArticleCard from "../components/ArticleCard.jsx";
import Icon        from "../components/Icon.jsx";
import Pagination  from "../components/Pagination.jsx";
import { supabase } from "../lib/supabase.js";
import { getSiteSettings, getGuru } from "../lib/db.js";

// ── Hook: site settings ───────────────────────────────────────
function useSite() {
  const [site, setSite] = useState({ nama: "Al-Adzkiya", tagline: "Lembaga Bimbingan Belajar", logo: "🎓" });
  useEffect(() => {
    getSiteSettings().then(s => { if (s) setSite(s); }).catch(() => {});
  }, []);
  return site;
}

/* ── Articles list page ───────────────────────────────────── */
export function ArticlesPage({ onNav, onArticle }) {
  const site = useSite();
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [kategoriList, setKategoriList] = useState(["Semua"]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    supabase.from("artikel").select("*").order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = data || [];
        setArticles(list);
        // Kumpulkan kategori unik
        const cats = ["Semua", ...new Set(list.map(a => a.category).filter(Boolean))];
        setKategoriList(cats);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset page on search/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, kategori]);

  const filtered = articles.filter(a => {
    const katOk = kategori === "Semua" || a.category === kategori;
    const searchOk = !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt || "").toLowerCase().includes(search.toLowerCase());
    return katOk && searchOk;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <Navbar onNav={onNav} onLogin={() => onNav("login")} site={site} />
      <div style={{ paddingTop: 88 }}>
        <section className="section" style={{ padding: "60px 4%" }}>
          <div className="section-header" style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label blue"><i className="fa-solid fa-sparkles" style={{marginRight: 6}}></i> Blog & Artikel</div>
            <h2 className="section-title">Tips, Info & Pengumuman</h2>
            <p className="section-sub">Temukan artikel edukatif, tips belajar, dan informasi terbaru dari {site.nama}.</p>
          </div>

          {/* Filter & search - Centered */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <div style={{ width: "100%", maxWidth: 640, position: "relative" }}>
              <i className="fa-solid fa-magnifying-glass" style={{ position: "absolute", left: 16, top: 18, color: "var(--muted)" }}></i>
              <input
                className="form-input" style={{ width: "100%", paddingLeft: 44, height: 52, borderRadius: 100, fontSize: "1rem" }}
                placeholder="Cari berdasarkan judul atau isi artikel..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>⏳ Memuat artikel...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
              <div style={{ fontSize: "3rem", color: "var(--border)", marginBottom: 16 }}><i className="fa-solid fa-box-open"></i></div>
              <p>Belum ada artikel{search ? ' untuk "' + search + '"' : ""}.</p>
            </div>
          ) : (
            <>
              <style>{`
                .blog-layout { display: grid; grid-template-columns: 240px 1fr; gap: 40px; align-items: start; }
                @media (max-width: 992px) {
                  .blog-layout { grid-template-columns: 1fr; }
                }
              `}</style>
              
              <div className="blog-layout">
                {/* ── Kiri: Sidebar ── */}
                <aside style={{ position: "sticky", top: 100 }}>
                  
                  {/* Kategori Sidebar */}
                  {kategoriList.length > 1 && (
                    <div style={{
                      background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
                      padding: "20px 18px", marginBottom: 20
                    }}>
                      <h4 style={{ fontSize: ".88rem", fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                        <i className="fa-solid fa-tags" style={{ marginRight: 8, color: "var(--primary)" }}></i>
                        Kategori Topik
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {kategoriList.map(k => (
                          <div key={k} onClick={() => setKategori(k)}
                            style={{
                              padding: "8px 12px", borderRadius: 8, fontSize: ".85rem",
                              fontWeight: kategori === k ? 700 : 500, cursor: "pointer",
                              background: kategori === k ? "var(--bg)" : "transparent",
                              color: kategori === k ? "var(--primary)" : "var(--muted)",
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              transition: ".15s"
                            }}
                            onMouseEnter={e => { if(kategori !== k) e.currentTarget.style.background = "var(--surface)"; }}
                            onMouseLeave={e => { if(kategori !== k) e.currentTarget.style.background = "transparent"; }}
                          >
                            <span>{k}</span>
                            {kategori === k && <i className="fa-solid fa-check" style={{ fontSize: ".7rem" }}></i>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>

                {/* ── Kanan: Daftar Artikel (Grid Only) ── */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
                    {paginated.map((a, i) => (
                      <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .06}s` }}>
                        <ArticleCard article={a} index={i} onClick={() => onArticle(a)} />
                      </div>
                    ))}
                  </div>

                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
      <Footer onNav={onNav} site={site} />
    </>
  );
}

/* ── Article detail page ──────────────────────────────────── */
export function ArticleDetailPage({ article, onNav, onArticle }) {
  const site = useSite();
  const [otherArticles, setOtherArticles] = useState([]);

  useEffect(() => {
    supabase.from("artikel").select("id,title,img,date,category")
      .order("created_at", { ascending: false }).limit(6)
      .then(({ data }) => setOtherArticles((data || []).filter(a => a.id !== article?.id).slice(0, 5)));
  }, [article]);

  if (!article) return (
    <>
      <Navbar onNav={onNav} onLogin={() => onNav("login")} site={site} />
      <div style={{ paddingTop: 88, padding: "120px 5% 60px", textAlign: "center", color: "var(--muted)" }}>
        <div style={{ fontSize: "4rem", color: "var(--border)", marginBottom: 16 }}><i className="fa-regular fa-file-lines"></i></div>
        <p>Artikel tidak ditemukan.</p>
        <button className="btn-outline" style={{ marginTop: 16, padding: "10px 20px" }}
          onClick={() => onNav("artikel")}>← Kembali ke Artikel</button>
      </div>
      <Footer onNav={onNav} site={site} />
    </>
  );

  // Cek apakah content HTML atau plain text
  const isHTML = /<[a-z][\s\S]*>/i.test(article.content || "");

  // Parse URL video YouTube
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      // youtube.com/watch?v=ID
      const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
      // Sudah berbentuk embed
      if (url.includes("embed")) return url;
      // Google Drive
      const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
      if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
      return url;
    } catch { return url; }
  };

  const embedUrl = getEmbedUrl(article.video_url);

  // Unique categories dari artikel lain
  const categories = [...new Set(otherArticles.map(a => a.category).filter(Boolean))];

  return (
    <>
      <Navbar onNav={onNav} onLogin={() => onNav("login")} site={site} />
      <div style={{ paddingTop: 88 }}>
        <section className="section">
          <button onClick={() => onNav("artikel")} style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
            background: "none", border: "1px solid var(--border)", padding: "8px 14px",
            borderRadius: 8, cursor: "pointer", fontSize: ".85rem", color: "var(--muted)",
            fontFamily: "inherit",
          }}>
            <Icon name="back" size={16} />Kembali ke Artikel
          </button>

          {/* Himalayas style Header: Side-by-side title & image */}
          <div className="fade-in article-himalayas-header" style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px",
            alignItems: "center", marginBottom: 60
          }}>
            <div>
              <div style={{ display: "inline-flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
                {article.category && (
                  <span style={{ padding: "4px 14px", borderRadius: 100, fontSize: ".8rem", fontWeight: 700, background: "var(--primary)", color: "#fff" }}>
                    {article.category}
                  </span>
                )}
                {article.date && <span style={{ fontSize: ".85rem", color: "var(--muted)", fontWeight: 500 }}><i className="fa-solid fa-calendar-day" style={{marginRight: 6}}></i> {article.date}</span>}
              </div>

              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, lineHeight: 1.25, marginBottom: 32, color: "var(--text-main)", letterSpacing: "-1px" }}>
                {article.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--primary-light)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", fontWeight:700, color:"#fff", boxShadow: "0 10px 25px var(--primary-light)" }}>
                   {article.author?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", color: "var(--text-main)", fontWeight: 700 }}>{article.author || "Admin"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Penulis Konten</div>
                </div>
              </div>
            </div>

            <div style={{ width: "100%", height: 380, borderRadius: 24, overflow: "hidden", position: "relative", boxShadow: "var(--shadow-soft)", background: "var(--surface)" }}>
              {article.img && (article.img.startsWith("http")||article.img.startsWith("/")) ? (
                <img
                  src={article.img}
                  alt={article.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><i class="fa-solid fa-newspaper" style="color:var(--glass-border);font-size:4rem"></i></div>'; }}
                />
              ) : (
                <div style={{
                  height: "100%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "6rem",
                  background: "linear-gradient(135deg, var(--bg), var(--surface))",
                }}>
                  <i className="fa-solid fa-newspaper" style={{color:"var(--glass-border)"}}></i>
                </div>
              )}
            </div>
          </div>

          <style>{`
            @media (max-width: 900px) {
              .article-himalayas-header { grid-template-columns: 1fr !important; gap: 40px !important; }
            }
          `}</style>

          {/* 2-column layout: Content + Sidebar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 60, alignItems: "start" }}
            className="article-layout fade-in">

            {/* ── Main Content ── */}
            <div style={{ minWidth: 0 }}>
              {/* Video embed */}
              {embedUrl && (
                <div style={{ marginBottom: 40, borderRadius: 16, overflow: "hidden", boxShadow: "var(--shadow-soft)" }}>
                  <iframe
                    src={embedUrl}
                    width="100%"
                    height="380"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    title="Video artikel"
                    style={{ display: "block" }}
                  />
                </div>
              )}

              {/* Konten artikel */}
              {isHTML ? (
                <div
                  style={{ fontSize: ".95rem", lineHeight: 1.9, color: "#334155" }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
                />
              ) : (
                <div style={{ fontSize: ".95rem", lineHeight: 1.9, color: "#334155", whiteSpace: "pre-line" }}>
                  {article.content || article.excerpt}
                </div>
              )}

              {/* CSS untuk konten rich text */}
              <style>{`
                [dangerouslySetInnerHTML] h2,
                .rich-content h2 { font-size: 1.3rem; font-weight: 700; margin: 20px 0 8px; }
                [dangerouslySetInnerHTML] h3,
                .rich-content h3 { font-size: 1.05rem; font-weight: 700; margin: 16px 0 6px; }
                [dangerouslySetInnerHTML] ul,
                .rich-content ul,
                [dangerouslySetInnerHTML] ol,
                .rich-content ol { padding-left: 22px; margin: 8px 0; }
                [dangerouslySetInnerHTML] li,
                .rich-content li { margin-bottom: 4px; }
                @media (max-width: 860px) {
                  .article-layout { grid-template-columns: 1fr !important; }
                }
              `}</style>
            </div>

            {/* ── Sidebar ── */}
            <aside style={{ position: "sticky", top: 100 }}>
              {/* Artikel Terbaru Lainnya */}
              <div style={{
                background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
                padding: "20px 18px", marginBottom: 20,
              }}>
                <h4 style={{ fontSize: ".88rem", fontWeight: 700, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                  <i className="fa-solid fa-newspaper" style={{ marginRight: 8, color: "var(--blue)" }}></i>
                  Artikel Terbaru
                </h4>
                {otherArticles.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {otherArticles.map(a => (
                      <div key={a.id}
                        onClick={() => onArticle && onArticle(a)}
                        style={{
                          display: "flex", gap: 12, alignItems: "center",
                          cursor: "pointer", transition: ".2s",
                          padding: "8px 10px", borderRadius: 10, margin: "0 -10px",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#f8fafc"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{
                          width: 52, height: 52, borderRadius: 10, overflow: "hidden",
                          flexShrink: 0, background: "linear-gradient(135deg,#dbeafe,#dcfce7)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {a.img && (a.img.startsWith("http") || a.img.startsWith("/")) ? (
                            <img src={a.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "1.4rem" }}><i className="fa-solid fa-newspaper" style={{color:"var(--glass-border)"}}></i></span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: ".82rem", fontWeight: 600, lineHeight: 1.35, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: ".7rem", color: "var(--muted)", marginTop: 3 }}>{a.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: ".82rem", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>
                    Belum ada artikel lain.
                  </div>
                )}
              </div>

              {/* Kategori */}
              {categories.length > 0 && (
                <div style={{
                  background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
                  padding: "20px 18px",
                }}>
                  <h4 style={{ fontSize: ".88rem", fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                    <i className="fa-solid fa-tags" style={{ marginRight: 8, color: "#8b5cf6" }}></i>
                    Kategori
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {categories.map(cat => (
                      <span key={cat} style={{
                        padding: "5px 14px", borderRadius: 100, fontSize: ".78rem",
                        fontWeight: 600, background: "#f1f5f9", color: "#475569",
                        border: "1px solid #e2e8f0", cursor: "default",
                      }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>
      </div>
      <Footer onNav={onNav} site={site} />
    </>
  );
}

/* ── About page ───────────────────────────────────────────── */
export function AboutPage({ onNav }) {
  const site = useSite();
  const [guruList, setGuruList] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getGuru()
      .then(data => setGuruList((data || []).filter(g => g.status === "Aktif").slice(0, 6)))
      .catch(() => setGuruList([]))
      .finally(() => setLoading(false));
  }, []);

  const values = [
    { icon: "🎯", color: "#dbeafe", title: "Visi Kami",  desc: site.visi  || "Menjadi platform bimbel terpercaya yang menghasilkan generasi berprestasi dan berkarakter." },
    { icon: "💡", color: "#dcfce7", title: "Misi Kami",  desc: site.misi  || "Menyediakan layanan belajar berkualitas dengan tentor terbaik, metode inovatif, dan harga terjangkau." },
    { icon: "❤️", color: "#fef9c3", title: "Nilai Kami", desc: site.tentang || "Integritas, inovasi, dan kepedulian terhadap perkembangan setiap siswa menjadi landasan kerja kami." },
  ];

  const avatarColors = ["#3b82f6","#22c55e","#f59e0b","#8b5cf6","#ef4444","#06b6d4"];

  return (
    <>
      <Navbar onNav={onNav} onLogin={() => onNav("login")} site={site} />
      <div style={{ paddingTop: 88 }}>

        {/* Hero */}
        <section className="section" style={{ background: "#fff" }}>
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label blue" style={{ margin: "0 auto 12px" }}>✦ Tentang Kami</div>
            <h2 className="section-title">Kisah di Balik {site.nama}</h2>
            <p className="section-sub" style={{ margin: "0 auto", maxWidth: 600 }}>
              {site.tagline || `${site.nama} hadir dengan misi sederhana: menjadikan pendidikan berkualitas dapat diakses oleh semua siswa.`}
            </p>
          </div>

          {/* Visi Misi Nilai */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", border: "1px solid var(--border)" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: v.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 16 }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 8 }}>{v.title}</h3>
                <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tim Pengajar — dari Supabase */}
        <section className="section">
          <div className="section-header" style={{ textAlign: "center" }}>
            <div className="section-label blue" style={{ margin: "0 auto 12px" }}>✦ Tim Pengajar</div>
            <h2 className="section-title">Tentor {site.nama}</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>⏳ Memuat data tentor...</div>
          ) : guruList.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>
              Belum ada data tentor aktif.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 24 }}>
              {guruList.map((g, i) => (
                <div key={g.id} style={{
                  background: "#fff", borderRadius: 16, padding: "28px 24px",
                  border: "1px solid var(--border)", textAlign: "center",
                }}>
                  {/* Avatar inisial */}
                  <div style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: avatarColors[i % avatarColors.length],
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.6rem", fontWeight: 800, color: "#fff",
                    margin: "0 auto 14px",
                  }}>
                    {g.nama?.[0]?.toUpperCase() || "G"}
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{g.nama}</h3>
                  {g.email && (
                    <p style={{ color: "var(--blue)", fontWeight: 600, marginBottom: 4, fontSize: ".82rem" }}>{g.email}</p>
                  )}
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 100,
                    fontSize: ".72rem", fontWeight: 700,
                    background: g.status === "Aktif" ? "#dcfce7" : "#f1f5f9",
                    color: g.status === "Aktif" ? "#16a34a" : "var(--muted)",
                  }}>{g.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Kontak */}
        {(site.alamat || site.kontak || site.email) && (
          <section className="section" style={{ background: "#fff" }}>
            <div className="section-header" style={{ textAlign: "center" }}>
              <div className="section-label blue" style={{ margin: "0 auto 12px" }}>✦ Hubungi Kami</div>
              <h2 className="section-title">Informasi Kontak</h2>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              {[
                site.alamat && { icon: "📍", label: "Alamat",  val: site.alamat },
                site.kontak && { icon: "📞", label: "Telepon", val: site.kontak },
                site.email  && { icon: "✉️", label: "Email",   val: site.email  },
                site.wa     && { icon: "💬", label: "WhatsApp", val: site.wa, link: `https://wa.me/${site.wa.replace(/\D/g,"")}` },
              ].filter(Boolean).map((c, i) => (
                <div key={i} style={{
                  background: "#f8fafc", borderRadius: 14, padding: "20px 24px",
                  border: "1px solid var(--border)", minWidth: 200, textAlign: "center",
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>{c.icon}</div>
                  <div style={{ fontSize: ".72rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 4 }}>{c.label}</div>
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer"
                      style={{ fontSize: ".88rem", fontWeight: 600, color: "var(--blue)", textDecoration: "none" }}>
                      {c.val}
                    </a>
                  ) : (
                    <div style={{ fontSize: ".88rem", fontWeight: 600 }}>{c.val}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
      <Footer onNav={onNav} site={site} />
    </>
  );
}
