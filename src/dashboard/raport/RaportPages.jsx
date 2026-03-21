import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/Toast.jsx";
import { useConfirm } from "../../components/Modal.jsx";
import { getRaport, getRaportGuru, getRaportSiswa, upsertRaport, deleteRaport, setRaportFinal, setRaportDraft, getProgramMapel, getSiswa, getGuru } from "../../lib/db.js";
import { exportExcel } from "../../utils/exportHelper.js";
import { exportRaportPDF } from "../../utils/pdfRaport.js";
import { BULAN_LIST, TAHUN_LIST } from "../../data/index.js";
import Icon from "../../components/Icon.jsx";
import DataTable from "../../components/DataTable.jsx";

// ==============================================================================
// 1. ADMIN RAPORT (Kelola, Validasi, Cetak)
// ==============================================================================
export function AdminRaport({ user, siteInfo }) {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [bulan, setBulan] = useState(BULAN_LIST[new Date().getMonth()]);
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [raports, setRaports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal for Admin
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRaport = async () => {
    setLoading(true);
    try {
      const data = await getRaport(bulan, tahun);
      setRaports(data || []);
    } catch (e) {
      toast.error("Gagal memuat raport: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRaport();
  }, [bulan, tahun]);

  const handleToggleValid = async (r) => {
    try {
      if (r.validated) {
        await setRaportDraft(r.siswa_id, r.program, r.bulan, r.tahun);
        toast.success("Raport ditarik ke Draft.");
      } else {
        await setRaportFinal(r.siswa_id, r.program, r.bulan, r.tahun);
        toast.success("Raport divalidasi dan sekarang bisa dilihat Siswa.");
      }
      fetchRaport();
    } catch (e) {
      toast.error("Gagal update status: " + e.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Hapus Raport",
      message: "Apakah Anda yakin ingin menghapus data raport ini? Tindakan ini tidak bisa dibatalkan.",
      type: "danger"
    });
    if (!ok) return;

    try {
      await deleteRaport(id);
      setRaports(prev => prev.filter(r => r.id !== id));
      toast.success("Raport berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus: " + e.message);
    }
  };

  const handleOpenEdit = (r) => {
    setEditData({ ...r });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await upsertRaport(editData);
      toast.success("Perubahan raport disimpan.");
      setShowEdit(false);
      fetchRaport();
    } catch (e) {
      toast.error("Gagal menyimpan: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <select className="form-input" value={bulan} onChange={e => setBulan(e.target.value)} style={{ width: 140 }}>
          {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
        </select>
        <select className="form-input" value={tahun} onChange={e => setTahun(e.target.value)} style={{ width: 100 }}>
          {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
        </select>
        <button className="btn-outline" onClick={fetchRaport} title="Refresh Data">
          <Icon name="rotate" />
        </button>
      </div>

      <DataTable
        title={`Semua Raport (${raports.length})`}
        data={raports}
        searchPlaceholder="Cari siswa, program, atau guru..."
        searchKeys={["siswa_nama", "program", "mata_pelajaran", "guru_nama"]}
        headers={[
          "Siswa",
          "Program / Mapel",
          "Guru Pengampu",
          { label: "Status", align: "center" },
          { label: "Aksi", align: "right" }
        ]}
        renderRow={(r) => [
          <div key="siswa">
            <div style={{ fontWeight: 600 }}>{r.siswa_nama}</div>
            <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{r.kelas}</div>
          </div>,
          <div key="prog">
            <div style={{ fontSize: ".85rem" }}>{r.program}</div>
            {r.mata_pelajaran && <div style={{ fontSize: ".7rem", color: "var(--blue)", fontWeight: 700 }}>{r.mata_pelajaran}</div>}
          </div>,
          <span key="guru" style={{ fontSize: ".85rem" }}>{r.guru_nama}</span>,
          <div key="stat" style={{ textAlign: "center" }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: r.validated ? "#dcfce7" : "#fef08a", color: r.validated ? "#16a34a" : "#ca8a04" }}>
              {r.validated ? "Tervalidasi" : "Draft Guru"}
            </span>
          </div>,
          <div key="btns" className="action-btns" style={{ justifyContent: "flex-end" }}>
            <button className="icon-btn" style={{ background: "#fee2e2", color: "#ef4444" }} onClick={() => exportRaportPDF([r], siteInfo)} title="Download PDF">
              <Icon name="file-pdf" />
            </button>
            <button className="icon-btn edit" onClick={() => handleOpenEdit(r)} title="Edit Raport">
              <Icon name="pen-to-square" />
            </button>
            <button onClick={() => handleToggleValid(r)} className="icon-btn" style={{ background: r.validated ? "#fef3c7" : "#dcfce7", color: r.validated ? "#d97706" : "#059669" }} title={r.validated ? "Batalkan Validasi" : "Validasi Raport"}>
              <Icon name={r.validated ? "xmark" : "check"} />
            </button>
            <button className="icon-btn del" onClick={() => handleDelete(r.id)} title="Hapus">
              <Icon name="trash" />
            </button>
          </div>
        ]}
      />

      <ConfirmDialog />
    {/* --- Admin Edit Modal --- */}
      {showEdit && editData && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Edit Raport (Admin)</h2>
              <button className="modal-close" onClick={() => setShowEdit(false)}><Icon name="xmark" /></button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Siswa</label>
                <input type="text" className="form-input" value={editData.siswa_nama} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Program</label>
                <input type="text" className="form-input" value={editData.program} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Mata Pelajaran</label>
                <input type="text" className="form-input" value={editData.mata_pelajaran || ""} onChange={e => setEditData({...editData, mata_pelajaran: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Kelas / Jenjang</label>
                <input type="text" className="form-input" value={editData.kelas} onChange={e => setEditData({...editData, kelas: e.target.value})} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Pembelajaran (Materi)</label>
              <input type="text" className="form-input" value={editData.materi} onChange={e => setEditData({...editData, materi: e.target.value})} />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Fokus & Sasaran</label>
              <input type="text" className="form-input" value={editData.fokus_sasaran} onChange={e => setEditData({...editData, fokus_sasaran: e.target.value})} />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Catatan Perkembangan</label>
              <textarea className="form-input" rows="5" value={editData.catatan} onChange={e => setEditData({...editData, catatan: e.target.value})} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28 }}>
              <button className="btn-outline" onClick={() => setShowEdit(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// 2. GURU RAPORT (Input Naratif)
// ==============================================================================
export function GuruRaport({ user, siteInfo }) {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [myGuruId, setMyGuruId] = useState(null);
  const [isGuruUnlinked, setIsGuruUnlinked] = useState(false);
  const [bulan, setBulan] = useState(BULAN_LIST[new Date().getMonth()]);
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [programList, setProgramList] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [mapel, setMapel] = useState("");

  const [siswaDB, setSiswaDB] = useState([]);
  const [raportDB, setRaportDB] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  // Load Guru ID first
  useEffect(() => {
    supabase.from("guru").select("id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMyGuruId(data.id);
        } else {
          // Fallback check by email (use email from props)
          supabase.from("guru").select("id").eq("email", user.email).maybeSingle()
            .then(({ data: g }) => {
              if (g) setMyGuruId(g.id);
              else {
                setIsGuruUnlinked(true);
                setLoading(false);
              }
            });
        }
      });
  }, [user.id]);

  useEffect(() => {
    if (!myGuruId) return;
    setLoading(true);
    Promise.all([
      getSiswa(), 
      getRaport(bulan, tahun) // Ambil semua untuk cek status pengisian guru lain
    ]).then(([siswas, raports]) => {
      // Tampilkan siswa jika: 1. Status Aktif, ATAU 2. Sudah ada raport di bulan/tahun ini (histori)
      const visibleSiswas = siswas.filter(s => {
        const isAktif = s.status === "Aktif";
        const hasReport = (raports || []).some(r => r.siswa_id === s.id);
        return isAktif || hasReport;
      });
      setSiswaDB(visibleSiswas);
      setRaportDB(raports || []);
      
      // Ambil program unik dari siswa yang tampil
      const progs = new Set();
      visibleSiswas.forEach(s => (s.programs||[]).forEach(p => progs.add(p.nama)));
      const arrProgs = Array.from(progs).sort();
      setProgramList(arrProgs);

      // Pastikan program terpilih ada di list, jika tidak (atau kosong), pilih yang pertama
      if (arrProgs.length > 0) {
        if (!selectedProgram || !arrProgs.includes(selectedProgram)) {
          setSelectedProgram(arrProgs[0]);
        }
      } else {
        setSelectedProgram("");
      }
      
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, [myGuruId, bulan, tahun]); // Re-fetch when ID found or month/year changes

  const isMapel = (selectedProgram || "").toLowerCase().includes("mapel");

  const filteredSiswa = siswaDB.filter(s => 
    (s.programs || []).some(p => p.nama === selectedProgram)
  );

  const handleOpenModal = (siswa) => {
    if (isMapel && !mapel.trim()) {
      toast.error("Silakan isi nama Mata Pelajaran terlebih dahulu di filter atas!");
      return;
    }

    const currentMapel = (isMapel ? mapel.trim() : "").toLowerCase();
    const existing = raportDB.find(r => 
      r.siswa_id === siswa.id && 
      r.program === selectedProgram && 
      (r.mata_pelajaran || "").toLowerCase() === currentMapel
    );

    if (existing && existing.validated) {
      toast.info("Raport ini sudah divalidasi Admin dan tidak dapat diubah.");
      return;
    }

    if (existing && existing.guru_id !== myGuruId) {
      toast.warning(`Raport ini sudah diisi oleh ${existing.guru_nama}. Anda hanya bisa mengedit raport yang Anda buat sendiri.`);
      return;
    }

    if (existing) {
      setEditData(existing);
    } else {
      setEditData({
        siswa_id: siswa.id,
        siswa_nama: siswa.nama,
        kelas: siswa.sekolah || "-",
        materi: "",
        fokus_sasaran: "",
        catatan: ""
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editData.materi || !editData.fokus_sasaran || !editData.catatan || !editData.kelas) {
      toast.error("Harap isi semua kolom dengan lengkap!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editData,
        guru_id: myGuruId,
        guru_nama: user.nama || user.email.split("@")[0],
        program: selectedProgram,
        mata_pelajaran: isMapel ? mapel.trim() : "",
        bulan,
        tahun,
        tanggal: new Date().toISOString().split("T")[0],
      };
      const saved = await upsertRaport(payload);
      
      // Update local state
      setRaportDB(prev => {
        const idx = prev.findIndex(r => r.id === saved.id);
        if (idx >= 0) return [...prev.slice(0, idx), saved, ...prev.slice(idx + 1)];
        return [...prev, saved];
      });
      
      toast.success("Raport berhasil disimpan!");
      setShowModal(false);
    } catch (e) {
      toast.error("Gagal menyimpan raport: " + e.message);
    }
    setSaving(false);
  };

  if (isGuruUnlinked) return (
    <div className="content-card fade-in" style={{ padding: 60, textAlign: "center", border: "1.5px dashed #cbd5e1" }}>
      <div style={{ fontSize: "3rem", marginBottom: 20, color: "var(--slate-400)" }}><i className="fa-solid fa-user-xmark"></i></div>
      <h3 style={{ color: "var(--slate-700)" }}>Profil Guru Tidak Ditemukan</h3>
      <p style={{ color: "var(--muted)", maxWidth: 450, margin: "0 auto" }}>
        Akun <strong>{user.email}</strong> belum terhubung ke database Guru.<br/>
        Silakan hubungi Admin untuk menautkan akun Anda atau pastikan email sama dengan di data Guru.
      </p>
    </div>
  );

  return (
    <div className="fade-in">

      {/* ── Toolbar & Filter ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" value={bulan} onChange={e => setBulan(e.target.value)} style={{ width: 140 }}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" value={tahun} onChange={e => setTahun(e.target.value)} style={{ width: 100 }}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Program</label>
          <select className="form-input" value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} style={{ width: 200 }}>
            {programList.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        
        {isMapel && (
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Spesifik Mapel</label>
            <input 
              type="text" className="form-input" placeholder="Cth: Matematika" 
              value={mapel} onChange={e => setMapel(e.target.value)} style={{ width: 180 }}
            />
          </div>
        )}
      </div>

      {/* ── Table Siswa ── */}
      <DataTable
        title={`Input Raport - ${selectedProgram} ${isMapel && mapel ? `(${mapel})` : ""}`}
        data={filteredSiswa}
        searchPlaceholder="Cari nama siswa..."
        searchKeys={["nama", "sekolah"]}
        headers={[
          "Nama Siswa",
          "Kelas / Sekolah",
          { label: "Status Raport", align: "center" },
          { label: "Aksi", align: "right" }
        ]}
        renderRow={(s) => {
          const currentMapel = (isMapel ? mapel.trim() : "").toLowerCase();
          const existing = raportDB.find(r => 
            r.siswa_id === s.id && 
            r.program === selectedProgram && 
            (r.mata_pelajaran || "").toLowerCase() === currentMapel
          );
          return [
            <strong key="nama">{s.nama}</strong>,
            <span key="sch">{s.sekolah || "-"}</span>,
            <div key="stat" style={{ textAlign: "center" }}>
              {existing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                  <span style={{ fontSize: ".75rem", fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: existing.validated ? "#dcfce7" : "#fef08a", color: existing.validated ? "#16a34a" : "#ca8a04" }}>
                    {existing.validated ? <><i className="fa-solid fa-check" style={{marginRight: 4}}></i>Valid</> : "Sudah Diisi (Draft)"}
                  </span>
                  {existing.guru_id !== myGuruId && (
                    <span style={{ fontSize: ".65rem", color: "var(--muted)" }}>Oleh: {existing.guru_nama}</span>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: ".75rem", fontWeight: 700, padding: "4px 8px", borderRadius: 6, background: "#fee2e2", color: "#dc2626" }}>Belum Diisi</span>
              )}
            </div>,
            <div key="btns" style={{ textAlign: "right" }}>
              {(!existing || existing.guru_id === myGuruId) && (
                <button 
                  onClick={() => handleOpenModal(s)}
                  className={existing ? "btn-outline" : "btn-primary"} 
                  style={{ padding: "6px 12px", fontSize: ".75rem" }}
                >
                  {existing ? "Edit Raport" : "Isi Raport"}
                </button>
              )}
            </div>
          ];
        }}
      />

      {/* ── Modal Input Raport ── */}
      {showModal && editData && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>{editData.id ? "Edit Raport" : "Input Raport Baru"}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icon name="xmark" /></button>
            </div>
            <p style={{ color: "var(--primary)", fontSize: "1.05rem", fontWeight: 800, marginBottom: 28 }}>
              <Icon name="user-graduate" style={{ marginRight: 8 }} />
              {editData.siswa_nama}
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Bulan & Tahun</label>
                <input type="text" className="form-input" value={`${bulan} ${tahun}`} disabled style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Program {isMapel ? "& Mapel" : ""}</label>
                <input type="text" className="form-input" value={`${selectedProgram}${isMapel ? ` - ${mapel}` : ""}`} disabled style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Kelas / Jenjang</label>
                <input type="text" className="form-input" placeholder="Cth: Kelas 4 SD" value={editData.kelas} onChange={e => setEditData({...editData, kelas: e.target.value})} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Pembelajaran (Materi)</label>
              <input type="text" className="form-input" placeholder="Topik materi yang diajarkan bulan ini..." value={editData.materi} onChange={e => setEditData({...editData, materi: e.target.value})} />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Fokus dan Sasaran Pembelajaran</label>
              <input type="text" className="form-input" placeholder="Sasaran atau target capaian..." value={editData.fokus_sasaran} onChange={e => setEditData({...editData, fokus_sasaran: e.target.value})} />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Catatan Perkembangan (Analisis Naratif)</label>
              <textarea 
                className="form-input" rows="5" 
                placeholder="Tuliskan analisis perkembangan belajar siswa di sini dalam bentuk paragraf."
                value={editData.catatan} onChange={e => setEditData({...editData, catatan: e.target.value})}
              ></textarea>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button className="btn-outline" onClick={() => setShowModal(false)} disabled={saving}>Batal</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan Raport"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

// ==============================================================================
// 3. SISWA RAPORT (Lihat & Cetak PDF)
// ==============================================================================
export function SiswaRaport({ user, siteInfo }) {
  const toast = useToast();
  const [sid, setSid] = useState(null);
  const [raports, setRaports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Dapatkan dulu ID Siswa (Internal) dari tabel siswa
    supabase.from("siswa").select("id").eq("user_id", user.id).maybeSingle()
      .then(async ({ data }) => {
        let id = data?.id;
        
        // AUTO-LINK FALLBACK: Jika user id belum tersambung, cari via email
        if (!id) {
          const { data: byEmail } = await supabase.from("siswa")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();
          id = byEmail?.id;
          
          if (id) {
            // Tautkan user_id secara otomatis untuk login berikutnya
            await supabase.from("siswa").update({ user_id: user.id }).eq("id", id);
          }
        }

        setSid(id);
        if (!id) {
          setLoading(false);
          return;
        }
        
        // 2. Ambil raport menggunakan Internal ID tersebut
        getRaportSiswa(id)
          .then(data => setRaports(data || []))
          .catch(e => toast.error("Gagal memuat raport: " + e.message))
          .finally(() => setLoading(false));
      });
  }, [user.id]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat raport...</div>;

  return (
    <div className="fade-in">
      {raports.length === 0 ? (
        <div className="content-card" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16, color: "var(--slate-400)" }}><i className="fa-regular fa-folder-open"></i></div>
          <h3 style={{ color: "var(--slate-700)" }}>Belum ada Raport</h3>
          <p style={{ color: "var(--muted)", maxWidth: 400, margin: "0 auto" }}>
            Laporan perkembangan bulanan kamu akan muncul di sini setelah diisi oleh Guru dan divalidasi oleh Admin.
          </p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Riwayat Raport Perkembangan</h3>
            <button className="btn-primary" onClick={() => exportRaportPDF(raports, siteInfo)}>
              <Icon name="file-pdf" style={{ marginRight: 8 }} /> Cetak Semua Raport
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
            {raports.map(r => (
              <div key={r.id} className="content-card" style={{ position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--blue)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      {r.bulan} {r.tahun}
                    </div>
                    <h4 style={{ margin: "4px 0", fontSize: "1.15rem" }}>{r.program}</h4>
                    {r.mata_pelajaran && <div style={{ fontSize: ".85rem", color: "var(--slate-600)", fontWeight: 500 }}>Mapel: {r.mata_pelajaran}</div>}
                  </div>
                  <div style={{ padding: 10, background: "var(--blue-light)", borderRadius: 12, color: "var(--blue)" }}>
                    <i className="fa-solid fa-award" style={{ fontSize: 22 }} />
                  </div>
                </div>

                <div style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: 20, borderLeft: "3px solid #e2e8f0", paddingLeft: 12 }}>
                  <div style={{ fontWeight: 600, color: "var(--slate-700)" }}>Materi Terakhir:</div>
                  <div style={{ fontStyle: "italic", marginTop: 2 }}>"{r.materi.length > 80 ? r.materi.substring(0, 80) + "..." : r.materi}"</div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => exportRaportPDF([r], siteInfo)}>
                    <Icon name="download" style={{ marginRight: 8 }} /> Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function GuruRekapRaport({ user, siteInfo }) {
  const [loading, setLoading] = useState(true);
  const [raports, setRaports] = useState([]);
  const [myGuruId, setMyGuruId] = useState(null);
  const [bulan, setBulan] = useState(BULAN_LIST[new Date().getMonth()]);
  const [tahun, setTahun] = useState(String(new Date().getFullYear()));
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    supabase.from("guru").select("id").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setMyGuruId(data.id);
        else {
          supabase.from("guru").select("id").eq("email", user.email).maybeSingle()
            .then(({ data: g }) => g && setMyGuruId(g.id));
        }
      });
  }, [user.id]);

  useEffect(() => {
    if (!myGuruId) return;
    setLoading(true);
    getRaportGuru(myGuruId, bulan, tahun)
      .then(setRaports)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [myGuruId, bulan, tahun]);

  const handleOpenEdit = (r) => {
    if (r.validated) {
      toast.info("Raport ini sudah divalidasi Admin dan tidak dapat diubah.");
      return;
    }
    setEditData({ ...r });
    setShowEdit(true);
  };

  const handleSaveEdit = async () => {
    if (!editData.materi || !editData.fokus_sasaran || !editData.catatan || !editData.kelas) {
      toast.error("Harap isi semua kolom dengan lengkap!");
      return;
    }
    setSaving(true);
    try {
      const saved = await upsertRaport(editData);
      setRaports(prev => prev.map(r => r.id === saved.id ? saved : r));
      toast.success("Raport berhasil diperbarui!");
      setShowEdit(false);
    } catch (e) {
      toast.error("Gagal menyimpan: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div className="fade-in">
      {/* ── Toolbar & Filter ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Bulan</label>
          <select className="form-input" value={bulan} onChange={e => setBulan(e.target.value)} style={{ width: 140 }}>
            {BULAN_LIST.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tahun</label>
          <select className="form-input" value={tahun} onChange={e => setTahun(e.target.value)} style={{ width: 100 }}>
            {TAHUN_LIST.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn-outline" onClick={() => {
          setLoading(true);
          getRaportGuru(myGuruId, bulan, tahun).then(setRaports).finally(() => setLoading(false));
        }} title="Refresh Data" style={{ height: 42 }}>
          <Icon name="rotate" />
        </button>
      </div>

      <DataTable
        title={`Rekap Raport Saya (${raports.length})`}
        data={raports}
        searchPlaceholder="Cari nama siswa atau program..."
        searchKeys={["siswa_nama", "program", "mata_pelajaran"]}
        headers={[
          "Siswa",
          "Program / Mapel",
          "Tanggal",
          { label: "Status", align: "center" },
          { label: "Aksi", align: "right" }
        ]}
        renderRow={(r) => [
          <div key="siswa">
            <div style={{ fontWeight: 600 }}>{r.siswa_nama}</div>
            <div style={{ fontSize: ".75rem", color: "var(--muted)" }}>{r.kelas}</div>
          </div>,
          <div key="prog">
            <div style={{ fontSize: ".85rem" }}>{r.program}</div>
            {r.mata_pelajaran && <div style={{ fontSize: ".7rem", color: "var(--blue)", fontWeight: 700 }}>{r.mata_pelajaran}</div>}
          </div>,
          <span key="date" style={{ fontSize: ".85rem" }}>{r.tanggal}</span>,
          <div key="stat" style={{ textAlign: "center" }}>
            <span style={{ fontSize: ".7rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: r.validated ? "#dcfce7" : "#fef08a", color: r.validated ? "#16a34a" : "#ca8a04" }}>
              {r.validated ? "Tervalidasi" : "Draft Guru"}
            </span>
          </div>,
          <div key="btns" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button className="btn-outline" style={{ padding: 6 }} onClick={() => exportRaportPDF([r], siteInfo)} title="Download PDF">
              <Icon name="file-pdf" color="#ef4444" />
            </button>
            <button className="btn-outline" style={{ padding: 6 }} onClick={() => handleOpenEdit(r)} title="Edit Raport">
               <Icon name="pen-to-square" />
            </button>
          </div>
        ]}
      />

      {/* ── Modal Edit (Reuse Style) ── */}
      {showEdit && editData && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2>Edit Raport</h2>
              <button className="modal-close" onClick={() => setShowEdit(false)}><Icon name="xmark" /></button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Siswa</label>
                <input type="text" className="form-input" value={editData.siswa_nama} disabled style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Program & Mapel</label>
                <input type="text" className="form-input" value={`${editData.program}${editData.mata_pelajaran ? ` - ${editData.mata_pelajaran}` : ""}`} disabled style={{ background: "#f8fafc" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Kelas / Jenjang</label>
                <input type="text" className="form-input" value={editData.kelas} onChange={e => setEditData({ ...editData, kelas: e.target.value })} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Pembelajaran (Materi)</label>
              <input type="text" className="form-input" value={editData.materi} onChange={e => setEditData({ ...editData, materi: e.target.value })} />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Fokus & Sasaran</label>
              <input type="text" className="form-input" value={editData.fokus_sasaran} onChange={e => setEditData({ ...editData, fokus_sasaran: e.target.value })} />
            </div>

            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Catatan Perkembangan</label>
              <textarea className="form-input" rows="5" value={editData.catatan} onChange={e => setEditData({ ...editData, catatan: e.target.value })} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 28 }}>
              <button className="btn-outline" onClick={() => setShowEdit(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSaveEdit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Perubahan"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
