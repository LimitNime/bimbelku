// ============================================================
// SiswaPages.jsx — Semua halaman dashboard Siswa
// Sesuai spesifikasi: Absensi, Pembayaran, Artikel, Profil
// ============================================================
import { useState } from "react";
import StatCard     from "../../components/StatCard.jsx";
import ArticleCard  from "../../components/ArticleCard.jsx";
import Icon         from "../../components/Icon.jsx";
import {
  STUDENTS_DATA,
  ABSENSI_DATA,
  SPP_DATA,
  ARTICLES,
  BULAN_LIST,
  TAHUN_LIST,
} from "../../data/index.js";

// Siswa yang sedang login (nanti dari Supabase Auth)
const MY_SISWA_ID = 1;
const MY_SISWA    = STUDENTS_DATA.find(s => s.id === MY_SISWA_ID);

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD SISWA
// ─────────────────────────────────────────────────────────────
export function SiswaDashboard({ onMenu }) {
  const mySPP     = SPP_DATA.filter(s => s.siswa_id === MY_SISWA_ID);
  const belumBayar= mySPP.filter(s => s.status === "Belum Bayar").length;
  const myAbsensi = ABSENSI_DATA.filter(a => a.siswa_id === MY_SISWA_ID);
  const totalHadir= myAbsensi.filter(a => a.status === "Hadir").length;

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="📚" label="Program"       value={MY_SISWA?.program || "-"}   bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="✅" label="Total Hadir"    value={totalHadir}                 bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="💰" label="SPP Belum Bayar"value={belumBayar + " bulan"}      bgColor={belumBayar > 0 ? "#fee2e2" : "#dcfce7"} textColor={belumBayar > 0 ? "#dc2626" : "#16a34a"} />
        <StatCard icon="👨‍🏫" label="Tentor"        value={MY_SISWA?.guru || "-"}      bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      {/* Notif SPP jika ada yang belum bayar */}
      {belumBayar > 0 && (
        <div style={{
          background: "#fff7ed", border: "1px solid #fed7aa",
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: "1.4rem" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#c2410c" }}>
              SPP Belum Dibayar
            </div>
            <div style={{ fontSize: ".78rem", color: "#9a3412" }}>
              Kamu memiliki {belumBayar} tagihan SPP yang belum dibayar.
            </div>
          </div>
          <button className="btn-primary"
            style={{ padding: "8px 14px", fontSize: ".78rem", background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            onClick={() => onMenu("pembayaran")}>
            Lihat
          </button>
        </div>
      )}

      <div className="content-grid-2">
        {/* Info siswa */}
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}>📋 Info Saya</h3>
          {[
            { label: "Nama",     val: MY_SISWA?.nama    },
            { label: "Sekolah",  val: MY_SISWA?.sekolah },
            { label: "Program",  val: MY_SISWA?.program },
            { label: "Tentor",   val: MY_SISWA?.guru    },
            { label: "SPP/Bln",  val: "Rp " + (MY_SISWA?.besaran_spp || 0).toLocaleString("id-ID") },
            { label: "Status",   val: MY_SISWA?.status  },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", borderBottom: "1px solid #f1f5f9",
              fontSize: ".85rem",
            }}>
              <span style={{ color: "var(--muted)" }}>{item.label}</span>
              <strong>{item.val}</strong>
            </div>
          ))}
        </div>

        {/* Artikel terbaru */}
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}>📰 Artikel Terbaru</h3>
          {ARTICLES.slice(0, 3).map((a, i) => (
            <div key={i} style={{
              display: "flex", gap: 10, padding: "10px 0",
              borderBottom: "1px solid #f1f5f9", alignItems: "center",
            }}>
              <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{a.img}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: ".85rem", lineHeight: 1.3 }}>{a.title}</div>
                <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 2 }}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ABSENSI SISWA
