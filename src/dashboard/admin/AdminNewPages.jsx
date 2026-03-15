// ============================================================
// AdminNewPages.jsx — Halaman baru: SPP, Keuangan, Absen, Honor, Tutorial
// ============================================================
import { useState } from "react";
import Icon from "../../components/Icon.jsx";

// ── Data dummy ───────────────────────────────────────────────
const SISWA_LIST = [
  { id: 1, name: "Andi Pratama",  kelas: "XII IPA", paket: "Premium" },
  { id: 2, name: "Siti Rahma",    kelas: "X IPS",   paket: "Basic"   },
  { id: 3, name: "Budi Wijaya",   kelas: "XI IPA",  paket: "Private" },
  { id: 4, name: "Dewi Lestari",  kelas: "XII IPS", paket: "Premium" },
];

const GURU_LIST = [
  { id: 1, name: "Drs. Budi Santoso", mapel: "Matematika & Fisika"        },
  { id: 2, name: "Ibu Sari Dewi",     mapel: "Bahasa Indonesia & Inggris" },
  { id: 3, name: "Pak Rizky Maulana", mapel: "Kimia & Biologi"            },
];

const BULAN = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const HARI  = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

// ── Helpers ───────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div className="table-card" style={{ marginBottom: 20 }}>
      <div className="table-head"><h3>{title}</h3></div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function StatRow({ label, value, color = "var(--text)" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: ".88rem", color: "var(--muted)" }}>{label}</span>
      <strong style={{ color }}>{value}</strong>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SPP SISWA
