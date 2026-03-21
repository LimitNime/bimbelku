import React, { useState, useEffect } from "react";
import StatCard    from "../../components/StatCard.jsx";
import ArticleCard from "../../components/ArticleCard.jsx";
import Icon        from "../../components/Icon.jsx";
import DataTable   from "../../components/DataTable.jsx";
import { useToast }              from "../../components/Toast.jsx";
import { ConfirmModal, useConfirm } from "../../components/Modal.jsx";
import {
  STUDENTS_DATA,
  TEACHERS_DATA,
  ARTICLES,
  PROGRAMS,
  SPP_DATA,
  PEMASUKAN_DATA,
  HONOR_SETTING,
  KOMPONEN_HONOR_SETTING,
  PENGELUARAN_DATA,
} from "../../data/index.js";

import { exportExcel } from "../../utils/exportHelper.js";
import { supabase } from "../../lib/supabase.js";
import { loginUser, logoutUser, getSession, registerUser } from "../../lib/auth.js";
import {
  getGuru, addGuru, updateGuru, deleteGuru,
  getSiswa, addSiswa, updateSiswa, updateStatusSiswa, deleteSiswa,
  getPrograms, addProgram, updateProgram, deleteProgram,
  getHonorSetting, getArtikel, addArtikel, updateArtikel, deleteArtikel,
  getAllLandingSections, updateLandingSection,
  getSiteSettings,
} from "../../lib/db.js";

