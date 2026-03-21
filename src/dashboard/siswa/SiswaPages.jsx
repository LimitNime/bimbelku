// ============================================================
// SiswaPages.jsx — Dashboard Siswa (Supabase connected)
// ============================================================
import { useState, useEffect } from "react";
import StatCard     from "../../components/StatCard.jsx";
import ArticleCard  from "../../components/ArticleCard.jsx";
import Icon         from "../../components/Icon.jsx";
import { cetakKwitansiPDF, cetakRaportPDF } from "../../utils/exportHelper.js";
import { supabase } from "../../lib/supabase.js";
import { useToast } from "../../components/Toast.jsx";
import { getSiteSettings, getRaportSiswa } from "../../lib/db.js";
import {
  STUDENTS_DATA, ABSENSI_DATA, SPP_DATA, SPP_EXPIRED,
  BULAN_LIST, TAHUN_LIST,
} from "../../data/index.js";
import Pagination from "../../components/Pagination.jsx";

// ── Helper ambil siswa yang login dari Supabase ───────────────
const useMySiswa = () => {
  const [mySiswa,   setMySiswa]   = useState(null);
  const [myUserId,  setMyUserId]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return; }
      setMyUserId(user.id);
      supabase.from("siswa")
        .select("*, programs:siswa_programs(id, nama_program, spp)")
        .eq("user_id", user.id)
        .maybeSingle()                         // ← tidak 406 kalau tidak ditemukan
        .then(async ({ data }) => {
          if (data) {
            setMySiswa({
              ...data,
              programs:  (data.programs || []).map(p => ({ nama: p.nama_program, spp: p.spp, id: p.id })),
              total_spp: (data.programs || []).reduce((a, b) => a + (b.spp || 0), 0),
            });
            setLoading(false);
          } else {
            // Fallback: cari by email
            const { data: byEmail } = await supabase.from("siswa")
              .select("*, programs:siswa_programs(id, nama_program, spp)")
              .eq("email", user.email)
              .maybeSingle();
            if (byEmail) {
              setMySiswa({
                ...byEmail,
                programs:  (byEmail.programs || []).map(p => ({ nama: p.nama_program, spp: p.spp, id: p.id })),
                total_spp: (byEmail.programs || []).reduce((a, b) => a + (b.spp || 0), 0),
              });
            }
            setLoading(false);
          }
        });
    });
  }, []);

  return { mySiswa, myUserId, loading };
};

