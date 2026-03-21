// ============================================================
// SharedDashPages.jsx — Pages shared across roles
// ============================================================
import { useState, useEffect } from "react";
import DOMPurify from 'dompurify';
import Icon from "../components/Icon.jsx";

/* ── Profil ───────────────────────────────────────────────── */
export function ProfilPage({ user }) {
  const isGuru  = user.role === "Guru";
  const name    = isGuru ? "Drs. Budi Santoso" : "Andi Pratama";
  const color   = isGuru ? "#3b82f6" : "#22c55e";

  const fields = [
    { label: "Email",         val: user.email },
    { label: "Telepon",       val: "+62 812-0000-0000" },
    isGuru
      ? { label: "Mata Pelajaran", val: "Matematika & Fisika" }
      : { label: "Kelas",          val: "XII IPA" },
    isGuru
      ? { label: "Pengalaman",     val: "8 Tahun" }
      : { label: "Paket",          val: "Premium" },
    { label: "Bergabung Sejak", val: "Januari 2025" },
    { label: "Status",          val: "Aktif" },
  ];

  return (
    <div className="fade-in">
      <div className="profile-card">
        <div className="profile-avatar" style={{ background: color }}>{name[0]}</div>
        <h2 style={{ marginBottom: 4 }}>{name}</h2>
        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 20 }}>{user.role}</p>

        {fields.map((f, i) => (
          <div key={i} className="profile-field">
            <label>{f.label}</label>
            <p>{f.val}</p>
          </div>
        ))}

        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem", marginTop: 8 }}>
          <Icon name="edit" size={14} />Edit Profil
        </button>
      </div>
    </div>
  );
}

/* ── Article detail (in-dashboard) ───────────────────────── */
export function DashArticleDetail({ article, onBack, onArticle }) {
  const [otherArticles, setOtherArticles] = useState([]);

  useEffect(() => {
    if (!article) return;
    // Ambil beberapa artikel terbaru untuk sidebar (kecuali yang sedang dibaca)
    import("../lib/supabase.js").then(({ supabase }) => {
      supabase.from("artikel")
        .select("id,title,img,date")
        .neq("id", article.id)
        .order("created_at", { ascending: false })
        .limit(5)
        .then(({ data }) => setOtherArticles(data || []));
    });
  }, [article]);

  if (!article) return (
    <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
      <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
      Artikel tidak ditemukan.
      <div style={{ marginTop: 16 }}>
        <button onClick={onBack} className="btn-outline" style={{ padding: "8px 16px", fontSize: ".85rem" }}>Kembali</button>
      </div>
    </div>
  );

  // Cek apakah content mengandung HTML tag atau plain text
  const isHTML = /<[a-z][\s\S]*>/i.test(article.content || "");

  return (
    <div className="fade-in">
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20,
        background: "none", border: "1px solid var(--border)", padding: "8px 14px",
        borderRadius: 8, cursor: "pointer", fontSize: ".85rem", color: "var(--muted)",
        fontFamily: "inherit", transition: ".2s"
      }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
         onMouseLeave={e => e.currentTarget.style.background = "none"}>
        <Icon name="back" size={16} />Kembali
      </button>

      <div className="dashboard-article-layout" style={{
        display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start"
      }}>
        {/* Kolom Kiri: Konten Utama */}
        <div style={{ minWidth: 0 }}>
          {/* Hero */}
          <div style={{
            height: 160, borderRadius: 16, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "4rem", overflow: "hidden", position: "relative",
            background: article.img && (article.img.startsWith("http")||article.img.startsWith("/")) ? "#f1f5f9" : "linear-gradient(135deg,#dbeafe,#dcfce7)", marginBottom: 24,
          }}>
            {article.img && (article.img.startsWith("http") || article.img.startsWith("/")) ? (
              <img src={article.img} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0 }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '📰'; }} />
            ) : (
              article.img || "📰"
            )}
          </div>

          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
            {article.title}
          </h1>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
            {article.category && (
              <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dbeafe", color: "#2563eb" }}>{article.category}</span>
            )}
            {article.date   && <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>📅 {article.date}</span>}
            {article.author && <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>✍️ {article.author}</span>}
          </div>

          {/* Video embed */}
          {article.video_url && (
            <div style={{ marginBottom: 24 }}>
              <iframe
                src={article.video_url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
                width="100%" height="360" frameBorder="0" allowFullScreen
                style={{ borderRadius: 12 }}
                title="Video artikel"
              />
            </div>
          )}

          {/* Konten artikel — render HTML atau plain text */}
          <div style={{ background: "#fff", padding: 32, borderRadius: 16, border: "1px solid var(--border)" }}>
            {isHTML ? (
              <div
                className="artikel-content"
                style={{ fontSize: ".95rem", lineHeight: 1.9, color: "#334155" }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
              />
            ) : (
              <div className="artikel-content" style={{ fontSize: ".95rem", lineHeight: 1.9, color: "#334155", whiteSpace: "pre-line" }}>
                {article.content || article.excerpt}
              </div>
            )}
          </div>

          {/* Style untuk konten rich text */}
          <style>{`
            .artikel-content h2 { font-size: 1.3rem; font-weight: 700; margin: 24px 0 12px; }
            .artikel-content h3 { font-size: 1.05rem; font-weight: 700; margin: 20px 0 8px; }
            .artikel-content ul, .artikel-content ol { padding-left: 22px; margin: 12px 0; }
            .artikel-content li { margin-bottom: 6px; }
            .artikel-content p  { margin: 12px 0; }
            .artikel-content img { max-width: 100%; border-radius: 8px; margin: 16px 0; }
            .artikel-content strong { font-weight: 700; }
            .artikel-content blockquote { border-left: 4px solid #e2e8f0; padding-left: 16px; color: #64748b; font-style: italic; margin: 16px 0; }
            
            @media (max-width: 900px) {
              .dashboard-article-layout { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
        
        {/* Kolom Kanan: Sidebar */}
        <aside className="dashboard-article-sidebar" style={{ position: "sticky", top: 20 }}>
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
            padding: "20px 18px"
          }}>
            <h4 style={{ fontSize: ".88rem", fontWeight: 700, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
              <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: 8, color: "#f59e0b" }}></i>
              Artikel Lainnya
            </h4>
            {otherArticles.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {otherArticles.map(a => (
                  <div key={a.id} onClick={() => onArticle ? onArticle(a) : null}
                    style={{
                      display: "flex", gap: 12, alignItems: "center", cursor: onArticle ? "pointer" : "default",
                      padding: "6px", borderRadius: 8, margin: "-6px", transition: ".2s"
                    }}
                    onMouseEnter={e => { if(onArticle) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if(onArticle) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{
                      width: 60, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0,
                      background: "linear-gradient(135deg,#f1f5f9,#e2e8f0)", display: "flex",
                      alignItems: "center", justifyContent: "center"
                    }}>
                      {a.img && (a.img.startsWith("http") || a.img.startsWith("/")) ? (
                        <img src={a.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "1.5rem" }}>{a.img || "📰"}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: ".82rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {a.title}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "var(--muted)" }}>{a.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: ".82rem", color: "var(--muted)", textAlign: "center", padding: "16px 0" }}>
                Belum ada artikel lain.
              </div>
            )}
          </div>
        </aside>
      </div>
      
      {/* Media Query terpisah untuk Layout utama karena inline style ga support @media */}
      <style>{`
        .fade-in > div:nth-child(2) {
           display: grid; grid-template-columns: 1fr 300px; gap: 32px; align-items: start;
        }
        @media (max-width: 900px) {
           .fade-in > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
