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
  BULAN_LIST,
  TAHUN_LIST,
} from "../../data/index.js";

// Guru yang sedang login (nanti dari Supabase Auth)
const MY_GURU_ID = 1;
const MY_GURU    = TEACHERS_DATA.find(g => g.id === MY_GURU_ID);

// Siswa yang diajar guru ini
const MY_SISWA   = STUDENTS_DATA.filter(s => s.guru === MY_GURU?.nama);

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
  const absensiHariIni = ABSENSI_DATA.filter(a => a.guru_id === MY_GURU_ID);
  const totalHadir     = absensiHariIni.filter(a => a.status === "Hadir").length;
  const myHonor        = HONOR_DATA.find(h => h.guru_id === MY_GURU_ID);
  const totalSiswa     = myHonor?.rincian.reduce((a, b) => a + b.jumlah_siswa, 0) || 0;
  const totalHonor     = totalSiswa * (MY_GURU?.honor_per_siswa || 0);

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="👨‍🎓" label="Total Siswa Diajar" value={MY_SISWA.length}         bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="📋" label="Program Diajar"      value={MY_GURU?.program.length || 0} bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="✅" label="Hadir Bulan Ini"     value={totalHadir}                bgColor="#fef9c3" textColor="#d97706" />
        <StatCard icon="💰" label="Estimasi Honor"      value={"Rp " + totalHonor.toLocaleString("id-ID")} bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      <div className="content-grid-2">
        {/* Daftar siswa */}
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}>👥 Siswa Saya</h3>
          {MY_SISWA.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: ".85rem" }}>Belum ada siswa.</p>
          ) : (
            MY_SISWA.map((s, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{s.nama}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.program} · {s.sekolah}</div>
                </div>
                <span className={`badge ${s.status === "Aktif" ? "green" : s.status === "Cuti" ? "yellow" : "red"}`}>
                  {s.status}
                </span>
              </div>
            ))
          )}
          <button className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 14, padding: "9px", fontSize: ".82rem" }} onClick={() => onMenu("input-absensi")}>
            ✍️ Input Absensi Hari Ini
          </button>
        </div>

        {/* Program & honor */}
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}>📊 Program yang Diajar</h3>
          {MY_GURU?.program.map((p, i) => {
            const jml = STUDENTS_DATA.filter(s => s.program === p && s.guru === MY_GURU.nama).length;
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <span style={{ fontSize: ".88rem", fontWeight: 500 }}>{p}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge blue">{jml} siswa</span>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 14, background: "#f0fdf4", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>Honor per siswa</div>
            <div style={{ fontWeight: 700, color: "var(--green)", fontSize: ".95rem" }}>
              Rp {MY_GURU?.honor_per_siswa.toLocaleString("id-ID")}/siswa
            </div>
          </div>
        </div>
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
    s.program.toLowerCase().includes(search.toLowerCase())
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
              <tr><th>Nama</th><th>Sekolah</th><th>Program</th><th>SPP</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.nama}</strong>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{s.kontak}</div>
                  </td>
                  <td style={{ fontSize: ".82rem" }}>{s.sekolah}</td>
                  <td><span className="badge blue">{s.program}</span></td>
                  <td style={{ fontSize: ".82rem", fontWeight: 600 }}>
                    Rp {s.besaran_spp.toLocaleString("id-ID")}
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
export function InputAbsensi() {
  const today    = new Date().toISOString().split("T")[0];
  const [tgl, setTgl]       = useState(today);
  const [search, setSearch] = useState("");
  const [saved,  setSaved]  = useState(false);
  const [absen, setAbsen]   = useState(
    MY_SISWA.map(s => ({ siswa_id: s.id, nama: s.nama, program: s.program, hadir: false }))
  );

  const toggle = (id) => setAbsen(absen.map(a => a.siswa_id === id ? { ...a, hadir: !a.hadir } : a));
  const checkAll = () => setAbsen(absen.map(a => ({ ...a, hadir: true })));

  const filtered = absen.filter(a =>
    a.nama.toLowerCase().includes(search.toLowerCase()) ||
    a.program.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimpan = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const totalHadir = absen.filter(a => a.hadir).length;

  return (
    <div className="fade-in">
      {/* Filter tanggal */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tanggal</label>
          <input className="form-input" type="date" value={tgl}
            onChange={e => setTgl(e.target.value)} style={{ width: 180 }} />
        </div>
        <div style={{ fontSize: ".85rem", color: "var(--muted)", marginTop: 20 }}>
          📅 {fmtTgl(tgl)}
        </div>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="👨‍🎓" label="Total Siswa"  value={absen.length}       bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="✅"   label="Hadir"        value={totalHadir}         bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="❌"   label="Tidak Hadir"  value={absen.length - totalHadir} bgColor="#fee2e2" textColor="#dc2626" />
      </div>

      <div className="table-card">
        <div className="table-head">
          <h3>Daftar Hadir — {fmtTglShort(tgl)}</h3>
          <button onClick={checkAll} className="btn-outline"
            style={{ padding: "7px 14px", fontSize: ".8rem" }}>
            ✅ Tandai Semua Hadir
          </button>
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
              <tr><th>Nama Siswa</th><th>Program</th><th>Kehadiran</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.siswa_id}>
                  <td><strong>{a.nama}</strong></td>
                  <td><span className="badge blue">{a.program}</span></td>
                  <td>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={a.hadir}
                        onChange={() => toggle(a.siswa_id)}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <span style={{
                        fontSize: ".82rem", fontWeight: 600,
                        color: a.hadir ? "#16a34a" : "#dc2626",
                      }}>
                        {a.hadir ? "✅ Hadir" : "❌ Tidak Hadir"}
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simpan button */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: ".88rem" }} onClick={handleSimpan}>
            💾 Simpan Absensi
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
export function RekapAbsensi() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");

  // Filter absensi milik guru ini di bulan/tahun yang dipilih
  const data = ABSENSI_DATA.filter(a => {
    const d = new Date(a.tanggal);
    const bln = d.toLocaleDateString("id-ID", { month: "long" });
    const thn = d.getFullYear().toString();
    return a.guru_id === MY_GURU_ID && bln === bulan && thn === tahun;
  });

  const hadir       = data.filter(a => a.status === "Hadir").length;
  const tidakHadir  = data.filter(a => a.status === "Tidak Hadir").length;

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

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="📋" label="Total Pertemuan" value={data.length}   bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="✅" label="Hadir"           value={hadir}         bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="❌" label="Tidak Hadir"     value={tidakHadir}    bgColor="#fee2e2" textColor="#dc2626" />
      </div>

      <div className="table-card">
        <div className="table-head">
          <h3>Rekap Absensi — {bulan} {tahun}</h3>
        </div>
        {data.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Belum ada data absensi di bulan ini.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr><th>Tanggal</th><th>Nama Siswa</th><th>Program</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{fmtTglShort(a.tanggal)}</td>
                    <td><strong>{a.siswa_nama}</strong></td>
                    <td><span className="badge blue">{a.program}</span></td>
                    <td>
                      <span className={`badge ${a.status === "Hadir" ? "green" : "red"}`}>
                        {a.status}
                      </span>
                    </td>
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
// 5. HONOR GURU (lihat honor sendiri)
// ─────────────────────────────────────────────────────────────
export function HonorGuruPage() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");

  const honor = HONOR_DATA.find(
    h => h.guru_id === MY_GURU_ID && h.bulan === bulan && h.tahun === tahun
  );

  const totalSiswa = honor?.rincian.reduce((a, b) => a + b.jumlah_siswa, 0) || 0;
  const totalHonor = totalSiswa * (MY_GURU?.honor_per_siswa || 0);

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
        <div className="content-card" style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
          <p style={{ color: "var(--muted)" }}>Belum ada data honor bulan {bulan} {tahun}.</p>
        </div>
      ) : (
        <>
          {/* Rincian per program */}
          <div className="table-card" style={{ marginBottom: 20 }}>
            <div className="table-head"><h3>Rincian Honor — {bulan} {tahun}</h3></div>
            <table>
              <thead>
                <tr><th>Program</th><th>Jumlah Siswa</th><th>Honor/Siswa</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {honor.rincian.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.program}</strong></td>
                    <td>{r.jumlah_siswa} siswa</td>
                    <td>Rp {MY_GURU?.honor_per_siswa.toLocaleString("id-ID")}</td>
                    <td style={{ fontWeight: 700, color: "var(--blue)" }}>
                      Rp {(r.jumlah_siswa * (MY_GURU?.honor_per_siswa || 0)).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary box */}
          <div className="content-card" style={{ maxWidth: 400 }}>
            <h3 style={{ marginBottom: 14 }}>💰 Total Honor</h3>
            {[
              { label: "Total Siswa Diajar", val: totalSiswa + " siswa" },
              { label: "Honor per Siswa",    val: "Rp " + MY_GURU?.honor_per_siswa.toLocaleString("id-ID") },
              { label: "Tanggal Bayar",      val: honor.tgl_bayar },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: ".85rem", color: "var(--muted)" }}>{item.label}</span>
                <strong style={{ fontSize: ".85rem" }}>{item.val}</strong>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
              <span style={{ fontSize: ".95rem", fontWeight: 700 }}>Total Honor</span>
              <strong style={{ fontSize: "1.1rem", color: "var(--blue)" }}>
                Rp {totalHonor.toLocaleString("id-ID")}
              </strong>
            </div>
            <div style={{ marginTop: 12 }}>
              <span className={`badge ${honor.status === "Dibayar" ? "green" : "red"}`} style={{ fontSize: ".8rem" }}>
                {honor.status === "Dibayar" ? "✅ Sudah Dibayar" : "⏳ Belum Dibayar"}
              </span>
            </div>
          </div>
        </>
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
    program: MY_GURU?.program.join(", ") || "",
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
              { label: "Email",             val: form.email   },
              { label: "No. Telepon",       val: form.kontak  },
              { label: "Program Diajar",    val: form.program },
              { label: "Honor per Siswa",   val: "Rp " + (MY_GURU?.honor_per_siswa || 0).toLocaleString("id-ID") },
              { label: "Status",            val: MY_GURU?.status || "Aktif" },
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
