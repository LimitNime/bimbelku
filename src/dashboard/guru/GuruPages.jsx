// ============================================================
// GuruPages.jsx — Semua halaman dashboard Guru/Tentor
// Sesuai spesifikasi: Absensi, Honor, Profil
// ============================================================
import { useState } from "react";
import StatCard    from "../../components/StatCard.jsx";
import Icon        from "../../components/Icon.jsx";
import {
  STUDENTS_DATA,
  TEACHERS_DATA,
  ABSENSI_DATA,
  HONOR_DATA,
  HONOR_SETTING,
  BULAN_LIST,
  TAHUN_LIST,
} from "../../data/index.js";

// Guru yang sedang login (nanti dari Supabase Auth)
const MY_GURU_ID = 1;
const MY_GURU    = TEACHERS_DATA.find(g => g.id === MY_GURU_ID);

// Siswa yang pernah diajar guru ini (dari absensi)
// Karena guru tidak lagi punya relasi langsung di STUDENTS_DATA
const siswaPernahDiajar = () => {
  const ids = new Set(ABSENSI_DATA.filter(a => a.guru_id === MY_GURU_ID).map(a => a.siswa_id));
  return STUDENTS_DATA.filter(s => ids.has(s.id));
};
const MY_SISWA = siswaPernahDiajar();

// ── Helper format tanggal ─────────────────────────────────────
const fmtTgl = (iso) => new Date(iso).toLocaleDateString("id-ID", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});
const fmtTglShort = (iso) => new Date(iso).toLocaleDateString("id-ID", {
  day: "numeric", month: "short", year: "numeric",
});

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD GURU
// ─────────────────────────────────────────────────────────────
export function GuruDashboard({ onMenu }) {
  const myHonor    = HONOR_DATA.find(h => h.guru_id === MY_GURU_ID);
  const totalHonor = myHonor?.mengajar?.reduce((a,b) => a + b.jumlah_siswa * b.honor_per_siswa, 0) || 0;

  // Absensi bulan ini
  const absBulanIni = ABSENSI_DATA.filter(a => {
    const d = new Date(a.tanggal);
    return a.guru_id === MY_GURU_ID &&
      d.getMonth() === new Date().getMonth() &&
      d.getFullYear() === new Date().getFullYear();
  });
  const totalHadir = absBulanIni.filter(a => a.status === "Hadir").length;

  return (
    <div className="fade-in">
      {/* Stats — hanya 2 kartu relevan */}
      <div className="stats-grid">
        <StatCard icon="✅" label="Hadir Bulan Ini"  value={totalHadir}                                    bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="💰" label="Estimasi Honor"   value={"Rp " + totalHonor.toLocaleString("id-ID")}   bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      {/* Shortcut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <button className="btn-primary" style={{ padding: "16px", fontSize: ".88rem", justifyContent: "center", borderRadius: 14 }}
          onClick={() => onMenu("input-absensi")}>
          ✍️ Input Absensi
        </button>
        <button className="btn-outline" style={{ padding: "16px", fontSize: ".88rem", justifyContent: "center", borderRadius: 14 }}
          onClick={() => onMenu("rekap-absensi")}>
          📋 Rekap Absensi
        </button>
      </div>

      {/* Artikel / info terbaru */}
      <div className="content-card">
        <h3 style={{ marginBottom: 14 }}>💡 Info</h3>
        <p style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.7 }}>
          Selamat datang, <strong>{MY_GURU?.nama}</strong>!<br />
          Gunakan menu <strong>Input Absensi</strong> untuk mengisi daftar hadir siswa.<br />
          Lihat honor kamu di menu <strong>Honor Saya</strong>.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. DAFTAR SISWA
