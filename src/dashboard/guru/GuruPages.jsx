// ============================================================
// GuruPages.jsx — All Guru/Tentor dashboard pages
// ============================================================
import StatCard from "../../components/StatCard.jsx";
import Icon from "../../components/Icon.jsx";
import { STUDENTS_DATA, SCHEDULE_GURU } from "../../data";

/* ── Guru Dashboard ───────────────────────────────────────── */
export function GuruDashboard() {
  const stats = [
    { icon: "👨‍🎓", label: "Siswa Diajar",     value: "12",    bgColor: "#dbeafe", textColor: "#2563eb" },
    { icon: "📅",   label: "Sesi Minggu Ini",  value: "3",     bgColor: "#dcfce7", textColor: "#16a34a" },
    { icon: "📚",   label: "Materi Diajarkan", value: "8",     bgColor: "#fef9c3", textColor: "#d97706" },
    { icon: "⭐",   label: "Rating",           value: "4.8 ⭐", bgColor: "#f3e8ff", textColor: "#7c3aed" },
  ];

  const myStudents = STUDENTS_DATA.filter(s => s.teacher === "Drs. Budi Santoso");

  return (
    <div className="fade-in">
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="content-grid-2">
        {/* Today's schedule */}
        <div className="content-card">
          <h3>📅 Jadwal Hari Ini</h3>
          {SCHEDULE_GURU.slice(0, 2).map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-day">{s.day}</div>
              <div className="schedule-info">
                <h4>{s.subject}</h4>
                <p>{s.time} · {s.room}</p>
                <p style={{ marginTop: 4 }}>{s.students.join(", ")}</p>
              </div>
            </div>
          ))}
        </div>

        {/* My students */}
        <div className="content-card">
          <h3>👥 Siswa Saya</h3>
          {myStudents.map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{s.name}</div>
                <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.grade}</div>
              </div>
              <span className={`badge ${s.status === "Aktif" ? "green" : "red"}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Daftar Siswa (Guru) ──────────────────────────────────── */
export function DaftarSiswaGuru() {
  const siswa = STUDENTS_DATA.filter(s => s.teacher === "Drs. Budi Santoso");

  return (
    <div className="fade-in">
      <div className="table-card">
        <div className="table-head"><h3>Daftar Siswa Saya ({siswa.length})</h3></div>
        <table>
          <thead><tr><th>Nama</th><th>Email</th><th>Paket</th><th>Kelas</th><th>Status</th></tr></thead>
          <tbody>
            {siswa.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.email}</td>
                <td><span className="badge blue">{s.package}</span></td>
                <td>{s.grade}</td>
                <td><span className={`badge ${s.status === "Aktif" ? "green" : "red"}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Jadwal Mengajar ──────────────────────────────────────── */
export function JadwalGuru() {
  return (
    <div className="fade-in">
      <div className="content-card" style={{ maxWidth: 600 }}>
        <h3>📅 Jadwal Mengajar Saya</h3>
        <div style={{ marginTop: 16 }}>
          {SCHEDULE_GURU.map((s, i) => (
            <div key={i} className="schedule-item">
              <div className="schedule-day">{s.day}</div>
              <div className="schedule-info" style={{ flex: 1 }}>
                <h4>{s.subject}</h4>
                <p>{s.time} · {s.room}</p>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {s.students.map((st, j) => (
                    <span key={j} className="badge blue">{st}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
