export default function StatCard({ icon, label, value, bgColor, textColor }) {
  const isFA = typeof icon === "string" && (icon.startsWith("fa-") || icon.includes("fa-"));
  
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ 
        background: bgColor || (textColor ? `${textColor}15` : 'var(--blue-light)'),
        color: textColor || 'var(--blue)'
      }}>
        {isFA 
          ? <i className={`fa-solid ${icon}`} />
          : <span>{icon}</span>
        }
      </div>
      
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}
