// ============================================================
// PackageCard.jsx — Reusable package display card
// ============================================================
import Icon from "./Icon";

export default function PackageCard({ pkg, onDaftar, showActions = false, onEdit, onDelete }) {
  const isFeatured = pkg.badge === "Terpopuler";

  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: "32px 28px",
      border: isFeatured ? "2px solid var(--blue)" : "1px solid var(--border)",
      boxShadow: isFeatured ? "0 8px 40px rgba(37,99,235,.15)" : "none",
      position: "relative", transition: "all .25s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,.1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = isFeatured ? "0 8px 40px rgba(37,99,235,.15)" : "none"; }}
    >
      {/* Badge */}
      {pkg.badge && (
        <div style={{
          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
          padding: "5px 16px", borderRadius: 100, fontSize: "0.75rem", fontWeight: 700,
          background: pkg.color, color: "#fff", whiteSpace: "nowrap",
        }}>{pkg.badge}</div>
      )}

      {/* Icon */}
      <div style={{ color: pkg.color, marginBottom: 8 }}><Icon name="package" size={28} /></div>

      {/* Name & Price */}
      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 4 }}>{pkg.name}</div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "2rem", fontWeight: 800, color: pkg.color }}>
        {pkg.price}
        <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontFamily: "inherit" }}>{pkg.period}</span>
      </div>

      {/* Description */}
      <div style={{
        fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6,
        margin: "16px 0", padding: "16px 0",
        borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)",
      }}>{pkg.desc}</div>

      {/* Features */}
      {pkg.features.map((f, j) => (
        <div key={j} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.88rem", marginBottom: 10 }}>
          <span style={{ color: "#16a34a", flexShrink: 0 }}><Icon name="check" size={14} /></span>
          {f}
        </div>
      ))}

      {/* CTA or admin actions */}
      {showActions ? (
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="icon-btn edit" onClick={onEdit}
            style={{ flex: 1, width: "auto", borderRadius: 8, padding: "8px 0", fontSize: ".82rem", gap: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="edit" size={13} />Edit
          </button>
          <button className="icon-btn del" onClick={onDelete}
            style={{ flex: 1, width: "auto", borderRadius: 8, padding: "8px 0", fontSize: ".82rem", gap: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="trash" size={13} />Hapus
          </button>
        </div>
      ) : (
        <button onClick={onDaftar} style={{
          width: "100%", padding: 13, borderRadius: 12, fontSize: "0.9rem",
          fontWeight: 700, cursor: "pointer", border: "none", marginTop: 20,
          transition: "all .2s", fontFamily: "inherit",
          ...(isFeatured
            ? { background: `linear-gradient(135deg,${pkg.color},#60a5fa)`, color: "#fff" }
            : { background: "transparent", border: `2px solid ${pkg.color}`, color: pkg.color }),
        }}>Daftar Sekarang</button>
      )}
    </div>
  );
}
