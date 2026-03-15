// ============================================================
// StatCard.jsx — Dashboard stat summary card
// ============================================================

export default function StatCard({ icon, label, value, bgColor, textColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bgColor, fontSize: "1.5rem" }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3 style={{ color: textColor }}>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}
