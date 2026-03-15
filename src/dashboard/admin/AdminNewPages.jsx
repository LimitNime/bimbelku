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
  PEMASUKAN_DATA,
  PENGELUARAN_DATA,
  SPP_DATA,
  KATEGORI_PEMASUKAN,
  KATEGORI_PENGELUARAN,
  BULAN_LIST,
  TAHUN_LIST,
} from "../../data/index.js";

// ── Helper export CSV ─────────────────────────────────────────
const exportCSV = (filename, headers, rows) => {
  const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${v}"`).join(","))].join("\n");
  const a   = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" })),
    download: filename,
  });
  a.click();
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
    exportCSV(`spp-${bulan}-${tahun}.csv`,
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
    exportCSV(`pemasukan-${bulan}-${tahun}.csv`,
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
    exportCSV(`pengeluaran-${bulan}-${tahun}.csv`,
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
    exportCSV(`laporan-${tahun}.csv`,
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
// 5. HONOR GURU
// ─────────────────────────────────────────────────────────────
export function HonorGuru() {
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState(HONOR_DATA);
  const [openId,   setOpenId]   = useState(null); // rincian yang dibuka

  const filtered = data.filter(h => h.bulan === bulan && h.tahun === tahun);

  const toggle = (id) => {
    setData(data.map(h => h.id === id ? {
      ...h,
      status:    h.status === "Dibayar" ? "Belum" : "Dibayar",
      tgl_bayar: h.status !== "Dibayar" ? new Date().toLocaleDateString("id-ID") : "-",
    } : h));
  };

  const handleExport = () => {
    exportCSV(`honor-guru-${bulan}-${tahun}.csv`,
      ["Nama Guru", "Total Siswa", "Honor/Siswa", "Total Honor", "Status", "Tgl Bayar"],
      filtered.map(h => {
        const totalSiswa = h.rincian.reduce((a, b) => a + b.jumlah_siswa, 0);
        const guru = TEACHERS_DATA.find(g => g.id === h.guru_id);
        return [h.guru_nama, totalSiswa, guru?.honor_per_siswa || 0, totalSiswa * (guru?.honor_per_siswa || 0), h.status, h.tgl_bayar];
      })
    );
  };

  return (
    <div className="fade-in">
      {/* Filter */}
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
        <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
          📥 Export Excel
        </button>
      </div>

      {/* Tabel honor */}
      <div className="table-card">
        <div className="table-head"><h3>Honor Guru — {bulan} {tahun}</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama Guru</th><th>Program (klik untuk detail)</th><th>Total Siswa</th><th>Honor/Siswa</th><th>Total Honor</th><th>Tgl Bayar</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>Belum ada data honor bulan ini.</td></tr>
              ) : filtered.map(h => {
                const guru       = TEACHERS_DATA.find(g => g.id === h.guru_id);
                const totalSiswa = h.rincian.reduce((a, b) => a + b.jumlah_siswa, 0);
                const totalHonor = totalSiswa * (guru?.honor_per_siswa || 0);
                const isOpen     = openId === h.id;

                return (
                  <>
                    <tr key={h.id}>
                      <td><strong>{h.guru_nama}</strong></td>
                      <td>
                        <button onClick={() => setOpenId(isOpen ? null : h.id)}
                          style={{
                            background: "#dbeafe", color: "#2563eb", border: "none",
                            padding: "4px 10px", borderRadius: 7, cursor: "pointer",
                            fontSize: ".75rem", fontWeight: 700, fontFamily: "inherit",
                          }}>
                          {h.rincian.length} Program {isOpen ? "▲" : "▼"}
                        </button>
                      </td>
                      <td>{totalSiswa} siswa</td>
                      <td>Rp {(guru?.honor_per_siswa || 0).toLocaleString("id-ID")}</td>
                      <td style={{ fontWeight: 700, color: "#2563eb" }}>Rp {totalHonor.toLocaleString("id-ID")}</td>
                      <td style={{ fontSize: ".8rem", color: "var(--muted)" }}>{h.tgl_bayar}</td>
                      <td><span className={`badge ${h.status === "Dibayar" ? "green" : "red"}`}>{h.status}</span></td>
                      <td>
                        <button onClick={() => toggle(h.id)}
                          style={{
                            padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                            fontFamily: "inherit", fontSize: ".75rem", fontWeight: 700,
                            background: h.status === "Dibayar" ? "#fee2e2" : "#dcfce7",
                            color: h.status === "Dibayar" ? "#dc2626" : "#16a34a",
                          }}>
                          {h.status === "Dibayar" ? "Batal" : "✓ Bayar"}
                        </button>
                      </td>
                    </tr>

                    {/* Rincian per program */}
                    {isOpen && (
                      <tr key={h.id + "-detail"} style={{ background: "#f8fafc" }}>
                        <td colSpan={8} style={{ padding: "12px 20px" }}>
                          <div style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 8, color: "var(--muted)" }}>
                            Rincian Program — {h.guru_nama}
                          </div>
                          <table style={{ width: "auto", minWidth: 360 }}>
                            <thead>
                              <tr>
                                <th style={{ background: "#e2e8f0" }}>Program</th>
                                <th style={{ background: "#e2e8f0" }}>Jumlah Siswa</th>
                                <th style={{ background: "#e2e8f0" }}>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {h.rincian.map((r, i) => (
                                <tr key={i}>
                                  <td>{r.program}</td>
                                  <td>{r.jumlah_siswa} siswa</td>
                                  <td style={{ fontWeight: 600, color: "#2563eb" }}>
                                    Rp {(r.jumlah_siswa * (guru?.honor_per_siswa || 0)).toLocaleString("id-ID")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </>
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