// ─────────────────────────────────────────────────────────────
export function AbsensiSiswa() {
  const [bulan, setBulan] = useState("Maret");
  const [tahun, setTahun] = useState("2026");

  const data = ABSENSI_DATA.filter(a => {
    const d   = new Date(a.tanggal);
    const bln = d.toLocaleDateString("id-ID", { month: "long" });
    const thn = d.getFullYear().toString();
    return a.siswa_id === MY_SISWA_ID && bln === bulan && thn === tahun;
  });

  const hadir      = data.filter(a => a.status === "Hadir").length;
  const tidakHadir = data.filter(a => a.status === "Tidak Hadir").length;
  const persen     = data.length > 0 ? Math.round((hadir / data.length) * 100) : 0;

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

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="📋" label="Total Pertemuan"    value={data.length}  bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="✅" label="Hadir"              value={hadir}        bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="❌" label="Tidak Hadir"        value={tidakHadir}   bgColor="#fee2e2" textColor="#dc2626" />
        <StatCard icon="📊" label="Persentase Hadir"   value={persen + "%"} bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head">
          <h3>Riwayat Absensi — {bulan} {tahun}</h3>
        </div>
        {data.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Belum ada data absensi di bulan ini.
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Tanggal</th><th>Program</th><th>Keterangan</th></tr>
            </thead>
            <tbody>
              {data.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {new Date(a.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </td>
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
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PEMBAYARAN SPP
// ─────────────────────────────────────────────────────────────
export function PembayaranSiswa() {
  const mySPP     = SPP_DATA.filter(s => s.siswa_id === MY_SISWA_ID);
  const lunas     = mySPP.filter(s => s.status === "Lunas").length;
  const belum     = mySPP.filter(s => s.status === "Belum Bayar").length;
  const totalBayar= mySPP.filter(s => s.status === "Lunas").reduce((a, b) => a + b.nominal, 0);

  // Cetak kwitansi sederhana
  const cetakKwitansi = (spp) => {
    const isi = `
KWITANSI PEMBAYARAN SPP
=======================
Nama Siswa : ${MY_SISWA?.nama}
Program    : ${spp.program}
Bulan      : ${spp.bulan} ${spp.tahun}
Nominal    : Rp ${spp.nominal.toLocaleString("id-ID")}
Tgl Bayar  : ${spp.tgl_bayar}
Status     : ${spp.status}
=======================
BimbelKu — Terima kasih!
    `.trim();
    const blob = new Blob([isi], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `kwitansi-spp-${spp.bulan}-${spp.tahun}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fade-in">
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="✅" label="Sudah Dibayar"  value={lunas + " bulan"}  bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="⏳" label="Belum Dibayar"  value={belum + " bulan"}  bgColor={belum > 0 ? "#fee2e2" : "#dcfce7"} textColor={belum > 0 ? "#dc2626" : "#16a34a"} />
        <StatCard icon="💰" label="Total Dibayar"  value={"Rp " + totalBayar.toLocaleString("id-ID")} bgColor="#dbeafe" textColor="#2563eb" />
      </div>

      {/* Tabel */}
      <div className="table-card">
        <div className="table-head"><h3>Riwayat Pembayaran SPP</h3></div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr><th>Bulan</th><th>Tahun</th><th>Program</th><th>Nominal</th><th>Tgl Bayar</th><th>Status</th><th>Kwitansi</th></tr>
            </thead>
            <tbody>
              {mySPP.map((s, i) => (
                <tr key={i}>
                  <td><strong>{s.bulan}</strong></td>
                  <td>{s.tahun}</td>
                  <td><span className="badge blue">{s.program}</span></td>
                  <td style={{ fontWeight: 600 }}>Rp {s.nominal.toLocaleString("id-ID")}</td>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</td>
                  <td>
                    <span className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status === "Lunas" ? (
                      <button className="icon-btn edit" onClick={() => cetakKwitansi(s)}
                        title="Download kwitansi" style={{ width: "auto", padding: "4px 10px", borderRadius: 7, fontSize: ".75rem", gap: 4, display: "flex", alignItems: "center" }}>
                        <Icon name="arrow" size={12} />Unduh
                      </button>
                    ) : (
                      <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>—</span>
                    )}
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
// 4. ARTIKEL SISWA
// ─────────────────────────────────────────────────────────────
export function ArtikelSiswa({ onArticle }) {
  const [search, setSearch] = useState("");
  const filtered = ARTICLES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <input className="form-input" style={{ maxWidth: 300 }}
          placeholder="🔍 Cari artikel..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
        {filtered.map((a, i) => (
          <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .08}s` }}>
            <ArticleCard article={a} index={i} onClick={() => onArticle(a)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. PROFIL SISWA
// ─────────────────────────────────────────────────────────────
export function ProfilSiswa({ user }) {
  const [edit,  setEdit]  = useState(false);
  const [saved, setSaved] = useState(false);
  const [form,  setForm]  = useState({
    nama:    MY_SISWA?.nama    || "",
    sekolah: MY_SISWA?.sekolah || "",
    kontak:  MY_SISWA?.kontak  || "",
    ttl:     MY_SISWA?.ttl     || "",
    alamat:  MY_SISWA?.alamat  || "",
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
        <div className="profile-avatar" style={{ background: "#22c55e" }}>
          {form.nama[0] || "S"}
        </div>

        <h2 style={{ marginBottom: 4 }}>{form.nama}</h2>
        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 20 }}>Siswa</p>

        {!edit ? (
          <>
            {[
              { label: "Email",      val: user.email        },
              { label: "No. Telepon",val: form.kontak       },
              { label: "TTL",        val: form.ttl          },
              { label: "Alamat",     val: form.alamat       },
              { label: "Sekolah",    val: form.sekolah      },
              { label: "Program",    val: MY_SISWA?.program },
              { label: "Tentor",     val: MY_SISWA?.guru    },
              { label: "Status",     val: MY_SISWA?.status  },
            ].map((f, i) => (
              <div key={i} className="profile-field">
                <label>{f.label}</label>
                <p>{f.val || "-"}</p>
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
              { label: "Nama Lengkap", key: "nama"    },
              { label: "No. Telepon",  key: "kontak"  },
              { label: "TTL",          key: "ttl"     },
              { label: "Alamat",       key: "alamat"  },
              { label: "Sekolah",      key: "sekolah" },
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