// ── Helper export Excel ───────────────────────────────────────
const exportCSV = (filename, headers, rows) => {
  exportExcel(filename.replace(".csv",""), [{ name: "Data", headers, rows }]);
};

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD ADMIN
// ─────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [stats,   setStats]   = useState({ aktif: 0, cuti: 0, nonaktif: 0, totalGuru: 0, sudahBayar: 0, belumBayar: 0, totalMasuk: 0, totalKeluar: 0, totalArtikel: 0 });
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSiswa(),
      getGuru(),
      supabase.from("spp_data").select("status"),
      supabase.from("pemasukan").select("nominal"),
      supabase.from("pengeluaran").select("nominal"),
      supabase.from("artikel").select("id"),
    ]).then(([siswa, guru, { data: spp }, { data: masuk }, { data: keluar }, { data: artikel }]) => {
      setSiswaList(siswa || []);
      setStats({
        aktif:       (siswa || []).filter(s => s.status === "Aktif").length,
        cuti:        (siswa || []).filter(s => s.status === "Cuti").length,
        nonaktif:    (siswa || []).filter(s => s.status === "Nonaktif").length,
        totalGuru:   (guru || []).length,
        sudahBayar:  (spp  || []).filter(s => s.status === "Lunas").length,
        belumBayar:  (spp  || []).filter(s => s.status === "Belum Bayar").length,
        totalMasuk:  (masuk  || []).reduce((a, b) => a + b.nominal, 0),
        totalKeluar: (keluar || []).reduce((a, b) => a + b.nominal, 0),
        totalArtikel:(artikel || []).length,
      });
    }).catch(e => console.error(e))
    .finally(() => setLoading(false));
  }, []);

  const saldo = stats.totalMasuk - stats.totalKeluar;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat dashboard...</div>;

  const dashCards = [
    { icon: "fa-graduation-cap",     label: "Siswa Aktif",       value: stats.aktif,                                              bgColor: "#eff6ff", textColor: "#2563eb" },
    { icon: "fa-chalkboard-user",    label: "Total Guru",        value: stats.totalGuru,                                          bgColor: "#f0fdf4", textColor: "#16a34a" },
    { icon: "fa-circle-check",       label: "SPP Sudah Bayar",   value: stats.sudahBayar + " tagihan",                            bgColor: "#f0fdf4", textColor: "#16a34a" },
    { icon: "fa-hourglass-half",     label: "SPP Belum Bayar",   value: stats.belumBayar + " tagihan",                            bgColor: "#fff7ed", textColor: "#ea580c" },
    { icon: "fa-wallet",             label: "Total Pemasukan",   value: "Rp " + stats.totalMasuk.toLocaleString("id-ID"),        bgColor: "#f0fdf4", textColor: "#16a34a" },
    { icon: "fa-arrow-trend-down",   label: "Total Pengeluaran", value: "Rp " + stats.totalKeluar.toLocaleString("id-ID"),       bgColor: "#fef2f2", textColor: "#dc2626" },
    { icon: "fa-building-columns",   label: "Saldo Saat Ini",    value: "Rp " + saldo.toLocaleString("id-ID"),                   bgColor: saldo >= 0 ? "#eff6ff" : "#fef2f2", textColor: saldo >= 0 ? "#2563eb" : "#dc2626" },
    { icon: "fa-newspaper",          label: "Total Artikel",     value: stats.totalArtikel,                                       bgColor: "#faf5ff", textColor: "#7c3aed" },
  ];

  return (
    <div className="fade-in">

      {/* ── Stat Cards — 4 kolom sejajar (2 baris × 4) ──── */}
      <div className="grid-4">
        {dashCards.map((c, i) => (
          <div key={i} style={{
            background: "#fff",
            borderRadius: 16,
            padding: "20px 22px",
            border: "1px solid #e8edf4",
            boxShadow: "0 2px 12px rgba(0,0,0,.04)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            transition: "transform .2s, box-shadow .2s",
            cursor: "default",
            position: "relative",
            overflow: "hidden",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,.04)"; }}
          >
            {/* decorative top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.textColor, borderRadius: "16px 16px 0 0", opacity: .5 }} />

            {/* text section */}
            <div>
              <p style={{ fontSize: ".72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".9px", marginBottom: 6 }}>
                {c.label}
              </p>
              <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: c.value.toString().length > 12 ? "1rem" : "1.35rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-.5px" }}>
                {c.value}
              </h3>
            </div>

            {/* icon section */}
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: c.bgColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <i className={`fa-solid ${c.icon}`} style={{ fontSize: 20, color: c.textColor }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table & Summary ─────────────────────────────── */}
      <div className="content-grid-2">
        <div className="table-card">
          <div className="table-head"><h3><i className="fa-solid fa-graduation-cap" style={{ marginRight: 8 }}></i> Siswa Terbaru</h3></div>
          <table>
            <thead><tr><th>Nama</th><th>Program</th><th>Status</th></tr></thead>
            <tbody>
              {siswaList.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.nama}</strong>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.sekolah}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {(s.programs || []).map((p, i) => (
                        <span key={i} className="badge blue" style={{ fontSize: ".68rem" }}>{p.nama}</span>
                      ))}
                    </div>
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

        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}><i className="fa-solid fa-chart-pie" style={{marginRight: 8, color: "var(--primary)"}}></i> Ringkasan</h3>
          {[
            { label: "Siswa Aktif",     val: stats.aktif,                                              color: "#2563eb" },
            { label: "Siswa Cuti",      val: stats.cuti,                                               color: "#d97706" },
            { label: "Siswa Nonaktif",  val: stats.nonaktif,                                           color: "#dc2626" },
            { label: "SPP Lunas",       val: stats.sudahBayar + " tagihan",                            color: "#16a34a" },
            { label: "SPP Belum Bayar", val: stats.belumBayar + " tagihan",                            color: "#dc2626" },
            { label: "Saldo Bersih",    val: "Rp " + saldo.toLocaleString("id-ID"),                    color: saldo >= 0 ? "#16a34a" : "#dc2626" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>{item.label}</span>
              <strong style={{ color: item.color, fontSize: ".88rem" }}>{item.val}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. DATA SISWA
// ─────────────────────────────────────────────────────────────
export function ManajemenSiswa() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [programs,  setPrograms]  = useState(PROGRAMS);
  const [search,    setSearch]    = useState("");
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [rincianId, setRincianId] = useState(null);
  const [saving,    setSaving]    = useState(false);

  const emptyForm = { nama: "", email: "", ttl: "", alamat: "", kontak: "", sekolah: "", programs: [], status: "Aktif" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    getSiswa()
      .then(setData)
      .catch(e => { console.error(e); setData(STUDENTS_DATA); })
      .finally(() => setLoading(false));
    getPrograms()
      .then(setPrograms)
      .catch(() => setPrograms(PROGRAMS));
  }, []);

  const filtered = data.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    (s.sekolah || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.programs || []).some(p => p.nama.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleEdit = (s) => {
    setForm({ ...s, programs: s.programs ? [...s.programs] : [] });
    setEditId(s.id);
    setShowForm(true);
    setRincianId(null);
  };

  // Toggle program di form
  const toggleProgram = (namaProg) => {
    const ada = form.programs.find(p => p.nama === namaProg);
    if (ada) {
      setForm({ ...form, programs: form.programs.filter(p => p.nama !== namaProg) });
    } else {
      setForm({ ...form, programs: [...form.programs, { nama: namaProg, spp: 0 }] });
    }
  };

  // Update nominal SPP per program
  const updateSpp = (namaProg, val) => {
    setForm({
      ...form,
      programs: form.programs.map(p =>
        p.nama === namaProg ? { ...p, spp: parseInt(val) || 0 } : p
      ),
    });
  };

  const totalSpp = form.programs.reduce((a, b) => a + (b.spp || 0), 0);

  const handleSave = async () => {
    if (!form.nama || !form.email) return toast.warning("Nama dan email wajib diisi!");
    if (form.programs.length === 0) return toast.warning("Pilih minimal 1 program!");
    setSaving(true);
    try {
      if (editId) {
        await updateSiswa(editId, form, form.programs);
        const fresh = await getSiswa();
        setData(fresh);
        toast.success(`Data ${form.nama} berhasil diperbarui!`);
      } else {
        await addSiswa(form, form.programs);
        const fresh = await getSiswa();
        setData(fresh);
        toast.success(`Siswa ${form.nama} berhasil ditambahkan!`);
      }
      resetForm();
    } catch (e) {
      toast.error("Gagal menyimpan: " + e.message);
    } finally { setSaving(false); }
  };

  const handleDeleteSiswa = async (id) => {
    const s = data.find(x => x.id === id);
    const ok = await confirm({
      title: "Hapus Siswa?",
      message: `Data "${s?.nama}" akan dihapus permanen beserta semua data programnya. Gunakan Edit untuk mengubah status (Nonaktif/Cuti).`,
      type: "danger",
      confirmText: "Ya, Hapus Permanen",
    });
    if (!ok) return;
    try {
      await deleteSiswa(id);
      setData(data.filter(x => x.id !== id));
      toast.success(`Siswa ${s?.nama} berhasil dihapus.`);
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  // ← Semua hooks harus sebelum early return
  const [rincianSPPData, setRincianSPPData] = useState([]);

  useEffect(() => {
    if (!rincianId) { setRincianSPPData([]); return; }
    supabase.from("spp_data").select("*").eq("siswa_id", rincianId).order("tahun").order("bulan")
      .then(({ data: spp }) => setRincianSPPData(spp || []));
  }, [rincianId]);

  const rincianSPP   = rincianSPPData;
  const siswaRincian = rincianId ? data.find(s => s.id === rincianId) : null;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Memuat data siswa...</div>;

  const handleExport = () => {
    exportCSV("data-siswa.csv",
      ["Nama", "Email", "TTL", "Alamat", "Kontak", "Sekolah", "Program", "Total SPP", "Status"],
      filtered.map(s => [
        s.nama, s.email, s.ttl, s.alamat, s.kontak, s.sekolah,
        (s.programs || []).map(p => p.nama).join("; "),
        s.total_spp, s.status,
      ])
    );
  };

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            <i className="fa-solid fa-file-excel" style={{ marginRight: 8 }}></i> Export Excel
          </button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }}
            onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i> Tambah Siswa
          </button>
        </div>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Siswa" : "Tambah Siswa Baru"}</h3>

          {/* Identitas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
            {[
              { label: "Nama Lengkap *", key: "nama",    ph: "Nama lengkap siswa" },
              { label: "Email *",        key: "email",   ph: "email@example.com", type: "email" },
              { label: "TTL",            key: "ttl",     ph: "Kota, DD MMM YYYY" },
              { label: "No. Telepon",    key: "kontak",  ph: "08xxxxxxxxxx" },
              { label: "Sekolah",        key: "sekolah", ph: "Nama sekolah" },
              { label: "Alamat",         key: "alamat",  ph: "Alamat lengkap" },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type || "text"} placeholder={f.ph}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Aktif", "Nonaktif", "Cuti"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Pilih Program + input SPP per program */}
          <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 10 }}>
              <i className="fa-solid fa-book-open" style={{ marginRight: 8 }}></i> Program yang Diikuti
            </div>

            {/* Toggle program */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {programs.map(p => {
                const active = form.programs.find(x => x.nama === p.nama);
                return (
                  <button key={p.id} onClick={() => toggleProgram(p.nama)}
                    style={{
                      padding: "6px 14px", borderRadius: 100, border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: ".8rem",
                      fontWeight: 700, transition: ".15s",
                      background: active ? "var(--blue)" : "#f1f5f9",
                      color: active ? "#fff" : "var(--muted)",
                    }}>
                    {active ? "✓ " : "+ "}{p.nama}
                  </button>
                );
              })}
            </div>

            {/* Input SPP per program yang dipilih */}
            {form.programs.length > 0 && (
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: 10 }}>
                  Input nominal SPP per program (bebas, bisa beda tiap siswa):
                </div>
                {form.programs.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ minWidth: 160, fontSize: ".85rem", fontWeight: 600 }}>{p.nama}</span>
                    <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Rp</span>
                    <input
                      type="number" min="0"
                      className="form-input"
                      style={{ maxWidth: 160 }}
                      value={p.spp}
                      placeholder="0"
                      onChange={e => updateSpp(p.nama, e.target.value)}
                    />
                  </div>
                ))}
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0 0", borderTop: "1px solid var(--border)",
                  fontWeight: 700, fontSize: ".92rem",
                }}>
                  <span>Total SPP/bulan</span>
                  <span style={{ color: "var(--blue)" }}>
                    Rp {totalSpp.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave} disabled={saving}>
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }}></i> {saving ? "Menyimpan..." : editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Modal rincian SPP */}
      {rincianId && siswaRincian && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
          zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
        }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3>Rincian SPP — {siswaRincian.nama}</h3>
              <button onClick={() => setRincianId(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>
            <DataTable
              data={rincianSPP}
              searchPlaceholder="Cari program atau bulan..."
              headers={["Bulan", "Tahun", "Program", "Nominal", "Tgl Bayar", "Status"]}
              emptyMessage="Belum ada data SPP"
              renderRow={(s, i) => [
                <span key="bln">{s.bulan}</span>,
                <span key="thn">{s.tahun}</span>,
                <span key="prog" className="badge blue" style={{ fontSize: ".72rem" }}>{s.program}</span>,
                <strong key="nom">Rp {s.nominal.toLocaleString("id-ID")}</strong>,
                <span key="tgl" style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</span>,
                <span key="stat" className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>{s.status}</span>
              ]}
            />
          </div>
        </div>
      )}

      <DataTable
        title={`Daftar Siswa (${data.length})`}
        data={data}
        searchPlaceholder="Cari nama, sekolah, atau program..."
        searchKeys={["nama", "email", "kontak", "sekolah", "alamat"]}
        headers={[
          { label: "Nama & Kontak", key: "nama" },
          "Alamat",
          "TTL",
          "Sekolah",
          "Program",
          { label: "Total SPP", key: "total_spp", align: "right" },
          "Status",
          { label: "Aksi", align: "center" }
        ]}
        renderRow={(s) => [
          <div key="info">
            <strong>{s.nama}</strong>
            <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{s.email}</div>
            <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{s.kontak}</div>
          </div>,
          <div key="alamat" style={{ fontSize: ".82rem", maxWidth: 200, whiteSpace: "normal" }}>{s.alamat || "-"}</div>,
          <span key="ttl" style={{ fontSize: ".8rem" }}>{s.ttl || "-"}</span>,
          <span key="sekolah" style={{ fontSize: ".82rem" }}>{s.sekolah || "-"}</span>,
          <div key="prog" style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(s.programs || []).map((p, i) => (
              <span key={i} className="badge blue" style={{ fontSize: ".7rem" }}>{p.nama}</span>
            ))}
          </div>,
          <strong key="spp" style={{ color: "var(--blue)" }}>Rp {(s.total_spp || 0).toLocaleString("id-ID")}</strong>,
          <span key="stat" className={`badge ${s.status === "Aktif" ? "green" : s.status === "Cuti" ? "yellow" : "red"}`}>{s.status}</span>,
          <div key="btns" className="action-btns" style={{ justifyContent: "center" }}>
            <button className="icon-btn edit" onClick={() => handleEdit(s)} title="Edit"><i className="fa-solid fa-pen-to-square"></i></button>
            <button onClick={() => { setRincianId(s.id); setShowForm(false); }}
              style={{ padding: "4px 8px", borderRadius: 7, border: "none", background: "#dcfce7", color: "#16a34a", cursor: "pointer", fontSize: ".72rem", fontWeight: 700 }}>
              SPP
            </button>
            <button className="icon-btn del" onClick={() => handleDeleteSiswa(s.id)} title="Hapus"><i className="fa-solid fa-trash-can"></i></button>
          </div>
        ]}
      />
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. DATA GURU
// ─────────────────────────────────────────────────────────────
export function ManajemenGuru() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [honorSettingLocal, setHonorSettingLocal] = useState(HONOR_SETTING);
  const emptyForm = { nama: "", ttl: "", alamat: "", email: "", kontak: "", status: "Aktif" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    getGuru()
      .then(setData)
      .catch(e => { console.error(e); setData(TEACHERS_DATA); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(g =>
    g.nama.toLowerCase().includes(search.toLowerCase()) ||
    (g.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleEdit = (g) => {
    setForm({ nama: g.nama, ttl: g.ttl || "", alamat: g.alamat || "", email: g.email || "", kontak: g.kontak || "", status: g.status });
    setEditId(g.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nama) return toast.warning("Nama wajib diisi!");
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateGuru(editId, form);
        setData(data.map(g => g.id === editId ? { ...g, ...updated } : g));
        toast.success(`Data ${form.nama} berhasil diperbarui!`);
      } else {
        const newGuru = await addGuru(form);
        setData([...data, newGuru]);
        toast.success(`Guru ${form.nama} berhasil ditambahkan!`);
      }
      resetForm();
    } catch (e) {
      toast.error("Gagal menyimpan: " + e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, nama) => {
    const ok = await confirm({
      title: "Hapus Guru?",
      message: `Data guru "${nama}" akan dihapus permanen dan tidak bisa dikembalikan.`,
      type: "danger",
      confirmText: "Ya, Hapus",
    });
    if (!ok) return;
    try {
      await deleteGuru(id);
      setData(data.filter(g => g.id !== id));
      toast.success(`Guru ${nama} berhasil dihapus.`);
    } catch (e) { toast.error("Gagal menghapus: " + e.message); }
  };

  const handleExport = () => {
    exportCSV("data-guru.csv",
      ["Nama", "TTL", "Alamat", "Email", "No HP", "Status"],
      filtered.map(g => [g.nama, g.ttl || "-", g.alamat || "-", g.email || "-", g.kontak || "-", g.status])
    );
    toast.info("File Excel sedang diunduh...");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Memuat data guru...</div>;

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "7px 12px", fontSize: ".78rem" }} onClick={handleExport}>
            <i className="fa-solid fa-file-excel" style={{ marginRight: 6 }}></i> Export Excel
          </button>
          <button className="btn-primary" style={{ padding: "7px 12px", fontSize: ".78rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <i className="fa-solid fa-plus" style={{ marginRight: 6 }}></i> Tambah Guru
          </button>
        </div>
      </div>

      {/* Form — identitas guru saja */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Data Guru" : "Tambah Guru Baru"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
            {[
              { label: "Nama Lengkap *", key: "nama",   ph: "Nama lengkap guru" },
              { label: "TTL",            key: "ttl",    ph: "Kota, DD MMM YYYY" },
              { label: "Alamat",         key: "alamat", ph: "Alamat lengkap" },
              { label: "Email *",        key: "email",  ph: "email@al-adzkiya.com", type: "email" },
              { label: "No. HP",         key: "kontak", ph: "08xxxxxxxxxx" },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type || "text"} placeholder={f.ph}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Aktif", "Nonaktif"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Program yang diajar */}
          {editId && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 10 }}>
                <i className="fa-solid fa-book-open" style={{ marginRight: 8 }}></i> Program yang Diajar
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                {PROGRAMS.map(p => {
                  const sudahAda = honorSettingLocal.find(h => h.guru_id === editId && h.program === p.nama);
                  return (
                    <button key={p.id} onClick={() => {
                      if (sudahAda) {
                        setHonorSettingLocal(prev => prev.filter(h => !(h.guru_id === editId && h.program === p.nama)));
                      } else {
                        setHonorSettingLocal(prev => [...prev, { id: Date.now() + p.id, guru_id: editId, guru_nama: form.nama, program: p.nama, honor_per_siswa: 0 }]);
                      }
                    }}
                    style={{
                      padding: "6px 14px", borderRadius: 100, border: "none",
                      cursor: "pointer", fontFamily: "inherit", fontSize: ".78rem",
                      fontWeight: 700, transition: ".15s",
                      background: sudahAda ? "var(--blue)" : "#f1f5f9",
                      color: sudahAda ? "#fff" : "var(--muted)",
                    }}>
                      {sudahAda ? "✓ " : "+ "}{p.nama}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: ".75rem", color: "var(--muted)" }}>
                Nominal honor/siswa diatur di menu <strong>Setting Honor Guru</strong>.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave} disabled={saving}>
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }}></i> {saving ? "Menyimpan..." : editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <DataTable
        title={`Daftar Guru / Tentor (${data.length})`}
        data={data}
        searchPlaceholder="Cari nama atau email..."
        searchKeys={["nama", "email", "kontak", "alamat"]}
        headers={[
          "Nama",
          "TTL",
          "Alamat",
          "No. HP",
          "Status",
          { label: "Aksi", align: "center" }
        ]}
        renderRow={(g) => [
          <div key="info">
            <strong>{g.nama}</strong>
            <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{g.email}</div>
          </div>,
          <span key="ttl" style={{ fontSize: ".82rem" }}>{g.ttl || "-"}</span>,
          <div key="alamat" style={{ fontSize: ".82rem", maxWidth: 200, whiteSpace: "normal" }}>{g.alamat || "-"}</div>,
          <span key="kontak" style={{ fontSize: ".82rem" }}>{g.kontak}</span>,
          <span key="stat" className={`badge ${g.status === "Aktif" ? "green" : "red"}`}>{g.status}</span>,
          <div key="btns" className="action-btns" style={{ justifyContent: "center" }}>
            <button className="icon-btn edit" onClick={() => handleEdit(g)}><i className="fa-solid fa-pen-to-square"></i></button>
            <button className="icon-btn del" onClick={() => handleDelete(g.id, g.nama)}><i className="fa-solid fa-trash-can"></i></button>
          </div>
        ]}
      />
      <ConfirmDialog />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Rich Text Editor Toolbar component
// ─────────────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const ref = React.useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync value ke DOM hanya sekali saat mount atau saat editId berubah
  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, []);  // eslint-disable-line

  const exec = (cmd, val = null) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML || "");
  };

  const ToolBtn = ({ cmd, val, title, children, active }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
      style={{
        padding: "4px 8px", border: "none", borderRadius: 6, cursor: "pointer",
        fontFamily: "inherit", fontSize: ".82rem", fontWeight: 600,
        background: active ? "#dbeafe" : "#f1f5f9",
        color: active ? "var(--blue)" : "var(--text)",
        minWidth: 32,
      }}
    >{children}</button>
  );

  return (
    <div style={{ border: `1.5px solid ${isFocused ? "var(--blue)" : "var(--border)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color .15s" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", gap: 4, padding: "8px 10px", flexWrap: "wrap", borderBottom: "1px solid var(--border)", background: "#f8fafc" }}>
        <ToolBtn cmd="bold"          title="Bold (Ctrl+B)"><b>B</b></ToolBtn>
        <ToolBtn cmd="italic"        title="Italic (Ctrl+I)"><i>I</i></ToolBtn>
        <ToolBtn cmd="underline"     title="Underline (Ctrl+U)"><u>U</u></ToolBtn>
        <ToolBtn cmd="strikeThrough" title="Strikethrough"><s>S</s></ToolBtn>
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn cmd="formatBlock" val="h2"  title="Heading 2"><span style={{ fontSize: ".78rem" }}>H2</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="h3"  title="Heading 3"><span style={{ fontSize: ".78rem" }}>H3</span></ToolBtn>
        <ToolBtn cmd="formatBlock" val="p"   title="Paragraf"><span style={{ fontSize: ".78rem" }}>¶</span></ToolBtn>
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn cmd="insertUnorderedList" title="Bullet list">• —</ToolBtn>
        <ToolBtn cmd="insertOrderedList"   title="Numbered list">1.</ToolBtn>
        <ToolBtn cmd="indent"  title="Indent">→</ToolBtn>
        <ToolBtn cmd="outdent" title="Outdent">←</ToolBtn>
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn cmd="justifyLeft"   title="Rata kiri"><i className="fa-solid fa-align-left"></i></ToolBtn>
        <ToolBtn cmd="justifyCenter" title="Rata tengah"><i className="fa-solid fa-align-center"></i></ToolBtn>
        <ToolBtn cmd="justifyRight"  title="Rata kanan"><i className="fa-solid fa-align-right"></i></ToolBtn>
        <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        <ToolBtn cmd="removeFormat" title="Hapus format"><i className="fa-solid fa-eraser"></i></ToolBtn>
      </div>
      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: 220, padding: "14px 16px", outline: "none",
          fontSize: ".92rem", lineHeight: 1.75, color: "var(--text)",
          fontFamily: "inherit",
        }}
        data-placeholder="Tulis isi artikel di sini..."
      />
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] h2 { font-size: 1.3rem; font-weight: 700; margin: 12px 0 6px; }
        [contenteditable] h3 { font-size: 1.05rem; font-weight: 700; margin: 10px 0 4px; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 20px; margin: 6px 0; }
        [contenteditable] li { margin-bottom: 3px; }
        [contenteditable] p  { margin: 4px 0; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. MANAJEMEN ARTIKEL
// ─────────────────────────────────────────────────────────────
export function ManajemenArtikel({ onDetail }) {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [dataArtikel, setDataArtikel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", content: "", category: "Tips Belajar", img: "", author: "Admin", video_url: "", excerpt: "" });
  const [search, setSearch] = useState("");
  const [kategoriList, setKategoriList] = useState(["Tips Belajar", "Informasi", "Pengumuman", "Kegiatan"]);
  const [showAddKat, setShowAddKat] = useState(false);
  const [newKat, setNewKat] = useState("");

  useEffect(() => {
    getArtikel()
      .then(setDataArtikel)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ title: "", summary: "", content: "", category: "Tips Belajar", img: "", author: "Admin", video_url: "", excerpt: "" }); setEditId(null); setShowForm(false); };

  const tambahKategori = () => {
    if (!newKat.trim()) return;
    if (kategoriList.includes(newKat.trim())) return toast.warning("Kategori sudah ada");
    setKategoriList([...kategoriList, newKat.trim()]);
    setForm({ ...form, category: newKat.trim() });
    setNewKat("");
    setShowAddKat(false);
    toast.success("Kategori ditambahkan");
  };

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.warning("Judul dan isi artikel wajib diisi!");
    setSaving(true);
    try {
      // Fix HTTP 400: Supabase schema uses English columns (title, excerpt, img, category, etc)
      const dbData = { 
        title: form.title, 
        excerpt: form.excerpt || form.summary, 
        content: form.content, 
        category: form.category, 
        img: form.img, 
        author: form.author,
        video_url: form.video_url
      };
      if (editId) {
        await updateArtikel(editId, dbData);
        setDataArtikel(dataArtikel.map(a => a.id === editId ? { ...a, ...dbData } : a));
        toast.success("Artikel berhasil diperbarui!");
      } else {
        const res = await addArtikel(dbData);
        setDataArtikel([res, ...dataArtikel]);
        toast.success("Artikel berhasil diterbitkan!");
      }
      resetForm();
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, judul) => {
    const ok = await confirm({
      title: "Hapus Artikel?",
      message: `Artikel "${judul}" akan dihapus permanen.`,
      type: "danger",
    });
    if (!ok) return;
    try {
      await deleteArtikel(id);
      setDataArtikel(dataArtikel.filter(a => a.id !== id));
      toast.success("Artikel berhasil dihapus.");
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  const filtered = dataArtikel.filter(a => (a.judul || a.title || "").toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>Memuat artikel...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20, gap: 10, flexWrap: "wrap" }}>
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i> Tulis Artikel Baru
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Artikel" : "Buat Artikel Baru"}</h3>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Judul */}
            <div className="form-group">
              <label className="form-label">Judul *</label>
              <input className="form-input" value={form.title || ""}
                onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul artikel..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
              {/* Kategori + tambah */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                  Kategori
                  <button onClick={() => setShowAddKat(!showAddKat)}
                    style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: ".75rem", fontWeight: 600, fontFamily: "inherit" }}>
                    + Kategori baru
                  </button>
                </label>
                {showAddKat && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input className="form-input" placeholder="Nama kategori..." value={newKat}
                      onChange={e => setNewKat(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && tambahKategori()} />
                    <button className="btn-primary" style={{ padding: "6px 12px", fontSize: ".8rem", whiteSpace: "nowrap" }}
                      onClick={tambahKategori}>Tambah</button>
                  </div>
                )}
                <select className="form-input" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  {kategoriList.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              {/* Emoji/Gambar */}
              <div className="form-group">
                <label className="form-label">Emoji / Gambar</label>
                <input className="form-input" value={form.img}
                  onChange={e => setForm({ ...form, img: e.target.value })} placeholder="fa-solid fa-newspaper atau https://..." />
              </div>
              {/* Penulis */}
              <div className="form-group">
                <label className="form-label">Penulis</label>
                <input className="form-input" value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })} />
              </div>
            </div>

            {/* Video */}
            <div className="form-group">
              <label className="form-label">Link Video (opsional)</label>
              <input className="form-input" value={form.video_url}
                onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/..." />
            </div>

            {/* Ringkasan */}
            <div className="form-group">
              <label className="form-label">Ringkasan (opsional — auto dari isi jika kosong)</label>
              <input className="form-input" value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat..." />
            </div>

            {/* Rich text editor */}
            <div className="form-group">
              <label className="form-label">Isi Artikel *</label>
              <RichEditor
                key={editId || "new"}           // re-mount saat ganti artikel
                value={form.content}
                onChange={val => setForm(f => ({ ...f, content: val }))}
              />
              <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>
                Gunakan toolbar di atas untuk format teks (bold, heading, list, dll)
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave} disabled={saving}>
              <><i className="fa-solid fa-paper-plane" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : editId ? "Update" : "Publikasikan"}</>
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <DataTable
        title={`Daftar Artikel (${dataArtikel.length})`}
        data={dataArtikel}
        searchPlaceholder="Cari judul atau isi artikel..."
        searchKeys={["title", "judul", "content", "konten", "category", "kategori"]}
        headers={[
          "Judul Artikel",
          "Kategori",
          "Tanggal",
          { label: "Aksi", align: "right" }
        ]}
        renderRow={(a) => [
          <div key="info">
            <div style={{ fontWeight: 600, color: "var(--blue)" }}>{a.judul || a.title}</div>
            <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>{(a.ringkasan || a.excerpt)?.slice(0, 60)}...</div>
          </div>,
          <span key="kat" className="badge blue">{a.kategori || a.category}</span>,
          <span key="date" style={{ fontSize: ".82rem", color: "var(--muted)" }}>
            {new Date(a.created_at || a.date || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>,
          <div key="btns" className="action-btns" style={{ justifyContent: "flex-end" }}>
            <button className="icon-btn edit" onClick={() => { 
              setForm({ 
                title: a.judul || a.title || "", 
                summary: a.ringkasan || a.excerpt || "", 
                content: a.konten || a.content || "", 
                category: a.kategori || a.category || "Tips Belajar", 
                img: a.gambar || a.img || "", 
                author: a.penulis || a.author || "Admin", 
                video_url: a.video_url || "", 
                excerpt: a.ringkasan || a.excerpt || "" 
              }); 
              setEditId(a.id); 
              setShowForm(true); 
              window.scrollTo(0, 0); 
            }} title="Edit Artikel">
              <i className="fa-solid fa-pen-to-square"></i>
            </button>
            <button className="icon-btn del" onClick={() => handleDelete(a.id, a.judul || a.title)} title="Hapus Artikel">
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        ]}
      />
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. MANAJEMEN USER
// ─────────────────────────────────────────────────────────────
export function ManajemenUser() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [users,      setUsers]      = useState([]);
  const [guruData,   setGuruData]   = useState([]);
  const [siswaData,  setSiswaData]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [noAdminKey, setNoAdminKey] = useState(false);
  const [showPwd,    setShowPwd]    = useState(false);
  const [programList, setProgramList] = useState([]);

  const emptyForm = {
    nama: "", email: "", password: "", role: "siswa",
    kontak: "", ttl: "", alamat: "", sekolah: "",
    programs: [],
  };
  const [form, setForm] = useState(emptyForm);

  const loadAll = async () => {
    const [{ data: prof }, guru, siswa] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      getGuru(),
      getSiswa(),
    ]);
    setUsers(prof || []);
    setGuruData(guru || []);
    setSiswaData(siswa || []);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadAll(), getPrograms().then(setProgramList).catch(() => {})])
      .finally(() => setLoading(false));
  }, []);

  const roleColors = { admin: "purple", guru: "yellow", siswa: "green" };

  // Gabungkan info dari profiles + guru/siswa
  const enrichedUsers = users.map(u => {
    const guruRow  = guruData.find(g => g.user_id === u.id || g.email === u.email);
    const siswaRow = siswaData.find(s => s.user_id === u.id || s.email === u.email);
    const detail   = guruRow || siswaRow || {};
    return {
      ...u,
      email:  detail.email  || u.email  || "-",
      kontak: detail.kontak || "-",
      ttl:    detail.ttl    || "-",
      _guruId:  guruRow?.id,
      _siswaId: siswaRow?.id,
    };
  });

  const filtered = enrichedUsers.filter(u =>
    (u.nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); setShowPwd(false); };

  const openEdit = (u) => {
    setEditId(u.id);
    setForm({ ...emptyForm, nama: u.nama || "", email: u.email === "-" ? "" : u.email || "", role: u.role, kontak: u.kontak === "-" ? "" : u.kontak || "" });
    setShowPwd(false);
    setShowForm(true);
  };

  const handleAdd = async () => {
    if (!form.nama || !form.email || !form.password) return toast.warning("Nama, email, dan password wajib diisi!");
    if (form.password.length < 6) return toast.warning("Password minimal 6 karakter!");
    
    setSaving(true);
    try {
      // Panggil Edge Function via registerUser (auth.js)
      const newUser = await registerUser(form.email, form.password, form.role, form.nama);
      const userId = newUser?.id;
      if (!userId) throw new Error("Gagal mendaftarkan user via server.");

      // 2. Upsert ke profiles
      await supabase.from("profiles").upsert({ id: userId, nama: form.nama, role: form.role }, { onConflict: "id" });

      // 3. Otomatis buat di tabel guru/siswa sesuai role
      if (form.role === "guru") {
        const { data: existing } = await supabase.from("guru").select("id").eq("user_id", userId).maybeSingle();
        if (!existing) {
          await supabase.from("guru").insert({
            user_id: userId, nama: form.nama, email: form.email,
            kontak: form.kontak || "", ttl: form.ttl || "", alamat: form.alamat || "",
            status: "Aktif",
          });
        }
      } else if (form.role === "siswa") {
        const { data: existing } = await supabase.from("siswa").select("id").eq("user_id", userId).maybeSingle();
        if (!existing) {
          // Pakai addSiswa() agar SPP bulan ini otomatis terbuat (status Lunas)
          const siswaData = {
            user_id: userId, nama: form.nama, email: form.email,
            kontak: form.kontak || "", ttl: form.ttl || "",
            alamat: form.alamat || "", sekolah: form.sekolah || "",
            status: "Aktif",
          };
          // form.programs berisi program yang dipilih (jika ada), fallback array kosong
          const programs = form.programs || [];
          if (programs.length > 0) {
            await addSiswa(siswaData, programs);
          } else {
            // Tidak ada program dipilih — insert biasa tanpa SPP
            await supabase.from("siswa").insert(siswaData);
          }
        }
      }

      await loadAll();
      resetForm();
      toast.success(`✅ User ${form.nama} (${form.role}) berhasil dibuat dan langsung bisa login!`);
    } catch (e) {
      const msg = e.message?.toLowerCase() || "";
      if (msg.includes("already") || msg.includes("registered")) {
        toast.warning(`Email "${form.email}" sudah terdaftar. Gunakan email lain.`);
      } else {
        toast.error("Gagal tambah user: " + e.message);
      }
    } finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!editId || !form.nama) return toast.warning("Nama wajib diisi!");
    if (showPwd && form.password && form.password.length < 6) return toast.warning("Password minimal 6 karakter!");
    setSaving(true);
    try {
      // Update profiles
      await supabase.from("profiles").update({ nama: form.nama, role: form.role }).eq("id", editId);

      // Update tabel guru/siswa kalau ada
      const u = enrichedUsers.find(x => x.id === editId);
      if (u?._guruId) {
        await supabase.from("guru").update({ nama: form.nama, email: form.email, kontak: form.kontak }).eq("id", u._guruId);
      }
      if (u?._siswaId) {
        await supabase.from("siswa").update({ nama: form.nama, email: form.email, kontak: form.kontak }).eq("id", u._siswaId);
      }

      // Note: Ganti password oleh admin membutuhkan Edge Function (registerUser action update)
      
      await loadAll();
      resetForm();
      toast.success("User berhasil diperbarui!");
    } catch (e) { 
      toast.error("Gagal update: " + e.message); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (u) => {
    const ok = await confirm({
      title: "Hapus User?",
      message: `User "${u.nama}" akan dihapus permanen. Data absensi/SPP tetap tersimpan.`,
      type: "danger", confirmText: "Ya, Hapus",
    });
    if (!ok) return;
    try {
      // Hapus profile (tabel profiles). User Auth tetap ada di database Auth 
      // kecuali dihapus via Edge Function.
      await supabase.from("profiles").delete().eq("id", u.id);
      
      setUsers(users.filter(x => x.id !== u.id));
      toast.success("User berhasil dihapus dari sistem.");
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data user...</div>;

  return (
    <div className="fade-in">
      {noAdminKey && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 18px", marginBottom: 20, fontSize: ".83rem", lineHeight: 1.7 }}>
          <strong style={{ color: "#c2410c" }}><i className="fa-solid fa-triangle-exclamation" style={{marginRight: 6}}></i> Service Role Key belum dikonfigurasi</strong><br />
          <span style={{ color: "#9a3412" }}>
            Tambahkan ke file <code>.env</code>: <code style={{ background: "#fef3c7", padding: "2px 6px", borderRadius: 4 }}>VITE_SUPABASE_SERVICE_ROLE_KEY=eyJ...</code><br />
            Ambil dari: Supabase Dashboard → Settings → API → <strong>service_role</strong>
          </span>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>{showForm && !editId ? "Tutup" : "Tambah User"}
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 16 }}>{editId ? "Edit User" : "Tambah User Baru"}</h3>

          {/* Baris 1: Identitas akun */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nama Lengkap *</label>
              <input className="form-input" placeholder="Nama lengkap"
                value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="email@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-input" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}>
                {["admin", "guru", "siswa"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            {!editId && (
              <div className="form-group">
                <label className="form-label">Password * (min. 6 karakter)</label>
                <div style={{ position: "relative" }}>
                  <input className="form-input" type={showPwd ? "text" : "password"} placeholder="Password awal"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
                    style={{ paddingRight: 40 }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                    <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Baris 2: Data tambahan (muncul jika role guru/siswa) */}
          {(form.role === "guru" || form.role === "siswa") && (
            <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--muted)", marginBottom: 10 }}>
                <i className="fa-regular fa-clipboard" style={{marginRight: 6}}></i> Data {form.role === "guru" ? "Guru" : "Siswa"} (akan otomatis tersimpan di Data {form.role === "guru" ? "Guru" : "Siswa"})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">No. HP</label>
                  <input className="form-input" placeholder="08xxxxxxxxxx"
                    value={form.kontak} onChange={e => setForm({ ...form, kontak: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">TTL</label>
                  <input className="form-input" placeholder="Kota, DD MMM YYYY"
                    value={form.ttl} onChange={e => setForm({ ...form, ttl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Alamat</label>
                  <input className="form-input" placeholder="Alamat lengkap"
                    value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
                </div>
                {form.role === "siswa" && (
                  <div className="form-group">
                    <label className="form-label">Sekolah</label>
                    <input className="form-input" placeholder="Nama sekolah"
                      value={form.sekolah} onChange={e => setForm({ ...form, sekolah: e.target.value })} />
                  </div>
                )}
              </div>
              {/* Pilih program untuk siswa */}
              {form.role === "siswa" && programList.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: ".82rem", fontWeight: 700, color: "var(--muted)", marginBottom: 8 }}>
                    <i className="fa-solid fa-book-open" style={{marginRight: 6}}></i> Program (opsional — bisa diisi nanti di Data Siswa)
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {programList.map(p => {
                      const active = (form.programs || []).find(x => x.nama === p.nama);
                      return (
                        <button key={p.id} type="button"
                          onClick={() => {
                            const cur = form.programs || [];
                            const updated = active
                              ? cur.filter(x => x.nama !== p.nama)
                              : [...cur, { nama: p.nama, spp: p.spp || 0 }];
                            setForm({ ...form, programs: updated });
                          }}
                          style={{
                            padding: "5px 12px", borderRadius: 100, border: "none",
                            cursor: "pointer", fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700,
                            background: active ? "var(--blue)" : "#f1f5f9",
                            color: active ? "#fff" : "var(--muted)",
                          }}>
                          {active ? "✓ " : "+ "}{p.nama}
                        </button>
                      );
                    })}
                  </div>
                  {(form.programs || []).length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {(form.programs || []).map((p, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: ".83rem", minWidth: 160, fontWeight: 600 }}>{p.nama}</span>
                          <span style={{ fontSize: ".8rem", color: "var(--muted)" }}>SPP Rp</span>
                          <input type="number" min="0" className="form-input" style={{ maxWidth: 140 }}
                            value={p.spp}
                            onChange={e => {
                              const updated = (form.programs || []).map((x, j) =>
                                j === i ? { ...x, spp: parseInt(e.target.value) || 0 } : x
                              );
                              setForm({ ...form, programs: updated });
                            }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* Ganti password saat edit */}
          {editId && (
            <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
              <button onClick={() => setShowPwd(!showPwd)}
                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: ".83rem", fontWeight: 600, fontFamily: "inherit", padding: 0 }}>
                {showPwd ? <><i className="fa-solid fa-chevron-up" style={{marginRight: 6}}></i>Tutup ganti password</> : <><i className="fa-solid fa-key" style={{marginRight: 6}}></i>Ganti Password</>}
              </button>
              {showPwd && (
                <div className="form-group" style={{ marginTop: 10, maxWidth: 280 }}>
                  <label className="form-label">Password Baru (min. 6 karakter)</label>
                  <div style={{ position: "relative" }}>
                    <input className="form-input" type={showPwd ? "text" : "password"} placeholder="Password baru"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} 
                      style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                      <i className={`fa-solid ${showPwd ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" style={{ padding: "10px 20px", fontSize: ".85rem" }}
              onClick={editId ? handleUpdate : handleAdd} disabled={saving}>
              <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : editId ? "Update" : "Simpan & Buat Akun"}</>
            </button>
            <button className="btn-outline" style={{ padding: "10px 20px", fontSize: ".85rem" }}
              onClick={resetForm}>Batal</button>
          </div>
          {!editId && (
            <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 8 }}>
              <i className="fa-solid fa-lightbulb" style={{color: "#eab308", marginRight: 6}}></i> Akun langsung aktif. Untuk role guru/siswa, data juga otomatis masuk ke menu Data Guru / Data Siswa.
            </p>
          )}
        </div>
      )}

      <DataTable
        title={`Semua Pengguna (${users.length})`}
        data={enrichedUsers}
        searchPlaceholder="Cari nama, email, atau role..."
        searchKeys={["nama", "email", "role"]}
        headers={[
          "Nama",
          "Role",
          "User ID",
          { label: "Aksi", align: "center" }
        ]}
        renderRow={(u) => [
          <strong key="nama">{u.nama || "-"}</strong>,
          <span key="role" className={`badge ${roleColors[u.role] || "blue"}`}>{u.role}</span>,
          <span key="uid" style={{ fontSize: ".72rem", color: "var(--muted)", fontFamily: "monospace" }}>{u.id?.slice(0, 8)}...</span>,
          <div key="btns" className="action-btns" style={{ justifyContent: "center" }}>
            <button className="icon-btn edit" onClick={() => openEdit(u)} title="Edit"><i className="fa-solid fa-pen-to-square"></i></button>
            <button className="icon-btn del"  onClick={() => handleDelete(u)} title="Hapus"><i className="fa-solid fa-trash-can"></i></button>
          </div>
        ]}
      />
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. SETTING HONOR GURU
// Admin setting honor per program per guru
// ─────────────────────────────────────────────────────────────
export function SettingHonor() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [guruList,        setGuruList]        = useState([]);
  const [honorSetting,    setHonorSetting]    = useState([]);
  const [komponenSetting, setKomponenSetting] = useState([]);
  const [activeGuru,      setActiveGuru]      = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [showHonorForm,    setShowHonorForm]    = useState(false);
  const [showKomponenForm, setShowKomponenForm] = useState(false);
  const [editHonorId,     setEditHonorId]     = useState(null);
  const [editKomponenId,  setEditKomponenId]  = useState(null);
  const [honorForm,    setHonorForm]    = useState({ program: "", honor_per_siswa: 0 });
  const [komponenForm, setKomponenForm] = useState({ nama: "", nominal_default: 0, aktif: true });
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    Promise.all([getGuru(), getHonorSetting(), getPrograms()])
      .then(([guru, honor, prog]) => {
        setGuruList(guru || []);
        setHonorSetting(honor || []);
        setPrograms(prog || []);
        if (guru?.length > 0) setActiveGuru(guru[0].id);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));

    // Load komponen honor setting
    supabase.from("komponen_honor_setting").select("*")
      .then(({ data }) => setKomponenSetting(data || []));
  }, []);

  const guru       = guruList.find(g => g.id === activeGuru);
  const myHonor    = honorSetting.filter(h => h.guru_id === activeGuru);
  const myKomponen = komponenSetting.filter(k => k.guru_id === activeGuru);

  // ── Honor per Program ──────────────────────────────────────
  const resetHonorForm = () => { setHonorForm({ program: "", honor_per_siswa: 0 }); setEditHonorId(null); setShowHonorForm(false); };

  const handleEditHonor = (item) => {
    setHonorForm({ program: item.program, honor_per_siswa: item.honor_per_siswa });
    setEditHonorId(item.id); setShowHonorForm(true); setShowKomponenForm(false);
  };

  const handleSaveHonor = async () => {
    if (!honorForm.program) return toast.warning("Program wajib diisi!");
    
    // Validasi Duplikat Program
    if (!editHonorId && honorSetting.some(h => h && h.guru_id === activeGuru && h.program === honorForm.program)) {
      return toast.warning(`Program ${honorForm.program} sudah disetting untuk guru ini!`);
    }

    try {
      if (editHonorId) {
        const { error } = await supabase.from("honor_setting").update({
          program: honorForm.program,
          honor_per_siswa: parseInt(honorForm.honor_per_siswa),
        }).eq("id", editHonorId);
        if (error) throw error;
        setHonorSetting(honorSetting.map(h => h.id === editHonorId ? { ...h, ...honorForm, honor_per_siswa: parseInt(honorForm.honor_per_siswa) } : h));
      } else {
        const { data, error } = await supabase.from("honor_setting").insert({
          guru_id: activeGuru,
          program: honorForm.program,
          honor_per_siswa: parseInt(honorForm.honor_per_siswa),
          aktif: true,
        }).select().single();
        if (error) throw error;
        setHonorSetting([...honorSetting, data]);
      }
      resetHonorForm();
      toast.success("Setting honor program berhasil disimpan!");
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
  };

  // ── Komponen Tetap ─────────────────────────────────────────
  const resetKomponenForm = () => { setKomponenForm({ nama: "", nominal_default: 0, aktif: true }); setEditKomponenId(null); setShowKomponenForm(false); };

  const handleEditKomponen = (item) => {
    setKomponenForm({ nama: item.nama, nominal_default: item.nominal_default, aktif: item.aktif });
    setEditKomponenId(item.id); setShowKomponenForm(true); setShowHonorForm(false);
  };

  const handleSaveKomponen = async () => {
    if (!komponenForm.nama) return toast.warning("Nama komponen wajib diisi!");
    try {
      if (editKomponenId) {
        const { error } = await supabase.from("komponen_honor_setting").update({
          ...komponenForm, nominal_default: parseInt(komponenForm.nominal_default),
        }).eq("id", editKomponenId);
        if (error) throw error;
        setKomponenSetting(komponenSetting.map(k => k.id === editKomponenId ? { ...k, ...komponenForm, nominal_default: parseInt(komponenForm.nominal_default) } : k));
      } else {
        const { data, error } = await supabase.from("komponen_honor_setting").insert({
          guru_id: activeGuru, ...komponenForm, nominal_default: parseInt(komponenForm.nominal_default),
        }).select().single();
        if (error) throw error;
        setKomponenSetting([...komponenSetting, data]);
      }
      resetKomponenForm();
      toast.success("Komponen honor berhasil disimpan!");
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
  };

  const toggleAktif = async (id) => {
    const k = komponenSetting.find(x => x.id === id);
    await supabase.from("komponen_honor_setting").update({ aktif: !k.aktif }).eq("id", id);
    setKomponenSetting(komponenSetting.map(x => x.id === id ? { ...x, aktif: !x.aktif } : x));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat setting honor...</div>;

  return (
    <div className="fade-in">
      {/* Pilih guru */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {guruList.map(g => (
          <button key={g.id} onClick={() => { setActiveGuru(g.id); resetHonorForm(); resetKomponenForm(); }}
            style={{
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: ".85rem", fontWeight: 600, transition: ".2s",
              background: activeGuru === g.id ? "var(--blue)" : "#f1f5f9",
              color: activeGuru === g.id ? "#fff" : "var(--muted)",
              boxShadow: activeGuru === g.id ? "0 4px 12px rgba(37,99,235,.3)" : "none",
            }}>
            {g.nama}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>

        {/* ── Bagian 1: Honor per Program ───────────────────── */}
        <div>
          <div className="table-card">
            <div className="table-head">
              <h3><i className="fa-solid fa-book" style={{marginRight: 8}}></i> Honor per Program</h3>
              <button className="btn-primary" style={{ padding: "7px 12px", fontSize: ".78rem" }}
                onClick={() => { setShowHonorForm(!showHonorForm); setEditHonorId(null); setHonorForm({ program: "", honor_per_siswa: 0 }); setShowKomponenForm(false); }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>Tambah
              </button>
            </div>

            {/* Form honor program */}
            {showHonorForm && (
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "#f8fafc" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Program *</label>
                    <select className="form-input" value={honorForm.program}
                      onChange={e => setHonorForm({ ...honorForm, program: e.target.value })}>
                      <option value="">-- Pilih Program --</option>
                      {programs.map(p => <option key={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Honor/Siswa (Rp) *</label>
                    <input className="form-input" type="number" min="0"
                      value={honorForm.honor_per_siswa}
                      onChange={e => setHonorForm({ ...honorForm, honor_per_siswa: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={handleSaveHonor}>
                    <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {editHonorId ? "Update" : "Simpan"}</>
                  </button>
                  <button className="btn-outline" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={resetHonorForm}>Batal</button>
                </div>
              </div>
            )}

            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>PROGRAM</th>
                    <th>HONOR/SISWA</th>
                    <th style={{ textAlign: "right" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {myHonor.map(h => (
                    <tr key={h.id}>
                      <td><strong>{h.program}</strong></td>
                      <td><strong style={{ color: "var(--blue)" }}>Rp {h.honor_per_siswa.toLocaleString("id-ID")}</strong></td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                          <button className="icon-btn edit" onClick={() => handleEditHonor(h)}><i className="fa-solid fa-pen-to-square"></i></button>
                          <button className="icon-btn del"
                            onClick={async () => {
                              const ok = await confirm({ title: "Hapus Setting?", message: `Hapus program honor ${h.program}?`, type: "danger" });
                              if (!ok) return;
                              await supabase.from("honor_setting").delete().eq("id", h.id);
                              setHonorSetting(honorSetting.filter(x => x.id !== h.id));
                            }}>
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myHonor.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>Belum ada data honor per program</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Bagian 2: Komponen Tetap ──────────────────────── */}
        <div>
          <div className="table-card">
            <div className="table-head">
              <h3><i className="fa-solid fa-sack-dollar" style={{marginRight: 8}}></i> Komponen Tetap</h3>
              <button className="btn-primary" style={{ padding: "7px 12px", fontSize: ".78rem" }}
                onClick={() => { setShowKomponenForm(!showKomponenForm); setEditKomponenId(null); setKomponenForm({ nama: "", nominal_default: 0, aktif: true }); setShowHonorForm(false); }}>
                <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>Tambah
              </button>
            </div>

            {/* Form komponen */}
            {showKomponenForm && (
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", background: "#f8fafc" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nama Komponen *</label>
                    <input className="form-input" value={komponenForm.nama}
                      onChange={e => setKomponenForm({ ...komponenForm, nama: e.target.value })}
                      placeholder="Gaji Pokok, Transportasi..." />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Nominal Default (Rp)</label>
                    <input className="form-input" type="number" min="0"
                      value={komponenForm.nominal_default}
                      onChange={e => setKomponenForm({ ...komponenForm, nominal_default: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".85rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={komponenForm.aktif}
                      onChange={e => setKomponenForm({ ...komponenForm, aktif: e.target.checked })} />
                    Aktif (otomatis muncul saat input honor)
                  </label>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-primary" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={handleSaveKomponen}>
                    <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {editKomponenId ? "Update" : "Simpan"}</>
                  </button>
                  <button className="btn-outline" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={resetKomponenForm}>Batal</button>
                </div>
              </div>
            )}

            <div style={{ overflowX: "auto", marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>KOMPONEN</th>
                    <th>DEFAULT</th>
                    <th>AKTIF</th>
                    <th style={{ textAlign: "right" }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {myKomponen.map(k => (
                    <tr key={k.id}>
                      <td><strong>{k.nama}</strong></td>
                      <td><span style={{ fontSize: ".82rem" }}>Rp {k.nominal_default.toLocaleString("id-ID")}</span></td>
                      <td>
                        <button onClick={() => toggleAktif(k.id)} style={{
                          padding: "3px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                          fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                          background: k.aktif ? "#dcfce7" : "#f1f5f9",
                          color: k.aktif ? "#16a34a" : "var(--muted)",
                        }}>
                          {k.aktif ? "✓ Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td>
                        <div className="action-btns" style={{ justifyContent: "flex-end" }}>
                          <button className="icon-btn edit" onClick={() => handleEditKomponen(k)}><i className="fa-solid fa-pen-to-square"></i></button>
                          <button className="icon-btn del"
                            onClick={async () => {
                              const ok = await confirm({ title: "Hapus Komponen?", message: `Hapus komponen ${k.nama}?`, type: "danger" });
                              if (!ok) return;
                              await supabase.from("komponen_honor_setting").delete().eq("id", k.id);
                              setKomponenSetting(komponenSetting.filter(x => x.id !== k.id));
                            }}>
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {myKomponen.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)' }}>Belum ada komponen tetap</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info ringkasan */}
          <div style={{
            background: "#f8fafc", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 16px", marginTop: 12,
            fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6,
          }}>
            <i className="fa-solid fa-circle-info" style={{marginRight: 6, color: "var(--primary)"}}></i> <strong>Catatan:</strong> Nominal default adalah nilai awal saat input honor bulan baru.
            Admin tetap bisa ubah nominal tiap bulan saat input honor.
          </div>
        </div>
      </div>
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. MANAJEMEN PROGRAM BIMBEL
// ─────────────────────────────────────────────────────────────
export function ManajemenProgram() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [data,       setData]      = useState([]);
  const [data_siswa, setDataSiswa] = useState([]);
  const [loading,    setLoading]   = useState(true);
  const [showForm,   setShowForm]  = useState(false);
  const [editId,     setEditId]    = useState(null);
  const [search,     setSearch]    = useState("");
  const [saving,     setSaving]    = useState(false);
  const [form, setForm] = useState({ nama: "", jenjang: "" });

  useEffect(() => {
    Promise.all([getPrograms(), getSiswa()])
      .then(([prog, siswa]) => { setData(prog); setDataSiswa(siswa); })
      .catch(e => { console.error(e); setData(PROGRAMS); setDataSiswa(STUDENTS_DATA); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    (p.jenjang || "").toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ nama: "", jenjang: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({ nama: p.nama, jenjang: p.jenjang || "" });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.nama) return toast.warning("Nama program wajib diisi!");
    setSaving(true);
    try {
      if (editId) {
        const updated = await updateProgram(editId, { nama: form.nama, jenjang: form.jenjang });
        setData(data.map(p => p.id === editId ? { ...p, ...updated } : p));
        toast.success("Program berhasil diperbarui!");
      } else {
        const newProg = await addProgram({ nama: form.nama, jenjang: form.jenjang });
        setData([...data, newProg]);
        toast.success("Program berhasil ditambahkan!");
      }
      resetForm();
    } catch (e) {
      toast.error("Gagal menyimpan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data program...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".85rem" }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>{showForm && !editId ? "Tutup Form" : "Tambah Program"}
        </button>
      </div>

      <DataTable
        title={`Daftar Program (${data.length})`}
        data={data}
        searchPlaceholder="Cari program / jenjang..."
        searchKeys={["nama", "jenjang"]}
        headers={[
          "Nama Program",
          "Jenjang",
          "Dipakai (Siswa)",
          { label: "Aksi", align: "right" }
        ]}
        renderRow={(p) => {
          const jmlSiswa = data_siswa.filter(s =>
            (s.programs || []).some(pr => pr.nama === p.nama)
          ).length;
          return [
            <strong key="nama">{p.nama}</strong>,
            <span key="jen" style={{ fontSize: ".82rem", color: "var(--muted)" }}>{p.jenjang}</span>,
            <span key="jml" className="badge blue">{jmlSiswa} siswa</span>,
            <div key="btns" className="action-btns" style={{ justifyContent: "flex-end" }}>
              <button className="icon-btn edit" onClick={() => handleEdit(p)}><i className="fa-solid fa-pen-to-square"></i></button>
              <button className="icon-btn del"
                onClick={async () => {
                  if (jmlSiswa > 0) { toast.warning(`Program "${p.nama}" masih dipakai ${jmlSiswa} siswa. Pindahkan siswa dulu.`); return; }
                  const ok = await confirm({ title: "Hapus Program?", message: `Program "${p.nama}" akan dihapus permanen.`, type: "danger", confirmText: "Ya, Hapus" });
                  if (!ok) return;
                  try {
                    await deleteProgram(p.id);
                    setData(data.filter(x => x.id !== p.id));
                    toast.success("Program berhasil dihapus.");
                  } catch (e) { toast.error("Gagal menghapus: " + e.message); }
                }}>
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ];
        }}
      />

      {/* Form tambah/edit */}
      {showForm && (
        <div className="content-card" style={{ marginTop: 20 }}>
          <h3>{editId ? "Edit Program" : "Tambah Program Baru"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Nama Program *</label>
              <input className="form-input" value={form.nama}
                onChange={e => setForm({ ...form, nama: e.target.value })}
                placeholder="cth: Matematika SMP" />
            </div>
            <div className="form-group">
              <label className="form-label">Jenjang</label>
              <input className="form-input" value={form.jenjang}
                onChange={e => setForm({ ...form, jenjang: e.target.value })}
                placeholder="cth: SMP / SD / Semua" />
            </div>
          </div>
          <div className="info-box" style={{ marginTop: 10 }}>
            <i className="fa-solid fa-lightbulb" style={{marginRight: 6, color: "#eab308"}}></i> Biaya SPP tidak diisi di sini — nominal SPP diinput per siswa karena bisa berbeda tiap siswa.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave}>
              <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {editId ? "Update" : "Simpan"}</>
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. LANDING PAGE EDITOR
// ─────────────────────────────────────────────────────────────
export function LandingPageEditor() {
  const toast   = useToast();
  const [sections, setSections] = useState({});
  const [activeSection, setActiveSection] = useState("hero");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form,     setForm]     = useState({});

  const SECTION_LABELS = {
    hero:        { label: <><i className="fa-solid fa-rocket" style={{marginRight: 6}}></i> Hero</>,         desc: "Bagian atas halaman utama" },
    about:       { label: <><i className="fa-solid fa-school" style={{marginRight: 6}}></i> Tentang</>,       desc: "Deskripsi bimbel" },
    features:    { label: <><i className="fa-solid fa-star" style={{marginRight: 6}}></i> Keunggulan</>,    desc: "Fitur / keunggulan bimbel" },
    testimonial: { label: <><i className="fa-solid fa-comments" style={{marginRight: 6}}></i> Testimoni</>,     desc: "Ulasan dari siswa" },
    faq:         { label: <><i className="fa-solid fa-circle-question" style={{marginRight: 6}}></i> FAQ</>,           desc: "Pertanyaan umum" },
    cta:         { label: <><i className="fa-solid fa-bullhorn" style={{marginRight: 6}}></i> CTA</>,           desc: "Ajakan daftar / hubungi" },
    footer:      { label: <><i className="fa-solid fa-link" style={{marginRight: 6}}></i> Footer</>,        desc: "Alamat & copyright" },
  };

  useEffect(() => {
    getAllLandingSections()
      .then(data => {
        setSections(data);
        setForm(data[activeSection] || {});
      })
      .finally(() => setLoading(false));
  }, []);

  const switchSection = (key) => {
    setActiveSection(key);
    setForm(sections[key] || {});
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateLandingSection(activeSection, form);
      setSections(prev => ({ ...prev, [activeSection]: form }));
      toast.success(`Section "${SECTION_LABELS[activeSection]?.label}" berhasil disimpan!`);
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
    finally { setSaving(false); }
  };

  // Helper: update field dalam array item (features, testimoni, faq)
  const updateItem = (field, idx, key, val) => {
    const arr = [...(form[field] || [])];
    arr[idx] = { ...arr[idx], [key]: val };
    setForm({ ...form, [field]: arr });
  };

  const addItem = (field, template) => {
    setForm({ ...form, [field]: [...(form[field] || []), template] });
  };

  const removeItem = (field, idx) => {
    const arr = [...(form[field] || [])];
    arr.splice(idx, 1);
    setForm({ ...form, [field]: arr });
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat landing page...</div>;

  const inp = (key, label, ph = "", type = "text") => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {type === "textarea" ? (
        <textarea className="form-input" rows={3} value={form[key] || ""}
          onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph}
          style={{ resize: "vertical" }} />
      ) : (
        <input className="form-input" type={type} value={form[key] || ""}
          onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} />
      )}
    </div>
  );

  return (
    <div className="fade-in">
      {/* Pilih section */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {Object.entries(SECTION_LABELS).map(([key, { label }]) => (
          <button key={key} onClick={() => switchSection(key)}
            style={{
              padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer",
              fontFamily: "inherit", fontSize: ".82rem", fontWeight: 600,
              background: activeSection === key ? "var(--blue)" : "#f1f5f9",
              color: activeSection === key ? "#fff" : "var(--muted)",
            }}>{label}</button>
        ))}
      </div>

      <div className="content-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3>{SECTION_LABELS[activeSection]?.label}</h3>
            <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 2 }}>{SECTION_LABELS[activeSection]?.desc}</p>
          </div>
          <button className="btn-primary" style={{ padding: "9px 18px", fontSize: ".85rem" }}
            onClick={handleSave} disabled={saving}>
            <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : "Simpan Section Ini"}</>
          </button>
        </div>

        {/* ── HERO ── */}
        {activeSection === "hero" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {inp("badge",         "Badge (teks kecil atas)")}
            {inp("judul",         "Judul Utama")}
            {inp("deskripsi",     "Deskripsi",         "", "textarea")}
            {inp("btn_utama",     "Teks Tombol Utama")}
            {inp("btn_utama_link", "Link Tombol Utama (URL opsional)")}
            {inp("btn_sekunder",  "Teks Tombol Kedua")}
            {inp("btn_sekunder_link", "Link Tombol Kedua (URL opsional)")}
            {inp("stat1_num",     "Statistik 1 — Angka", "2.500+")}
            {inp("stat1_label",   "Statistik 1 — Label", "Siswa Aktif")}
            {inp("stat2_num",     "Statistik 2 — Angka", "150+")}
            {inp("stat2_label",   "Statistik 2 — Label", "Tentor Pilihan")}
            {inp("stat3_num",     "Statistik 3 — Angka", "98%")}
            {inp("stat3_label",   "Statistik 3 — Label", "Tingkat Kepuasan")}
            {inp("rating_num",    "Rating Angka",        "4.9")}
            {inp("rating_label",  "Rating Label",        "Rata-rata kenaikan nilai")}
            {inp("rating_nilai",  "Nilai Kenaikan",      "+32 Poin")}
          </div>
        )}

        {/* ── ABOUT ── */}
        {activeSection === "about" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {inp("label",     "Label (teks kecil)")}
            {inp("judul",     "Judul Section")}
            {inp("deskripsi", "Deskripsi", "", "textarea")}
          </div>
        )}

        {/* ── FEATURES ── */}
        {activeSection === "features" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
              {inp("label", "Label")}
              {inp("judul", "Judul Section")}
            </div>
            <div style={{ fontWeight: 700, fontSize: ".85rem", marginBottom: 12 }}>Daftar Keunggulan:</div>
            {(form.items || []).map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 1fr 2fr auto", gap: 10, marginBottom: 10, alignItems: "center", background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                <input className="form-input" value={item.icon || ""} placeholder="fa-solid fa-trophy"
                  onChange={e => updateItem("items", i, "icon", e.target.value)}
                  style={{ textAlign: "center", fontSize: "1.2rem", paddingLeft: 6, paddingRight: 6 }} />
                <input className="form-input" value={item.title || ""} placeholder="Judul keunggulan"
                  onChange={e => updateItem("items", i, "title", e.target.value)} />
                <input className="form-input" value={item.desc || ""} placeholder="Deskripsi singkat"
                  onChange={e => updateItem("items", i, "desc", e.target.value)} />
                <button onClick={() => removeItem("items", i)}
                  style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
              </div>
            ))}
            <button onClick={() => addItem("items", { icon: "fa-solid fa-star", color: "#f1f5f9", title: "Keunggulan Baru", desc: "Deskripsi keunggulan" })}
              className="btn-outline" style={{ padding: "8px 14px", fontSize: ".8rem" }}>+ Tambah Keunggulan</button>
          </div>
        )}

        {/* ── TESTIMONIAL ── */}
        {activeSection === "testimonial" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
              {inp("label", "Label")}
              {inp("judul", "Judul Section")}
            </div>
            <div style={{ fontWeight: 700, fontSize: ".85rem", marginBottom: 12 }}>Daftar Testimoni:</div>
            {(form.items || []).map((item, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px auto", gap: 10, marginBottom: 8, alignItems: "center" }}>
                  <input className="form-input" value={item.nama || ""} placeholder="Nama siswa"
                    onChange={e => updateItem("items", i, "nama", e.target.value)} />
                  <input className="form-input" value={item.sekolah || ""} placeholder="Asal sekolah"
                    onChange={e => updateItem("items", i, "sekolah", e.target.value)} />
                  <input className="form-input" type="number" min="1" max="5" value={item.rating || 5}
                    onChange={e => updateItem("items", i, "rating", parseInt(e.target.value))}
                    placeholder="5" />
                  <button onClick={() => removeItem("items", i)}
                    style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
                </div>
                <textarea className="form-input" rows={2} value={item.pesan || ""} placeholder="Isi testimoni..."
                  onChange={e => updateItem("items", i, "pesan", e.target.value)} style={{ resize: "vertical" }} />
              </div>
            ))}
            <button onClick={() => addItem("items", { nama: "Nama Siswa", sekolah: "Asal Sekolah", rating: 5, pesan: "Testimoni siswa..." })}
              className="btn-outline" style={{ padding: "8px 14px", fontSize: ".8rem" }}>+ Tambah Testimoni</button>
          </div>
        )}

        {/* ── FAQ ── */}
        {activeSection === "faq" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
              {inp("label", "Label")}
              {inp("judul", "Judul Section")}
            </div>
            <div style={{ fontWeight: 700, fontSize: ".85rem", marginBottom: 12 }}>Daftar Pertanyaan:</div>
            {(form.items || []).map((item, i) => (
              <div key={i} style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                  <input className="form-input" value={item.pertanyaan || ""} placeholder="Pertanyaan..."
                    onChange={e => updateItem("items", i, "pertanyaan", e.target.value)} style={{ flex: 1 }} />
                  <button onClick={() => removeItem("items", i)}
                    style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontWeight: 700 }}>✕</button>
                </div>
                <textarea className="form-input" rows={2} value={item.jawaban || ""} placeholder="Jawaban..."
                  onChange={e => updateItem("items", i, "jawaban", e.target.value)} style={{ resize: "vertical" }} />
              </div>
            ))}
            <button onClick={() => addItem("items", { pertanyaan: "Pertanyaan baru?", jawaban: "Jawaban pertanyaan..." })}
              className="btn-outline" style={{ padding: "8px 14px", fontSize: ".8rem" }}>+ Tambah FAQ</button>
          </div>
        )}

        {/* ── CTA ── */}
        {activeSection === "cta" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {inp("judul",       "Judul CTA")}
            {inp("deskripsi",   "Deskripsi", "", "textarea")}
            {inp("btn_text",    "Teks Tombol Daftar")}
            {inp("btn_link",    "Link Tombol Daftar (URL opsional)")}
            {inp("btn_wa_text", "Teks Tombol WA")}
            {inp("btn_wa_link", "Link Tombol WA (URL opsional)")}
          </div>
        )}

        {/* ── FOOTER ── */}
        {activeSection === "footer" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {inp("deskripsi", "Deskripsi Footer", "", "textarea")}
            {inp("alamat",    "Alamat")}
            {inp("copyright", "Teks Copyright")}
          </div>
        )}
      </div>
    </div>
  );
}