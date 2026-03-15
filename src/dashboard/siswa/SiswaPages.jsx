// ============================================================
// SiswaPages.jsx — All Siswa dashboard pages
// ============================================================
import StatCard from "../../components/StatCard.jsx";
import ArticleCard from "../../components/ArticleCard.jsx";
import PackageCard from "../../components/PackageCard.jsx";
import Icon from "../../components/Icon.jsx";
import { SCHEDULE_SISWA, ARTICLES, PACKAGES } from "../../data";

/* ── Siswa Dashboard ──────────────────────────────────────── */
export function SiswaDashboard() {
  const stats = [
    { icon: "🎓", label: "Paket Aktif",      value: "Premium", bgColor: "#dbeafe", textColor: "#2563eb" },
    { icon: "📅", label: "Sesi Minggu Ini",  value: "2",       bgColor: "#dcfce7", textColor: "#16a34a" },
    { icon: "👨‍🏫", label: "Tentor",          value: "2",       bgColor: "#fef9c3", textColor: "#d97706" },
    { icon: "⏰", label: "Sisa Sesi",        value: "6",       bgColor: "#f3e8ff", textColor: "#7c3aed" },
  ];

  return (
    <div className="fade-in">
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="content-grid-2">
        {/* Schedule */}
        <div className="content-card">
          <h3>📅 Jadwal Belajar Besok</h3>
          {SCHEDULE_SISWA.slice(0, 2).map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-day" style={{ background: "var(--green)" }}>{s.day}</div>
              <div className="schedule-info">
                <h4>{s.subject}</h4>
                <p>{s.time} · {s.room}</p>
                <p style={{ marginTop: 3 }}>{s.teacher}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Latest articles */}
        <div className="content-card">
          <h3>📚 Artikel Terbaru</h3>
          {ARTICLES.slice(0, 3).map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
              <span style={{ fontSize: "1.5rem" }}>{a.img}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: ".85rem", lineHeight: 1.3 }}>{a.title}</div>
                <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 3 }}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Paket Siswa ──────────────────────────────────────────── */
export function PaketSiswa() {
  const myPkg = PACKAGES[1]; // Premium

  return (
    <div className="fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 800 }}>
        {/* Active package card */}
        <div>
          <PackageCard pkg={myPkg} />
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 14px", marginTop: 12 }}>
            <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>Status</p>
            <span className="badge green">Aktif hingga 30 April 2026</span>
          </div>
        </div>

        {/* Progress + upgrade */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="content-card">
            <h3>📊 Progress Belajar</h3>
            {[
              { sub: "Matematika",    pct: 75 },
              { sub: "Fisika",        pct: 60 },
              { sub: "Bahasa Inggris",pct: 85 },
            ].map((p, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: ".82rem" }}>
                  <span>{p.sub}</span><strong>{p.pct}%</strong>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 100, height: 6 }}>
                  <div style={{ background: "var(--blue)", borderRadius: 100, height: 6, width: `${p.pct}%`, transition: "width .5s" }} />
                </div>
              </div>
            ))}
          </div>

          <div className="content-card">
            <h3>💡 Upgrade Paket</h3>
            <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 12 }}>
              Dapatkan akses lebih dengan Paket Private
            </p>
            <button className="btn-primary" style={{ padding: "10px 14px", fontSize: ".82rem", width: "100%", justifyContent: "center" }}>
              Lihat Paket Private
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Jadwal Siswa ─────────────────────────────────────────── */
export function JadwalSiswa() {
  return (
    <div className="fade-in">
      <div className="content-card" style={{ maxWidth: 600 }}>
        <h3>📅 Jadwal Belajar Saya</h3>
        <div style={{ marginTop: 16 }}>
          {SCHEDULE_SISWA.map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-day" style={{ background: "var(--green)" }}>{s.day}</div>
              <div className="schedule-info" style={{ flex: 1 }}>
                <h4>{s.subject}</h4>
                <p>{s.time} · {s.room}</p>
                <p style={{ marginTop: 3, fontStyle: "italic" }}>{s.teacher}</p>
              </div>
              <span className="badge green">Aktif</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Artikel Siswa ────────────────────────────────────────── */
export function ArtikelSiswa({ onArticle }) {
  return (
    <div className="fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 24 }}>
        {ARTICLES.map((a, i) => (
          <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .08}s` }}>
            <ArticleCard article={a} index={i} onClick={() => onArticle(a)} />
          </div>
        ))}
      </div>
    </div>
  );
}
