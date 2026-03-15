// ============================================================
// AdminPages.jsx — Dashboard Admin
// Sesuai spesifikasi: Data Siswa, Data Guru, Artikel, User
// ============================================================
import { useState } from "react";
import StatCard    from "../../components/StatCard.jsx";
import ArticleCard from "../../components/ArticleCard.jsx";
import Icon        from "../../components/Icon.jsx";
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

// ── Helper export CSV sederhana ───────────────────────────────
const exportCSV = (filename, headers, rows) => {
  const csvHeaders = headers.join(",");
  const csvRows    = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
  const blob = new Blob([csvHeaders + "\n" + csvRows], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD ADMIN
// ─────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const aktif      = STUDENTS_DATA.filter(s => s.status === "Aktif").length;
  const belumBayar = SPP_DATA.filter(s => s.status === "Belum Bayar").length;
  const sudahBayar = SPP_DATA.filter(s => s.status === "Lunas").length;
  const totalMasuk = PEMASUKAN_DATA.reduce((a, b) => a + b.nominal, 0);
  const totalKeluar= PENGELUARAN_DATA.reduce((a, b) => a + b.nominal, 0);
  const saldo      = totalMasuk - totalKeluar;

  return (
    <div className="fade-in">
      {/* Stats row 1 */}
      <div className="stats-grid">
        <StatCard icon="👨‍🎓" label="Siswa Aktif"        value={aktif}                                          bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="👨‍🏫" label="Total Guru"          value={TEACHERS_DATA.length}                           bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="✅"   label="SPP Sudah Bayar"    value={sudahBayar + " siswa"}                          bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="⏳"   label="SPP Belum Bayar"    value={belumBayar + " siswa"}                          bgColor="#fee2e2" textColor="#dc2626" />
      </div>

      {/* Stats row 2 */}
      <div className="stats-grid" style={{ marginTop: 0 }}>
        <StatCard icon="💵" label="Total Pemasukan"   value={"Rp " + totalMasuk.toLocaleString("id-ID")}  bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="💸" label="Total Pengeluaran" value={"Rp " + totalKeluar.toLocaleString("id-ID")} bgColor="#fee2e2" textColor="#dc2626" />
        <StatCard icon="🏦" label="Saldo Saat Ini"    value={"Rp " + saldo.toLocaleString("id-ID")}       bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="📝" label="Total Artikel"     value={ARTICLES.length}                             bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      <div className="content-grid-2">
        {/* Siswa terbaru */}
        <div className="table-card">
          <div className="table-head"><h3>👨‍🎓 Siswa Terbaru</h3></div>
          <table>
            <thead><tr><th>Nama</th><th>Program</th><th>Status</th></tr></thead>
            <tbody>
              {STUDENTS_DATA.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.nama}</strong>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.sekolah}</div>
                  </td>
                  <td><span className="badge blue">{s.program}</span></td>
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

        {/* Ringkasan */}
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}>📊 Ringkasan Bulan Ini</h3>
          {[
            { label: "Siswa Aktif",        val: aktif,                                              color: "#2563eb" },
            { label: "Siswa Cuti",         val: STUDENTS_DATA.filter(s => s.status === "Cuti").length, color: "#d97706" },
            { label: "Siswa Nonaktif",     val: STUDENTS_DATA.filter(s => s.status === "Nonaktif").length, color: "#dc2626" },
            { label: "SPP Lunas",          val: sudahBayar + " tagihan",                            color: "#16a34a" },
            { label: "SPP Belum Bayar",    val: belumBayar + " tagihan",                            color: "#dc2626" },
            { label: "Saldo Bersih",       val: "Rp " + saldo.toLocaleString("id-ID"),              color: saldo >= 0 ? "#16a34a" : "#dc2626" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0", borderBottom: "1px solid #f1f5f9",
            }}>
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
  const [data, setData]         = useState(STUDENTS_DATA);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [rincianId, setRincianId] = useState(null);
  const [form, setForm] = useState({
    nama: "", email: "", ttl: "", alamat: "", kontak: "",
    sekolah: "", program: "Calistung", besaran_spp: 150000,
    status: "Aktif", guru: "Drs. Budi Santoso",
  });

  const filtered = data.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.sekolah.toLowerCase().includes(search.toLowerCase()) ||
    s.program.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ nama: "", email: "", ttl: "", alamat: "", kontak: "", sekolah: "", program: "Calistung", besaran_spp: 150000, status: "Aktif", guru: "Drs. Budi Santoso" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (s) => {
    setForm({ ...s });
    setEditId(s.id);
    setShowForm(true);
    setRincianId(null);
  };

  const handleSave = () => {
    if (!form.nama || !form.email) return alert("Nama dan email wajib diisi!");
    if (editId) {
      setData(data.map(s => s.id === editId ? { ...form, id: editId } : s));
    } else {
      setData([...data, { ...form, id: Date.now(), tgl_daftar: new Date().toISOString().split("T")[0] }]);
    }
    resetForm();
  };

  const handleNonaktif = (id) => {
    setData(data.map(s => s.id === id ? { ...s, status: s.status === "Aktif" ? "Nonaktif" : "Aktif" } : s));
  };

  const handleExport = () => {
    exportCSV("data-siswa.csv",
      ["Nama", "Email", "TTL", "Alamat", "Kontak", "Sekolah", "Program", "SPP", "Status", "Guru"],
      filtered.map(s => [s.nama, s.email, s.ttl, s.alamat, s.kontak, s.sekolah, s.program, s.besaran_spp, s.status, s.guru])
    );
  };

  // SPP rincian siswa
  const rincianSPP = rincianId ? SPP_DATA.filter(s => s.siswa_id === rincianId) : [];
  const siswaRincian = rincianId ? data.find(s => s.id === rincianId) : null;

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Cari nama / sekolah / program..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            📥 Export Excel
          </button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Icon name="plus" size={14} />Tambah Siswa
          </button>
        </div>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Siswa" : "Tambah Siswa Baru"}</h3>
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
              <label className="form-label">Program</label>
              <select className="form-input" value={form.program}
                onChange={e => {
                  const p = PROGRAMS.find(x => x.nama === e.target.value);
                  setForm({ ...form, program: e.target.value, besaran_spp: p?.spp || 0 });
                }}>
                {PROGRAMS.map(p => <option key={p.id}>{p.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Besaran SPP (Rp)</label>
              <input className="form-input" type="number" value={form.besaran_spp}
                onChange={e => setForm({ ...form, besaran_spp: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label className="form-label">Tentor</label>
              <select className="form-input" value={form.guru} onChange={e => setForm({ ...form, guru: e.target.value })}>
                {TEACHERS_DATA.map(g => <option key={g.id}>{g.nama}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Aktif", "Nonaktif", "Cuti"].map(s => <option key={s}>{s}</option>)}
              </select>
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
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr><th>Bulan</th><th>Tahun</th><th>Nominal</th><th>Tgl Bayar</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {rincianSPP.length === 0 ? (
                    <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)" }}>Belum ada data SPP</td></tr>
                  ) : rincianSPP.map((s, i) => (
                    <tr key={i}>
                      <td>{s.bulan}</td>
                      <td>{s.tahun}</td>
                      <td style={{ fontWeight: 600 }}>Rp {s.nominal.toLocaleString("id-ID")}</td>
                      <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</td>
                      <td><span className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head"><h3>Daftar Siswa ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nama</th><th>TTL</th><th>Sekolah</th><th>Program</th>
                <th>SPP</th><th>Tentor</th><th>Status</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.nama}</strong>
                    <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{s.email}</div>
                    <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{s.kontak}</div>
                  </td>
                  <td style={{ fontSize: ".8rem" }}>{s.ttl}</td>
                  <td style={{ fontSize: ".82rem" }}>{s.sekolah}</td>
                  <td><span className="badge blue">{s.program}</span></td>
                  <td style={{ fontSize: ".82rem", fontWeight: 600 }}>
                    Rp {s.besaran_spp.toLocaleString("id-ID")}
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{s.guru}</td>
                  <td>
                    <span className={`badge ${s.status === "Aktif" ? "green" : s.status === "Cuti" ? "yellow" : "red"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleEdit(s)} title="Edit"><Icon name="edit" size={13} /></button>
                      <button onClick={() => { setRincianId(s.id); setShowForm(false); }}
                        style={{ padding: "4px 8px", borderRadius: 7, border: "none", background: "#dcfce7", color: "#16a34a", cursor: "pointer", fontSize: ".72rem", fontWeight: 700 }}>
                        SPP
                      </button>
                      <button className="icon-btn del" onClick={() => handleNonaktif(s.id)} title="Nonaktifkan">
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
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
// 3. DATA GURU
// ─────────────────────────────────────────────────────────────
export function ManajemenGuru() {
  const [data, setData]         = useState(TEACHERS_DATA);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [honorSettingLocal, setHonorSettingLocal] = useState(HONOR_SETTING);
  const [form, setForm] = useState({
    nama: "", email: "", kontak: "", status: "Aktif",
  });

  const filtered = data.filter(g =>
    g.nama.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ nama: "", email: "", kontak: "", status: "Aktif" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (g) => {
    setForm({ nama: g.nama, email: g.email, kontak: g.kontak, status: g.status });
    setEditId(g.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nama || !form.email) return alert("Nama dan email wajib diisi!");
    if (editId) {
      setData(data.map(g => g.id === editId ? { ...g, ...form } : g));
    } else {
      setData([...data, { ...form, id: Date.now() }]);
    }
    resetForm();
  };

  const handleExport = () => {
    exportCSV("data-guru.csv",
      ["Nama", "Email", "Kontak", "Program", "Jml Siswa", "Status"],
      filtered.map(g => {
        const programs = HONOR_SETTING.filter(h => h.guru_id === g.id).map(h => h.program).join("; ");
        const jmlSiswa = STUDENTS_DATA.filter(s => s.guru === g.nama).length;
        return [g.nama, g.email, g.kontak, programs, jmlSiswa, g.status];
      })
    );
  };

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Cari nama / email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            📥 Export Excel
          </button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <Icon name="plus" size={14} />Tambah Guru
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Guru" : "Tambah Guru Baru"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 14 }}>
            {[
              { label: "Nama Lengkap *", key: "nama",   ph: "Nama lengkap guru" },
              { label: "Email *",        key: "email",  ph: "email@bimbelku.com", type: "email" },
              { label: "No. Telepon",    key: "kontak", ph: "08xxxxxxxxxx" },
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

          {/* Program yang diajar — tambah/kurang */}
          {editId && (
            <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
              <div style={{ fontWeight: 700, fontSize: ".88rem", marginBottom: 10 }}>
                📚 Program yang Diajar
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {PROGRAMS.map(p => {
                  const sudahAda = HONOR_SETTING.find(h => h.guru_id === editId && h.program === p.nama);
                  return (
                    <button key={p.id}
                      onClick={() => {
                        if (sudahAda) {
                          setHonorSettingLocal(prev => prev.filter(h => !(h.guru_id === editId && h.program === p.nama)));
                        } else {
                          setHonorSettingLocal(prev => [...prev, {
                            id: Date.now() + p.id,
                            guru_id: editId,
                            guru_nama: form.nama,
                            program: p.nama,
                            honor_per_siswa: 0,
                          }]);
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
                Klik program untuk tambah/hapus. Nominal honor per siswa bisa diatur di menu <strong>Setting Honor Guru</strong>.
              </p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleSave}>
              💾 {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head"><h3>Daftar Guru / Tentor ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama</th><th>Kontak</th><th>Program</th><th>Jml Siswa</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const jmlSiswa  = STUDENTS_DATA.filter(s => s.guru === g.nama).length;
                const programs  = honorSettingLocal.filter(h => h.guru_id === g.id);
                return (
                  <tr key={g.id}>
                    <td>
                      <strong>{g.nama}</strong>
                      <div style={{ fontSize: ".72rem", color: "var(--muted)" }}>{g.email}</div>
                    </td>
                    <td style={{ fontSize: ".82rem" }}>{g.kontak}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {programs.length > 0
                          ? programs.map((h, i) => (
                              <span key={i} className="badge blue" style={{ fontSize: ".7rem" }}>
                                {h.program}
                              </span>
                            ))
                          : <span style={{ fontSize: ".78rem", color: "var(--muted)" }}>Belum ada</span>
                        }
                      </div>
                    </td>
                    <td><span className="badge blue">{jmlSiswa} siswa</span></td>
                    <td><span className={`badge ${g.status === "Aktif" ? "green" : "red"}`}>{g.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn edit" onClick={() => handleEdit(g)}><Icon name="edit" size={13} /></button>
                        <button className="icon-btn del" onClick={() => setData(data.filter(d => d.id !== g.id))}><Icon name="trash" size={13} /></button>
                      </div>
                    </td>
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
// 4. MANAJEMEN ARTIKEL
// ─────────────────────────────────────────────────────────────
export function ManajemenArtikel({ onDetail }) {
  const [articles, setArticles] = useState(ARTICLES);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({
    title: "", category: "Informasi", excerpt: "",
    content: "", img: "", video_url: "",
  });

  const resetForm = () => {
    setForm({ title: "", category: "Informasi", excerpt: "", content: "", img: "", video_url: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (a) => {
    setForm({ title: a.title, category: a.category, excerpt: a.excerpt, content: a.content || "", img: a.img || "", video_url: a.video_url || "" });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title) return alert("Judul tidak boleh kosong!");
    const now = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    if (editId) {
      setArticles(articles.map(a => a.id === editId ? { ...a, ...form } : a));
    } else {
      setArticles([{ id: Date.now(), author: "Admin BimbelKu", date: now, ...form }, ...articles]);
    }
    resetForm();
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".85rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Icon name="plus" size={15} />{showForm ? "Tutup Form" : "Tambah Artikel"}
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Artikel" : "Buat Artikel Baru"}</h3>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Judul *</label>
              <input className="form-input" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul artikel..." />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {["Tips Belajar", "Pengumuman", "Informasi"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emoji / Gambar</label>
                <input className="form-input" value={form.img}
                  onChange={e => setForm({ ...form, img: e.target.value })} placeholder="Emoji atau link gambar" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Link Video (YouTube / GDrive)</label>
              <input className="form-input" value={form.video_url}
                onChange={e => setForm({ ...form, video_url: e.target.value })} placeholder="https://youtube.com/..." />
            </div>
            <div className="form-group">
              <label className="form-label">Ringkasan</label>
              <input className="form-input" value={form.excerpt}
                onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat..." />
            </div>
            <div className="form-group">
              <label className="form-label">Isi Artikel *</label>
              <textarea className="form-input" rows={7} value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Tulis isi artikel di sini..." style={{ resize: "vertical" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleSave}>
              🚀 {editId ? "Update" : "Publikasikan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-head"><h3>Daftar Artikel ({articles.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Judul</th><th>Kategori</th><th>Video</th><th>Penulis</th><th>Tanggal</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td>
                    <strong style={{ cursor: "pointer", color: "var(--blue)" }} onClick={() => onDetail(a)}>
                      {a.img && <span style={{ marginRight: 6 }}>{a.img}</span>}{a.title}
                    </strong>
                  </td>
                  <td><span className="badge blue">{a.category}</span></td>
                  <td>
                    {a.video_url
                      ? <span style={{ fontSize: ".75rem", color: "#16a34a", fontWeight: 700 }}>▶ Ada</span>
                      : <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>—</span>}
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{a.author}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{a.date}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleEdit(a)}><Icon name="edit" size={13} /></button>
                      <button className="icon-btn del" onClick={() => setArticles(articles.filter(x => x.id !== a.id))}><Icon name="trash" size={13} /></button>
                    </div>
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
// 5. MANAJEMEN USER
// ─────────────────────────────────────────────────────────────
export function ManajemenUser() {
  const [users, setUsers] = useState([
    { id: 1,  nama: "Administrator",      email: "admin@bimbelku.com",  role: "Admin", status: "Aktif" },
    { id: 2,  nama: "Drs. Budi Santoso",  email: "guru@bimbelku.com",   role: "Guru",  status: "Aktif" },
    { id: 3,  nama: "Andi Pratama",       email: "siswa@bimbelku.com",  role: "Siswa", status: "Aktif" },
    ...STUDENTS_DATA.slice(1).map(s => ({ id: s.id + 10, nama: s.nama, email: s.email, role: "Siswa", status: s.status })),
    ...TEACHERS_DATA.slice(1).map(g => ({ id: g.id + 20, nama: g.nama, email: g.email, role: "Guru",  status: g.status })),
  ]);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState("");
  const [form, setForm] = useState({ nama: "", email: "", role: "Siswa", password: "", status: "Aktif" });

  const roleColors = { Admin: "purple", Guru: "blue", Siswa: "green" };

  const filtered = users.filter(u =>
    u.nama.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.nama || !form.email) return alert("Nama dan email wajib diisi!");
    setUsers([...users, { ...form, id: Date.now() }]);
    setForm({ nama: "", email: "", role: "Siswa", password: "", status: "Aktif" });
    setShowForm(false);
  };

  const toggleStatus = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === "Aktif" ? "Nonaktif" : "Aktif" } : u));
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Cari nama / email..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={14} />Tambah User
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah User Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            {[
              { label: "Nama Lengkap *", key: "nama",     ph: "Nama lengkap" },
              { label: "Email *",        key: "email",    ph: "email@example.com", type: "email" },
              { label: "Password *",     key: "password", ph: "Password awal",     type: "password" },
            ].map(f => (
              <div key={f.key} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type || "text"} placeholder={f.ph}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {["Admin", "Guru", "Siswa"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={handleAdd}>💾 Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-head"><h3>Semua Pengguna ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.nama}</strong></td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{u.email}</td>
                  <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.status === "Aktif" ? "green" : "red"}`}>{u.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                      <button onClick={() => toggleStatus(u.id)}
                        className={`icon-btn ${u.status === "Aktif" ? "del" : "edit"}`}
                        title={u.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}>
                        <Icon name={u.status === "Aktif" ? "trash" : "check"} size={13} />
                      </button>
                    </div>
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
// 6. SETTING HONOR GURU
// Admin setting honor per program per guru
// ─────────────────────────────────────────────────────────────
export function SettingHonor() {
  const [honorSetting, setHonorSetting] = useState(HONOR_SETTING);
  const [komponenSetting, setKomponenSetting] = useState(KOMPONEN_HONOR_SETTING);
  const [activeGuru, setActiveGuru] = useState(TEACHERS_DATA[0]?.id || 1);
  const [showHonorForm, setShowHonorForm]       = useState(false);
  const [showKomponenForm, setShowKomponenForm] = useState(false);
  const [editHonorId,    setEditHonorId]        = useState(null);
  const [editKomponenId, setEditKomponenId]     = useState(null);
  const [honorForm, setHonorForm]       = useState({ program: "", honor_per_siswa: 0 });
  const [komponenForm, setKomponenForm] = useState({ nama: "", nominal_default: 0, aktif: true });

  const guru          = TEACHERS_DATA.find(g => g.id === activeGuru);
  const myHonor       = honorSetting.filter(h => h.guru_id === activeGuru);
  const myKomponen    = komponenSetting.filter(k => k.guru_id === activeGuru);

  // ── Honor per Program ──────────────────────────────────────
  const resetHonorForm = () => {
    setHonorForm({ program: "", honor_per_siswa: 0 });
    setEditHonorId(null);
    setShowHonorForm(false);
  };

  const handleEditHonor = (item) => {
    setHonorForm({ program: item.program, honor_per_siswa: item.honor_per_siswa });
    setEditHonorId(item.id);
    setShowHonorForm(true);
    setShowKomponenForm(false);
  };

  const handleSaveHonor = () => {
    if (!honorForm.program) return alert("Program wajib diisi!");
    if (editHonorId) {
      setHonorSetting(honorSetting.map(h =>
        h.id === editHonorId ? { ...h, ...honorForm, honor_per_siswa: parseInt(honorForm.honor_per_siswa) } : h
      ));
    } else {
      setHonorSetting([...honorSetting, {
        id: Date.now(), guru_id: activeGuru,
        guru_nama: guru?.nama || "",
        ...honorForm,
        honor_per_siswa: parseInt(honorForm.honor_per_siswa),
      }]);
    }
    resetHonorForm();
  };

  // ── Komponen Tetap ─────────────────────────────────────────
  const resetKomponenForm = () => {
    setKomponenForm({ nama: "", nominal_default: 0, aktif: true });
    setEditKomponenId(null);
    setShowKomponenForm(false);
  };

  const handleEditKomponen = (item) => {
    setKomponenForm({ nama: item.nama, nominal_default: item.nominal_default, aktif: item.aktif });
    setEditKomponenId(item.id);
    setShowKomponenForm(true);
    setShowHonorForm(false);
  };

  const handleSaveKomponen = () => {
    if (!komponenForm.nama) return alert("Nama komponen wajib diisi!");
    if (editKomponenId) {
      setKomponenSetting(komponenSetting.map(k =>
        k.id === editKomponenId ? { ...k, ...komponenForm, nominal_default: parseInt(komponenForm.nominal_default) } : k
      ));
    } else {
      setKomponenSetting([...komponenSetting, {
        id: Date.now(), guru_id: activeGuru,
        ...komponenForm,
        nominal_default: parseInt(komponenForm.nominal_default),
      }]);
    }
    resetKomponenForm();
  };

  const toggleAktif = (id) => {
    setKomponenSetting(komponenSetting.map(k =>
      k.id === id ? { ...k, aktif: !k.aktif } : k
    ));
  };

  return (
    <div className="fade-in">
      {/* Pilih guru */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TEACHERS_DATA.map(g => (
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
              <h3>📚 Honor per Program</h3>
              <button className="btn-primary" style={{ padding: "7px 12px", fontSize: ".78rem" }}
                onClick={() => { setShowHonorForm(!showHonorForm); setEditHonorId(null); setHonorForm({ program: "", honor_per_siswa: 0 }); setShowKomponenForm(false); }}>
                <Icon name="plus" size={13} />Tambah
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
                      {PROGRAMS.map(p => <option key={p.id}>{p.nama}</option>)}
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
                    💾 {editHonorId ? "Update" : "Simpan"}
                  </button>
                  <button className="btn-outline" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={resetHonorForm}>Batal</button>
                </div>
              </div>
            )}

            {/* Tabel honor program */}
            {myHonor.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: ".85rem" }}>
                Belum ada setting honor program.
              </div>
            ) : (
              <table>
                <thead><tr><th>Program</th><th>Honor/Siswa</th><th>Aksi</th></tr></thead>
                <tbody>
                  {myHonor.map(h => (
                    <tr key={h.id}>
                      <td><strong>{h.program}</strong></td>
                      <td style={{ fontWeight: 600, color: "var(--blue)" }}>
                        Rp {h.honor_per_siswa.toLocaleString("id-ID")}
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="icon-btn edit" onClick={() => handleEditHonor(h)}>
                            <Icon name="edit" size={13} />
                          </button>
                          <button className="icon-btn del"
                            onClick={() => setHonorSetting(honorSetting.filter(x => x.id !== h.id))}>
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Bagian 2: Komponen Tetap ──────────────────────── */}
        <div>
          <div className="table-card">
            <div className="table-head">
              <h3>💰 Komponen Tetap</h3>
              <button className="btn-primary" style={{ padding: "7px 12px", fontSize: ".78rem" }}
                onClick={() => { setShowKomponenForm(!showKomponenForm); setEditKomponenId(null); setKomponenForm({ nama: "", nominal_default: 0, aktif: true }); setShowHonorForm(false); }}>
                <Icon name="plus" size={13} />Tambah
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
                    💾 {editKomponenId ? "Update" : "Simpan"}
                  </button>
                  <button className="btn-outline" style={{ padding: "7px 14px", fontSize: ".8rem" }} onClick={resetKomponenForm}>Batal</button>
                </div>
              </div>
            )}

            {/* Tabel komponen */}
            {myKomponen.length === 0 ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--muted)", fontSize: ".85rem" }}>
                Belum ada setting komponen tetap.
              </div>
            ) : (
              <table>
                <thead><tr><th>Komponen</th><th>Default</th><th>Aktif</th><th>Aksi</th></tr></thead>
                <tbody>
                  {myKomponen.map(k => (
                    <tr key={k.id}>
                      <td><strong>{k.nama}</strong></td>
                      <td style={{ fontSize: ".82rem" }}>Rp {k.nominal_default.toLocaleString("id-ID")}</td>
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
                        <div className="action-btns">
                          <button className="icon-btn edit" onClick={() => handleEditKomponen(k)}>
                            <Icon name="edit" size={13} />
                          </button>
                          <button className="icon-btn del"
                            onClick={() => setKomponenSetting(komponenSetting.filter(x => x.id !== k.id))}>
                            <Icon name="trash" size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Info ringkasan */}
          <div style={{
            background: "#f8fafc", border: "1px solid var(--border)",
            borderRadius: 10, padding: "12px 16px", marginTop: 12,
            fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6,
          }}>
            💡 <strong>Catatan:</strong> Nominal default adalah nilai awal saat input honor bulan baru.
            Admin tetap bisa ubah nominal tiap bulan saat input honor.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. MANAJEMEN PROGRAM BIMBEL
// Admin bisa tambah/edit/hapus program
// Program ini yang dipakai di Data Siswa & Setting Honor
// ─────────────────────────────────────────────────────────────
export function ManajemenProgram() {
  const [data, setData]         = useState(PROGRAMS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState(null);
  const [search, setSearch]     = useState("");
  const [form, setForm] = useState({
    nama: "", jenjang: "", spp: 0,
  });

  const filtered = data.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.jenjang.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ nama: "", jenjang: "", spp: 0 });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setForm({ nama: p.nama, jenjang: p.jenjang, spp: p.spp });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.nama) return alert("Nama program wajib diisi!");
    if (editId) {
      setData(data.map(p => p.id === editId
        ? { ...p, nama: form.nama, jenjang: form.jenjang, spp: parseInt(form.spp) || 0 }
        : p
      ));
    } else {
      setData([...data, {
        id: Date.now(),
        nama: form.nama,
        jenjang: form.jenjang,
        spp: parseInt(form.spp) || 0,
      }]);
    }
    resetForm();
  };

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <input className="form-input" style={{ maxWidth: 260 }}
          placeholder="🔍 Cari program / jenjang..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".85rem" }}
          onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Icon name="plus" size={14} />{showForm && !editId ? "Tutup" : "Tambah Program"}
        </button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
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
            <div className="form-group">
              <label className="form-label">Biaya SPP (Rp)</label>
              <input className="form-input" type="number" min="0" value={form.spp}
                onChange={e => setForm({ ...form, spp: e.target.value })}
                placeholder="0" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave}>
              💾 {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {/* Tabel program */}
      <div className="table-card">
        <div className="table-head">
          <h3>Daftar Program ({filtered.length})</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nama Program</th>
                <th>Jenjang</th>
                <th>Biaya SPP</th>
                <th>Dipakai (Siswa)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const jmlSiswa = STUDENTS_DATA.filter(s => s.program === p.nama).length;
                return (
                  <tr key={p.id}>
                    <td><strong>{p.nama}</strong></td>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{p.jenjang}</td>
                    <td style={{ fontWeight: 600, color: "var(--blue)" }}>
                      Rp {p.spp.toLocaleString("id-ID")}
                    </td>
                    <td>
                      <span className="badge blue">{jmlSiswa} siswa</span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn edit" onClick={() => handleEdit(p)}>
                          <Icon name="edit" size={13} />
                        </button>
                        <button className="icon-btn del"
                          onClick={() => {
                            if (jmlSiswa > 0) return alert(`Program "${p.nama}" masih dipakai ${jmlSiswa} siswa. Pindahkan siswa dulu sebelum menghapus.`);
                            setData(data.filter(x => x.id !== p.id));
                          }}>
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Info */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
          <div className="info-box">
            💡 Program yang ditambahkan di sini akan otomatis tersedia di menu <strong>Data Siswa</strong> dan <strong>Setting Honor Guru</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}