// ─────────────────────────────────────────────────────────────
export function SPPSiswa() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");
  const [data, setData]   = useState(
    SISWA_LIST.map(s => ({ ...s, status: s.id % 2 === 0 ? "Belum Bayar" : "Lunas", tgl: s.id % 2 !== 0 ? "5 Mar 2026" : "-", nominal: s.paket === "Premium" ? "Rp 599.000" : s.paket === "Private" ? "Rp 1.299.000" : "Rp 299.000" }))
  );

  const toggle = (id) => setData(data.map(d => d.id === id ? { ...d, status: d.status === "Lunas" ? "Belum Bayar" : "Lunas", tgl: d.status !== "Lunas" ? new Date().toLocaleDateString("id-ID") : "-" } : d));
  const lunas  = data.filter(d => d.status === "Lunas").length;

  return (
    <div className="fade-in">
      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: "💰", label: "Total Tagihan",  value: data.length + " Siswa",    bg: "#dbeafe", tc: "#2563eb" },
          { icon: "✅", label: "Sudah Bayar",    value: lunas + " Siswa",           bg: "#dcfce7", tc: "#16a34a" },
          { icon: "⏳", label: "Belum Bayar",    value: (data.length - lunas) + " Siswa", bg: "#fee2e2", tc: "#dc2626" },
          { icon: "📊", label: "Tingkat Bayar",  value: Math.round(lunas/data.length*100) + "%", bg: "#f3e8ff", tc: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: "1.4rem" }}>{s.icon}</div>
            <div className="stat-info"><h3 style={{ color: s.tc }}>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <select className="form-input" style={{ maxWidth: 160 }} value={bulan} onChange={e => setBulan(e.target.value)}>
          {BULAN.map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="form-input" style={{ maxWidth: 100 }} value={tahun} onChange={e => setTahun(e.target.value)}>
          {["2024","2025","2026"].map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-head"><h3>SPP Bulan {bulan} {tahun}</h3>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem" }}>
            <Icon name="plus" size={14} />Tambah
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Nominal</th><th>Tgl Bayar</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.kelas}</td>
                  <td style={{ fontWeight: 600 }}>{d.nominal}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{d.tgl}</td>
                  <td><span className={`badge ${d.status === "Lunas" ? "green" : "red"}`}>{d.status}</span></td>
                  <td>
                    <button onClick={() => toggle(d.id)} className="icon-btn edit" style={{ width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: ".75rem" }}>
                      {d.status === "Lunas" ? "Batal" : "✓ Lunas"}
                    </button>
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
// 2. PEMASUKAN
// ─────────────────────────────────────────────────────────────
export function Pemasukan() {
  const [data, setData] = useState([
    { id: 1, tanggal: "1 Mar 2026",  keterangan: "SPP Andi Pratama",    kategori: "SPP",      nominal: 599000  },
    { id: 2, tanggal: "3 Mar 2026",  keterangan: "SPP Budi Wijaya",     kategori: "SPP",      nominal: 1299000 },
    { id: 3, tanggal: "5 Mar 2026",  keterangan: "Pendaftaran Siswa Baru", kategori: "Daftar", nominal: 150000  },
    { id: 4, tanggal: "7 Mar 2026",  keterangan: "Try Out Nasional",    kategori: "Program",  nominal: 500000  },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" });

  const total = data.reduce((a, b) => a + b.nominal, 0);
  const add   = () => {
    if (!form.keterangan || !form.nominal) return;
    setData([...data, { ...form, id: Date.now(), nominal: parseInt(form.nominal) }]);
    setForm({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" });
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: "💵", label: "Total Pemasukan", value: "Rp " + total.toLocaleString("id-ID"), bg: "#dcfce7", tc: "#16a34a" },
          { icon: "📋", label: "Transaksi",        value: data.length + " Item",                 bg: "#dbeafe", tc: "#2563eb" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: "1.4rem" }}>{s.icon}</div>
            <div className="stat-info"><h3 style={{ color: s.tc }}>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Pemasukan
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah Pemasukan</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div className="form-group"><label className="form-label">Tanggal</label><input className="form-input" type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {["SPP", "Daftar", "Program", "Donasi", "Lainnya"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Keterangan</label><input className="form-input" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan..." /></div>
            <div className="form-group"><label className="form-label">Nominal (Rp)</label><input className="form-input" type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={add}>Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-head"><h3>Riwayat Pemasukan ({data.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{d.tanggal}</td>
                  <td>{d.keterangan}</td>
                  <td><span className="badge blue">{d.kategori}</span></td>
                  <td style={{ fontWeight: 700, color: "#16a34a" }}>Rp {d.nominal.toLocaleString("id-ID")}</td>
                  <td><button className="icon-btn del" onClick={() => setData(data.filter(x => x.id !== d.id))}><Icon name="trash" size={13} /></button></td>
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
// 3. PENGELUARAN
// ─────────────────────────────────────────────────────────────
export function Pengeluaran() {
  const [data, setData] = useState([
    { id: 1, tanggal: "2 Mar 2026",  keterangan: "Honor Guru Budi",      kategori: "Honor",      nominal: 1500000 },
    { id: 2, tanggal: "4 Mar 2026",  keterangan: "Listrik & Internet",   kategori: "Operasional",nominal: 350000  },
    { id: 3, tanggal: "6 Mar 2026",  keterangan: "ATK & Fotokopi",       kategori: "Operasional",nominal: 120000  },
    { id: 4, tanggal: "8 Mar 2026",  keterangan: "Hadiah Try Out",       kategori: "Program",    nominal: 300000  },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "Operasional", nominal: "" });

  const total = data.reduce((a, b) => a + b.nominal, 0);
  const add   = () => {
    if (!form.keterangan || !form.nominal) return;
    setData([...data, { ...form, id: Date.now(), nominal: parseInt(form.nominal) }]);
    setForm({ tanggal: "", keterangan: "", kategori: "Operasional", nominal: "" });
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: "💸", label: "Total Pengeluaran", value: "Rp " + total.toLocaleString("id-ID"), bg: "#fee2e2", tc: "#dc2626" },
          { icon: "📋", label: "Transaksi",          value: data.length + " Item",                 bg: "#dbeafe", tc: "#2563eb" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: "1.4rem" }}>{s.icon}</div>
            <div className="stat-info"><h3 style={{ color: s.tc }}>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Pengeluaran
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah Pengeluaran</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div className="form-group"><label className="form-label">Tanggal</label><input className="form-input" type="date" value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {["Honor", "Operasional", "Program", "Lainnya"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Keterangan</label><input className="form-input" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan..." /></div>
            <div className="form-group"><label className="form-label">Nominal (Rp)</label><input className="form-input" type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} placeholder="0" /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={add}>Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-head"><h3>Riwayat Pengeluaran ({data.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{d.tanggal}</td>
                  <td>{d.keterangan}</td>
                  <td><span className="badge yellow">{d.kategori}</span></td>
                  <td style={{ fontWeight: 700, color: "#dc2626" }}>Rp {d.nominal.toLocaleString("id-ID")}</td>
                  <td><button className="icon-btn del" onClick={() => setData(data.filter(x => x.id !== d.id))}><Icon name="trash" size={13} /></button></td>
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
// 4. SALDO & LAPORAN KEUANGAN
// ─────────────────────────────────────────────────────────────
export function SaldoLaporan() {
  const pemasukan   = 2548000;
  const pengeluaran = 2270000;
  const saldo       = pemasukan - pengeluaran;

  const bulanan = [
    { bulan: "Januari", masuk: 8500000, keluar: 6200000 },
    { bulan: "Februari",masuk: 9200000, keluar: 7100000 },
    { bulan: "Maret",   masuk: 2548000, keluar: 2270000 },
  ];

  return (
    <div className="fade-in">
      {/* Saldo summary */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: "💵", label: "Total Pemasukan",  value: "Rp " + pemasukan.toLocaleString("id-ID"),   bg: "#dcfce7", tc: "#16a34a" },
          { icon: "💸", label: "Total Pengeluaran", value: "Rp " + pengeluaran.toLocaleString("id-ID"), bg: "#fee2e2", tc: "#dc2626" },
          { icon: "🏦", label: "Saldo Bersih",      value: "Rp " + saldo.toLocaleString("id-ID"),       bg: "#dbeafe", tc: "#2563eb" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: "1.4rem" }}>{s.icon}</div>
            <div className="stat-info"><h3 style={{ color: s.tc }}>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Monthly report */}
      <div className="table-card">
        <div className="table-head"><h3>📊 Laporan Bulanan 2026</h3>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem" }}>⬇ Export</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Bulan</th><th>Pemasukan</th><th>Pengeluaran</th><th>Saldo</th></tr></thead>
            <tbody>
              {bulanan.map((b, i) => {
                const sal = b.masuk - b.keluar;
                return (
                  <tr key={i}>
                    <td><strong>{b.bulan}</strong></td>
                    <td style={{ color: "#16a34a", fontWeight: 600 }}>Rp {b.masuk.toLocaleString("id-ID")}</td>
                    <td style={{ color: "#dc2626", fontWeight: 600 }}>Rp {b.keluar.toLocaleString("id-ID")}</td>
                    <td style={{ color: sal >= 0 ? "#2563eb" : "#dc2626", fontWeight: 700 }}>Rp {sal.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HONOR GURU
// ─────────────────────────────────────────────────────────────
export function HonorGuru() {
  const [bulan, setBulan] = useState("Maret");
  const [data, setData]   = useState(
    GURU_LIST.map((g, i) => ({
      ...g,
      sesi: [12, 9, 7][i],
      harga: [150000, 130000, 120000][i],
      status: i === 0 ? "Dibayar" : "Belum",
      tgl: i === 0 ? "10 Mar 2026" : "-",
    }))
  );

  const toggle = (id) => setData(data.map(d => d.id === id ? { ...d, status: d.status === "Dibayar" ? "Belum" : "Dibayar", tgl: d.status !== "Dibayar" ? new Date().toLocaleDateString("id-ID") : "-" } : d));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select className="form-input" style={{ maxWidth: 160 }} value={bulan} onChange={e => setBulan(e.target.value)}>
          {BULAN.map(b => <option key={b}>{b}</option>)}
        </select>
      </div>

      <div className="table-card">
        <div className="table-head"><h3>Honor Guru Bulan {bulan}</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama Guru</th><th>Mata Pelajaran</th><th>Sesi</th><th>Harga/Sesi</th><th>Total</th><th>Tgl Bayar</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td style={{ fontSize: ".82rem" }}>{d.mapel}</td>
                  <td>{d.sesi}x</td>
                  <td>Rp {d.harga.toLocaleString("id-ID")}</td>
                  <td style={{ fontWeight: 700, color: "#2563eb" }}>Rp {(d.sesi * d.harga).toLocaleString("id-ID")}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{d.tgl}</td>
                  <td><span className={`badge ${d.status === "Dibayar" ? "green" : "red"}`}>{d.status}</span></td>
                  <td>
                    <button onClick={() => toggle(d.id)} className="icon-btn edit" style={{ width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: ".75rem" }}>
                      {d.status === "Dibayar" ? "Batal" : "✓ Bayar"}
                    </button>
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
// 6. ABSEN SISWA
// ─────────────────────────────────────────────────────────────
export function AbsenSiswa() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const [hari, setHari]   = useState("Senin");
  const [data, setData]   = useState(
    SISWA_LIST.map(s => ({ ...s, status: "Hadir", ket: "" }))
  );

  const setStatus = (id, status) => setData(data.map(d => d.id === id ? { ...d, status } : d));
  const hadir  = data.filter(d => d.status === "Hadir").length;
  const absen  = data.filter(d => d.status === "Alpha").length;
  const izin   = data.filter(d => d.status === "Izin").length;
  const sakit  = data.filter(d => d.status === "Sakit").length;

  return (
    <div className="fade-in">
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { icon: "✅", label: "Hadir", value: hadir,  bg: "#dcfce7", tc: "#16a34a" },
          { icon: "❌", label: "Alpha", value: absen,  bg: "#fee2e2", tc: "#dc2626" },
          { icon: "📝", label: "Izin",  value: izin,   bg: "#fef9c3", tc: "#d97706" },
          { icon: "🏥", label: "Sakit", value: sakit,  bg: "#dbeafe", tc: "#2563eb" },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, fontSize: "1.4rem" }}>{s.icon}</div>
            <div className="stat-info"><h3 style={{ color: s.tc }}>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select className="form-input" style={{ maxWidth: 140 }} value={hari} onChange={e => setHari(e.target.value)}>
          {HARI.map(h => <option key={h}>{h}</option>)}
        </select>
        <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>📅 {today}</span>
      </div>

      <div className="table-card">
        <div className="table-head"><h3>Absensi Siswa — {hari}</h3>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem" }}>⬇ Export</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama Siswa</th><th>Kelas</th><th>Status</th><th>Keterangan</th></tr></thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id}>
                  <td><strong>{d.name}</strong></td>
                  <td>{d.kelas}</td>
                  <td>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["Hadir", "Izin", "Sakit", "Alpha"].map(st => (
                        <button key={st} onClick={() => setStatus(d.id, st)} style={{
                          padding: "3px 8px", borderRadius: 6, fontSize: ".72rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit",
                          background: d.status === st ? (st === "Hadir" ? "#16a34a" : st === "Alpha" ? "#dc2626" : st === "Izin" ? "#d97706" : "#2563eb") : "#f1f5f9",
                          color: d.status === st ? "#fff" : "var(--muted)",
                        }}>{st}</button>
                      ))}
                    </div>
                  </td>
                  <td><input className="form-input" style={{ padding: "6px 10px", fontSize: ".8rem" }} placeholder="Opsional..." value={d.ket} onChange={e => setData(data.map(x => x.id === d.id ? { ...x, ket: e.target.value } : x))} /></td>
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
// 7. ABSEN GURU
// ─────────────────────────────────────────────────────────────
export function AbsenGuru() {
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const [hari, setHari] = useState("Senin");
  const [data, setData] = useState(
    GURU_LIST.map(g => ({ ...g, status: "Hadir", ket: "" }))
  );

  const setStatus = (id, status) => setData(data.map(d => d.id === id ? { ...d, status } : d));

  return (
    <div className="fade-in">
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <select className="form-input" style={{ maxWidth: 140 }} value={hari} onChange={e => setHari(e.target.value)}>
          {HARI.map(h => <option key={h}>{h}</option>)}
        </select>
        <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>📅 {today}</span>
      </div>

      <div className="table-card">
        <div className="table-head"><h3>Absensi Guru — {hari}</h3>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem" }}>⬇ Export</button>
        </div>
        <table>
          <thead><tr><th>Nama Guru</th><th>Mata Pelajaran</th><th>Status</th><th>Keterangan</th></tr></thead>
          <tbody>
            {data.map(d => (
              <tr key={d.id}>
                <td><strong>{d.name}</strong></td>
                <td style={{ fontSize: ".82rem" }}>{d.mapel}</td>
                <td>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["Hadir", "Izin", "Sakit", "Alpha"].map(st => (
                      <button key={st} onClick={() => setStatus(d.id, st)} style={{
                        padding: "3px 8px", borderRadius: 6, fontSize: ".72rem", fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit",
                        background: d.status === st ? (st === "Hadir" ? "#16a34a" : st === "Alpha" ? "#dc2626" : st === "Izin" ? "#d97706" : "#2563eb") : "#f1f5f9",
                        color: d.status === st ? "#fff" : "var(--muted)",
                      }}>{st}</button>
                    ))}
                  </div>
                </td>
                <td><input className="form-input" style={{ padding: "6px 10px", fontSize: ".8rem" }} placeholder="Opsional..." value={d.ket} onChange={e => setData(data.map(x => x.id === d.id ? { ...x, ket: e.target.value } : x))} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. TUTORIAL
// ─────────────────────────────────────────────────────────────
export function Tutorial() {
  const [data, setData] = useState([
    { id: 1, judul: "Cara Menggunakan Dashboard Admin",     kategori: "Admin",  durasi: "5 menit",  url: "#", desc: "Panduan lengkap penggunaan dashboard admin BimbelKu." },
    { id: 2, judul: "Cara Input Data Siswa Baru",           kategori: "Admin",  durasi: "3 menit",  url: "#", desc: "Langkah-langkah menambahkan siswa baru ke sistem." },
    { id: 3, judul: "Cara Mencatat Pembayaran SPP",         kategori: "Admin",  durasi: "4 menit",  url: "#", desc: "Tutorial pencatatan pembayaran SPP siswa." },
    { id: 4, judul: "Cara Mengisi Absensi Harian",          kategori: "Guru",   durasi: "3 menit",  url: "#", desc: "Panduan pengisian absensi siswa dan guru." },
    { id: 5, judul: "Cara Melihat Jadwal Belajar",          kategori: "Siswa",  durasi: "2 menit",  url: "#", desc: "Cara melihat jadwal dan materi belajar." },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ judul: "", kategori: "Admin", durasi: "", url: "", desc: "" });

  const add = () => {
    if (!form.judul) return;
    setData([...data, { ...form, id: Date.now() }]);
    setForm({ judul: "", kategori: "Admin", durasi: "", url: "", desc: "" });
    setShowForm(false);
  };

  const catColors = { Admin: "purple", Guru: "blue", Siswa: "green" };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Tutorial
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah Tutorial Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div className="form-group"><label className="form-label">Judul</label><input className="form-input" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Judul tutorial..." /></div>
            <div className="form-group"><label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {["Admin", "Guru", "Siswa"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Durasi</label><input className="form-input" value={form.durasi} onChange={e => setForm({ ...form, durasi: e.target.value })} placeholder="e.g. 5 menit" /></div>
            <div className="form-group"><label className="form-label">Link Video/URL</label><input className="form-input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." /></div>
            <div className="form-group" style={{ gridColumn: "1/-1" }}><label className="form-label">Deskripsi</label><textarea className="form-input" rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Deskripsi singkat..." /></div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={add}>Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {data.map(t => (
          <div key={t.id} className="content-card" style={{ transition: ".2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span className={`badge ${catColors[t.kategori] || "blue"}`}>{t.kategori}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                <button className="icon-btn del" onClick={() => setData(data.filter(x => x.id !== t.id))}><Icon name="trash" size={13} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{t.judul}</h3>
            <p style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>{t.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>⏱ {t.durasi}</span>
              <a href={t.url} style={{ fontSize: ".78rem", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>▶ Lihat Tutorial</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