// ── Artikel terbaru dari DB (dipakai di dashboard siswa) ──────
function ArtikelDashboard() {
  const [list, setList] = useState([]);
  useEffect(() => {
    supabase.from("artikel").select("id,title,img,date,category")
      .order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => setList(data || []));
  }, []);
  if (!list.length) return <div style={{ fontSize: ".82rem", color: "var(--muted)" }}>Belum ada artikel.</div>;
  return list.map((a, i) => (
    <div key={a.id} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
      <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {a.img && (a.img.startsWith('http') || a.img.startsWith('/')) ? (
           <img src={a.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<div style="font-size: 1.4rem;"><i class="fa-solid fa-newspaper" style="color:var(--glass-border)"></i></div>'; }} />
        ) : (
           <span style={{ fontSize: "1.4rem" }}>{a.img || <i className="fa-solid fa-newspaper" style={{color:"var(--glass-border)"}}></i>}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ 
          fontWeight: 600, fontSize: ".85rem", lineHeight: 1.3,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>{a.title}</div>
        <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: 2 }}>{a.date || "-"}</div>
      </div>
    </div>
  ));
}

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD SISWA
// ─────────────────────────────────────────────────────────────
export function SiswaDashboard({ onMenu }) {
  const { mySiswa, loading } = useMySiswa();
  const [sppData,   setSppData]   = useState([]);
  const [absensi,   setAbsensi]   = useState([]);
  const [expired,   setExpired]   = useState(null);

  useEffect(() => {
    if (!mySiswa) return;
    // Load SPP bulan ini
    supabase.from("spp_data").select("*").eq("siswa_id", mySiswa.id)
      .then(({ data }) => setSppData(data || []));
    // Load absensi
    supabase.from("absensi").select("*").eq("siswa_id", mySiswa.id).eq("status", "Hadir")
      .then(({ data }) => setAbsensi(data || []));
    // Load expired
    supabase.from("spp_expired").select("*").eq("siswa_id", mySiswa.id).maybeSingle()
      .then(({ data }) => setExpired(data));
  }, [mySiswa]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat dashboard...</div>;

  const belumBayar  = sppData.filter(s => s.status === "Belum Bayar").length;
  const totalHadir  = absensi.length;
  const expTgl      = expired?.expired;
  const isExpired   = expTgl && new Date(expTgl) < new Date();
  const isSoonExp   = expTgl && !isExpired && (new Date(expTgl) - new Date()) / (1000*60*60*24) <= 7;
  const fmtExpired  = expTgl ? new Date(expTgl).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <div className="fade-in">
      {/* Banner status nonaktif / cuti */}
      {mySiswa && mySiswa.status !== "Aktif" && (
        <div style={{
          background: mySiswa.status === "Cuti" ? "#fefce8" : "#fef2f2",
          border: `1px solid ${mySiswa.status === "Cuti" ? "#fde68a" : "#fecaca"}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <i className={`fa-solid ${mySiswa.status === "Cuti" ? "fa-moon" : "fa-circle-xmark"}`}
            style={{ fontSize: "1.6rem", color: mySiswa.status === "Cuti" ? "#ca8a04" : "#dc2626" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: ".92rem", color: mySiswa.status === "Cuti" ? "#92400e" : "#991b1b" }}>
              Akun {mySiswa.status === "Cuti" ? "Sedang Cuti" : "Tidak Aktif"}
            </div>
            <div style={{ fontSize: ".8rem", color: mySiswa.status === "Cuti" ? "#78350f" : "#7f1d1d", marginTop: 2 }}>
              {mySiswa.status === "Cuti"
                ? "Akunmu sedang dalam status Cuti. Hubungi admin untuk mengaktifkan kembali."
                : "Akunmu saat ini Nonaktif. Pembayaran SPP dan absensi tidak akan diproses. Hubungi admin."}
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <StatCard icon="fa-book" label="Program Diikuti" value={(mySiswa?.programs || []).length + " program"} bgColor="#dbeafe" textColor="#2563eb" />
        <StatCard icon="fa-circle-check" label="Total Hadir"      value={totalHadir}                                   bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="fa-file-invoice-dollar" label="SPP Belum Bayar" value={belumBayar + " tagihan"}                      bgColor={belumBayar > 0 ? "#fee2e2" : "#dcfce7"} textColor={belumBayar > 0 ? "#dc2626" : "#16a34a"} />
        <StatCard icon="fa-receipt" label="Total SPP/Bln"   value={"Rp " + (mySiswa?.total_spp || 0).toLocaleString("id-ID")} bgColor="#f3e8ff" textColor="#7c3aed" />
      </div>

      {(isExpired || isSoonExp) && (
        <div style={{
          background: isExpired ? "#fef2f2" : "#fff7ed",
          border: `1px solid ${isExpired ? "#fecaca" : "#fed7aa"}`,
          borderRadius: 12, padding: "14px 18px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: "1.4rem" }}>{isExpired ? "🔴" : "⏰"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: ".88rem", color: isExpired ? "#dc2626" : "#c2410c" }}>
              {isExpired ? "Masa Aktif SPP Sudah Expired!" : "Masa Aktif SPP Hampir Berakhir!"}
            </div>
            <div style={{ fontSize: ".78rem", color: isExpired ? "#991b1b" : "#9a3412" }}>
              {isExpired
                ? `Masa aktif berakhir sejak ${fmtExpired}. Segera hubungi admin.`
                : `Masa aktif berakhir pada ${fmtExpired}. Segera perpanjang.`}
            </div>
          </div>
          <button className="btn-primary"
            style={{ padding: "8px 14px", fontSize: ".78rem", background: isExpired ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#ea580c,#f97316)" }}
            onClick={() => onMenu("pembayaran")}>
            Lihat SPP
          </button>
        </div>
      )}

      {belumBayar > 0 && (
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: "1.4rem" }}><i className="fa-solid fa-triangle-exclamation" style={{color: "#ea580c"}}></i></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: ".88rem", color: "#c2410c" }}>SPP Belum Dibayar</div>
            <div style={{ fontSize: ".78rem", color: "#9a3412" }}>Kamu memiliki {belumBayar} tagihan SPP yang belum dibayar.</div>
          </div>
          <button className="btn-primary" style={{ padding: "8px 14px", fontSize: ".78rem", background: "linear-gradient(135deg,#ea580c,#f97316)" }} onClick={() => onMenu("pembayaran")}>
            Lihat
          </button>
        </div>
      )}

      <div className="content-grid-2">
        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}><i className="fa-solid fa-id-card" style={{marginRight: 8, color: "var(--primary)"}}></i> Info Saya</h3>
          {[
            { label: "Nama",          val: mySiswa?.nama    },
            { label: "Sekolah",       val: mySiswa?.sekolah },
            { label: "Total SPP/Bln", val: "Rp " + (mySiswa?.total_spp || 0).toLocaleString("id-ID") },
            { label: "Status",        val: mySiswa?.status  },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9", fontSize: ".85rem" }}>
              <span style={{ color: "var(--muted)" }}>{item.label}</span>
              <strong>{item.val || "-"}</strong>
            </div>
          ))}
          {(mySiswa?.programs || []).length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: ".75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Program & SPP</div>
              {(mySiswa.programs || []).map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f1f5f9", fontSize: ".83rem" }}>
                  <span className="badge blue" style={{ fontSize: ".72rem" }}>{p.nama}</span>
                  <span style={{ fontWeight: 600, color: "var(--blue)" }}>Rp {(p.spp || 0).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="content-card">
          <h3 style={{ marginBottom: 14 }}><i className="fa-solid fa-newspaper" style={{marginRight: 8, color: "var(--blue)"}}></i> Artikel Terbaru</h3>
          <ArtikelDashboard />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ABSENSI SISWA
// ─────────────────────────────────────────────────────────────
export function AbsensiSiswa() {
  const { mySiswa } = useMySiswa();
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();
  const [bulan,   setBulan]  = useState(todayBln);
  const [tahun,   setTahun]  = useState(todayThn);
  const [data,    setData]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mySiswa) return;
    setLoading(true);
    supabase.from("absensi")
      .select("*")
      .eq("siswa_id", mySiswa.id)
      .eq("status", "Hadir")
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .order("tanggal")
      .then(({ data: rows }) => setData(rows || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [mySiswa, bulan, tahun]);

  const pertemuan = [...new Set(data.map(a => a.sesi_id || a.tanggal))].length;

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat absensi...</div>;

  return (
    <div className="fade-in">
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

      <div className="table-card">
        <div className="table-head"><h3>Riwayat Kehadiran — {bulan} {tahun}</h3></div>
        {data.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Belum ada data kehadiran di bulan ini.</div>
        ) : (
          <table>
            <thead><tr><th>Tanggal</th><th>Program</th><th>Keterangan</th></tr></thead>
            <tbody>
              {data.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>
                    {new Date(a.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                  </td>
                  <td><span className="badge blue">{a.program}</span></td>
                  <td><span className="badge green">Hadir</span></td>
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
  const { mySiswa } = useMySiswa();
  const todayBln = new Date().toLocaleDateString("id-ID", { month: "long" });
  const todayThn = new Date().getFullYear().toString();
  const [bulan,   setBulan]  = useState(todayBln);
  const [tahun,   setTahun]  = useState(todayThn);
  const [data,    setData]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mySiswa) return;
    setLoading(true);
    supabase.from("spp_data")
      .select("*")
      .eq("siswa_id", mySiswa.id)
      .eq("bulan", bulan)
      .eq("tahun", tahun)
      .then(({ data: rows }) => setData(rows || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [mySiswa, bulan, tahun]);

  const cetakKwitansi = async (spp) => {
    const site = await getSiteSettings().catch(() => ({}));
    cetakKwitansiPDF(spp, mySiswa, site);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat data SPP...</div>;

  const lunas = data.filter(s => s.status === "Lunas").length;
  const belum = data.filter(s => s.status === "Belum Bayar").length;

  return (
    <div className="fade-in">
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

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard icon="fa-circle-check" label="Lunas"       value={lunas + " tagihan"} bgColor="#dcfce7" textColor="#16a34a" />
        <StatCard icon="fa-clock" label="Belum Bayar" value={belum + " tagihan"} bgColor={belum > 0 ? "#fee2e2" : "#dcfce7"} textColor={belum > 0 ? "#dc2626" : "#16a34a"} />
      </div>

      <div className="table-card">
        <div className="table-head"><h3>SPP — {bulan} {tahun}</h3></div>
        {data.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Belum ada data SPP bulan ini.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr><th>Program</th><th>Nominal</th><th>Tgl Bayar</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {data.map((s, i) => (
                  <tr key={i}>
                    <td><span className="badge blue">{s.program}</span></td>
                    <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Rp {s.nominal.toLocaleString("id-ID")}</td>
                    <td style={{ fontSize: ".82rem", color: "var(--muted)" }}>{s.tgl_bayar}</td>
                    <td><span className={`badge ${s.status === "Lunas" ? "green" : "red"}`}>{s.status}</span></td>
                    <td>
                      {s.status === "Lunas" && (
                        <button onClick={() => cetakKwitansi(s)} style={{
                          padding: "4px 10px", borderRadius: 7, border: "none", cursor: "pointer",
                          fontFamily: "inherit", fontSize: ".72rem", fontWeight: 700,
                          background: "#dbeafe", color: "#2563eb",
                        }}>
                          <i className="fa-solid fa-print" style={{marginRight: 6}}></i> Kwitansi
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
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. ARTIKEL SISWA
// ─────────────────────────────────────────────────────────────
export function ArtikelSiswa({ onArticle }) {
  const [articles, setArticles]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    supabase.from("artikel").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setArticles(data || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    (a.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}><i className="fa-solid fa-spinner fa-spin" style={{marginRight: 8}}></i> Memuat artikel...</div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 20 }}>
        <input className="form-input" style={{ maxWidth: 300 }}
          placeholder="🔍 Cari artikel..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12, color: "var(--border)" }}><i className="fa-solid fa-box-open"></i></div>
          <p>Belum ada artikel{search ? ` untuk "${search}"` : ""}.</p>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {paginated.map((a, i) => (
              <div key={a.id} className="fade-in" style={{ animationDelay: `${i * .08}s` }}>
                <ArticleCard article={a} index={i} onClick={() => onArticle(a)} />
              </div>
            ))}
          </div>

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. PROFIL SISWA
// ─────────────────────────────────────────────────────────────
export function ProfilSiswa({ user }) {
  const toast = useToast();
  const { mySiswa, loading } = useMySiswa();
  const [edit,    setEdit]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [viewPwd, setViewPwd] = useState(false); // Toggle visibility
  const [form,  setForm]  = useState({ nama: "", sekolah: "", kontak: "", ttl: "", alamat: "" });
  const [pwdForm, setPwdForm] = useState({ baru: "", konfirmasi: "" });

  useEffect(() => {
    if (mySiswa) {
      setForm({
        nama:    mySiswa.nama    || "",
        sekolah: mySiswa.sekolah || "",
        kontak:  mySiswa.kontak  || "",
        ttl:     mySiswa.ttl     || "",
        alamat:  mySiswa.alamat  || "",
      });
    }
  }, [mySiswa]);

  const handleSave = async () => {
    if (!mySiswa) return;
    setSaving(true);
    try {
      // 1. Update tabel siswa — terlihat di Data Siswa admin
      const { error: siswaErr } = await supabase
        .from("siswa")
        .update({ nama: form.nama, sekolah: form.sekolah, kontak: form.kontak, ttl: form.ttl, alamat: form.alamat })
        .eq("id", mySiswa.id);
      if (siswaErr) throw siswaErr;

      // 2. Update tabel profiles — nama terlihat di Manajemen User admin
      if (mySiswa.user_id) {
        await supabase.from("profiles").update({ nama: form.nama }).eq("id", mySiswa.user_id);
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
        <div className="profile-avatar" style={{ background: "#22c55e" }}>
          {form.nama[0] || "S"}
        </div>
        <h2 style={{ marginBottom: 4 }}>{form.nama}</h2>
        <p style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: 20 }}>Siswa</p>

        {!edit ? (
          <>
            {[
              { label: "Email",       val: user?.email || mySiswa?.email },
              { label: "No. Telepon", val: form.kontak  },
              { label: "TTL",         val: form.ttl      },
              { label: "Alamat",      val: form.alamat   },
              { label: "Sekolah",     val: form.sekolah  },
              { label: "Program",     val: (mySiswa?.programs || []).map(p => p.nama).join(", ") },
              { label: "Status",      val: mySiswa?.status },
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
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 8 }}>
              <button onClick={() => setShowPwd(!showPwd)}
                style={{ background: "none", border: "none", color: "var(--blue)", cursor: "pointer", fontSize: ".83rem", fontWeight: 600, fontFamily: "inherit", padding: 0, marginBottom: 10 }}>
                {showPwd ? <><i className="fa-solid fa-chevron-up" style={{marginRight: 6}}></i>Tutup ganti password</> : <><i className="fa-solid fa-key" style={{marginRight: 6}}></i>Ganti Password</>}
              </button>
              {showPwd && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="form-group" style={{ position: "relative" }}>
                    <label className="form-label">Password Baru (min. 6 karakter)</label>
                    <div style={{ position: "relative" }}>
                      <input className="form-input" type={viewPwd ? "text" : "password"} placeholder="••••••••"
                        value={pwdForm.baru} onChange={e => setPwdForm({ ...pwdForm, baru: e.target.value })} style={{ paddingRight: 40 }} />
                      <button type="button" onClick={() => setViewPwd(!viewPwd)} 
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}>
                        <i className={`fa-solid ${viewPwd ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="form-group" style={{ position: "relative" }}>
                    <label className="form-label">Konfirmasi Password Baru</label>
                    <div style={{ position: "relative" }}>
                      <input className="form-input" type={viewPwd ? "text" : "password"} placeholder="••••••••"
                        value={pwdForm.konfirmasi} onChange={e => setPwdForm({ ...pwdForm, konfirmasi: e.target.value })} style={{ paddingRight: 40 }} />
                    </div>
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