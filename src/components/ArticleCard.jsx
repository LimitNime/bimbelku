// ============================================================
// ArticleCard.jsx — Reusable article preview card
// ============================================================

const BG_COLORS = ["#dbeafe", "#dcfce7", "#fef9c3", "#f3e8ff"];

export default function ArticleCard({ article, index = 0, onClick }) {
  return (
    <div onClick={onClick} className="content-card fade-in" style={{
      padding: 0, overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column", height: "100%"
    }}>
      {/* Thumbnail */}
      <div style={{
        height: 180, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "3rem",
        background: article.img && (article.img.startsWith("http") || article.img.startsWith("/")) 
          ? "#f1f5f9" 
          : BG_COLORS[index % BG_COLORS.length],
        position: "relative",
      }}>
        {article.img && (article.img.startsWith("http") || article.img.startsWith("/")) ? (
          <img src={article.img} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = '<i class="fa-solid fa-newspaper" style="color:var(--muted)"></i>'; }} />
        ) : (
          <i className="fa-solid fa-newspaper" style={{ color: "rgba(0,0,0,0.15)" }}></i>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "inline-flex", marginBottom: 16 }}>
          <span style={{
            padding: "4px 12px", borderRadius: 100, fontSize: "0.75rem",
            fontWeight: 700, background: "var(--blue)", color: "#fff",
          }}>{article.category || "Umum"}</span>
        </div>

        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: 12, lineHeight: 1.4, color: "var(--text-main)" }}>
          {article.title}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 20, flex: 1 }}>
          {article.excerpt}
        </p>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 500 }}>
            <i className="fa-solid fa-pen-nib" style={{ marginRight: 6 }}></i> {article.author || "Admin"}
          </div>
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#eab308" }}>Baca selengkapnya <i className="fa-solid fa-arrow-right" style={{marginLeft: 4}}></i></span>
        </div>
      </div>
    </div>
  );
}
