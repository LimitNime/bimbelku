// ============================================================
// AdminPages.jsx — All Admin dashboard pages
// ============================================================
import { useState } from "react";
import ArticleCard from "../../components/ArticleCard.jsx";
import PackageCard from "../../components/PackageCard.jsx";
import StatCard from "../../components/StatCard.jsx";
import Icon from "../../components/Icon.jsx";
import { STUDENTS_DATA, TEACHERS_DATA, PACKAGES, ARTICLES } from "../../data";

/* ── Admin Dashboard ──────────────────────────────────────── */
export function AdminDashboard() {
  const stats = [
    { icon: "👨‍🎓", label: "Total Siswa",   value: "2.547",    bgColor: "#dbeafe", textColor: "#2563eb" },
    { icon: "👨‍🏫", label: "Total Guru",    value: "48",       bgColor: "#dcfce7", textColor: "#16a34a" },
    { icon: "📝",   label: "Total Artikel", value: "124",      bgColor: "#fef9c3", textColor: "#d97706" },
    { icon: "💰",   label: "Pendapatan",    value: "Rp 12.4M", bgColor: "#f3e8ff", textColor: "#7c3aed" },
  ];

  return (
    <div className="fade-in">
      <div className="stats-grid">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="content-grid-2">
        {/* Recent students table */}
        <div className="table-card">
          <div className="table-head"><h3>📋 Siswa Terbaru</h3></div>
          <table>
            <thead><tr><th>Nama</th><th>Paket</th><th>Status</th></tr></thead>
            <tbody>
              {STUDENTS_DATA.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.name}</strong><br />
                    <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.email}</span>
                  </td>
                  <td><span className="badge blue">{s.package}</span></td>
                  <td><span className={`badge ${s.status === "Aktif" ? "green" : "red"}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Monthly summary */}
        <div className="content-card">
          <h3>📈 Ringkasan Bulan Ini</h3>
          {[
            { label: "Siswa Baru",    val: "+124",     color: "#22c55e" },
            { label: "Paket Terjual", val: "89",       color: "#3b82f6" },
            { label: "Try Out",       val: "3 Sesi",   color: "#f59e0b" },
            { label: "Rating",        val: "4.9 ⭐",   color: "#8b5cf6" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
              <span style={{ fontSize: ".88rem", color: "var(--muted)" }}>{item.label}</span>
              <strong style={{ color: item.color }}>{item.val}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Manajemen Siswa ──────────────────────────────────────── */
export function ManajemenSiswa() {
  const [data, setData]       = useState(STUDENTS_DATA);
  const [search, setSearch]   = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]       = useState({ name: "", email: "", package: "Basic", grade: "", status: "Aktif" });

  const filtered = data.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const addSiswa = () => {
    if (!form.name || !form.email) return;
    setData([...data, { ...form, id: Date.now(), teacher: "Drs. Budi Santoso" }]);
    setForm({ name: "", email: "", package: "Basic", grade: "", status: "Aktif" });
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <input className="form-input" style={{ maxWidth: 260 }} placeholder="🔍 Cari siswa..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Siswa
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Tambah Siswa Baru</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Nama</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nama lengkap" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Paket</label>
              <select className="form-input" value={form.package} onChange={e => setForm({ ...form, package: e.target.value })}>
                {PACKAGES.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Kelas</label>
              <input className="form-input" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="e.g. XII IPA" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={addSiswa}>Simpan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-card">
        <div className="table-head"><h3>Daftar Siswa ({filtered.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Nama</th><th>Paket</th><th>Kelas</th><th>Tentor</th><th>Status</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong><br /><span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.email}</span></td>
                  <td><span className="badge blue">{s.package}</span></td>
                  <td>{s.grade}</td>
                  <td style={{ fontSize: ".82rem" }}>{s.teacher}</td>
                  <td><span className={`badge ${s.status === "Aktif" ? "green" : "red"}`}>{s.status}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                      <button className="icon-btn del" onClick={() => setData(data.filter(d => d.id !== s.id))}><Icon name="trash" size={13} /></button>
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

/* ── Manajemen Guru ───────────────────────────────────────── */
export function ManajemenGuru() {
  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}>
          <Icon name="plus" size={15} />Tambah Guru
        </button>
      </div>
      <div className="table-card">
        <div className="table-head"><h3>Daftar Guru / Tentor</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Mata Pelajaran</th><th>Siswa</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {TEACHERS_DATA.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.name}</strong></td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{g.email}</td>
                  <td style={{ fontSize: ".82rem" }}>{g.subject}</td>
                  <td><span className="badge blue">{g.students} Siswa</span></td>
                  <td><span className="badge green">{g.status}</span></td>
                  <td><div className="action-btns">
                    <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                    <button className="icon-btn del"><Icon name="trash" size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Manajemen Paket ──────────────────────────────────────── */
export function ManajemenPaket() {
  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}>
          <Icon name="plus" size={15} />Tambah Paket
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
        {PACKAGES.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} showActions onEdit={() => {}} onDelete={() => {}} />
        ))}
      </div>
    </div>
  );
}

/* ── Manajemen Artikel ────────────────────────────────────── */
export function ManajemenArtikel({ onDetail }) {
  const [articles, setArticles] = useState(ARTICLES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Tips Belajar", excerpt: "", content: "" });

  const add = () => {
    if (!form.title) return;
    const now = new Date();
    setArticles([{
      id: Date.now(), author: "Admin BimbelKu", img: "📝",
      date: now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
      ...form,
    }, ...articles]);
    setForm({ title: "", category: "Tips Belajar", excerpt: "", content: "" });
    setShowForm(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(!showForm)}>
          <Icon name="plus" size={15} />Tambah Artikel
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>Buat Artikel Baru</h3>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Judul</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul artikel..." />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["Tips Belajar", "Pengumuman", "Informasi"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ringkasan</label>
              <input className="form-input" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Ringkasan singkat..." />
            </div>
            <div className="form-group">
              <label className="form-label">Isi Artikel</label>
              <textarea className="form-input" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Tulis isi artikel di sini..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={add}>Publikasikan</button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={() => setShowForm(false)}>Batal</button>
          </div>
        </div>
      )}

      <div className="table-card">
        <div className="table-head"><h3>Daftar Artikel ({articles.length})</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Judul</th><th>Kategori</th><th>Penulis</th><th>Tanggal</th><th>Aksi</th></tr></thead>
            <tbody>
              {articles.map(a => (
                <tr key={a.id}>
                  <td>
                    <strong style={{ cursor: "pointer", color: "var(--blue)" }} onClick={() => onDetail(a)}>{a.title}</strong>
                  </td>
                  <td><span className="badge blue">{a.category}</span></td>
                  <td style={{ fontSize: ".82rem" }}>{a.author}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{a.date}</td>
                  <td><div className="action-btns">
                    <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                    <button className="icon-btn del" onClick={() => setArticles(articles.filter(x => x.id !== a.id))}><Icon name="trash" size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Manajemen User ───────────────────────────────────────── */
export function ManajemenUser() {
  const users = [
    { id: 1,  name: "Administrator",      email: "admin@bimbelku.com", role: "Admin", status: "Aktif" },
    { id: 2,  name: "Drs. Budi Santoso",  email: "guru@bimbelku.com",  role: "Guru",  status: "Aktif" },
    { id: 3,  name: "Andi Pratama",       email: "siswa@bimbelku.com", role: "Siswa", status: "Aktif" },
    ...STUDENTS_DATA.slice(1).map(s  => ({ id: s.id  + 10, name: s.name, email: s.email, role: "Siswa", status: s.status })),
    ...TEACHERS_DATA.slice(1).map(g => ({ id: g.id + 20, name: g.name, email: g.email, role: "Guru",  status: g.status })),
  ];
  const roleColors = { Admin: "purple", Guru: "blue", Siswa: "green" };

  return (
    <div className="fade-in">
      <div className="table-card">
        <div className="table-head">
          <h3>Semua Pengguna ({users.length})</h3>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".82rem" }}>
            <Icon name="plus" size={14} />Tambah User
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.name}</strong></td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{u.email}</td>
                  <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.status === "Aktif" ? "green" : "red"}`}>{u.status}</span></td>
                  <td><div className="action-btns">
                    <button className="icon-btn edit"><Icon name="edit" size={13} /></button>
                    <button className="icon-btn del"><Icon name="trash" size={13} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
