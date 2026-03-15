// ============================================================
// ArticleCard.jsx — Reusable article preview card
// ============================================================

const BG_COLORS = ["#dbeafe", "#dcfce7", "#fef9c3", "#f3e8ff"];

export default function ArticleCard({ article, index = 0, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      border: "1px solid var(--border)", cursor: "pointer", transition: "all .25s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,.08)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 140, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: "3.5rem",
        background: BG_COLORS[index % BG_COLORS.length],
      }}>{article.img}</div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{
            padding: "3px 10px", borderRadius: 100, fontSize: "0.72rem",
            fontWeight: 700, background: "#dbeafe", color: "#2563eb",
          }}>{article.category}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{article.date}</span>
        </div>

        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>
          {article.title}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>
          {article.excerpt}
        </p>
        <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 12, fontWeight: 500 }}>
          ✍️ {article.author}
        </div>
      </div>
    </div>
  );
}
