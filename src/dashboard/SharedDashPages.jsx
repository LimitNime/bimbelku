// ============================================================
// SharedDashPages.jsx — Pages shared across roles
// ============================================================
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
export function DashArticleDetail({ article, onBack }) {
  return (
    <div className="fade-in">
      <button onClick={onBack} style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
        background: "none", border: "1px solid var(--border)", padding: "8px 14px",
        borderRadius: 8, cursor: "pointer", fontSize: ".85rem", color: "var(--muted)",
        fontFamily: "inherit",
      }}>
        <Icon name="back" size={16} />Kembali
      </button>

      <div style={{ maxWidth: 720 }}>
        {/* Hero */}
        <div style={{
          height: 160, borderRadius: 16, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "4rem",
          background: "linear-gradient(135deg,#dbeafe,#dcfce7)", marginBottom: 24,
        }}>{article.img}</div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
          {article.title}
        </h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 24, flexWrap: "wrap" }}>
          <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dbeafe", color: "#2563eb" }}>{article.category}</span>
          <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>📅 {article.date}</span>
          <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>✍️ {article.author}</span>
        </div>

        <div style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "#334155", whiteSpace: "pre-line" }}>
          {article.content || article.excerpt}
        </div>
      </div>
    </div>
  );
}
