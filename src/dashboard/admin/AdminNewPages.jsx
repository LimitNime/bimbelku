// ============================================================
// AdminNewPages.jsx — SPP, Keuangan, Honor, Tutorial
// ============================================================
import { useState, useEffect } from "react";
import StatCard from "../../components/StatCard.jsx";
import Icon     from "../../components/Icon.jsx";
import DataTable from "../../components/DataTable.jsx";
import Pagination from "../../components/Pagination.jsx";
import {
  STUDENTS_DATA,
  TEACHERS_DATA,
  HONOR_DATA,
  HONOR_SETTING,
  KOMPONEN_HONOR_SETTING,
  PEMASUKAN_DATA,
  PENGELUARAN_DATA,
  SPP_DATA,
  SPP_EXPIRED,
  KATEGORI_PEMASUKAN,
  KATEGORI_PENGELUARAN,
  BULAN_LIST,
  ABSENSI_DATA,
  TAHUN_LIST,
} from "../../data/index.js";

import { exportExcel, cetakSlipGajiPDF, cetakKwitansiPDF } from "../../utils/exportHelper.js";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/Toast.jsx";
import { ConfirmModal, useConfirm } from "../../components/Modal.jsx";
import {
  getSiswa,
  getGuru,
  getSppData, updateSppStatus, deleteSppData, getSppExpired, upsertSppExpired, generateAllSppBulan, getSppDataByTahun,
  getAbsensi, insertAbsensi, verifikasiAbsensi, verifikasiAbsensiSemua,
  getHonorSetting,
  getHonorData, upsertHonorData,
  getPemasukan, addPemasukan, updatePemasukan, deletePemasukan,
  getPengeluaran, addPengeluaran, updatePengeluaran, deletePengeluaran,
  getSiteSettings, updateSiteSettings,
  getWaTemplate, updateWaTemplate,
} from "../../lib/db.js";

