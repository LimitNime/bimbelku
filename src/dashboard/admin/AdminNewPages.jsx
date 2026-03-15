// ============================================================
// AdminNewPages.jsx — SPP, Keuangan, Honor, Tutorial
// Sesuai spesifikasi lengkap
// ============================================================
import { useState } from "react";
import StatCard from "../../components/StatCard.jsx";
import Icon     from "../../components/Icon.jsx";
import {
  STUDENTS_DATA,
  TEACHERS_DATA,
  HONOR_DATA,
  HONOR_SETTING,
  KOMPONEN_HONOR_SETTING,
  PEMASUKAN_DATA,
  PENGELUARAN_DATA,
  SPP_DATA,
  KATEGORI_PEMASUKAN,
  KATEGORI_PENGELUARAN,
  BULAN_LIST,
  ABSENSI_DATA,
  TAHUN_LIST,
} from "../../data/index.js";

import { exportExcel, cetakSlipGajiPDF } from "../../utils/exportHelper.js";

// ── Helper export Excel (wrapper sederhana) ───────────────────
const exportToExcel = (filename, headers, rows, colWidths) => {
  exportExcel(filename, [{ name: "Data", headers, rows, colWidths }]);
};

// ── Summary Box component ─────────────────────────────────────
function SummaryBox({ items }) {
  return (
    <div style={{
      background: "#f8fafc", border: "1px solid var(--border)",
      borderRadius: 12, padding: "16px 20px", marginTop: 20,
      display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12,
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ textAlign: "center" }}>
          <div style={{ fontSize: ".75rem", color: "var(--muted)", marginBottom: 4 }}>{item.label}</div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.2rem", fontWeight: 800, color: item.color || "var(--text)" }}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. SPP SISWA
// ─────────────────────────────────────────────────────────────
export function SPPSiswa() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");
  const [data,  setData]  = useState(SPP_DATA);

  const filtered = data.filter(s => s.bulan === bulan && s.tahun === tahun);
  const lunas    = filtered.filter(s => s.status === "Lunas").length;
  const belum    = filtered.filter(s => s.status === "Belum Bayar").length;
  const persen   = filtered.length > 0 ? Math.round((lunas / filtered.length) * 100) : 0;

  const toggle = (id) => {
    setData(data.map(s => s.id === id ? {
      ...s,
      status:    s.status === "Lunas" ? "Belum Bayar" : "Lunas",
      tgl_bayar: s.status !== "Lunas" ? new Date().toLocaleDateString("id-ID") : "-",
    } : s));
  };

  const handleExport = () => {
    exportToExcel(`spp-${bulan}-${tahun}`,
      ["Nama Siswa", "Program", "Nominal", "Tgl Bayar", "Status"],
      filtered.map(s => [s.siswa_nama, s.program, s.nominal, s.tgl_bayar, s.status])
    );
  };

  return (
    <div className="fade-in">
      {/* Filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
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
        <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
          📥 Export Excel
        </button>
      </div>

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head">
          <h3>SPP Bulan {bulan} {tahun} ({filtered.length} siswa)</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama Siswa</th><th>Program</th><th>Nominal</th><th>Tgl Bayar</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Belum ada data SPP bulan ini.</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.siswa_nama}</strong></td>
                  <td><span className="badge blue">{s.program}</span></td>
                  <td style={{ fontWeight: 600 }}>Rp {s.nominal.toLocaleString("id-ID")}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</td>
                  <td><span className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>{s.status}</span></td>
                  <td>
                    <button onClick={() => toggle(s.id)}
                      style={{
                        padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                        fontFamily: "inherit", fontSize: ".75rem", fontWeight: 700,
                        background: s.status === "Lunas" ? "#fee2e2" : "#dcfce7",
                        color: s.status === "Lunas" ? "#dc2626" : "#16a34a",
                      }}>
                      {s.status === "Lunas" ? "Batal" : "✓ Lunas"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Box */}
        <div style={{ padding: "0 20px 20px" }}>
          <SummaryBox items={[
            { label: "Sudah Bayar",       value: lunas + " siswa",  color: "#16a34a" },
            { label: "Belum Bayar",       value: belum + " siswa",  color: "#dc2626" },
            { label: "Tingkat Pembayaran",value: persen + "%",       color: persen >= 80 ? "#16a34a" : "#d97706" },
            { label: "Total Tagihan",     value: filtered.length + " siswa", color: "#2563eb" },
          ]} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PEMASUKAN
// ─────────────────────────────────────────────────────────────
export function Pemasukan() {
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState(PEMASUKAN_DATA);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" });

  const filtered = data.filter(d => {
    const tgl = new Date(d.tanggal);
    return tgl.toLocaleDateString("id-ID", { month: "long" }) === bulan
        && tgl.getFullYear().toString() === tahun;
  });

  const total = filtered.reduce((a, b) => a + b.nominal, 0);

  const resetForm = () => {
    setForm({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ tanggal: item.tanggal, keterangan: item.keterangan, kategori: item.kategori, nominal: item.nominal });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.keterangan || !form.nominal) return alert("Keterangan dan nominal wajib diisi!");
    const item = { ...form, nominal: parseInt(form.nominal) };
    if (editId) {
      setData(data.map(d => d.id === editId ? { ...item, id: editId } : d));
    } else {
      setData([...data, { ...item, id: Date.now() }]);
    }
    resetForm();
  };

  const handleExport = () => {
    exportToExcel(`pemasukan-${bulan}-${tahun}`,
      ["Tanggal", "Keterangan", "Kategori", "Nominal"],
      filtered.map(d => [d.tanggal, d.keterangan, d.kategori, d.nominal])
    );
  };

  return (
    <div className="fade-in">
      {/* Filter & toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>📥 Export</button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Icon name="plus" size={14} />Tambah
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Pemasukan" : "Tambah Pemasukan"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input className="form-input" type="date" value={form.tanggal}
                onChange={e => setForm({ ...form, tanggal: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {KATEGORI_PEMASUKAN.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan *</label>
              <input className="form-input" value={form.keterangan}
                onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan..." />
            </div>
            <div className="form-group">
              <label className="form-label">Nominal (Rp) *</label>
              <input className="form-input" type="number" value={form.nominal}
                onChange={e => setForm({ ...form, nominal: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleSave}>
              💾 {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head"><h3>Pemasukan {bulan} {tahun} ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Belum ada data.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>{d.keterangan}</td>
                  <td><span className="badge blue">{d.kategori}</span></td>
                  <td style={{ fontWeight: 700, color: "#16a34a" }}>Rp {d.nominal.toLocaleString("id-ID")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleEdit(d)}><Icon name="edit" size={13} /></button>
                      <button className="icon-btn del"  onClick={() => setData(data.filter(x => x.id !== d.id))}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Summary */}
        <div style={{ padding: "0 20px 20px" }}>
          <SummaryBox items={[
            { label: "Total Transaksi",  value: filtered.length + " item",                        color: "#2563eb" },
            { label: "Total Pemasukan", value: "Rp " + total.toLocaleString("id-ID"),             color: "#16a34a" },
          ]} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PENGELUARAN
// ─────────────────────────────────────────────────────────────
export function Pengeluaran() {
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState(PENGELUARAN_DATA);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "Operasional", nominal: "" });

  const filtered = data.filter(d => {
    const tgl = new Date(d.tanggal);
    return tgl.toLocaleDateString("id-ID", { month: "long" }) === bulan
        && tgl.getFullYear().toString() === tahun;
  });

  const total = filtered.reduce((a, b) => a + b.nominal, 0);

  const resetForm = () => {
    setForm({ tanggal: "", keterangan: "", kategori: "Operasional", nominal: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({ tanggal: item.tanggal, keterangan: item.keterangan, kategori: item.kategori, nominal: item.nominal });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.keterangan || !form.nominal) return alert("Keterangan dan nominal wajib diisi!");
    const item = { ...form, nominal: parseInt(form.nominal) };
    if (editId) {
      setData(data.map(d => d.id === editId ? { ...item, id: editId } : d));
    } else {
      setData([...data, { ...item, id: Date.now() }]);
    }
    resetForm();
  };

  const handleExport = () => {
    exportToExcel(`pengeluaran-${bulan}-${tahun}`,
      ["Tanggal", "Keterangan", "Kategori", "Nominal"],
      filtered.map(d => [d.tanggal, d.keterangan, d.kategori, d.nominal])
    );
  };

  return (
    <div className="fade-in">
      {/* Filter & toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
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
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>📥 Export</button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Icon name="plus" size={14} />Tambah
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Tanggal</label>
              <input className="form-input" type="date" value={form.tanggal}
                onChange={e => setForm({ ...form, tanggal: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {KATEGORI_PENGELUARAN.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan *</label>
              <input className="form-input" value={form.keterangan}
                onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan..." />
            </div>
            <div className="form-group">
              <label className="form-label">Nominal (Rp) *</label>
              <input className="form-input" type="number" value={form.nominal}
                onChange={e => setForm({ ...form, nominal: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleSave}>
              💾 {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head"><h3>Pengeluaran {bulan} {tahun} ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Belum ada data.</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td>{d.keterangan}</td>
                  <td><span className="badge yellow">{d.kategori}</span></td>
                  <td style={{ fontWeight: 700, color: "#dc2626" }}>Rp {d.nominal.toLocaleString("id-ID")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleEdit(d)}><Icon name="edit" size={13} /></button>
                      <button className="icon-btn del"  onClick={() => setData(data.filter(x => x.id !== d.id))}><Icon name="trash" size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          <SummaryBox items={[
            { label: "Total Transaksi",   value: filtered.length + " item",              color: "#2563eb" },
            { label: "Total Pengeluaran", value: "Rp " + total.toLocaleString("id-ID"),  color: "#dc2626" },
          ]} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SALDO & LAPORAN
// ─────────────────────────────────────────────────────────────
export function SaldoLaporan() {
  const [tahun, setTahun] = useState("2026");

  // Hitung per bulan
  const bulanData = BULAN_LIST.map(bln => {
    const masuk = PEMASUKAN_DATA.filter(d => {
      const t = new Date(d.tanggal);
      return t.toLocaleDateString("id-ID", { month: "long" }) === bln && t.getFullYear().toString() === tahun;
    }).reduce((a, b) => a + b.nominal, 0);

    const keluar = PENGELUARAN_DATA.filter(d => {
      const t = new Date(d.tanggal);
      return t.toLocaleDateString("id-ID", { month: "long" }) === bln && t.getFullYear().toString() === tahun;
    }).reduce((a, b) => a + b.nominal, 0);

    return { bulan: bln, masuk, keluar, saldo: masuk - keluar };
  }).filter(b => b.masuk > 0 || b.keluar > 0);

  const totalMasuk  = bulanData.reduce((a, b) => a + b.masuk,  0);
  const totalKeluar = bulanData.reduce((a, b) => a + b.keluar, 0);
  const totalSaldo  = totalMasuk - totalKeluar;

  const handleExport = () => {
    exportToExcel(`laporan-${tahun}`,
      ["Bulan", "Total Pemasukan", "Total Pengeluaran", "Saldo"],
      bulanData.map(b => [b.bulan, b.masuk, b.keluar, b.saldo])
    );
  };

  return (
    <div className="fade-in">
      {/* Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" style={{ width: 120 }} value={tahun} onChange={e => setTahun(e.target.value)}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
          📥 Export Laporan {tahun}
        </button>
      </div>

      {/* Summary box atas */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="💵" label="Total Pemasukan"   value={"Rp " + totalMasuk.toLocaleString("id-ID")}  bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="💸" label="Total Pengeluaran" value={"Rp " + totalKeluar.toLocaleString("id-ID")} bgColor="#fee2e2" textColor="#dc2626" />
        <StatCard icon="🏦" label="Saldo Bersih"      value={"Rp " + totalSaldo.toLocaleString("id-ID")}  bgColor="#dbeafe" textColor={totalSaldo >= 0 ? "#2563eb" : "#dc2626"} />
      </div>

      {/* Tabel laporan bulanan */}
      <div className="table-card">
        <div className="table-head"><h3>Laporan Bulanan Tahun {tahun}</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Bulan</th><th>Total Pemasukan</th><th>Total Pengeluaran</th><th>Saldo</th></tr>
            </thead>
            <tbody>
              {bulanData.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Belum ada data tahun {tahun}.</td></tr>
              ) : bulanData.map((b, i) => (
                <tr key={i}>
                  <td><strong>{b.bulan}</strong></td>
                  <td style={{ color: "#16a34a", fontWeight: 600 }}>Rp {b.masuk.toLocaleString("id-ID")}</td>
                  <td style={{ color: "#dc2626", fontWeight: 600 }}>Rp {b.keluar.toLocaleString("id-ID")}</td>
                  <td style={{ color: b.saldo >= 0 ? "#2563eb" : "#dc2626", fontWeight: 700 }}>
                    Rp {b.saldo.toLocaleString("id-ID")}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              {bulanData.length > 0 && (
                <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                  <td><strong>TOTAL</strong></td>
                  <td style={{ color: "#16a34a" }}>Rp {totalMasuk.toLocaleString("id-ID")}</td>
                  <td style={{ color: "#dc2626" }}>Rp {totalKeluar.toLocaleString("id-ID")}</td>
                  <td style={{ color: totalSaldo >= 0 ? "#2563eb" : "#dc2626" }}>
                    Rp {totalSaldo.toLocaleString("id-ID")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HONOR GURU — CRUD lengkap + slip gaji
// ─────────────────────────────────────────────────────────────

// Helper hitung total honor
const hitungTotal = (h) => {
  const totalMengajar   = (h.mengajar || []).reduce((a, b) => a + b.jumlah_siswa * b.honor_per_siswa, 0);
  const totalKomponen   = (h.komponen_tetap || []).reduce((a, b) => a + b.nominal, 0);
  const totalTambahan   = (h.honor_tambahan || []).reduce((a, b) => a + b.nominal, 0);
  return totalMengajar + totalKomponen + totalTambahan;
};

// Cetak slip gaji — PDF profesional via exportHelper
const cetakSlip = (h) => cetakSlipGajiPDF(h);

export function HonorGuru() {
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState(HONOR_DATA);
  const [editId,   setEditId]   = useState(null); // ID honor yang sedang diedit

  const filtered = data.filter(h => h.bulan === bulan && h.tahun === tahun);

  // ── Toggle status bayar ──────────────────────────────────────
  const toggleBayar = (id) => {
    setData(data.map(h => h.id === id ? {
      ...h,
      status:    h.status === "Dibayar" ? "Belum" : "Dibayar",
      tgl_bayar: h.status !== "Dibayar" ? new Date().toLocaleDateString("id-ID") : "-",
    } : h));
  };

  // ── Hitung pertemuan dari absensi TERVERIFIKASI ──────────────
  const hitungPertemuanDariAbsensi = (guru_id, bulan, tahun) => {
    const absBulan = ABSENSI_DATA.filter(a => {
      const d   = new Date(a.tanggal);
      const bln = d.toLocaleDateString("id-ID", { month: "long" });
      const thn = d.getFullYear().toString();
      // ✅ Hanya absensi yang sudah diverifikasi admin
      return a.guru_id === guru_id && bln === bulan && thn === tahun
          && a.verified === true;
    });

    // Group by program → hitung tanggal unik per program
    const perProgram = {};
    absBulan.forEach(a => {
      if (!perProgram[a.program]) perProgram[a.program] = new Set();
      perProgram[a.program].add(a.tanggal);
    });

    return Object.entries(perProgram).map(([program, tglSet]) => ({
      program,
      jumlah_pertemuan: tglSet.size,
    }));
  };

  // ── Tambah honor baru untuk guru yang belum ada di bulan ini ─
  const tambahHonor = (guru) => {
    if (data.find(h => h.guru_id === guru.id && h.bulan === bulan && h.tahun === tahun)) return;
    const setting      = HONOR_SETTING.filter(s => s.guru_id === guru.id);
    const komponenSett = KOMPONEN_HONOR_SETTING.filter(k => k.guru_id === guru.id && k.aktif);

    // Hitung pertemuan dari absensi TERVERIFIKASI saja
    const pertemuan = hitungPertemuanDariAbsensi(guru.id, bulan, tahun);

    // Gabungkan dengan honor_setting
    // Kalau program belum ada di setting → honor_per_siswa = 0
    // Admin perlu tambah setting honor dulu untuk program itu
    const mengajar = pertemuan.map(p => {
      const s = setting.find(x => x.program === p.program);
      return {
        program:          p.program,
        jumlah_pertemuan: p.jumlah_pertemuan,
        honor_per_siswa:  s?.honor_per_siswa || 0,
        // Tandai kalau belum ada setting — supaya admin tau perlu diset
        belum_setting:    !s,
      };
    });

    // Kalau tidak ada absensi terverifikasi, pakai setting saja
    if (mengajar.length === 0) {
      setting.forEach(s => {
        mengajar.push({ program: s.program, jumlah_pertemuan: 0, honor_per_siswa: s.honor_per_siswa, belum_setting: false });
      });
    }

    const newHonor = {
      id:             Date.now(),
      guru_id:        guru.id,
      guru_nama:      guru.nama,
      bulan,  tahun,
      status:         "Belum",
      tgl_bayar:      "-",
      mengajar,
      komponen_tetap: komponenSett.map(k => ({ nama: k.nama, nominal: k.nominal_default })),
      honor_tambahan: [],
    };
    setData([...data, newHonor]);
    setEditId(newHonor.id);
  };

  // ── Export CSV ───────────────────────────────────────────────
  const handleExport = () => {
    exportToExcel(`honor-guru-${bulan}-${tahun}`,
      ["Nama Guru", "Honor Mengajar", "Komponen Tetap", "Honor Tambahan", "Total Gaji", "Status", "Tgl Bayar"],
      filtered.map(h => {
        const m = (h.mengajar||[]).reduce((a,b)=>a+b.jumlah_siswa*b.honor_per_siswa,0);
        const k = (h.komponen_tetap||[]).reduce((a,b)=>a+b.nominal,0);
        const t = (h.honor_tambahan||[]).reduce((a,b)=>a+b.nominal,0);
        return [h.guru_nama, m, k, t, m+k+t, h.status, h.tgl_bayar];
      })
    );
  };

  // Guru yang belum punya honor di bulan ini
  const guruBelumAda = TEACHERS_DATA.filter(g =>
    !data.find(h => h.guru_id === g.id && h.bulan === bulan && h.tahun === tahun)
  );

  return (
    <div className="fade-in">

      {/* ── Filter & toolbar ───────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Bulan</label>
            <select className="form-input" style={{ width: 160 }} value={bulan} onChange={e => { setBulan(e.target.value); setEditId(null); }}>
              {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tahun</label>
            <select className="form-input" style={{ width: 100 }} value={tahun} onChange={e => { setTahun(e.target.value); setEditId(null); }}>
              {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {guruBelumAda.map(g => (
            <button key={g.id} onClick={() => tambahHonor(g)}
              className="btn-outline" style={{ padding: "8px 12px", fontSize: ".78rem" }}>
              + Honor {g.nama.split(" ").pop()}
            </button>
          ))}
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            📥 Export
          </button>
        </div>
      </div>

      {/* ── Daftar honor per guru ───────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="content-card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
          <p style={{ color: "var(--muted)" }}>Belum ada data honor {bulan} {tahun}.</p>
          <p style={{ fontSize: ".82rem", color: "var(--muted)", marginTop: 8 }}>
            Klik tombol "+ Honor [Nama Guru]" di atas untuk mulai input.
          </p>
        </div>
      ) : (
        filtered.map(h => (
          <HonorCard
            key={h.id}
            honor={h}
            isEdit={editId === h.id}
            onToggleEdit={() => setEditId(editId === h.id ? null : h.id)}
            onUpdate={(updated) => setData(data.map(d => d.id === h.id ? updated : d))}
            onDelete={() => { setData(data.filter(d => d.id !== h.id)); setEditId(null); }}
            onToggleBayar={() => toggleBayar(h.id)}
            onSlip={() => cetakSlip(h)}
          />
        ))
      )}
    </div>
  );
}

// ── HonorCard — kartu per guru ────────────────────────────────
function HonorCard({ honor, isEdit, onToggleEdit, onUpdate, onDelete, onToggleBayar, onSlip }) {
  const h             = honor;
  const totalMengajar = (h.mengajar||[]).reduce((a,b)=>a+(b.jumlah_pertemuan||b.jumlah_siswa||0)*b.honor_per_siswa,0);
  const totalKomponen = (h.komponen_tetap||[]).reduce((a,b)=>a+b.nominal,0);
  const totalTambahan = (h.honor_tambahan||[]).reduce((a,b)=>a+b.nominal,0);
  const totalGaji     = totalMengajar + totalKomponen + totalTambahan;
  const fmt           = (n) => "Rp " + n.toLocaleString("id-ID");

  // ── Update helpers ────────────────────────────────────────
  const updateKomponen = (idx, val) => {
    const k = [...h.komponen_tetap];
    k[idx]  = { ...k[idx], nominal: parseInt(val) || 0 };
    onUpdate({ ...h, komponen_tetap: k });
  };

  const updateTambahan = (id, field, val) => {
    onUpdate({ ...h, honor_tambahan: h.honor_tambahan.map(t =>
      t.id === id ? { ...t, [field]: field === "nominal" ? (parseInt(val)||0) : val } : t
    )});
  };

  const tambahHonorLain = () => {
    onUpdate({ ...h, honor_tambahan: [...h.honor_tambahan, { id: Date.now(), nama: "Honor Tambahan", nominal: 0 }] });
  };

  const hapusTambahan = (id) => {
    onUpdate({ ...h, honor_tambahan: h.honor_tambahan.filter(t => t.id !== id) });
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
      marginBottom: 20, overflow: "hidden",
    }}>
      {/* Header kartu */}
      <div style={{
        padding: "16px 20px", display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 10,
        background: isEdit ? "#eff6ff" : "#fff",
        borderBottom: "1px solid var(--border)",
      }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>{h.guru_nama}</h3>
          <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>{h.bulan} {h.tahun}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "var(--blue)" }}>
            {fmt(totalGaji)}
          </div>
          <span className={`badge ${h.status === "Dibayar" ? "green" : "red"}`}>{h.status}</span>
          <button onClick={onToggleEdit} className="btn-outline" style={{ padding: "6px 12px", fontSize: ".78rem" }}>
            {isEdit ? "✕ Tutup" : "✏️ Edit"}
          </button>
          <button onClick={onSlip} style={{
            padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#f3e8ff", color: "#7c3aed", fontWeight: 600, fontSize: ".78rem", fontFamily: "inherit",
          }}>🖨️ Slip</button>
          <button onClick={onToggleBayar} style={{
            padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700,
            background: h.status === "Dibayar" ? "#fee2e2" : "#dcfce7",
            color: h.status === "Dibayar" ? "#dc2626" : "#16a34a",
          }}>
            {h.status === "Dibayar" ? "Batal Bayar" : "✓ Tandai Dibayar"}
          </button>
          <button onClick={onDelete} className="icon-btn del" title="Hapus honor bulan ini">
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>

      {/* Body — mode view */}
      {!isEdit && (
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>

            {/* Honor mengajar — otomatis dari absensi */}
            <div>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
                📚 Honor Mengajar
              </div>
              {(h.mengajar||[]).map((m,i) => {
                const pertemuan = m.jumlah_pertemuan || m.jumlah_siswa || 0;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: ".85rem" }}>
                    <span>
                      {m.program}{" "}
                      <span style={{ color: "var(--muted)", fontSize: ".78rem" }}>({pertemuan} pertemuan)</span>
                      {m.belum_setting && (
                        <span style={{ marginLeft: 6, fontSize: ".68rem", background: "#fef9c3", color: "#b45309", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                          ⚠️ Setting honor belum diisi
                        </span>
                      )}
                    </span>
                    <strong style={{ color: m.belum_setting ? "#b45309" : "var(--blue)" }}>
                      {m.belum_setting ? "Rp 0 — isi setting dulu" : fmt(pertemuan * m.honor_per_siswa)}
                    </strong>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: ".85rem", fontWeight: 700 }}>
                <span>Subtotal</span><span style={{ color: "var(--blue)" }}>{fmt(totalMengajar)}</span>
              </div>
            </div>

            {/* Komponen & tambahan */}
            <div>
              {(h.komponen_tetap||[]).length > 0 && (
                <>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
                    💰 Komponen Tetap
                  </div>
                  {(h.komponen_tetap||[]).map((k,i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: ".85rem" }}>
                      <span>{k.nama}</span><strong style={{ color: "#16a34a" }}>{fmt(k.nominal)}</strong>
                    </div>
                  ))}
                </>
              )}
              {(h.honor_tambahan||[]).length > 0 && (
                <>
                  <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", margin: "12px 0 10px" }}>
                    ➕ Honor Tambahan
                  </div>
                  {(h.honor_tambahan||[]).map((t,i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: ".85rem" }}>
                      <span>{t.nama}</span><strong style={{ color: "#d97706" }}>{fmt(t.nominal)}</strong>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body — mode edit */}
      {isEdit && (
        <div style={{ padding: "20px" }}>

          {/* 1. Honor mengajar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
              📚 Honor Mengajar
            </div>
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Honor/Pertemuan</th>
                    <th>Jml Pertemuan</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(h.mengajar||[]).map((m, i) => {
                    const pertemuan = m.jumlah_pertemuan || m.jumlah_siswa || 0;
                    return (
                      <tr key={i} style={{ background: m.belum_setting ? "#fffbeb" : "#fff" }}>
                        <td>
                          <strong>{m.program}</strong>
                          {m.belum_setting && (
                            <div style={{ fontSize: ".72rem", color: "#b45309", marginTop: 2 }}>
                              ⚠️ Belum ada setting honor — tambah di menu Setting Honor Guru
                            </div>
                          )}
                        </td>
                        <td style={{ color: m.belum_setting ? "#b45309" : "var(--muted)", fontSize: ".82rem" }}>
                          {m.belum_setting ? "—" : fmt(m.honor_per_siswa)}
                        </td>
                        <td>
                          <span style={{
                            display: "inline-block", padding: "4px 12px",
                            background: "#f0f9ff", borderRadius: 8,
                            fontSize: ".88rem", fontWeight: 700, color: "var(--blue)",
                          }}>
                            {pertemuan} pertemuan
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: m.belum_setting ? "#b45309" : "var(--blue)" }}>
                          {m.belum_setting ? "Rp 0" : fmt(pertemuan * m.honor_per_siswa)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: "#f8fafc" }}>
                    <td colSpan={3} style={{ fontWeight: 700, textAlign: "right" }}>Subtotal Mengajar</td>
                    <td style={{ fontWeight: 800, color: "var(--blue)" }}>{fmt(totalMengajar)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Komponen tetap */}
          {(h.komponen_tetap||[]).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>
                💰 Komponen Tetap — edit nominal jika perlu
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
                {(h.komponen_tetap||[]).map((k, i) => (
                  <div key={i} className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{k.nama}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Rp</span>
                      <input
                        type="number" min="0"
                        value={k.nominal}
                        onChange={e => updateKomponen(i, e.target.value)}
                        className="form-input" style={{ flex: 1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Honor tambahan */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--text)" }}>
                ➕ Honor Tambahan (tidak permanen)
              </div>
              <button onClick={tambahHonorLain} style={{
                padding: "5px 12px", borderRadius: 8, border: "1.5px dashed var(--blue)",
                color: "var(--blue)", background: "transparent", cursor: "pointer",
                fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit",
              }}>
                + Tambah Honor Lain
              </button>
            </div>

            {(h.honor_tambahan||[]).length === 0 ? (
              <p style={{ fontSize: ".82rem", color: "var(--muted)", fontStyle: "italic" }}>
                Belum ada honor tambahan bulan ini.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(h.honor_tambahan||[]).map(t => (
                  <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <input
                      className="form-input"
                      style={{ flex: 2, minWidth: 140 }}
                      value={t.nama}
                      placeholder="Nama honor..."
                      onChange={e => updateTambahan(t.id, "nama", e.target.value)}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 120 }}>
                      <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Rp</span>
                      <input
                        type="number" min="0"
                        className="form-input"
                        value={t.nominal}
                        onChange={e => updateTambahan(t.id, "nominal", e.target.value)}
                      />
                    </div>
                    <button onClick={() => hapusTambahan(t.id)} className="icon-btn del">
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total & simpan */}
          <div style={{
            background: "#f8fafc", borderRadius: 12, padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontSize: ".78rem", color: "var(--muted)" }}>Total Gaji Bulan Ini</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--blue)" }}>
                {fmt(totalGaji)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={onSlip} style={{
                padding: "10px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "#f3e8ff", color: "#7c3aed", fontWeight: 700, fontSize: ".85rem", fontFamily: "inherit",
              }}>🖨️ Cetak Slip</button>
              <button onClick={onToggleEdit} className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}>
                💾 Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. TUTORIAL
// ─────────────────────────────────────────────────────────────
export function Tutorial() {
  const [data, setData] = useState([
    { id: 1, judul: "Cara Menggunakan Dashboard Admin",  kategori: "Admin",  durasi: "5 menit", url: "#", desc: "Panduan lengkap penggunaan dashboard admin." },
    { id: 2, judul: "Cara Input Data Siswa Baru",        kategori: "Admin",  durasi: "3 menit", url: "#", desc: "Langkah-langkah menambahkan siswa baru." },
    { id: 3, judul: "Cara Mencatat Pembayaran SPP",      kategori: "Admin",  durasi: "4 menit", url: "#", desc: "Tutorial pencatatan SPP siswa." },
    { id: 4, judul: "Cara Mengisi Absensi Harian",       kategori: "Guru",   durasi: "3 menit", url: "#", desc: "Panduan pengisian absensi siswa." },
    { id: 5, judul: "Cara Melihat Pembayaran SPP",       kategori: "Siswa",  durasi: "2 menit", url: "#", desc: "Cara cek status pembayaran SPP." },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ judul: "", kategori: "Admin", durasi: "", url: "", desc: "" });
  const catColors = { Admin: "purple", Guru: "blue", Siswa: "green" };

  const add = () => {
    if (!form.judul) return;
    setData([...data, { ...form, id: Date.now() }]);
    setForm({ judul: "", kategori: "Admin", durasi: "", url: "", desc: "" });
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Tutorial
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah Tutorial Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Judul</label>
              <input className="form-input" value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })} placeholder="Judul tutorial..." />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={form.kategori}
                onChange={e => setForm({ ...form, kategori: e.target.value })}>
                {["Admin", "Guru", "Siswa"].map(k => <option key={k}>{k}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Durasi</label>
              <input className="form-input" value={form.durasi}
                onChange={e => setForm({ ...form, durasi: e.target.value })} placeholder="e.g. 5 menit" />
            </div>
            <div className="form-group">
              <label className="form-label">Link Video / URL</label>
              <input className="form-input" value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://youtube.com/..." />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Deskripsi</label>
              <textarea className="form-input" rows={2} value={form.desc}
                onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Deskripsi singkat..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={add}>💾 Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {data.map(t => (
          <div key={t.id} className="content-card" style={{ transition: ".2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span className={`badge ${catColors[t.kategori] || "blue"}`}>{t.kategori}</span>
              <div className="action-btns">
                <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                <button className="icon-btn del" onClick={() => setData(data.filter(x => x.id !== t.id))}><Icon name="trash" size={13} /></button>
              </div>
            </div>
            <h3 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{t.judul}</h3>
            <p style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>{t.desc}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>⏱ {t.durasi}</span>
              <a href={t.url} target="_blank" rel="noreferrer"
                style={{ fontSize: ".78rem", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>
                ▶ Tonton
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. REKAP ABSENSI ADMIN
// Admin lihat semua absensi dari semua guru
// Verifikasi per baris, filter per guru/bulan/tahun
// ─────────────────────────────────────────────────────────────

export function RekapAbsensiAdmin() {
  const [absensi,    setAbsensi]    = useState(ABSENSI_DATA);
  const [bulan,      setBulan]      = useState("Maret");
  const [tahun,      setTahun]      = useState("2026");
  const [filterGuru, setFilterGuru] = useState("Semua");
  const [activeTab,  setActiveTab]  = useState("rekap"); // "rekap" | "detail"
  const [detailGuru, setDetailGuru] = useState(null);

  // Filter absensi sesuai bulan/tahun/guru
  const filtered = absensi.filter(a => {
    const d   = new Date(a.tanggal);
    const bln = d.toLocaleDateString("id-ID", { month: "long" });
    const thn = d.getFullYear().toString();
    const guruOk = filterGuru === "Semua" || a.guru_nama === filterGuru;
    return bln === bulan && thn === tahun && guruOk;
  });

  // Verifikasi 1 baris
  const verifikasi = (id) => {
    setAbsensi(absensi.map(a => a.id === id ? { ...a, verified: true } : a));
  };

  // Verifikasi semua yang terfilter
  const verifikasiSemua = () => {
    const ids = new Set(filtered.map(a => a.id));
    setAbsensi(absensi.map(a => ids.has(a.id) ? { ...a, verified: true } : a));
  };

  // Batal verifikasi
  const batalVerifikasi = (id) => {
    setAbsensi(absensi.map(a => a.id === id ? { ...a, verified: false } : a));
  };

  // Summary per guru
  const guruList = [...new Set(filtered.map(a => a.guru_nama))];

  const summaryPerGuru = guruList.map(nama => {
    const rows     = filtered.filter(a => a.guru_nama === nama);
    const hadir    = rows.filter(a => a.status === "Hadir").length;
    const izin     = rows.filter(a => a.status === "Izin").length;
    const sakit    = rows.filter(a => a.status === "Sakit").length;
    const alpha    = rows.filter(a => a.status === "Alpha").length;
    const verified = rows.filter(a => a.verified).length;

    // Unique siswa yang diajar
    const siswaSet = {};
    rows.forEach(r => {
      if (!siswaSet[r.siswa_id]) siswaSet[r.siswa_id] = { nama: r.siswa_nama, programs: new Set() };
      siswaSet[r.siswa_id].programs.add(r.program);
    });
    const siswaList = Object.values(siswaSet);

    // Unique tanggal (pertemuan)
    const pertemuan = [...new Set(rows.map(r => r.tanggal))].length;

    return { nama, rows, hadir, izin, sakit, alpha, verified, siswaList, pertemuan };
  });

  const handleExport = () => {
    exportToExcel(`absensi-${bulan}-${tahun}`,
      ["Tanggal", "Nama Siswa", "Program", "Status", "Guru Pengisi", "Verified"],
      filtered.map(a => [a.tanggal, a.siswa_nama, a.program, a.status, a.guru_nama, a.verified ? "Ya" : "Belum"])
    );
  };

  const STATUS_COLORS = {
    "Hadir":       { bg: "#dcfce7", color: "#16a34a" },
    "Izin":        { bg: "#dbeafe", color: "#2563eb" },
    "Sakit":       { bg: "#fef9c3", color: "#b45309" },
    "Alpha":       { bg: "#fee2e2", color: "#dc2626" },
    "Tidak Hadir": { bg: "#fee2e2", color: "#dc2626" },
  };

  return (
    <div className="fade-in">

      {/* ── Filter ──────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Bulan</label>
            <select className="form-input" style={{ width: 150 }} value={bulan} onChange={e => setBulan(e.target.value)}>
              {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Tahun</label>
            <select className="form-input" style={{ width: 100 }} value={tahun} onChange={e => setTahun(e.target.value)}>
              {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Guru</label>
            <select className="form-input" style={{ width: 200 }} value={filterGuru} onChange={e => setFilterGuru(e.target.value)}>
              <option>Semua</option>
              {TEACHERS_DATA.map(g => <option key={g.id}>{g.nama}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={verifikasiSemua} className="btn-primary"
            style={{ padding: "9px 14px", fontSize: ".82rem", background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
            ✓ Verifikasi Semua
          </button>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            📥 Export
          </button>
        </div>
      </div>

      {/* ── Tab ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { key: "rekap",  label: "📊 Rekap per Guru" },
          { key: "detail", label: "📋 Detail Harian"  },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: ".85rem",
              fontWeight: 600, transition: ".15s",
              background: activeTab === tab.key ? "var(--blue)" : "#f1f5f9",
              color: activeTab === tab.key ? "#fff" : "var(--muted)",
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: Rekap per Guru ───────────────────────────── */}
      {activeTab === "rekap" && (
        <div>
          {summaryPerGuru.length === 0 ? (
            <div className="content-card" style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
              <p style={{ color: "var(--muted)" }}>Belum ada data absensi {bulan} {tahun}.</p>
            </div>
          ) : summaryPerGuru.map((g, gi) => (
            <div key={gi} style={{
              background: "#fff", borderRadius: 16, border: "1px solid var(--border)",
              marginBottom: 20, overflow: "hidden",
            }}>
              {/* Header guru */}
              <div style={{
                padding: "16px 20px", background: "#f8fafc",
                borderBottom: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <h3 style={{ fontSize: ".95rem", fontWeight: 700, margin: 0 }}>{g.nama}</h3>
                  <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                    {bulan} {tahun} · {g.pertemuan} pertemuan · {g.siswaList.length} siswa
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Hadir", val: g.hadir, color: "#16a34a", bg: "#dcfce7" },
                    { label: "Izin",  val: g.izin,  color: "#2563eb", bg: "#dbeafe" },
                    { label: "Sakit", val: g.sakit, color: "#b45309", bg: "#fef9c3" },
                    { label: "Alpha", val: g.alpha, color: "#dc2626", bg: "#fee2e2" },
                  ].map((s, i) => (
                    <span key={i} style={{
                      padding: "3px 10px", borderRadius: 100, fontSize: ".72rem",
                      fontWeight: 700, background: s.bg, color: s.color,
                    }}>
                      {s.label}: {s.val}
                    </span>
                  ))}
                  <span style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: ".72rem",
                    fontWeight: 700,
                    background: g.verified === g.rows.length ? "#dcfce7" : "#fef9c3",
                    color: g.verified === g.rows.length ? "#16a34a" : "#b45309",
                  }}>
                    ✓ {g.verified}/{g.rows.length} verified
                  </span>
                </div>
              </div>

              {/* Tabel siswa per guru */}
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Program</th>
                      <th>Hadir</th>
                      <th>Izin</th>
                      <th>Sakit</th>
                      <th>Alpha</th>
                      <th>Total Pertemuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.siswaList.map((s, si) => {
                      const siswaRows    = g.rows.filter(r => r.siswa_nama === s.nama);
                      const sHadir = siswaRows.filter(r => r.status === "Hadir").length;
                      const sIzin  = siswaRows.filter(r => r.status === "Izin").length;
                      const sSakit = siswaRows.filter(r => r.status === "Sakit").length;
                      const sAlpha = siswaRows.filter(r => r.status === "Alpha").length;
                      return (
                        <tr key={si}>
                          <td><strong>{s.nama}</strong></td>
                          <td>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {[...s.programs].map((p, pi) => (
                                <span key={pi} className="badge blue" style={{ fontSize: ".7rem" }}>{p}</span>
                              ))}
                            </div>
                          </td>
                          <td style={{ color: "#16a34a", fontWeight: 600 }}>{sHadir}</td>
                          <td style={{ color: "#2563eb", fontWeight: 600 }}>{sIzin}</td>
                          <td style={{ color: "#b45309", fontWeight: 600 }}>{sSakit}</td>
                          <td style={{ color: "#dc2626", fontWeight: 600 }}>{sAlpha}</td>
                          <td><span className="badge blue">{siswaRows.length}x</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 2: Detail Harian ────────────────────────────── */}
      {activeTab === "detail" && (
        <div className="table-card">
          <div className="table-head">
            <h3>Detail Absensi Harian — {bulan} {tahun}</h3>
            <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>
              {filtered.filter(a => a.verified).length}/{filtered.length} terverifikasi
            </span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
              Belum ada data absensi.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Nama Siswa</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Guru Pengisi</th>
                    <th>Verifikasi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>
                        {new Date(a.tanggal).toLocaleDateString("id-ID", {
                          weekday: "short", day: "numeric", month: "short",
                        })}
                      </td>
                      <td><strong>{a.siswa_nama}</strong></td>
                      <td><span className="badge blue">{a.program}</span></td>
                      <td>
                        <span style={{
                          padding: "3px 10px", borderRadius: 100, fontSize: ".72rem",
                          fontWeight: 700,
                          background: (STATUS_COLORS[a.status] || STATUS_COLORS["Alpha"]).bg,
                          color: (STATUS_COLORS[a.status] || STATUS_COLORS["Alpha"]).color,
                        }}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ fontSize: ".82rem" }}>{a.guru_nama}</td>
                      <td>
                        {a.verified ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ color: "#16a34a", fontSize: ".78rem", fontWeight: 700 }}>✓ Verified</span>
                            <button onClick={() => batalVerifikasi(a.id)} style={{
                              padding: "2px 8px", borderRadius: 6, border: "none",
                              background: "#fee2e2", color: "#dc2626", cursor: "pointer",
                              fontSize: ".68rem", fontWeight: 700, fontFamily: "inherit",
                            }}>Batal</button>
                          </div>
                        ) : (
                          <button onClick={() => verifikasi(a.id)} style={{
                            padding: "4px 12px", borderRadius: 7, border: "none",
                            background: "#dcfce7", color: "#16a34a", cursor: "pointer",
                            fontSize: ".75rem", fontWeight: 700, fontFamily: "inherit",
                          }}>
                            ✓ Verifikasi
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}