// ============================================================
// GuruPages.jsx — Semua halaman dashboard Guru/Tentor
// ============================================================
import { useState, useEffect } from "react";
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
import {
  getSiswa, getAbsensi, insertAbsensi,
  getProgramMapel, getRaportGuru, upsertRaport, deleteRaport
} from "../../lib/db.js";
import { useToast } from "../../components/Toast.jsx";
import { useConfirm } from "../../components/Modal.jsx";
import { supabase } from "../../lib/supabase.js";

const useMyGuru = () => {
  const [myGuru,   setMyGuru]   = useState(null);
  const [myGuruId, setMyGuruId] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      supabase.from("guru")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()                          // ← tidak throw 406 kalau tidak ada
        .then(({ data }) => {
          if (data) {
            setMyGuru(data);
            setMyGuruId(data.id);
            setLoading(false);
          } else {
            // Tidak ada guru terhubung ke akun ini — coba cari by email
            supabase.from("guru").select("*").eq("email", user.email).maybeSingle()
              .then(({ data: gByEmail }) => {
                if (gByEmail) {
                  setMyGuru(gByEmail);
                  setMyGuruId(gByEmail.id);
                }
                setLoading(false);
              });
          }
        });
    });
  }, []);

  return { myGuru, myGuruId, loading };
};

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
  const { myGuru, myGuruId, loading } = useMyGuru();
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalHonor, setTotalHonor] = useState(0);

  useEffect(() => {
    if (!myGuruId) return;
    const bln = new Date().toLocaleDateString("id-ID", { month: "long" });
    const thn = new Date().getFullYear().toString();
    supabase.from("absensi").select("id")
      .eq("guru_id", myGuruId).eq("status", "Hadir")
      .eq("bulan", bln).eq("tahun", thn)
      .then(({ data }) => setTotalHadir(data?.length || 0));
  }, [myGuruId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat dashboard...</div>;

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <StatCard icon="fa-circle-check" label="Hadir Bulan Ini" value={totalHadir}                                   bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="fa-file-invoice-dollar" label="Estimasi Honor"  value={"Rp " + totalHonor.toLocaleString("id-ID")}  bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <button className="btn-primary" style={{ padding: "16px", fontSize: ".88rem", justifyContent: "center", borderRadius: 14 }}
          onClick={() => onMenu("input-absensi")}>
          <i className="fa-solid fa-pen" style={{marginRight: 8}}></i> Input Absensi
        </button>
        <button className="btn-outline" style={{ padding: "16px", fontSize: ".88rem", justifyContent: "center", borderRadius: 14 }}
          onClick={() => onMenu("rekap-absensi")}>
          <i className="fa-solid fa-calendar-check" style={{marginRight: 8}}></i> Rekap Absensi
        </button>
      </div>

      <div className="content-card">
        <h3 style={{ marginBottom: 14 }}><i className="fa-solid fa-lightbulb" style={{color: "#eab308", marginRight: 8}}></i> Info</h3>
        <p style={{ fontSize: ".85rem", color: "var(--muted)", lineHeight: 1.7 }}>
          Selamat datang, <strong>{myGuru?.nama || "Guru"}</strong>!<br />
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
  const { myGuruId } = useMyGuru();
  const [siswa,  setSiswa]  = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!myGuruId) return;
    // Siswa yang pernah diajar guru ini dari absensi
    supabase.from("absensi").select("siswa_id").eq("guru_id", myGuruId)
      .then(({ data }) => {
        const ids = [...new Set((data || []).map(a => a.siswa_id))];
        if (ids.length === 0) return;
        supabase.from("siswa")
          .select("*, programs:siswa_programs(id, nama_program, spp)")
          .in("id", ids)
          .then(({ data: s }) => setSiswa((s || []).map(x => ({
            ...x,
            programs: (x.programs || []).map(p => ({ nama: p.nama_program, spp: p.spp })),
            total_spp: (x.programs || []).reduce((a, b) => a + (b.spp || 0), 0),
          }))));
      });
  }, [myGuruId]);

  const filtered = siswa.filter(s =>
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
  const toast = useToast();
  const { myGuru, myGuruId, loading: guruLoading } = useMyGuru();
  const today    = new Date().toISOString().split("T")[0];
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();

  const [tgl,        setTgl]        = useState(today);
  const [bulan,      setBulan]      = useState(todayBln);
  const [tahun,      setTahun]      = useState(todayThn);
  const [search,     setSearch]     = useState("");
  const [saved,      setSaved]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [semuaSiswa, setSemuaSiswa] = useState([]);

  useEffect(() => {
    getSiswa()
      .then(all => setSemuaSiswa((all || STUDENTS_DATA).filter(s => s.status === "Aktif")))
      .catch(() => setSemuaSiswa(STUDENTS_DATA.filter(s => s.status === "Aktif")));
  }, []);

  const [absen, setAbsen] = useState([]);

  useEffect(() => {
    setAbsen(semuaSiswa.map(s => ({
      siswa_id:  s.id,
      nama:      s.nama,
      programs:  s.programs || [],
      program:   "",
      hadir:     false,
    })));
  }, [semuaSiswa]);

  const handleTglChange = (val) => {
    setTgl(val);
    const d = new Date(val);
    setBulan(d.toLocaleDateString("id-ID", { month: "long" }));
    setTahun(d.getFullYear().toString());
  };

  const toggleHadir    = (id) => setAbsen(absen.map(a => a.siswa_id === id ? { ...a, hadir: !a.hadir } : a));
  const setProgram     = (id, prog) => setAbsen(absen.map(a => a.siswa_id === id ? { ...a, program: prog } : a));
  const hadirSemua     = () => setAbsen(absen.map(a => ({ ...a, hadir: true })));
  const kosongkanSemua = () => setAbsen(absen.map(a => ({ ...a, hadir: false, program: "" })));

  const filtered   = absen.filter(a => a.nama.toLowerCase().includes(search.toLowerCase()));
  const totalHadir = absen.filter(a => a.hadir).length;

  const handleSimpan = async () => {
    if (!myGuruId) return toast.warning("Tidak bisa identify guru. Coba refresh.");
    const diisi = absen.filter(a => a.hadir);
    if (diisi.length === 0) return toast.warning("Belum ada siswa yang ditandai hadir!");
    const belumPilih = diisi.filter(a => !a.program);
    if (belumPilih.length > 0) return toast.warning(`${belumPilih.map(a => a.nama).join(", ")} belum dipilih programnya!`);
    setSaving(true);
    const sesi_id = Date.now();
    const rows = diisi.map(a => ({
      sesi_id,
      tanggal:    tgl,
      bulan,
      tahun,
      siswa_id:   a.siswa_id,
      siswa_nama: a.nama,
      program:    a.program,
      guru_id:    myGuruId,      // ← UUID dari Supabase, bukan angka 1
      guru_nama:  myGuru?.nama || "",
      status:     "Hadir",
      verified:   false,
    }));
    try {
      await insertAbsensi(rows);
      setSaved(true);
      toast.success(`Absensi ${diisi.length} siswa berhasil disimpan! ✓`);
      if (onSaved) onSaved(rows.map(r => ({ ...r, id: crypto.randomUUID() })));
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      toast.error("Gagal simpan absensi: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (guruLoading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat...</div>;

  return (
    <div className="fade-in">
      {/* Filter */}
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
        <StatCard icon="fa-user-graduate" label="Total Siswa" value={absen.length}  bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="fa-circle-check"   label="Hadir"       value={totalHadir}   bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="fa-square"   label="Belum Diisi" value={absen.length - totalHadir} bgColor="#f1f5f9" textColor="#64748b" />
      </div>

      <div className="table-card">
        <div className="table-head">
          <div>
            <h3>Daftar Hadir — {fmtTglShort(tgl)}</h3>
            <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 3 }}>
              Diisi oleh: <strong>{myGuru?.nama || "Guru"}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={hadirSemua} className="btn-outline"
              style={{ padding: "7px 12px", fontSize: ".78rem" }}>
              <i className="fa-solid fa-check-double" style={{marginRight: 6}}></i> Semua Hadir
            </button>
            <button onClick={kosongkanSemua} style={{
              padding: "7px 12px", fontSize: ".78rem", borderRadius: 8,
              border: "1.5px solid #fee2e2", background: "transparent",
              color: "#dc2626", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}>
              <i className="fa-solid fa-eraser" style={{marginRight: 6}}></i> Kosongkan
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="form-input" style={{ maxWidth: 280 }}
            placeholder="🔍 Cari nama siswa..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Pilih Program</th>
                <th>Hadir</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.siswa_id} style={{ background: a.hadir ? "#f0fdf4" : "#fff" }}>
                  <td><strong>{a.nama}</strong></td>
                  <td>
                    {a.programs.length > 0 ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {a.programs.map((p, i) => (
                          <button key={i} onClick={() => setProgram(a.siswa_id, p.nama)}
                            style={{
                              padding: "4px 12px", borderRadius: 100, border: "none",
                              cursor: "pointer", fontFamily: "inherit",
                              fontSize: ".75rem", fontWeight: 700, transition: ".15s",
                              background: a.program === p.nama ? "var(--blue)" : "#f1f5f9",
                              color: a.program === p.nama ? "#fff" : "#94a3b8",
                            }}>
                            {p.nama}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>Tidak ada program</span>
                    )}
                  </td>
                  <td>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input type="checkbox" checked={a.hadir}
                        onChange={() => toggleHadir(a.siswa_id)}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#16a34a" }} />
                      {a.hadir && (
                        <span style={{ fontSize: ".8rem", fontWeight: 700, color: "#16a34a" }}>Hadir</span>
                      )}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn-primary" style={{ padding: "10px 24px", fontSize: ".88rem" }}
            onClick={handleSimpan} disabled={saving}>
            <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : `Simpan Absensi (${totalHadir} siswa hadir)`}</>
          </button>
          {saved && (
            <span style={{ color: "#16a34a", fontWeight: 600, fontSize: ".85rem" }}>
              <i className="fa-solid fa-circle-check" style={{marginRight: 6}}></i> Absensi berhasil disimpan!
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
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { myGuruId, loading: guruLoading } = useMyGuru();
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();
  const [bulan, setBulan] = useState(todayBln);
  const [tahun, setTahun] = useState(todayThn);
  const [filterTgl, setFilterTgl] = useState("");
  const [search, setSearch] = useState("");
  const [dbAbsensi, setDbAbsensi] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAbsensi = async () => {
    if (!myGuruId) return;
    setLoading(true);
    try {
      const data = await getAbsensi(bulan, tahun);
      setDbAbsensi(data.filter(a => a.guru_id === myGuruId));
    } catch { 
      setDbAbsensi([]); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadAbsensi(); }, [myGuruId, bulan, tahun]);

  // FIX #1: Hanya gunakan data dari DB agar tidak dobel setelah simpan
  const allAbsensi = [...dbAbsensi];

  // Filter per hari jika dipilih
  const filtered = allAbsensi.filter(a => {
    const tglOk = !filterTgl || a.tanggal === filterTgl;
    const searchOk = !search || (a.siswa_nama || "").toLowerCase().includes(search.toLowerCase());
    return tglOk && searchOk;
  });

  const pertemuanUnik = [...new Set(allAbsensi.map(a => a.sesi_id || a.tanggal))].length;
  const totalHadir = allAbsensi.filter(a => a.status === "Hadir").length;

  // Kelompokkan per sesi
  const perSesi = {};
  allAbsensi.forEach(a => {
    const key = String(a.sesi_id || a.tanggal);
    if (!perSesi[key]) perSesi[key] = { tanggal: a.tanggal, sesi_id: key, siswa: [], ids: [], verified: a.verified };
    perSesi[key].siswa.push(a.siswa_nama || a.nama || "-");
    perSesi[key].ids.push(a.id);
    if (a.verified) perSesi[key].verified = true;
  });

  let rows = Object.values(perSesi).sort((a, b) => a.tanggal.localeCompare(b.tanggal));

  // Filter per hari pada level sesi
  if (filterTgl) rows = rows.filter(r => r.tanggal === filterTgl);
  if (search) rows = rows.filter(r => r.siswa.some(n => n.toLowerCase().includes(search.toLowerCase())));

  // Hapus satu sesi
  const hapusSesi = async (ids) => {
    const ok = await confirm({
      title: "Hapus Sesi?",
      message: `${ids.length} record absensi dalam sesi ini akan dihapus permanen.`,
      type: "danger",
      confirmText: "Ya, Hapus",
    });
    if (!ok) return;

    try {
      // FIX #2: Karena data sudah murni dari DB, kita tidak perlu filter "temp" lagi yang rumit
      const { error } = await supabase
        .from("absensi")
        .delete()
        .in("id", ids);

      if (error) throw error;
      
      setDbAbsensi(prev => prev.filter(a => !ids.includes(a.id)));
      toast.success("Sesi absensi berhasil dihapus.");
    } catch (e) { 
      toast.error("Gagal hapus: " + e.message); 
    }
  };

  if (guruLoading || loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat rekap absensi...</div>;

  return (
    <div className="fade-in">
      {/* Filter UI tetap sama */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" style={{ width: 160 }} value={bulan}
            onChange={e => { setBulan(e.target.value); setFilterTgl(""); }}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" style={{ width: 100 }} value={tahun}
            onChange={e => { setTahun(e.target.value); setFilterTgl(""); }}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Filter Hari</label>
          <input type="date" className="form-input" style={{ width: 160 }} value={filterTgl}
            onChange={e => setFilterTgl(e.target.value)} />
        </div>
        {filterTgl && (
          <button className="btn-outline" style={{ padding: "9px 12px", fontSize: ".78rem" }}
            onClick={() => setFilterTgl("")}>✕ Reset Filter</button>
        )}
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="fa-calendar-days" label="Total Pertemuan" value={pertemuanUnik + "x"} bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="fa-user-check" label="Total Hadir" value={totalHadir + " siswa"} bgColor="#dcfce7" textColor="#16a34a" />
      </div>

      <div className="table-card">
        <div className="table-head">
          <h3>Rekap Kehadiran — {bulan} {tahun}{filterTgl ? ` (${new Date(filterTgl).toLocaleDateString("id-ID", { day: "numeric", month: "short" })})` : ""}</h3>
        </div>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <input className="form-input" style={{ maxWidth: 260 }}
            placeholder="🔍 Cari nama siswa..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
            Belum ada data kehadiran{filterTgl ? " di hari ini" : " di bulan ini"}.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Siswa Hadir</th>
                  <th>Jumlah</th>
                  <th>Verifikasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: ".82rem", whiteSpace: "nowrap" }}>
                      {new Date(r.tanggal).toLocaleDateString("id-ID", {
                        weekday: "short", day: "numeric", month: "short",
                      })}
                    </td>
                    <td style={{ fontSize: ".82rem" }}>{r.siswa.join(", ")}</td>
                    <td><span className="badge blue">{r.siswa.length} siswa</span></td>
                    <td>
                      {r.verified ? (
                        <span style={{ fontSize: ".78rem", fontWeight: 700, color: "#16a34a" }}><i className="fa-solid fa-check" style={{marginRight: 4}}></i> Verified</span>
                      ) : (
                        <span style={{ fontSize: ".78rem", fontWeight: 600, color: "#b45309" }}><i className="fa-solid fa-hourglass-half" style={{marginRight: 4}}></i> Menunggu</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => hapusSesi(r.ids)}
                        style={{
                          padding: "4px 10px", borderRadius: 7, border: "none",
                          background: "#fee2e2", color: "#dc2626", cursor: "pointer",
                          fontSize: ".72rem", fontWeight: 700, fontFamily: "inherit",
                        }}
                        title="Hapus sesi ini">
                        <i className="fa-solid fa-trash-can" style={{marginRight: 4}}></i> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. HONOR GURU (lihat honor sendiri — hasil akhir dari admin)
// ─────────────────────────────────────────────────────────────
export function HonorGuruPage() {
  const { myGuruId, loading: guruLoading } = useMyGuru();
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();
  const [bulan,   setBulan]  = useState(todayBln);
  const [tahun,   setTahun]  = useState(todayThn);
  const [honor,   setHonor]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!myGuruId) return;
    setLoading(true);
    supabase.from("honor_data")
      .select("*")
      .eq("guru_id", myGuruId)
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .maybeSingle()
      .then(({ data }) => setHonor(data || null))
      .catch(() => setHonor(null))
      .finally(() => setLoading(false));
  }, [myGuruId, bulan, tahun]);

  // Parse jsonb
  const parse = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const mengajar       = parse(honor?.mengajar);
  const komponenTetap  = parse(honor?.komponen_tetap);
  const honorTambahan  = parse(honor?.honor_tambahan);
  const totalMengajar  = mengajar.reduce((a, b)     => a + (b.jumlah_pertemuan||0) * (b.honor_per_siswa||0), 0);
  const totalKomponen  = komponenTetap.reduce((a, b) => a + (b.nominal||0), 0);
  const totalTambahan  = honorTambahan.reduce((a, b) => a + (b.nominal||0), 0);
  const totalGaji      = totalMengajar + totalKomponen + totalTambahan;
  const fmt = (n) => "Rp " + (n||0).toLocaleString("id-ID");

  if (guruLoading || loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat honor...</div>;

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
          <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--border)" }}><i className="fa-solid fa-box-open"></i></div>
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
                background: honor?.status === "Dibayar" ? "rgba(255,255,255,.25)" : "rgba(239,68,68,.3)",
              }}>
                {honor?.status === "Dibayar" ? <><i className="fa-solid fa-check" style={{marginRight: 4}}></i>Sudah Dibayar</> : <><i className="fa-solid fa-hourglass-half" style={{marginRight: 4}}></i>Belum Dibayar</>}
              </span>
              {honor?.tgl_bayar !== "-" && (
                <span style={{ fontSize: ".78rem", opacity: .8 }}>
                  Dibayar: {honor?.tgl_bayar}
                </span>
              )}
            </div>
          </div>

          {/* Rincian honor mengajar */}
          <div className="content-card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}><i className="fa-solid fa-chalkboard-user" style={{marginRight:8, color: "var(--primary)"}}></i> Honor Mengajar</h3>
            {mengajar.map((m, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "10px 0",
                borderBottom: "1px solid #f1f5f9",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: ".88rem" }}>{m.program}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>
                    {m.jumlah_pertemuan || 0} pertemuan × {fmt(m.honor_per_siswa||0)}
                  </div>
                </div>
                <strong style={{ color: "var(--blue)" }}>
                  {fmt((m.jumlah_pertemuan||0) * (m.honor_per_siswa||0))}
                </strong>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 700 }}>
              <span>Subtotal Mengajar</span>
              <span style={{ color: "var(--blue)" }}>{fmt(totalMengajar)}</span>
            </div>
          </div>

          {/* Komponen tetap */}
          {komponenTetap.length > 0 && (
            <div className="content-card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}><i className="fa-solid fa-sack-dollar" style={{marginRight:8, color: "#16a34a"}}></i> Komponen Tetap</h3>
              {komponenTetap.map((k, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: ".88rem" }}>{k.nama}</span>
                  <strong style={{ color: "#16a34a" }}>{fmt(k.nominal)}</strong>
                </div>
              ))}
            </div>
          )}

          {honorTambahan.length > 0 && (
            <div className="content-card" style={{ marginBottom: 16 }}>
              <h3 style={{ marginBottom: 14, fontSize: ".92rem" }}><i className="fa-solid fa-hand-holding-dollar" style={{marginRight:8, color: "#d97706"}}></i> Honor Tambahan</h3>
              {honorTambahan.map((t, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
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
  const toast = useToast();
  const { myGuru, myGuruId, loading } = useMyGuru();
  const [edit,    setEdit]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ nama: "", email: "", kontak: "", ttl: "", alamat: "" });
  const [pwdForm, setPwdForm] = useState({ baru: "", konfirmasi: "" });

  useEffect(() => {
    if (myGuru) setForm({
      nama:   myGuru.nama   || "",
      email:  myGuru.email  || "",
      kontak: myGuru.kontak || "",
      ttl:    myGuru.ttl    || "",
      alamat: myGuru.alamat || "",
    });
  }, [myGuru]);

  const handleSave = async () => {
    if (!myGuruId) return;
    setSaving(true);
    try {
      // 1. Update tabel guru — data terlihat di halaman Data Guru admin
      const { error: guruErr } = await supabase
        .from("guru")
        .update({ nama: form.nama, email: form.email, kontak: form.kontak, ttl: form.ttl, alamat: form.alamat })
        .eq("id", myGuruId);
      if (guruErr) throw guruErr;

      // 2. Update tabel profiles — nama terlihat di Manajemen User admin
      if (myGuru?.user_id) {
        await supabase
          .from("profiles")
          .update({ nama: form.nama })
          .eq("id", myGuru.user_id);
      }

      // 3. Ganti password jika diisi
      if (showPwd && pwdForm.baru) {
        if (pwdForm.baru.length < 6) { toast.warning("Password minimal 6 karakter!"); setSaving(false); return; }
        if (pwdForm.baru !== pwdForm.konfirmasi) { toast.warning("Konfirmasi password tidak cocok!"); setSaving(false); return; }
        const { error: pwErr } = await supabase.auth.updateUser({ password: pwdForm.baru });
        if (pwErr) throw pwErr;
        setPwdForm({ baru: "", konfirmasi: "" });
        setShowPwd(false);
      }

      setEdit(false);
      toast.success("Profil berhasil diperbarui! Perubahan sudah tampil di halaman admin.");
    } catch (e) {
      toast.error("Gagal simpan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat profil...</div>;

  return (
    <div className="fade-in">
      <div className="profile-card">
        <div className="profile-avatar" style={{ background: "#3b82f6" }}>
          {form.nama[0] || "G"}
        </div>
        <h2 style={{ marginBottom: 4 }}>{form.nama}</h2>
        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 20 }}>Tentor / Guru</p>

        {!edit ? (
          <>
            {[
              { label: "Email",       val: form.email  },
              { label: "No. Telepon", val: form.kontak },
              { label: "TTL",         val: form.ttl    },
              { label: "Alamat",      val: form.alamat },
              { label: "Status",      val: myGuru?.status || "Aktif" },
            ].map((f, i) => (
              <div key={i} className="profile-field">
                <label>{f.label}</label>
                <p>{f.val || "-"}</p>
              </div>
            ))}
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem", marginTop: 8 }}
              onClick={() => setEdit(true)}>
              <Icon name="edit" size={14} />Edit Profil
            </button>
          </>
        ) : (
          <>
            {[
              { label: "Nama Lengkap", key: "nama"   },
              { label: "Email (Tidak bisa diubah)", key: "email", disabled: true },
              { label: "No. Telepon",  key: "kontak" },
              { label: "TTL",          key: "ttl"    },
              { label: "Alamat",       key: "alamat" },
            ].map((f, i) => (
              <div key={i} className="form-group">
                <label className="form-label">{f.label}</label>
                <input className="form-input" value={form[f.key]}
                  disabled={f.disabled}
                  style={f.disabled ? { background: "#f1f5f9", cursor: "not-allowed" } : {}}
                  onChange={e => !f.disabled && setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}

            {/* Ganti password */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 8 }}>
              <button onClick={() => setShowPwd(!showPwd)}
                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: ".83rem", fontWeight: 600, fontFamily: "inherit", padding: 0, marginBottom: 10 }}>
                {showPwd ? <><i className="fa-solid fa-chevron-up" style={{marginRight: 6}}></i>Tutup ganti password</> : <><i className="fa-solid fa-key" style={{marginRight: 6}}></i>Ganti Password</>}
              </button>
              {showPwd && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="form-group">
                    <label className="form-label">Password Baru (min. 6 karakter)</label>
                    <input className="form-input" type="password" placeholder="••••••••"
                      value={pwdForm.baru} onChange={e => setPwdForm({ ...pwdForm, baru: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Konfirmasi Password Baru</label>
                    <input className="form-input" type="password" placeholder="••••••••"
                      value={pwdForm.konfirmasi} onChange={e => setPwdForm({ ...pwdForm, konfirmasi: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
                onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 6}}></i>Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i>Simpan</>}
              </button>
              <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }}
                onClick={() => { setEdit(false); setShowPwd(false); }}>
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. RAPORT GURU
// Guru input nilai per mapel per siswa per bulan
// ─────────────────────────────────────────────────────────────
export function RaportGuru() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const { myGuru, myGuruId, loading: loadingGuru } = useMyGuru();
  
  const now = new Date();
  const todayBln = now.toLocaleDateString("id-ID", { month: "long" });
  const todayThn = now.getFullYear().toString();

  const [bulan, setBulan] = useState(todayBln);
  const [tahun, setTahun] = useState(todayThn);
  const [loading, setLoading] = useState(true);
  const [siswa, setSiswa] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [raportRekap, setRaportRekap] = useState([]);
  const [view, setView] = useState("input"); // "input" | "rekap"

  // State untuk form input per siswa
  const [inputState, setInputState] = useState({}); // { [siswa_id]: { mapel, nilai, keterangan } }

  useEffect(() => {
    if (loadingGuru || !myGuruId) return;
    setLoading(true);
    Promise.all([getSiswa(), getProgramMapel(), getRaportGuru(myGuruId, bulan, tahun)])
      .then(([s, m, r]) => {
        // Filter siswa yang memiliki program yang sama dengan guru (asumsi sederhana: guru mengajar program tertentu)
        // Jika guru tidak punya program_spesifik, tampilkan semua siswa aktif
        setSiswa(s.filter(x => x.status === "Aktif") || []);
        setMapelList(m || []);
        setRaportRekap(r || []);
      })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [loadingGuru, myGuruId, bulan, tahun]);

  const handleInputChange = (siswaId, field, val) => {
    setInputState(prev => ({
      ...prev,
      [siswaId]: { ...prev[siswaId], [field]: val }
    }));
  };

  const handleSave = async (s) => {
    const state = inputState[s.id];
    if (!state?.mapel || !state?.nilai) return toast.warning("Pilih mapel dan isi nilai!");
    
    try {
      const row = {
        siswa_id: s.id,
        siswa_nama: s.nama,
        program: s.programs && s.programs.length > 0 ? s.programs[0].nama : "Umum",
        mata_pelajaran: state.mapel,
        guru_id: myGuruId,
        guru_nama: myGuru.nama,
        nilai: parseFloat(state.nilai),
        keterangan: state.keterangan || "",
        bulan,
        tahun,
        status: "Draft"
      };
      
      await upsertRaport(row);
      toast.success(`Nilai ${state.mapel} untuk ${s.nama} disimpan!`);
      
      // Refresh rekap
      const newRekap = await getRaportGuru(myGuruId, bulan, tahun);
      setRaportRekap(newRekap);

      // Clear input
      setInputState(prev => {
        const next = { ...prev };
        delete next[s.id];
        return next;
      });
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
  };

  const handleDelete = async (id) => {
    const r = raportRekap.find(x => x.id === id);
    if (r?.status === "Final") return toast.error("Raport sudah final, tidak bisa dihapus!");
    
    const ok = await confirm({ title: "Hapus Nilai?", message: "Nilai ini akan dihapus dari raport siswa.", type: "danger" });
    if (!ok) return;

    try {
      await deleteRaport(id);
      setRaportRekap(prev => prev.filter(x => x.id !== id));
      toast.success("Nilai dihapus.");
    } catch (e) { toast.error(e.message); }
  };

  if (loadingGuru || loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data Raport...</div>;

  return (
    <div className="fade-in">
      {/* Header & Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <button className={view === "input" ? "btn-primary" : "btn-outline"} onClick={() => setView("input")}>
            <i className="fa-solid fa-pen-nib" style={{marginRight: 6}}></i> Input Nilai
          </button>
          <button className={view === "rekap" ? "btn-primary" : "btn-outline"} onClick={() => setView("rekap")}>
            <i className="fa-solid fa-chart-simple" style={{marginRight: 6}}></i> Rekap Terisi ({raportRekap.length})
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select className="form-input" style={{ width: 130 }} value={bulan} onChange={e => setBulan(e.target.value)}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="form-input" style={{ width: 90 }} value={tahun} onChange={e => setTahun(e.target.value)}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {view === "input" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {siswa.map(s => {
            const mySiswaPrograms = (s.programs || []).map(p => p.nama);
            const myMapels = mapelList.filter(m => mySiswaPrograms.includes(m.program));
            const state = inputState[s.id] || { mapel: "", nilai: "", keterangan: "" };
            
            return (
              <div key={s.id} className="content-card" style={{ padding: 16 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 200px" }}>
                    <div style={{ fontWeight: 700, fontSize: ".92rem" }}>{s.nama}</div>
                    <div style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 2 }}>{mySiswaPrograms.join(", ") || "-"}</div>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0, flex: "1 1 180px" }}>
                    <label className="form-label" style={{ fontSize: ".72rem" }}>Mata Pelajaran</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <select className="form-input" 
                        value={state.mapel_select || (myMapels.find(m => m.mapel === state.mapel) ? state.mapel : (state.mapel ? "Lainnya" : ""))} 
                        onChange={e => {
                          const val = e.target.value;
                          handleInputChange(s.id, "mapel_select", val);
                          if (val !== "Lainnya") handleInputChange(s.id, "mapel", val);
                          else handleInputChange(s.id, "mapel", "");
                        }}>
                        <option value="">-- Pilih Mapel --</option>
                        {myMapels.map(m => <option key={m.id} value={m.mapel}>{m.mapel}</option>)}
                        <option value="Lainnya">Lainnya (Input Manual)</option>
                      </select>
                      
                      {(state.mapel_select === "Lainnya" || myMapels.length === 0) && (
                        <input className="form-input" placeholder="Ketik nama mapel..." 
                          value={state.mapel} onChange={e => handleInputChange(s.id, "mapel", e.target.value)} />
                      )}
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, flex: "0 0 80px" }}>
                    <label className="form-label" style={{ fontSize: ".72rem" }}>Nilai</label>
                    <input type="number" className="form-input" placeholder="0-100" 
                      value={state.nilai} onChange={e => handleInputChange(s.id, "nilai", e.target.value)} />
                  </div>

                  <div className="form-group" style={{ margin: 0, flex: "1 1 200px" }}>
                    <label className="form-label" style={{ fontSize: ".72rem" }}>Catatan/Keterangan</label>
                    <input className="form-input" placeholder="Contoh: Sangat baik..." 
                      value={state.keterangan} onChange={e => handleInputChange(s.id, "keterangan", e.target.value)} />
                  </div>

                  <button className="btn-primary" onClick={() => handleSave(s)} style={{ height: 38, padding: "0 16px" }}>
                    Simpan
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="content-card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Mapel</th>
                <th style={{ textAlign: "center" }}>Nilai</th>
                <th>Keterangan</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {raportRekap.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.siswa_nama}</strong></td>
                  <td>{r.mapel}</td>
                  <td style={{ textAlign: "center", fontWeight: 700, color: r.nilai >= 75 ? "#16a34a" : "#dc2626" }}>{r.nilai}</td>
                  <td style={{ fontSize: ".82rem" }}>{r.keterangan}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className={`badge ${r.status === "Final" ? "green" : "yellow"}`} style={{ fontSize: ".65rem" }}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    {r.status === "Draft" && (
                      <button className="icon-btn del" onClick={() => handleDelete(r.id)}>
                        <Icon name="trash" size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {raportRekap.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: 30, color: "var(--muted)" }}>
                    Belum ada nilai yang Anda input bulan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}