// ─────────────────────────────────────────────────────────────
export function DaftarSiswaGuru() {
  const [search, setSearch] = useState("");
  const filtered = MY_SISWA.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    (s.programs || []).some(p => p.nama.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 16 }}>
        <input className="form-input" style={{ maxWidth: 280 }}
          placeholder="🔍 Cari nama / program..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-card">
        <div className="table-head">
          <h3>Daftar Siswa Saya ({filtered.length})</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama</th><th>Sekolah</th><th>Program</th><th>Total SPP</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.nama}</strong>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.kontak}</div>
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{s.sekolah}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(s.programs || []).map((p, i) => (
                        <span key={i} className="badge blue" style={{ fontSize: ".7rem" }}>{p.nama}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: ".82rem", fontWeight: 600 }}>
                    Rp {(s.total_spp || 0).toLocaleString("id-ID")}
                  </td>
                  <td>
                    <span className={`badge ${s.status === "Aktif" ? "green" : s.status === "Cuti" ? "yellow" : "red"}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. INPUT ABSENSI
// ─────────────────────────────────────────────────────────────
export function InputAbsensi({ onSaved }) {
  const today   = new Date().toISOString().split("T")[0];
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();

  const [tgl,    setTgl]    = useState(today);
  const [bulan,  setBulan]  = useState(todayBln);
  const [tahun,  setTahun]  = useState(todayThn);
  const [search, setSearch] = useState("");
  const [saved,  setSaved]  = useState(false);

  // SEMUA siswa terdaftar di bimbel (aktif maupun tidak)
  const SEMUA_SISWA = STUDENTS_DATA;

  // Status kosong ("") berarti belum diisi
  const [absen, setAbsen] = useState(
    SEMUA_SISWA.map(s => ({
      siswa_id:  s.id,
      nama:      s.nama,
      program:   (s.programs || []).map(p => p.nama).join(", "),
      guru_id:   MY_GURU_ID,
      guru_nama: MY_GURU?.nama || "",
      status:    "", // kosong dulu — guru klik baru terpilih
    }))
  );

  // Sync bulan/tahun saat tanggal berubah
  const handleTglChange = (val) => {
    setTgl(val);
    const d = new Date(val);
    setBulan(d.toLocaleDateString("id-ID", { month: "long" }));
    setTahun(d.getFullYear().toString());
  };

  const setStatus = (id, status) => setAbsen(absen.map(a =>
    a.siswa_id === id ? { ...a, status: a.status === status ? "" : status } : a
  ));

  const checkAll = () => setAbsen(absen.map(a => ({ ...a, status: "Hadir" })));
  const clearAll = () => setAbsen(absen.map(a => ({ ...a, status: "" })));

  const filtered = absen.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    a.program.toLowerCase().includes(search.toLowerCase())
  );

  // Hanya hitung yang sudah diisi
  const totalHadir = absen.filter(a => a.status === "Hadir").length;
  const totalIzin  = absen.filter(a => a.status === "Izin").length;
  const totalSakit = absen.filter(a => a.status === "Sakit").length;
  const totalAlpha = absen.filter(a => a.status === "Alpha").length;
  const belumDiisi = absen.filter(a => a.status === "").length;

  const handleSimpan = () => {
    // Simpan absensi yang sudah diisi (status tidak kosong)
    const diisi = absen.filter(a => a.status !== "");
    if (diisi.length === 0) return alert("Belum ada absensi yang diisi!");
    setSaved(true);
    // Callback ke parent agar rekap absensi bisa update
    if (onSaved) onSaved(diisi.map(a => ({
      ...a, tanggal: tgl, bulan, tahun, verified: false, id: Date.now() + Math.random(),
    })));
    setTimeout(() => setSaved(false), 3000);
  };

  const STATUS_OPTIONS = ["Hadir", "Izin", "Sakit", "Alpha"];
  const STATUS_COLORS  = {
    Hadir: { bg: "#dcfce7", color: "#16a34a" },
    Izin:  { bg: "#dbeafe", color: "#2563eb" },
    Sakit: { bg: "#fef9c3", color: "#b45309" },
    Alpha: { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <div className="fade-in">
      {/* Filter — Tanggal + Bulan + Tahun */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tanggal</label>
          <input className="form-input" type="date" value={tgl}
            onChange={e => handleTglChange(e.target.value)} style={{ width: 160 }} />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" style={{ width: 150 }} value={bulan}
            onChange={e => setBulan(e.target.value)}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" style={{ width: 100 }} value={tahun}
            onChange={e => setTahun(e.target.value)}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ fontSize: ".82rem", color: "var(--muted)", paddingBottom: 2 }}>
          📅 {fmtTgl(tgl)}
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="⬜"  label="Belum Diisi" value={belumDiisi}  bgColor="#f1f5f9" textColor="#64748b" />
        <StatCard icon="✅"  label="Hadir"       value={totalHadir}  bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="📋"  label="Izin"        value={totalIzin}   bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="🤒"  label="Sakit"       value={totalSakit}  bgColor="#fef9c3" textColor="#b45309" />
        <StatCard icon="❌"  label="Alpha"       value={totalAlpha}  bgColor="#fee2e2" textColor="#dc2626" />
      </div>

      <div className="table-card">
        <div className="table-head">
          <div>
            <h3>Daftar Hadir — {fmtTglShort(tgl)}</h3>
            <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 3 }}>
              Diisi oleh: <strong>{MY_GURU?.nama}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={checkAll} className="btn-outline"
              style={{ padding: "7px 12px", fontSize: ".78rem" }}>
              ✅ Semua Hadir
            </button>
            <button onClick={clearAll} style={{
              padding: "7px 12px", fontSize: ".78rem", borderRadius: 8,
              border: "1.5px solid #fee2e2", background: "transparent",
              color: "#dc2626", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}>
              ⬜ Kosongkan
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="form-input" style={{ maxWidth: 280 }}
            placeholder="🔍 Cari nama / program..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama Siswa</th><th>Program</th><th>Status Kehadiran</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.siswa_id} style={{ background: a.status === "" ? "#fafbfc" : "#fff" }}>
                  <td><strong>{a.nama}</strong></td>
                  <td style={{ fontSize: ".78rem", color: "var(--muted)" }}>{a.program}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {STATUS_OPTIONS.map(s => (
                        <button key={s} onClick={() => setStatus(a.siswa_id, s)}
                          style={{
                            padding: "4px 12px", borderRadius: 100, border: "none",
                            cursor: "pointer", fontFamily: "inherit",
                            fontSize: ".75rem", fontWeight: 700, transition: ".15s",
                            background: a.status === s ? STATUS_COLORS[s].bg : "#f1f5f9",
                            color: a.status === s ? STATUS_COLORS[s].color : "#94a3b8",
                            boxShadow: a.status === s ? `0 0 0 2px ${STATUS_COLORS[s].color}40` : "none",
                          }}>
                          {s}
                        </button>
                      ))}
                      {a.status !== "" && (
                        <button onClick={() => setStatus(a.siswa_id, a.status)}
                          style={{
                            padding: "4px 8px", borderRadius: 100, border: "none",
                            cursor: "pointer", background: "#f1f5f9", color: "#94a3b8",
                            fontSize: ".72rem", fontFamily: "inherit",
                          }}>✕</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simpan */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: ".88rem" }}
            onClick={handleSimpan}>
            💾 Simpan Absensi ({absen.filter(a => a.status !== "").length} siswa)
          </button>
          {saved && (
            <span style={{ color: "#16a34a", fontWeight: 600, fontSize: ".85rem" }}>
              ✅ Absensi berhasil disimpan!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. REKAP ABSENSI
// ─────────────────────────────────────────────────────────────
export function RekapAbsensi({ savedAbsensi = [] }) {
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();
  const [bulan, setBulan] = useState(todayBln);
  const [tahun, setTahun] = useState(todayThn);
  const [search, setSearch] = useState("");

  // Gabungkan data bawaan + data yang baru disimpan dari InputAbsensi
  const allAbsensi = [...ABSENSI_DATA, ...savedAbsensi];

  // Filter absensi milik guru ini di bulan/tahun yang dipilih
  const data = allAbsensi.filter(a => {
    const bln = a.bulan || new Date(a.tanggal).toLocaleDateString("id-ID", { month: "long" });
    const thn = a.tahun || new Date(a.tanggal).getFullYear().toString();
    return a.guru_id === MY_GURU_ID && bln === bulan && thn === tahun
        && a.status === "Hadir";
  });

  const filtered = data.filter(a =>
    (a.siswa_nama || a.nama || "").toLowerCase().includes(search.toLowerCase())
  );

  const hadir = data.length;

  // Hitung tidak hadir (Izin + Sakit + Alpha)
  const tidakHadir = allAbsensi.filter(a => {
    const bln = a.bulan || new Date(a.tanggal).toLocaleDateString("id-ID", { month: "long" });
    const thn = a.tahun || new Date(a.tanggal).getFullYear().toString();
    return a.guru_id === MY_GURU_ID && bln === bulan && thn === tahun
        && ["Izin", "Sakit", "Alpha", "Tidak Hadir"].includes(a.status);
  }).length;

  return (
    <div className="fade-in">
      {/* Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" style={{ width: 160 }} value={bulan}
            onChange={e => setBulan(e.target.value)}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" style={{ width: 100 }} value={tahun}
            onChange={e => setTahun(e.target.value)}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="✅" label="Total Hadir"      value={hadir}      bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="❌" label="Total Tidak Hadir" value={tidakHadir} bgColor="#fee2e2" textColor="#dc2626" />
      </div>

      {/* Tabel — hanya Tanggal & Nama Siswa sesuai spesifikasi */}
      <div className="table-card">
        <div className="table-head">
          <h3>Rekap Kehadiran — {bulan} {tahun}</h3>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="form-input" style={{ maxWidth: 260 }}
            placeholder="🔍 Cari nama siswa..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Belum ada data kehadiran di bulan ini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Siswa</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                      {new Date(a.tanggal).toLocaleDateString("id-ID", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </td>
                    <td><strong>{a.siswa_nama || a.nama}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HONOR GURU (lihat honor sendiri — hasil akhir dari admin)
// ─────────────────────────────────────────────────────────────
export function HonorGuruPage() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");

  const honor = HONOR_DATA.find(
    h => h.guru_id === MY_GURU_ID && h.bulan === bulan && h.tahun === tahun
  );

  // Kalkulasi total dari 3 komponen
  const totalMengajar = (honor?.mengajar || []).reduce((a, b) => a + b.jumlah_siswa * b.honor_per_siswa, 0);
  const totalKomponen = (honor?.komponen_tetap || []).reduce((a, b) => a + b.nominal, 0);
  const totalTambahan = (honor?.honor_tambahan || []).reduce((a, b) => a + b.nominal, 0);
  const totalGaji     = totalMengajar + totalKomponen + totalTambahan;

  const fmt = (n) => "Rp " + n.toLocaleString("id-ID");

  return (
    <div className="fade-in">
      {/* Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" style={{ width: 160 }} value={bulan} onChange={e => setBulan(e.target.value)}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" style={{ width: 100 }} value={tahun} onChange={e => setTahun(e.target.value)}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {!honor ? (
        <div className="content-card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
          <p style={{ color: "var(--muted)" }}>Belum ada data honor {bulan} {tahun}.</p>
          <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 8 }}>
            Honor akan muncul setelah admin menginput data honor bulan ini.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 600 }}>

          {/* Total gaji — info utama */}
          <div style={{
            background: "linear-gradient(135deg, var(--blue), #60a5fa)",
            borderRadius: 16, padding: "24px 28px", marginBottom: 20, color: "#fff",
          }}>
            <div style={{ fontSize: ".85rem", opacity: .85, marginBottom: 6 }}>
              Total Gaji — {bulan} {tahun}
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "2rem", fontWeight: 800 }}>
              {fmt(totalGaji)}
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{
                padding: "4px 12px", borderRadius: 100, fontSize: ".75rem", fontWeight: 700,
                background: honor.status === "Dibayar" ? "rgba(255,255,255,.25)" : "rgba(239,68,68,.3)",
              }}>
                {honor.status === "Dibayar" ? "✓ Sudah Dibayar" : "⏳ Belum Dibayar"}
              </span>
              {honor.tgl_bayar !== "-" && (
                <span style={{ fontSize: ".78rem", opacity: .8 }}>
                  Dibayar: {honor.tgl_bayar}
                </span>
              )}
            </div>
          </div>

          {/* Rincian honor mengajar */}
          <div className="content-card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}>📚 Honor Mengajar</h3>
            {(honor.mengajar || []).map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{m.program}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>
                    {m.jumlah_siswa} siswa hadir
                  </div>
                </div>
                <strong style={{ color: "var(--blue)" }}>
                  {fmt(m.jumlah_siswa * m.honor_per_siswa)}
                </strong>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0", fontWeight: 700,
            }}>
              <span>Subtotal Mengajar</span>
              <span style={{ color: "var(--blue)" }}>{fmt(totalMengajar)}</span>
            </div>
          </div>

          {/* Komponen tetap */}
          {(honor.komponen_tetap || []).length > 0 && (
            <div className="content-card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}>💰 Komponen Tetap</h3>
              {(honor.komponen_tetap || []).map((k, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span style={{ fontSize: ".88rem" }}>{k.nama}</span>
                  <strong style={{ color: "#16a34a" }}>{fmt(k.nominal)}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Honor tambahan */}
          {(honor.honor_tambahan || []).length > 0 && (
            <div className="content-card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}>➕ Honor Tambahan</h3>
              {(honor.honor_tambahan || []).map((t, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: "1px solid #f1f5f9",
                }}>
                  <span style={{ fontSize: ".88rem" }}>{t.nama}</span>
                  <strong style={{ color: "#d97706" }}>{fmt(t.nominal)}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Ringkasan total */}
          <div style={{
            background: "#f8fafc", border: "1px solid var(--border)",
            borderRadius: 12, padding: "16px 20px",
          }}>
            {[
              { label: "Honor Mengajar",  val: totalMengajar, color: "var(--blue)"  },
              { label: "Komponen Tetap",  val: totalKomponen, color: "#16a34a"      },
              { label: "Honor Tambahan",  val: totalTambahan, color: "#d97706"      },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid var(--border)",
                fontSize: ".88rem",
              }}>
                <span style={{ color: "var(--muted)" }}>{row.label}</span>
                <span style={{ fontWeight: 600, color: row.color }}>{fmt(row.val)}</span>
              </div>
            ))}
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "12px 0 0", fontWeight: 800,
            }}>
              <span>TOTAL GAJI</span>
              <span style={{ fontSize: "1.1rem", color: "var(--blue)" }}>{fmt(totalGaji)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. PROFIL GURU
// ─────────────────────────────────────────────────────────────
export function ProfilGuru({ user }) {
  const [edit,  setEdit]  = useState(false);
  const [saved, setSaved] = useState(false);
  const [form,  setForm]  = useState({
    nama:    MY_GURU?.nama    || "",
    email:   MY_GURU?.email   || "",
    kontak:  MY_GURU?.kontak  || "",
    program: "",
  });

  const handleSave = () => {
    setEdit(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="fade-in">
      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar" style={{ background: "#3b82f6" }}>
          {form.nama[0] || "G"}
        </div>

        <h2 style={{ marginBottom: 4 }}>{form.nama}</h2>
        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 20 }}>Tentor / Guru</p>

        {!edit ? (
          <>
            {[
              { label: "Email",          val: form.email },
              { label: "No. Telepon",    val: form.kontak },
              { label: "Program Diajar", val: HONOR_SETTING.filter(s => s.guru_id === MY_GURU_ID).map(s => s.program).join(", ") },
              { label: "Status",         val: MY_GURU?.status || "Aktif" },
            ].map((f, i) => (
              <div key={i} className="profile-field">
                <label>{f.label}</label>
                <p>{f.val}</p>
              </div>
            ))}

            {saved && (
              <p style={{ color: "#16a34a", fontWeight: 600, fontSize: ".85rem", marginBottom: 12 }}>
                ✅ Profil berhasil diperbarui!
              </p>
            )}

            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={() => setEdit(true)}>
              <Icon name="edit" size={14} />Edit Profil
            </button>
          </>
        ) : (
          <>
            {[
              { label: "Nama Lengkap",   key: "nama"    },
              { label: "Email",          key: "email"   },
              { label: "No. Telepon",    key: "kontak"  },
            ].map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}

            {/* Ganti password */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8, marginBottom: 16 }}>
              <p style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 10 }}>Ganti Password</p>
              <div className="form-group">
                <label className="form-label">Password Lama</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password Baru</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleSave}>
                💾 Simpan
              </button>
              <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setEdit(false)}>
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}