// ── Helper export Excel ───────────────────────────────────────
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
  const toast = useToast();
  const [bulan,   setBulan]   = useState("Maret");
  const [tahun,   setTahun]   = useState("2026");
  const [data,    setData]    = useState([]);
  const [expired, setExpired] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editExpiredKey, setEditExpiredKey] = useState(null); // key = "siswa_id|program"
  const [expiredInput,   setExpiredInput]   = useState("");
  const { confirm: confirmDel, ConfirmDialog: ConfirmDialogSPP } = useConfirm();
  const [generating, setGenerating] = useState(false);
  const [siswaList,    setSiswaList]    = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [waTemplate,   setWaTemplate]   = useState("{nama}");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Load dari Supabase
  useEffect(() => {
    setLoading(true);
    // getSiteSettings & getWaTemplate hanya perlu diload sekali, bukan tiap ganti bulan
    const baseLoad = data.length === 0
      ? Promise.all([getSiteSettings(), getWaTemplate()])
      : Promise.resolve([siteSettings, { template: waTemplate }]);

    Promise.all([getSppData(bulan, tahun), getSppExpired(), getSiswa()])
      .then(async ([spp, exp, siswa]) => {
        setData(spp);
        setExpired(exp);
        setSiswaList(siswa);
        // Load site settings hanya sekali
        if (!siteSettings.nama) {
          const [site, waTpl] = await baseLoad;
          setSiteSettings(site || {});
          setWaTemplate(waTpl?.template || "Assalamualaikum, {nama}. SPP bulan {bulan} {tahun} belum lunas. Terima kasih - {nama_bimbel}");
        }
      })
      .catch(e => {
        console.error(e);
        setData(SPP_DATA.filter(s => s.bulan === bulan && s.tahun === tahun));
        setExpired(SPP_EXPIRED);
        setSiswaList(STUDENTS_DATA);
      })
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const filtered = data.filter(s => 
    (s.siswa_nama || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.program || "").toLowerCase().includes(search.toLowerCase())
  );
  
  const lunas  = filtered.filter(s => s.status === "Lunas").length;
  const belum  = filtered.filter(s => s.status === "Belum Bayar").length;
  const persen = filtered.length > 0 ? Math.round((lunas / filtered.length) * 100) : 0;

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);

  const toggle = async (id) => {
    const s = data.find(x => x.id === id);
    const newStatus = s?.status === "Lunas" ? "Belum Bayar" : "Lunas";
    try {
      await updateSppStatus(id, newStatus);
      setData(data.map(x => x.id === id ? {
        ...x, status: newStatus,
        tgl_bayar: newStatus === "Lunas" ? new Date().toLocaleDateString("id-ID") : "-",
      } : x));

      // Refresh data expired agar UI sinkron dengan otomatisasi di database
      const freshExp = await getSppExpired();
      setExpired(freshExp);

      toast.success(newStatus === "Lunas" ? "SPP ditandai Lunas ✓" : "SPP dibatalkan.");
    } catch (e) { toast.error("Gagal update: " + e.message); }
  };

  const getExpired = (siswa_id, program) => expired.find(e => e.siswa_id === siswa_id && e.program === program);

  const saveExpired = async (siswa_id, program) => {
    try {
      await upsertSppExpired(siswa_id, program, expiredInput);
      setExpired(prev => {
        const ada = prev.find(e => e.siswa_id === siswa_id && e.program === program);
        if (ada) return prev.map(e => (e.siswa_id === siswa_id && e.program === program) ? { ...e, expired: expiredInput } : e);
        return [...prev, { siswa_id, program, expired: expiredInput }];
      });
      setEditExpiredKey(null);
      toast.success("Tanggal expired SPP disimpan!");
    } catch (e) { toast.error("Gagal simpan expired: " + e.message); }
  };

  const handleDeleteSPP = async (id, nama) => {
    const ok = await confirmDel({ title: "Hapus Data SPP?", message: `Hapus data SPP "${nama}" ini secara permanen?`, type: "danger", confirmText: "Hapus" });
    if (!ok) return;
    try {
      await deleteSppData(id);
      setData(prev => prev.filter(x => x.id !== id));

      // Refresh expired karena penghapusan data Lunas menganulir masa aktif
      const freshExp = await getSppExpired();
      setExpired(freshExp);

      toast.success("Data SPP berhasil dihapus.");
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  const isExpiredSoon = (tgl) => {
    if (!tgl) return false;
    const diff = (new Date(tgl) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  };

  const isExpired = (tgl) => {
    if (!tgl) return false;
    return new Date(tgl) < new Date();
  };

  const openWA = (siswa_id) => {
    const siswa = siswaList.find(s => s.id === siswa_id);
    if (!siswa?.kontak) return toast.warning("Nomor HP siswa belum diisi di Data Siswa!");
    const nomor = siswa.kontak.replace(/^0/, "62").replace(/\D/g, "");
    // Isi template dengan variabel dinamis
    const pesan = encodeURIComponent(
      waTemplate
        .replace(/{nama}/g, siswa.nama)
        .replace(/{bulan}/g, bulan)
        .replace(/{tahun}/g, tahun)
        .replace(/{nama_bimbel}/g, siteSettings.nama || "Bimbel")
    );
    window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
  };

  const cetakKwitansiAdmin = (s) => {
    if (s.status !== "Lunas") return toast.warning("Kwitansi hanya bisa dicetak untuk SPP yang sudah Lunas!");
    const siswa = siswaList.find(x => x.id === s.siswa_id);
    cetakKwitansiPDF(s, siswa, siteSettings);
  };

  const handleExport = () => {
    exportExcel(`spp-${bulan}-${tahun}`, [
      {
        name: "SPP",
        headers: ["Nama Siswa", "Program", "Nominal", "Tgl Bayar", "Expired", "Status"],
        rows: filtered.map(s => {
          const exp = getExpired(s.siswa_id, s.program);
          const expTgl = exp?.expired ? new Date(exp.expired).toLocaleDateString("id-ID") : "-";
          return [s.siswa_nama, s.program, s.nominal, s.tgl_bayar || "-", expTgl, s.status];
        })
      }
    ]);
  };

  const handleExportTahunan = async () => {
    try {
      const allSpp = await getSppDataByTahun(tahun);
      if (!allSpp || allSpp.length === 0) {
        return toast.info(`Belum ada data SPP di tahun ${tahun}.`);
      }
      exportExcel(`spp-rekap-${tahun}`, [
        {
          name: `Rekap ${tahun}`,
          headers: ["Bulan", "Nama Siswa", "Program", "Nominal", "Tgl Bayar", "Status"],
          rows: allSpp.map(s => [s.bulan, s.siswa_nama, s.program, s.nominal, s.tgl_bayar || "-", s.status])
        }
      ]);
    } catch (e) {
      toast.error("Gagal export tahunan: " + e.message);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data SPP...</div>;

  // Unique siswa di bulan ini untuk tampilkan expired per siswa
  const uniqueSiswa = [...new Map(filtered.map(s => [s.siswa_id, s])).values()];

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
          <i className="fa-solid fa-file-excel" style={{ marginRight: 8 }}></i> Export Bulan Ini
        </button>
        <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExportTahunan}>
          <i className="fa-solid fa-file-excel" style={{ marginRight: 8 }}></i> Export 1 Tahun
        </button>
        <button className="btn-primary" style={{ padding: "9px 16px", fontSize: ".82rem" }}
          disabled={generating}
          onClick={async () => {
            setGenerating(true);
            try {
              const count = await generateAllSppBulan(bulan, tahun);
              if (count > 0) {
                toast.success(`${count} tagihan SPP baru berhasil digenerate!`);
                // Reload data
                const fresh = await getSppData(bulan, tahun);
                setData(fresh);
              } else {
                toast.info("Semua siswa aktif sudah memiliki tagihan di bulan ini.");
              }
            } catch (e) { toast.error("Gagal generate: " + e.message); }
            finally { setGenerating(false); }
          }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8 }}></i>
          {generating ? "Generating..." : "Generate Tagihan"}
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="search-box" style={{ maxWidth: 320, margin: 0 }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Cari nama atau program..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: ".82rem", color: "var(--muted)" }}>Tampilkan:</span>
          <select className="form-input" style={{ width: 80, padding: "6px 10px" }} value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {[10, 20, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Tabel SPP */}
      <div className="table-card">
        <div className="table-head">
          <h3>SPP Bulan {bulan} {tahun} ({filtered.length} tagihan)</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 150 }}>Nama Siswa</th>
                <th style={{ minWidth: 140 }}>Program</th>
                <th style={{ minWidth: 120 }}>Nominal</th>
                <th style={{ minWidth: 110 }}>Tgl Bayar</th>
                <th style={{ minWidth: 140 }}>Expired</th>
                <th style={{ minWidth: 90 }}>Status</th>
                <th style={{ minWidth: 130 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 32 }}>
                  <div style={{ fontSize: "1.8rem", marginBottom: 8 }}><i className="fa-solid fa-box-open" style={{ color: "#cbd5e1" }}></i></div>
                  <div>Tidak ditemukan data SPP untuk filter tersebut.</div>
                </td></tr>
              ) : currentItems.map(s => {
                const expKey       = `${s.siswa_id}|${s.program}`;
                const exp          = getExpired(s.siswa_id, s.program);
                const expTgl       = exp?.expired;
                const sudahExpired = isExpired(expTgl);
                const mauExpired   = isExpiredSoon(expTgl);
                
                // Determinasi warna baris
                let rowBg = "inherit";
                if (s.status === "Lunas") rowBg = "#f0fdf4"; // Hijau muda (Lunas)
                else if (sudahExpired) rowBg = "#fef2f2";    // Merah muda (Expired)
                else if (mauExpired) rowBg = "#fffbeb";      // Kuning/Krem muda (Segera)

                return (
                  <tr key={s.id} style={{ background: rowBg }}>
                    <td><strong>{s.siswa_nama}</strong></td>
                    <td><span className="badge blue" style={{ fontSize: ".72rem" }}>{s.program}</span></td>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Rp {s.nominal.toLocaleString("id-ID")}</td>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</td>
                    <td>
                      {editExpiredKey === expKey ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input type="date" className="form-input" style={{ width: 140, padding: "4px 8px" }}
                            value={expiredInput} onChange={e => setExpiredInput(e.target.value)} />
                          <button onClick={() => saveExpired(s.siswa_id, s.program)}
                            style={{ padding: "3px 8px", borderRadius: 6, border: "none", background: "#dcfce7", color: "#16a34a", cursor: "pointer", fontWeight: 700, fontSize: ".72rem", fontFamily: "inherit" }}>
                            <i className="fa-solid fa-check"></i>
                          </button>
                          <button onClick={() => setEditExpiredKey(null)}
                            style={{ padding: "3px 6px", borderRadius: 6, border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: ".72rem", fontFamily: "inherit" }}>
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{
                            fontSize: ".78rem", fontWeight: 600,
                            color: sudahExpired ? "#dc2626" : mauExpired ? "#d97706" : "var(--muted)",
                          }}>
                            {expTgl ? new Date(expTgl).toLocaleDateString("id-ID") : "—"}
                            {sudahExpired && <span style={{ marginLeft: 6, color: "#dc2626" }} title="Sudah Melewati Batas"><i className="fa-solid fa-triangle-exclamation"></i> Expired</span>}
                            {mauExpired && !sudahExpired && <span style={{ marginLeft: 6, color: "#d97706" }} title="Jatuh Tempo Sebentar Lagi"><i className="fa-solid fa-clock"></i> Segera</span>}
                          </span>
                          <button onClick={() => { setEditExpiredKey(expKey); setExpiredInput(expTgl || ""); }}
                            style={{ padding: "2px 6px", borderRadius: 5, border: "none", background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: ".68rem", fontFamily: "inherit" }}>
                            <i className="fa-solid fa-pen-to-square"></i>
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>
                        {s.status === "Lunas" && <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }}></i>}
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => toggle(s.id)}
                          style={{
                            padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                            fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                            background: s.status === "Lunas" ? "#fee2e2" : "#dcfce7",
                            color: s.status === "Lunas" ? "#dc2626" : "#16a34a",
                          }}>
                          {s.status === "Lunas" ? "Batal" : <><i className="fa-solid fa-check" style={{ marginRight: 4 }}></i> Lunas</>}
                        </button>
                        {s.status === "Lunas" && (
                          <button onClick={() => cetakKwitansiAdmin(s)}
                            style={{
                              padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                              fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                              background: "#f3e8ff", color: "#7c3aed",
                            }}>
                              <i className="fa-solid fa-print" style={{ marginRight: 4 }}></i> Kwitansi
                          </button>
                        )}
                        {s.status === "Belum Bayar" && (
                          <button onClick={() => openWA(s.siswa_id)}
                            style={{
                              padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                              fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                              background: "#dcfce7", color: "#16a34a",
                            }}>
                              <i className="fa-brands fa-whatsapp" style={{ marginRight: 4 }}></i> WA
                          </button>
                        )}
                        <button onClick={() => handleDeleteSPP(s.id, s.siswa_nama)}
                          style={{
                            padding: "4px 8px", borderRadius: 7, border: "none", cursor: "pointer",
                            fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                            background: "#fee2e2", color: "#dc2626",
                          }}>
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Manual Pagination for SPP */}
        {totalPages > 1 && (
          <div style={{ marginTop: 20, padding: "0 20px" }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Summary */}
        <div style={{ padding: "0 20px 20px" }}>
          <SummaryBox items={[
            { label: "Sudah Bayar",        value: lunas + " tagihan",  color: "#16a34a" },
            { label: "Belum Bayar",        value: belum + " tagihan",  color: "#dc2626" },
            { label: "Tingkat Pembayaran", value: persen + "%",         color: persen >= 80 ? "#16a34a" : "#d97706" },
            { label: "Total Tagihan",      value: filtered.length + " tagihan", color: "#2563eb" },
          ]} />
        </div>
      </div>
      <ConfirmDialogSPP />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PEMASUKAN
// ─────────────────────────────────────────────────────────────
export function Pemasukan() {
  const toast = useToast();
  const { confirm, ConfirmDialog: ConfirmDialogPemasukan } = useConfirm();
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" });

  useEffect(() => {
    setLoading(true);
    getPemasukan(bulan, tahun)
      .then(setData)
      .catch(e => { console.error(e); setData(PEMASUKAN_DATA.filter(d => {
        const tgl = new Date(d.tanggal);
        return tgl.toLocaleDateString("id-ID", { month: "long" }) === bulan && tgl.getFullYear().toString() === tahun;
      })); })
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const filtered = data;
  const total    = filtered.reduce((a, b) => a + b.nominal, 0);

  const resetForm = () => { setForm({ tanggal: "", keterangan: "", kategori: "SPP", nominal: "" }); setEditId(null); setShowForm(false); };

  const handleEdit = (item) => {
    setForm({ tanggal: item.tanggal, keterangan: item.keterangan, kategori: item.kategori, nominal: item.nominal });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.keterangan || !form.nominal) return toast.warning("Keterangan dan nominal wajib diisi!");
    setSaving(true);
    try {
      const item = { ...form, nominal: parseInt(form.nominal) };
      if (editId) {
        await updatePemasukan(editId, item);
        setData(data.map(d => d.id === editId ? { ...item, id: editId } : d));
        toast.success("Pemasukan berhasil diperbarui!");
      } else {
        const newItem = await addPemasukan(item);
        setData([...data, newItem]);
        toast.success("Pemasukan berhasil ditambahkan!");
      }
      resetForm();
    } catch (e) { toast.error("Gagal menyimpan: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: "Hapus Pemasukan?", message: "Data pemasukan ini akan dihapus.", type: "danger", confirmText: "Ya, Hapus" });
    if (!ok) return;
    try {
      await deletePemasukan(id);
      setData(data.filter(d => d.id !== id));
      toast.success("Pemasukan berhasil dihapus.");
    } catch (e) { toast.error("Gagal menghapus: " + e.message); }
  };

  const handleExport = () => {
    exportExcel(`pemasukan-${bulan}-${tahun}`, [
      {
        name: "Pemasukan",
        headers: ["Tanggal", "Kategori", "Keterangan", "Nominal"],
        rows: filtered.map(p => [p.tanggal, p.kategori, p.keterangan, p.nominal])
      }
    ]);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data pemasukan...</div>;

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
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}><i className="fa-solid fa-file-excel" style={{ marginRight: 8 }}></i> Export</button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i> Tambah
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
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }}></i> {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <DataTable
        title={`Pemasukan ${bulan} ${tahun} (${data.length})`}
        data={data}
        searchPlaceholder="Cari keterangan atau kategori..."
        searchKeys={["keterangan", "kategori"]}
        headers={[
          "Tanggal",
          "Keterangan",
          "Kategori",
          { label: "Nominal", align: "right" },
          { label: "Aksi", align: "center" }
        ]}
        renderRow={(d) => [
          <span key="tgl" style={{ fontSize: ".82rem", color: "var(--muted)" }}>
            {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>,
          <span key="ket">{d.keterangan}</span>,
          <span key="kat" className="badge blue">{d.kategori}</span>,
          <strong key="nom" style={{ color: "#16a34a" }}>Rp {d.nominal.toLocaleString("id-ID")}</strong>,
          <div key="btns" className="action-btns" style={{ justifyContent: "center" }}>
            <button className="icon-btn edit" onClick={() => handleEdit(d)}><i className="fa-solid fa-pen-to-square"></i></button>
            <button className="icon-btn del"  onClick={() => handleDelete(d.id)}><i className="fa-solid fa-trash-can"></i></button>
          </div>
        ]}
        footer={(
          <div style={{ padding: "0 20px 10px" }}>
            <SummaryBox items={[
              { label: "Total Transaksi",  value: data.length + " item",                        color: "#2563eb" },
              { label: "Total Pemasukan", value: "Rp " + total.toLocaleString("id-ID"),             color: "#16a34a" },
            ]} />
          </div>
        )}
      />
      <ConfirmDialogPemasukan />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. PENGELUARAN
// ─────────────────────────────────────────────────────────────
export function Pengeluaran() {
  const toast = useToast();
  const { confirm, ConfirmDialog: ConfirmDialogPengeluaran } = useConfirm();
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ tanggal: "", keterangan: "", kategori: "Operasional", nominal: "" });

  useEffect(() => {
    setLoading(true);
    getPengeluaran(bulan, tahun)
      .then(setData)
      .catch(e => { console.error(e); setData(PENGELUARAN_DATA.filter(d => {
        const tgl = new Date(d.tanggal);
        return tgl.toLocaleDateString("id-ID", { month: "long" }) === bulan && tgl.getFullYear().toString() === tahun;
      })); })
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const filtered = data;
  const total    = filtered.reduce((a, b) => a + b.nominal, 0);

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

  const handleSave = async () => {
    if (!form.keterangan || !form.nominal) return toast.warning("Keterangan dan nominal wajib diisi!");
    setSaving(true);
    try {
      const item = { ...form, nominal: parseInt(form.nominal) };
      if (editId) {
        await updatePengeluaran(editId, item);
        setData(data.map(d => d.id === editId ? { ...item, id: editId } : d));
        toast.success("Pengeluaran berhasil diperbarui!");
      } else {
        const newItem = await addPengeluaran(item);
        setData([...data, newItem]);
        toast.success("Pengeluaran berhasil ditambahkan!");
      }
      resetForm();
    } catch (e) { toast.error("Gagal menyimpan: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: "Hapus Pengeluaran?", message: "Data pengeluaran ini akan dihapus.", type: "danger", confirmText: "Ya, Hapus" });
    if (!ok) return;
    try {
      await deletePengeluaran(id);
      setData(data.filter(d => d.id !== id));
      toast.success("Pengeluaran berhasil dihapus.");
    } catch (e) { toast.error("Gagal menghapus: " + e.message); }
  };

  const handleExport = () => {
    exportExcel(`pengeluaran-${bulan}-${tahun}`, [
      {
        name: "Pengeluaran",
        headers: ["Tanggal", "Kategori", "Keterangan", "Nominal"],
        rows: filtered.map(p => [p.tanggal, p.kategori, p.keterangan, p.nominal])
      }
    ]);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data pengeluaran...</div>;

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
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}><i className="fa-solid fa-file-excel" style={{ marginRight: 8 }}></i> Export</button>
          <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
            <i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i> Tambah
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
              <i className="fa-solid fa-floppy-disk" style={{ marginRight: 8 }}></i> {editId ? "Update" : "Simpan"}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      <DataTable
        title={`Pengeluaran ${bulan} ${tahun} (${data.length})`}
        data={data}
        searchPlaceholder="Cari keterangan atau kategori..."
        searchKeys={["keterangan", "kategori"]}
        headers={[
          "Tanggal",
          "Keterangan",
          "Kategori",
          { label: "Nominal", align: "right" },
          { label: "Aksi", align: "center" }
        ]}
        renderRow={(d) => [
          <span key="tgl" style={{ fontSize: ".82rem", color: "var(--muted)" }}>
            {new Date(d.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>,
          <span key="ket">{d.keterangan}</span>,
          <span key="kat" className="badge yellow">{d.kategori}</span>,
          <strong key="nom" style={{ color: "#dc2626" }}>Rp {d.nominal.toLocaleString("id-ID")}</strong>,
          <div key="btns" className="action-btns" style={{ justifyContent: "center" }}>
            <button className="icon-btn edit" onClick={() => handleEdit(d)}><i className="fa-solid fa-pen-to-square"></i></button>
            <button className="icon-btn del"  onClick={() => handleDelete(d.id)}><i className="fa-solid fa-trash-can"></i></button>
          </div>
        ]}
        footer={(
          <div style={{ padding: "0 20px 10px" }}>
            <SummaryBox items={[
              { label: "Total Transaksi",   value: data.length + " item",              color: "#2563eb" },
              { label: "Total Pengeluaran", value: "Rp " + total.toLocaleString("id-ID"),  color: "#dc2626" },
            ]} />
          </div>
        )}
      />
      <ConfirmDialogPengeluaran />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. SALDO & LAPORAN
// ─────────────────────────────────────────────────────────────
export function SaldoLaporan() {
  const [tahun,      setTahun]      = useState("2026");
  const [pemasukan,  setPemasukan]  = useState([]);
  const [pengeluaran,setPengeluaran]= useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      supabase.from("pemasukan").select("*"),
      supabase.from("pengeluaran").select("*"),
    ])
      .then(([{ data: p }, { data: k }]) => {
        setPemasukan(p || []);
        setPengeluaran(k || []);
      })
      .catch(() => { setPemasukan([]); setPengeluaran([]); })
      .finally(() => setLoading(false));
  }, []);

  const getBulanan = (bln) => {
    const masuk = pemasukan.filter(d => {
      const t = new Date(d.tanggal);
      return t.toLocaleDateString("id-ID", { month: "long" }) === bln && t.getFullYear().toString() === tahun;
    }).reduce((a, b) => a + b.nominal, 0);

    const keluar = pengeluaran.filter(d => {
      const t = new Date(d.tanggal);
      return t.toLocaleDateString("id-ID", { month: "long" }) === bln && t.getFullYear().toString() === tahun;
    }).reduce((a, b) => a + b.nominal, 0);
    return { in: masuk, out: keluar, net: masuk - keluar };
  };

  const bulanData = BULAN_LIST.map(bln => {
    const { in: masuk, out: keluar, net: saldo } = getBulanan(bln);
    return { bulan: bln, masuk, keluar, saldo };
  }).filter(b => b.masuk > 0 || b.keluar > 0);

  const totalMasuk  = bulanData.reduce((a, b) => a + b.masuk,  0);
  const totalKeluar = bulanData.reduce((a, b) => a + b.keluar, 0);
  const totalSaldo  = totalMasuk - totalKeluar;

  const handleExport = () => {
    exportExcel(`laporan-${tahun}`, [
      {
        name: "Laporan Tahunan",
        headers: ["Bulan", "Pemasukan", "Pengeluaran", "Saldo"],
        rows: BULAN_LIST.map(b => {
          const l = getBulanan(b);
          return [b, l.in, l.out, l.net];
        })
      }
    ]);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat laporan...</div>;

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
          <i className="fa-solid fa-download" style={{ marginRight: 8 }}></i> Export Laporan {tahun}
        </button>
      </div>

      {/* Summary box atas */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="fa-money-bill-wave" label="Total Pemasukan"   value={"Rp " + totalMasuk.toLocaleString("id-ID")}  bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="fa-money-bill-transfer" label="Total Pengeluaran" value={"Rp " + totalKeluar.toLocaleString("id-ID")} bgColor="#fee2e2" textColor="#dc2626" />
        <StatCard icon="fa-building-columns" label="Saldo Bersih"      value={"Rp " + totalSaldo.toLocaleString("id-ID")}  bgColor="#dbeafe" textColor={totalSaldo >= 0 ? "#2563eb" : "#dc2626"} />
      </div>

      {/* Tabel laporan bulanan */}
        <DataTable
          title={`Laporan Bulanan Tahun ${tahun}`}
          data={bulanData}
          searchPlaceholder="Cari bulan..."
          headers={["Bulan", "Total Pemasukan", "Total Pengeluaran", "Saldo"]}
          emptyMessage={`Belum ada data tahun ${tahun}.`}
          renderRow={(b, i) => [
            <strong key="bln">{b.bulan}</strong>,
            <span key="in" style={{ color: "#16a34a", fontWeight: 600 }}>Rp {b.masuk.toLocaleString("id-ID")}</span>,
            <span key="out" style={{ color: "#dc2626", fontWeight: 600 }}>Rp {b.keluar.toLocaleString("id-ID")}</span>,
            <strong key="net" style={{ color: b.saldo >= 0 ? "#2563eb" : "#dc2626" }}>Rp {b.saldo.toLocaleString("id-ID")}</strong>
          ]}
          footer={(
            <div style={{ background: "#f8fafc", padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: ".9rem" }}>
              <span>TOTAL TAHUNAN</span>
              <div style={{ display: "flex", gap: 24 }}>
                <span style={{ color: "#16a34a" }}>Rp {totalMasuk.toLocaleString("id-ID")}</span>
                <span style={{ color: "#dc2626" }}>Rp {totalKeluar.toLocaleString("id-ID")}</span>
                <span style={{ color: totalSaldo >= 0 ? "#2563eb" : "#dc2626" }}>Rp {totalSaldo.toLocaleString("id-ID")}</span>
              </div>
            </div>
          )}
        />
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
const cetakSlip = async (h, bulan, tahun) => {
  const site = await getSiteSettings().catch(() => ({}));
  const bulan_id = BULAN_LIST.indexOf(bulan) + 1;
  cetakSlipGajiPDF({ ...h, bulan_id, bulan, tahun }, null, site);
};

export function HonorGuru() {
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [bulan,    setBulan]    = useState("Maret");
  const [tahun,    setTahun]    = useState("2026");
  const [data,     setData]     = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [honorSetting, setHonorSetting] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editId,   setEditId]   = useState(null);

  // Load data dari Supabase
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getHonorData(bulan, tahun),
      getGuru(),
      getHonorSetting(),
    ]).then(([honor, guru, setting]) => {
      setData(honor || []);
      setGuruList(guru || []);
      setHonorSetting(setting || []);
    }).catch(e => console.error(e))
    .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const filtered = data;

  // ── Toggle status bayar ──────────────────────────────────────
  const toggleBayar = async (id) => {
    const h = data.find(x => x.id === id);
    const newStatus   = h?.status === "Dibayar" ? "Belum" : "Dibayar";
    const newTglBayar = newStatus === "Dibayar" ? new Date().toLocaleDateString("id-ID") : "-";
    try {
      await upsertHonorData({ ...h, status: newStatus, tgl_bayar: newTglBayar });
      setData(data.map(x => x.id === id ? { ...x, status: newStatus, tgl_bayar: newTglBayar } : x));
    } catch (e) { toast.error("Gagal update: " + e.message); }
  };

  // ── Hitung pertemuan dari Supabase (absensi verified) ─────────
  const hitungPertemuanDariAbsensi = async (guru_id, bulan, tahun) => {
    const { data: absBulan, error } = await supabase
      .from("absensi")
      .select("program, sesi_id, tanggal")
      .eq("guru_id", guru_id)
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .eq("verified", true);

    if (error || !absBulan) return [];

    const perProgram = {};
    absBulan.forEach(a => {
      if (!perProgram[a.program]) perProgram[a.program] = new Set();
      perProgram[a.program].add(a.sesi_id || a.tanggal);
    });

    return Object.entries(perProgram).map(([program, sesiSet]) => ({
      program,
      jumlah_pertemuan: sesiSet.size,
    }));
  };

  // ── Tambah honor baru ────────────────────────────────────────
  const tambahHonor = async (guru) => {
    if (data.find(h => h.guru_id === guru.id && h.bulan === bulan && h.tahun === tahun)) return;
    const setting   = honorSetting.filter(s => s.guru_id === guru.id);
    const pertemuan = await hitungPertemuanDariAbsensi(guru.id, bulan, tahun);

    const mengajar = pertemuan.map(p => {
      const s = setting.find(x => x.program === p.program);
      return {
        program:          p.program,
        jumlah_pertemuan: p.jumlah_pertemuan,
        honor_per_siswa:  s?.honor_per_siswa || 0,
        belum_setting:    !s,
      };
    });

    if (mengajar.length === 0) {
      setting.forEach(s => {
        mengajar.push({ program: s.program, jumlah_pertemuan: 0, honor_per_siswa: s.honor_per_siswa, belum_setting: false });
      });
    }

    // ── Load komponen tetap dari komponen_honor_setting ────────
    const { data: komponenDB } = await supabase
      .from("komponen_honor_setting")
      .select("*")
      .eq("guru_id", guru.id)
      .eq("aktif", true);

    const komponenTetap = (komponenDB || []).map(k => ({
      id:      k.id,
      nama:    k.nama,
      nominal: k.nominal_default || 0,
    }));

    const newHonor = {
      guru_id:        guru.id,
      guru_nama:      guru.nama,
      bulan, tahun,
      status:         "Belum",
      tgl_bayar:      "-",
      mengajar:       JSON.stringify(mengajar),
      komponen_tetap: JSON.stringify(komponenTetap),   // ← isi dari setting
      honor_tambahan: JSON.stringify([]),
    };

    try {
      const saved = await upsertHonorData(newHonor);
      // Parse JSON back
      const parsed = {
        ...saved,
        mengajar:       JSON.parse(saved.mengajar || "[]"),
        komponen_tetap: JSON.parse(saved.komponen_tetap || "[]"),
        honor_tambahan: JSON.parse(saved.honor_tambahan || "[]"),
      };
      setData(prev => [...prev, parsed]);
      setEditId(parsed.id);
    } catch (e) { toast.error("Gagal tambah honor: " + e.message); }
  };

  // ── Export ───────────────────────────────────────────────────
  const handleExport = () => {
    exportExcel(`honor-guru-${bulan}-${tahun}`, [
      {
        name: "Honor",
        headers: ["Nama Guru", "Honor Mengajar", "Komponen Tetap", "Honor Tambahan", "Total Gaji", "Status", "Tgl Bayar"],
        rows: filtered.map(h => {
          const mengajar = typeof h.mengajar === "string" ? JSON.parse(h.mengajar || "[]") : (h.mengajar || []);
          const komponen = typeof h.komponen_tetap === "string" ? JSON.parse(h.komponen_tetap || "[]") : (h.komponen_tetap || []);
          const tambahan = typeof h.honor_tambahan === "string" ? JSON.parse(h.honor_tambahan || "[]") : (h.honor_tambahan || []);
          const m = mengajar.reduce((a,b) => a + (b.jumlah_pertemuan||0) * (b.honor_per_siswa||0), 0);
          const k = komponen.reduce((a,b) => a + (b.nominal||0), 0);
          const t = tambahan.reduce((a,b) => a + (b.nominal||0), 0);
          return [h.guru_nama, m, k, t, m+k+t, h.status, h.tgl_bayar];
        })
      }
    ]);
  };

  // Guru yang belum punya honor di bulan ini
  const guruBelumAda = guruList.filter(g =>
    !data.find(h => h.guru_id === g.id)
  );

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat honor guru...</div>;

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
          <button className="btn-outline" style={{ padding: "9px 14px", fontSize: ".82rem" }} onClick={handleExport}>
            <i className="fa-solid fa-file-excel" style={{ marginRight: 6 }}></i> Export
          </button>
          {guruBelumAda.length > 0 && (
            <button className="btn-primary" style={{ padding: "9px 16px", fontSize: ".82rem" }}
              onClick={async () => {
                toast.info(`Generating honor untuk ${guruBelumAda.length} guru...`);
                let count = 0;
                for (const g of guruBelumAda) {
                  try { await tambahHonor(g); count++; } catch {}
                }
                if (count > 0) toast.success(`${count} honor guru berhasil digenerate!`);
              }}>
              <i className="fa-solid fa-wand-magic-sparkles" style={{ marginRight: 8 }}></i>
              Generate Semua ({guruBelumAda.length} guru)
            </button>
          )}
        </div>
      </div>

      {/* ── Daftar honor per guru ───────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="content-card" style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--slate-400)" }}><i className="fa-regular fa-envelope-open"></i></div>
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
            onUpdate={async (updated) => {
              try {
                await upsertHonorData({
                  ...updated,
                  mengajar:       JSON.stringify(updated.mengajar       || []),
                  komponen_tetap: JSON.stringify(updated.komponen_tetap || []),
                  honor_tambahan: JSON.stringify(updated.honor_tambahan || []),
                });
                setData(data.map(d => d.id === h.id ? updated : d));
              } catch (e) { toast.error("Gagal simpan honor: " + e.message); }
            }}
            onDelete={async () => {
              const ok = await confirm({ title: "Hapus Honor?", message: "Hapus rekapan gaji/honor ini secara permanen?", type: "danger", confirmText: "Hapus" });
              if (!ok) return;
              try {
                await supabase.from("honor_data").delete().eq("id", h.id);
                setData(data.filter(d => d.id !== h.id));
                setEditId(null);
              } catch (e) { toast.error("Gagal hapus: " + e.message); }
            }}
            onToggleBayar={() => toggleBayar(h.id)}
            onSlip={() => cetakSlip(h, bulan, tahun)}
          />
        ))
      )}
      <ConfirmDialog />
    </div>
  );
}

// ── HonorCard — kartu per guru ────────────────────────────────
function HonorCard({ honor, isEdit, onToggleEdit, onUpdate, onDelete, onToggleBayar, onSlip }) {
  // Parse jsonb — Supabase bisa return string atau sudah array
  const parse = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  const h             = { ...honor, mengajar: parse(honor.mengajar), komponen_tetap: parse(honor.komponen_tetap), honor_tambahan: parse(honor.honor_tambahan) };
  const totalMengajar = h.mengajar.reduce((a,b)=>a+(b.jumlah_pertemuan||0)*( b.honor_per_siswa||0),0);
  const totalKomponen = h.komponen_tetap.reduce((a,b)=>a+(b.nominal||0),0);
  const totalTambahan = h.honor_tambahan.reduce((a,b)=>a+(b.nominal||0),0);
  const totalGaji     = totalMengajar + totalKomponen + totalTambahan;
  const fmt           = (n) => "Rp " + (n||0).toLocaleString("id-ID");

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
            {isEdit ? <><i className="fa-solid fa-xmark" style={{marginRight: 6}}></i>Tutup</> : <><i className="fa-solid fa-pen-to-square" style={{marginRight: 6}}></i>Edit</>}
          </button>
          <button onClick={onSlip} style={{
            padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#f3e8ff", color: "#7c3aed", fontWeight: 600, fontSize: ".78rem", fontFamily: "inherit",
          }}><i className="fa-solid fa-print" style={{marginRight: 6}}></i> Slip</button>
          <button onClick={onToggleBayar} style={{
            padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "inherit", fontSize: ".78rem", fontWeight: 700,
            background: h.status === "Dibayar" ? "#fee2e2" : "#dcfce7",
            color: h.status === "Dibayar" ? "#dc2626" : "#16a34a",
          }}>
            {h.status === "Dibayar" ? "Batal Bayar" : <><i className="fa-solid fa-check" style={{marginRight: 6}}></i>Tandai Dibayar</>}
          </button>
          <button onClick={onDelete} className="btn-outline" style={{ padding: "6px 12px", fontSize: ".78rem", color: "#dc2626", borderColor: "#fecaca" }} title="Hapus honor bulan ini">
            <i className="fa-solid fa-trash"></i>
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
                <i className="fa-solid fa-book-open" style={{marginRight: 6}}></i> Honor Mengajar
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
                          <i className="fa-solid fa-triangle-exclamation" style={{marginRight: 4}}></i> Setting honor belum diisi
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
                    <i className="fa-solid fa-sack-dollar" style={{marginRight: 6}}></i> Komponen Tetap
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
                    <i className="fa-solid fa-plus" style={{marginRight: 6}}></i> Honor Tambahan
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
              <i className="fa-solid fa-book-open" style={{marginRight: 6}}></i> Honor Mengajar
            </div>
            <DataTable
              data={h.mengajar || []}
              headers={["Program", "Honor/Pertemuan", "Jml Pertemuan", {label: "Subtotal", align: "right"}]}
              renderRow={(m, i) => {
                const pertemuan = m.jumlah_pertemuan || m.jumlah_siswa || 0;
                return [
                  <div key="prog">
                    <strong>{m.program}</strong>
                    {m.belum_setting && (
                      <div style={{ fontSize: ".72rem", color: "#b45309", marginTop: 2 }}>
                        <i className="fa-solid fa-triangle-exclamation" style={{marginRight: 4}}></i> Belum ada setting honor
                      </div>
                    )}
                  </div>,
                  <span key="hps" style={{ color: "var(--muted)", fontSize: ".82rem" }}>{m.belum_setting ? "—" : fmt(m.honor_per_siswa)}</span>,
                  <span key="jml" style={{ display: "inline-block", padding: "4px 10px", background: "#f0f9ff", borderRadius: 8, fontSize: ".82rem", fontWeight: 700, color: "var(--blue)" }}>
                    {pertemuan} pertemuan
                  </span>,
                  <strong key="sub" style={{ color: m.belum_setting ? "#b45309" : "var(--blue)" }}>{m.belum_setting ? "Rp 0" : fmt(pertemuan * m.honor_per_siswa)}</strong>
                ];
              }}
              footer={<div style={{ padding: "12px 20px", background: "#f8fafc", textAlign: "right", fontWeight: 800, color: "var(--blue)", borderTop: "1px solid var(--border)" }}>Subtotal Mengajar: {fmt(totalMengajar)}</div>}
            />
          </div>

          {/* 2. Komponen tetap */}
          {(h.komponen_tetap||[]).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 700, marginBottom: 10, color: "var(--text)" }}>
                <i className="fa-solid fa-sack-dollar" style={{marginRight: 6}}></i> Komponen Tetap — edit nominal jika perlu
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
                <i className="fa-solid fa-plus" style={{marginRight: 6}}></i> Honor Tambahan (tidak permanen)
              </div>
              <button onClick={tambahHonorLain} style={{
                padding: "5px 12px", borderRadius: 8, border: "1.5px dashed var(--blue)",
                color: "var(--blue)", background: "transparent", cursor: "pointer",
                fontSize: ".78rem", fontWeight: 700, fontFamily: "inherit",
              }}>
                <i className="fa-solid fa-plus" style={{marginRight: 6}}></i> Tambah Honor Lain
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
              }}><i className="fa-solid fa-print" style={{marginRight: 6}}></i> Cetak Slip</button>
              <button onClick={onToggleEdit} className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}>
                <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i>Simpan</>
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
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ judul: "", kategori: "Admin", durasi: "", url: "", deskripsi: "" });
  const catColors = { Admin: "purple", Guru: "blue", Siswa: "green" };

  // Normalisasi data dari Supabase — handle kolom yg mungkin belum ada di DB lama
  const normalizeTutorial = (t) => ({
    ...t,
    kategori: t.kategori || t.icon || "Admin",   // fallback ke icon atau default
    durasi:   t.durasi   || "",
    url:      t.url      || "",
    deskripsi: t.deskripsi || t.desc || "",
  });

  useEffect(() => {
    supabase.from("tutorial").select("*").order("created_at", { ascending: false })
      .then(({ data: d, error }) => {
        if (error) throw error;
        setData((d || []).map(normalizeTutorial));
      })
      .catch((e) => console.error("Gagal memuat tutorial:", e.message))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => { setForm({ judul: "", kategori: "Admin", durasi: "", url: "", deskripsi: "" }); setEditId(null); setShowForm(false); };

  const handleEdit = (t) => {
    const norm = normalizeTutorial(t);
    setForm({ judul: norm.judul, kategori: norm.kategori, durasi: norm.durasi, url: norm.url, deskripsi: norm.deskripsi });
    setEditId(t.id); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.judul) return toast.warning("Judul tutorial wajib diisi!");
    setSaving(true);
    // Payload: simpan kategori ke kolom 'icon' untuk kompatibilitas DB lama
    const payload = {
      judul:     form.judul,
      deskripsi: form.deskripsi,
      icon:      form.kategori,   // kolom yg ada di DB
      durasi:    form.durasi,
      url:       form.url,
    };
    try {
      if (editId) {
        const { data: updated, error } = await supabase.from("tutorial").update(payload).eq("id", editId).select().single();
        if (error) throw error;
        setData(data.map(t => t.id === editId ? normalizeTutorial(updated) : t));
        toast.success("Tutorial berhasil diperbarui!");
      } else {
        const { data: newT, error } = await supabase.from("tutorial").insert(payload).select().single();
         if (error) throw error;
        setData([normalizeTutorial(newT), ...data]);
        toast.success("Tutorial berhasil ditambahkan!");
      }
      resetForm();
    } catch (e) { toast.error("Gagal menyimpan: " + e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, judul) => {
    const ok = await confirm({ title: "Hapus Tutorial?", message: `Tutorial "${judul}" akan dihapus permanen.`, type: "danger", confirmText: "Ya, Hapus" });
    if (!ok) return;
    try {
      const { error } = await supabase.from("tutorial").delete().eq("id", id);
      if (error) throw error;
      setData(data.filter(t => t.id !== id));
      toast.success("Tutorial berhasil dihapus.");
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" style={{ padding: "9px 14px", fontSize: ".85rem" }} onClick={() => { resetForm(); setShowForm(!showForm); }}>
          <Icon name="plus" size={15} /> {showForm ? "Tutup" : "Tambah Tutorial"}
        </button>
      </div>

      {showForm && (
        <div className="content-card" style={{ marginBottom: 20 }}>
          <h3>{editId ? "Edit Tutorial" : "Tambah Tutorial Baru"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Judul *</label>
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
              <textarea className="form-input" rows={2} value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi singkat..." />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" style={{ padding: "10px 18px", fontSize: ".85rem" }}
              onClick={handleSave} disabled={saving}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 6}}></i>Menyimpan...</> : <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i>Simpan</>}
            </button>
            <button className="btn-outline" style={{ padding: "10px 18px", fontSize: ".85rem" }} onClick={resetForm}>Batal</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />Memuat tutorial...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {data.map(t => {
            const kat = t.kategori || t.icon || "Admin";
            return (
            <div key={t.id} className="content-card" style={{ transition: ".2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className={`badge ${catColors[kat] || "blue"}`}>{kat}</span>
                <div className="action-btns">
                  <button className="icon-btn edit" onClick={() => handleEdit(t)}><Icon name="edit" size={13} /></button>
                  <button className="icon-btn del" onClick={() => handleDelete(t.id, t.judul || "-")}><Icon name="trash" size={13} /></button>
                </div>
              </div>
              <h3 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>{t.judul || "(tanpa judul)"}</h3>
              <p style={{ fontSize: ".8rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 12 }}>{t.deskripsi || t.desc || ""}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: ".75rem", color: "var(--muted)" }}>{t.durasi ? <><i className="fa-regular fa-clock" style={{marginRight: 4}}></i>{t.durasi}</> : ""}</span>
                {t.url && t.url !== "#" && t.url !== "" && (
                  <a href={t.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: ".78rem", color: "var(--blue)", fontWeight: 600, textDecoration: "none" }}>
                    <i className="fa-solid fa-play" style={{marginRight: 6}}></i> Tonton
                  </a>
                )}
              </div>
            </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. REKAP ABSENSI ADMIN
// ─────────────────────────────────────────────────────────────

export function RekapAbsensiAdmin() {
  const toast = useToast();
  const { confirm, ConfirmDialog: ConfirmDialogAbsensi } = useConfirm();
  const [absensi,    setAbsensi]    = useState([]);
  const [guruList,   setGuruList]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [bulan,      setBulan]      = useState("Maret");
  const [tahun,      setTahun]      = useState("2026");
  const [filterGuru, setFilterGuru] = useState("Semua");
  const [activeTab,  setActiveTab]  = useState("rekap");

  // Load dari Supabase
  useEffect(() => {
    setLoading(true);
    Promise.all([getAbsensi(bulan, tahun), getGuru()])
      .then(([abs, guru]) => { setAbsensi(abs); setGuruList(guru); })
      .catch(e => { console.error(e); setAbsensi(ABSENSI_DATA); setGuruList(TEACHERS_DATA); })
      .finally(() => setLoading(false));
  }, [bulan, tahun]);

  const filtered = absensi.filter(a => {
    const guruOk = filterGuru === "Semua" || a.guru_nama === filterGuru;
    return guruOk;
  });

  // Hitung ulang honor setelah perubahan absensi (hapus/batal verifikasi)
  const recalcHonor = async (guru_id, guru_nama) => {
    try {
      // Ambil honor bulan ini
      const { data: honorRow } = await supabase
        .from("honor_data")
        .select("*")
        .eq("guru_id", guru_id)
        .eq("bulan", bulan)
        .eq("tahun", tahun)
        .maybeSingle();
      if (!honorRow) return; // Belum ada honor, tidak perlu update

      // Hitung ulang pertemuan dari absensi verified yang tersisa
      const { data: absBulan } = await supabase
        .from("absensi")
        .select("program, sesi_id, tanggal")
        .eq("guru_id", guru_id)
        .eq("bulan", bulan)
        .eq("tahun", tahun)
        .eq("verified", true);

      const perProgram = {};
      (absBulan || []).forEach(a => {
        if (!perProgram[a.program]) perProgram[a.program] = new Set();
        perProgram[a.program].add(a.sesi_id || a.tanggal);
      });

      // Update field mengajar di honor_data
      const mengajarLama = typeof honorRow.mengajar === "string"
        ? JSON.parse(honorRow.mengajar || "[]")
        : (honorRow.mengajar || []);

      const mengajarBaru = mengajarLama.map(m => ({
        ...m,
        jumlah_pertemuan: perProgram[m.program]?.size || 0,
      }));

      await supabase
        .from("honor_data")
        .update({ mengajar: JSON.stringify(mengajarBaru) })
        .eq("id", honorRow.id);
    } catch (e) {
      console.warn("Gagal recalc honor:", e.message);
    }
  };

  // Verifikasi 1 baris
  const verifikasi = async (id) => {
    try {
      await verifikasiAbsensi(id, true);
      setAbsensi(absensi.map(a => a.id === id ? { ...a, verified: true } : a));
    } catch (e) { toast.error("Gagal verifikasi: " + e.message); }
  };

  // Verifikasi semua yang terfilter
  const verifikasiSemua = async () => {
    const ids = filtered.map(a => a.id);
    try {
      await verifikasiAbsensiSemua(ids);
      setAbsensi(absensi.map(a => ids.includes(a.id) ? { ...a, verified: true } : a));
      toast.success(`${ids.length} absensi berhasil diverifikasi!`);
      // Recalc honor untuk semua guru yang terfilter
      const guruIds = [...new Set(filtered.map(a => ({ id: a.guru_id, nama: a.guru_nama }))
        .map(g => JSON.stringify(g)))].map(s => JSON.parse(s));
      for (const g of guruIds) await recalcHonor(g.id, g.nama);
    } catch (e) { toast.error("Gagal verifikasi: " + e.message); }
  };

  // Batal verifikasi — reset honor otomatis
  const batalVerifikasi = async (id) => {
    const baris = absensi.find(a => a.id === id);
    try {
      await verifikasiAbsensi(id, false);
      setAbsensi(absensi.map(a => a.id === id ? { ...a, verified: false } : a));
      toast.success("Verifikasi dibatalkan.");
      // Recalc honor
      if (baris?.guru_id) await recalcHonor(baris.guru_id, baris.guru_nama);
    } catch (e) { toast.error("Gagal batal verifikasi: " + e.message); }
  };

  // Hapus satu record absensi — sync honor otomatis
  const hapusAbsensi = async (id, nama) => {
    const baris = absensi.find(a => a.id === id);
    const ok = await confirm({
      title: "Hapus Absensi?",
      message: `Absensi "${nama}" akan dihapus. Honor guru akan dihitung ulang otomatis.`,
      type: "danger", confirmText: "Ya, Hapus",
    });
    if (!ok) return;
    try {
      const { error } = await supabase.from("absensi").delete().eq("id", id);
      if (error) throw error;
      setAbsensi(absensi.filter(a => a.id !== id));
      toast.success("Absensi berhasil dihapus.");
      // Recalc honor otomatis
      if (baris?.guru_id) await recalcHonor(baris.guru_id, baris.guru_nama);
    } catch (e) { toast.error("Gagal hapus: " + e.message); }
  };

  // Summary per guru
  const guruNamaList = [...new Set(filtered.map(a => a.guru_nama))];

  const summaryPerGuru = guruNamaList.map(nama => {
    const rows     = filtered.filter(a => a.guru_nama === nama);
    const hadir    = rows.filter(a => a.status === "Hadir").length;
    const verified = rows.filter(a => a.verified).length;

    const siswaSet = {};
    rows.forEach(r => {
      if (!siswaSet[r.siswa_id]) siswaSet[r.siswa_id] = { nama: r.siswa_nama, programs: new Set() };
      siswaSet[r.siswa_id].programs.add(r.program);
    });
    const siswaListPerGuru = Object.values(siswaSet);
    const pertemuan = [...new Set(rows.map(r => r.sesi_id || r.tanggal))].length;

    return { nama, rows, hadir, verified, siswaList: siswaListPerGuru, pertemuan };
  });

  const handleExport = () => {
    exportToExcel(`absensi-${bulan}-${tahun}`,
      ["Tanggal", "Nama Siswa", "Program", "Status", "Guru Pengisi", "Verified"],
      filtered.map(a => [a.tanggal, a.siswa_nama, a.program, a.status, a.guru_nama, a.verified ? "Ya" : "Belum"])
    );
  };

  const STATUS_COLORS = {
    "Hadir":       { bg: "#dcfce7", color: "#16a34a" },
    "Tidak Hadir": { bg: "#fee2e2", color: "#dc2626" },
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data absensi...</div>;

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
              {guruList.map(g => <option key={g.id}>{g.nama}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={verifikasiSemua} className="btn-primary"
            style={{ padding: "7px 12px", fontSize: ".78rem", background: "linear-gradient(135deg,#16a34a,#22c55e)" }}>
            <i className="fa-solid fa-check" style={{marginRight: 5}}></i> Verifikasi Semua
          </button>
          <button className="btn-outline" style={{ padding: "7px 12px", fontSize: ".78rem" }} onClick={handleExport}>
            <i className="fa-solid fa-file-excel" style={{marginRight: 5}}></i> Export
          </button>
        </div>
      </div>

      {/* ── Tab ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[
          { key: "rekap",  label: <><i className="fa-solid fa-chart-bar" style={{marginRight: 6}}></i>Rekap per Guru</> },
          { key: "detail", label: <><i className="fa-solid fa-list-check" style={{marginRight: 6}}></i>Detail Harian</>  },
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
              <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--slate-400)" }}><i className="fa-regular fa-envelope-open"></i></div>
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
                  <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dcfce7", color: "#16a34a" }}>
                    Hadir: {g.hadir}
                  </span>
                  <span style={{ padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700, background: "#dbeafe", color: "#2563eb" }}>
                    Pertemuan: {g.pertemuan}x
                  </span>
                  <span style={{
                    padding: "3px 10px", borderRadius: 100, fontSize: ".72rem", fontWeight: 700,
                    background: g.verified === g.rows.length ? "#dcfce7" : "#fef9c3",
                    color: g.verified === g.rows.length ? "#16a34a" : "#b45309",
                  }}>
                    {g.verified === g.rows.length
                      ? <><i className="fa-solid fa-check" style={{marginRight: 4}}></i>Terverifikasi {g.verified}</>
                      : `${g.verified} verified, ${g.rows.length - g.verified} belum`}
                  </span>
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Program</th>
                      <th>Total Hadir</th>
                      <th>Total Pertemuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.siswaList.map((s, si) => {
                      const siswaRows = g.rows.filter(r => r.siswa_nama === s.nama);
                      const sHadir    = siswaRows.filter(r => r.status === "Hadir").length;
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
                          <td style={{ color: "#16a34a", fontWeight: 600 }}>{sHadir}x</td>
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

      {activeTab === "detail" && (
        <DataTable
          title={`Detail Absensi Harian — ${bulan} ${tahun}`}
          data={filtered}
          searchPlaceholder="Cari siswa atau guru..."
          searchKeys={["siswa_nama", "guru_nama", "program"]}
          headers={[
            "Tanggal",
            "Nama Siswa",
            "Program",
            { label: "Status", align: "center" },
            "Guru Pengisi",
            "Verifikasi",
            { label: "Aksi", align: "center" }
          ]}
          renderRow={(a) => [
            <span key="tgl" style={{ fontSize: ".8rem", color: "var(--muted)" }}>
              {new Date(a.tanggal).toLocaleDateString("id-ID", {
                weekday: "short", day: "numeric", month: "short",
              })}
            </span>,
            <strong key="siswa">{a.siswa_nama}</strong>,
            <span key="prog" className="badge blue">{a.program}</span>,
            <div key="stat" style={{ textAlign: "center" }}>
              <span style={{
                padding: "3px 10px", borderRadius: 100, fontSize: ".72rem",
                fontWeight: 700,
                background: (STATUS_COLORS[a.status] || STATUS_COLORS["Hadir"]).bg,
                color: (STATUS_COLORS[a.status] || STATUS_COLORS["Hadir"]).color,
              }}>
                {a.status}
              </span>
            </div>,
            <span key="guru" style={{ fontSize: ".82rem" }}>{a.guru_nama}</span>,
            <div key="ver">
              {a.verified ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "#16a34a", fontSize: ".78rem", fontWeight: 700 }}><i className="fa-solid fa-check" style={{marginRight: 4}}></i> Verified</span>
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
                <i className="fa-solid fa-check" style={{marginRight: 4}}></i> Verifikasi
                </button>
              )}
            </div>,
            <div key="btns" style={{ textAlign: "center" }}>
              <button onClick={() => hapusAbsensi(a.id, a.siswa_nama)} style={{
                padding: "3px 8px", borderRadius: 6, border: "none",
                background: "#fee2e2", color: "#dc2626", cursor: "pointer",
                fontSize: ".7rem", fontWeight: 700, fontFamily: "inherit",
              }} title="Hapus record ini">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ]}
        />
      )}
      <ConfirmDialogAbsensi />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// 8. SETTING WEB — nama, logo, tagline, kontak, prefix kwitansi
// ─────────────────────────────────────────────────────────────
// Section helper — di luar fungsi agar tidak re-render saat state berubah
const SettingSection = ({ title, children }) => (
  <div className="content-card" style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: ".92rem", fontWeight: 700, marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>{title}</h3>
    {children}
  </div>
);

export function SettingWeb() {
  const toast  = useToast();
  const [form,    setForm]    = useState({
    nama: "", tagline: "", logo: "🎓",
    alamat: "", kontak: "", email: "", wa: "", ig: "", fb: "", maps: "",
    kwitansi_prefix: "KWT", copyright: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(data => setForm(f => ({ ...f, ...data })))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSiteSettings(form);
      toast.success("Setting web berhasil disimpan! Perubahan akan tampil di seluruh aplikasi.");
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat setting...</div>;

  return (
    <div className="fade-in" style={{ maxWidth: 720 }}>

      {/* Identitas Utama */}
      <SettingSection title={<><i className="fa-solid fa-school" style={{marginRight: 8}}></i> Identitas Bimbel</>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Logo / Icon *</label>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                {form.logo && (form.logo.startsWith("http") || form.logo.startsWith("/")) ? (
                  <img src={form.logo} alt="logo preview"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    onError={e => { e.target.style.display = "none"; }} />
                ) : (
                  <span style={{ fontSize: "2rem" }}><i className="fa-solid fa-graduation-cap"></i></span>
                )}
              </div>
              <input className="form-input" value={form.logo}
                onChange={e => setForm({ ...form, logo: e.target.value })}
                placeholder="Emoji atau URL gambar" style={{ flex: 1 }} />
            </div>
            <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>Gunakan emoji (<i className="fa-solid fa-graduation-cap"></i><i className="fa-solid fa-book"></i><i className="fa-solid fa-pencil"></i>) atau URL gambar (https://...)</p>
          </div>
          <div className="form-group">
            <label className="form-label">Nama Bimbel *</label>
            <input className="form-input" value={form.nama}
              onChange={e => setForm({ ...form, nama: e.target.value })}
              placeholder="Nama bimbel Anda" />
            <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>Akan tampil di navbar, kwitansi, slip gaji, landing page.</p>
          </div>
          <div className="form-group">
            <label className="form-label">Tagline</label>
            <input className="form-input" value={form.tagline}
              onChange={e => setForm({ ...form, tagline: e.target.value })}
              placeholder="Lembaga Bimbingan Belajar" />
          </div>
          <div className="form-group">
            <label className="form-label">Copyright Footer</label>
            <input className="form-input" value={form.copyright}
              onChange={e => setForm({ ...form, copyright: e.target.value })}
              placeholder="© 2026 Nama Bimbel. All rights reserved." />
          </div>
        </div>
      </SettingSection>

      {/* Kontak */}
      <SettingSection title={<><i className="fa-solid fa-phone" style={{marginRight: 8}}></i> Informasi Kontak</>}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          {[
            { label: "Alamat",    key: "alamat", ph: "Jl. Contoh No. 1, Kota" },
            { label: "No. HP / WA", key: "kontak", ph: "08xxxxxxxxxx" },
            { label: "Email",     key: "email",  ph: "info@bimbel.com" },
            { label: "WhatsApp (link wa.me)", key: "wa", ph: "628xxxxxxxxxx" },
            { label: "Instagram", key: "ig",     ph: "@namabimbel" },
            { label: "Facebook",  key: "fb",     ph: "facebook.com/namabimbel" },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-input" value={form[f.key] || ""}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.ph} />
            </div>
          ))}
          
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Google Maps (Embed URL)</label>
            <input className="form-input" value={form.maps || ""}
              onChange={e => setForm({ ...form, maps: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..." />
            <p style={{ fontSize: ".72rem", color: "var(--muted)", margin: "4px 0 10px" }}>
              Gunakan link dari Google Maps &gt; Bagikan &gt; Sematkan peta (salin URL di dalam src="...")
            </p>
            {form.maps && form.maps.includes("embed") && (
              <div style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
                <iframe src={form.maps} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            )}
          </div>
        </div>
      </SettingSection>

      {/* Kwitansi */}
      <SettingSection title={<><i className="fa-solid fa-receipt" style={{marginRight: 8}}></i> Setting Kwitansi</>}>
        <div className="form-group" style={{ maxWidth: 280 }}>
          <label className="form-label">Prefix Nomor Kwitansi</label>
          <input className="form-input" value={form.kwitansi_prefix}
            onChange={e => setForm({ ...form, kwitansi_prefix: e.target.value })}
            placeholder="KWT" />
          <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: 6 }}>
            Contoh hasil: <strong>{form.kwitansi_prefix || "KWT"}-AB12CD34-MAR-2026</strong>
          </p>
        </div>
      </SettingSection>

      <button className="btn-primary" style={{ padding: "12px 28px", fontSize: ".9rem" }}
        onClick={handleSave} disabled={saving}>
        <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : "Simpan Semua Setting"}</>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. TEMPLATE WA — edit pesan pengingat SPP
// ─────────────────────────────────────────────────────────────
export function TemplateWA() {
  const toast   = useToast();
  const [template, setTemplate] = useState("");
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [preview,  setPreview]  = useState(false);
  const [namaBimbel, setNamaBimbel] = useState("Al-Adzkiya");

  useEffect(() => {
    Promise.all([getWaTemplate(), getSiteSettings()])
      .then(([waTpl, site]) => {
        setTemplate(waTpl?.template || "");
        if (site?.nama) setNamaBimbel(site.nama);
      })
      .finally(() => setLoading(false));
  }, []);

  const contoh = { nama: "Andi Pratama", bulan: "Maret", tahun: "2026", nama_bimbel: namaBimbel };

  const handleSave = async () => {
    if (!template.trim()) return toast.warning("Template tidak boleh kosong!");
    setSaving(true);
    try {
      await updateWaTemplate(template);
      toast.success("Template WA berhasil disimpan!");
    } catch (e) { toast.error("Gagal simpan: " + e.message); }
    finally { setSaving(false); }
  };

  const previewText = template
    .replace(/{nama}/g, contoh.nama)
    .replace(/{bulan}/g, contoh.bulan)
    .replace(/{tahun}/g, contoh.tahun)
    .replace(/{nama_bimbel}/g, contoh.nama_bimbel);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat template...</div>;

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <div className="content-card">
        <h3 style={{ marginBottom: 6 }}><i className="fa-brands fa-whatsapp" style={{marginRight: 8, color: "#16a34a"}}></i> Template Pesan WA Pengingat SPP</h3>
        <p style={{ fontSize: ".83rem", color: "var(--muted)", marginBottom: 20, lineHeight: 1.6 }}>
          Edit pesan yang dikirim otomatis ke siswa yang belum bayar SPP.
          Gunakan variabel di bawah untuk data dinamis.
        </p>

        {/* Variabel yang tersedia */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {[
            { var: "{nama}",       desc: "Nama siswa" },
            { var: "{bulan}",      desc: "Bulan tagihan" },
            { var: "{tahun}",      desc: "Tahun tagihan" },
            { var: "{nama_bimbel}", desc: "Nama bimbel" },
          ].map(v => (
            <button key={v.var}
              onClick={() => setTemplate(t => t + v.var)}
              style={{
                padding: "4px 10px", borderRadius: 7, border: "1.5px dashed #93c5fd",
                background: "#eff6ff", color: "#2563eb", cursor: "pointer",
                fontSize: ".75rem", fontWeight: 700, fontFamily: "inherit",
              }}
              title={`Klik untuk sisipkan: ${v.desc}`}>
              {v.var} <span style={{ fontWeight: 400, opacity: .7 }}>— {v.desc}</span>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="form-group">
          <label className="form-label">Isi Pesan *</label>
          <textarea
            className="form-input"
            rows={5}
            value={template}
            onChange={e => setTemplate(e.target.value)}
            placeholder="Tulis template pesan WA..."
            style={{ resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
          />
          <p style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 4 }}>
            {template.length} karakter
          </p>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setPreview(!preview)}
            className="btn-outline" style={{ padding: "7px 14px", fontSize: ".8rem" }}>
            {preview ? <><i className="fa-solid fa-chevron-up" style={{marginRight: 6}}></i>Tutup Preview</> : <><i className="fa-solid fa-chevron-down" style={{marginRight: 6}}></i>Lihat Preview</>}
          </button>
          {preview && (
            <div style={{
              marginTop: 12, padding: "14px 16px",
              background: "#f0fdf4", border: "1px solid #bbf7d0",
              borderRadius: 12, fontSize: ".85rem", lineHeight: 1.7,
              whiteSpace: "pre-wrap", color: "#15803d",
            }}>
              <div style={{ fontSize: ".72rem", color: "#16a34a", fontWeight: 700, marginBottom: 6 }}>
                Preview (contoh: Andi Pratama, Maret 2026):
              </div>
              {previewText}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn-primary" style={{ padding: "10px 20px", fontSize: ".88rem" }}
            onClick={handleSave} disabled={saving}>
            <><i className="fa-solid fa-floppy-disk" style={{ marginRight: 6 }}></i> {saving ? "Menyimpan..." : "Simpan Template"}</>
          </button>
          <button className="btn-outline" style={{ padding: "10px 20px", fontSize: ".88rem" }}
            onClick={() => setTemplate("Assalamualaikum, {nama}. Mengingatkan pembayaran SPP bulan {bulan} {tahun} belum terlunasi. Mohon segera diselesaikan. Terima kasih - {nama_bimbel}")}>
            ↺ Reset Default
          </button>
        </div>
      </div>
    </div>
  );
}
