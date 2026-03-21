// ============================================================
// db.js — Semua query Supabase terpusat di sini
// ============================================================
import { supabase } from "./supabase.js";

// ── PROGRAMS ─────────────────────────────────────────────────
export const getPrograms = async () => {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .order("nama");
  if (error) throw error;
  return data;
};

export const addProgram = async (program) => {
  const { data, error } = await supabase
    .from("programs")
    .insert(program)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateProgram = async (id, updates) => {
  const { data, error } = await supabase
    .from("programs")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteProgram = async (id) => {
  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

// ── GURU ─────────────────────────────────────────────────────
export const getGuru = async () => {
  const { data, error } = await supabase
    .from("guru")
    .select("*")
    .order("nama");
  if (error) throw error;
  return data;
};

export const addGuru = async (guru) => {
  const { data, error } = await supabase
    .from("guru")
    .insert(guru)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateGuru = async (id, updates) => {
  const { data, error } = await supabase
    .from("guru")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteGuru = async (id) => {
  const { error } = await supabase
    .from("guru")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

// ── SISWA ─────────────────────────────────────────────────────
export const getSiswa = async () => {
  const { data, error } = await supabase
    .from("siswa")
    .select(`
      *,
      programs:siswa_programs (
        id,
        nama_program,
        spp
      )
    `)
    .order("nama");
  if (error) throw error;

  // Format supaya sama dengan struktur dummy data
  return data.map(s => ({
    ...s,
    programs: (s.programs || []).map(p => ({
      nama: p.nama_program,
      spp: p.spp,
      id: p.id,
    })),
    total_spp: (s.programs || []).reduce((a, b) => a + (b.spp || 0), 0),
  }));
};

export const addSiswa = async (siswa, programs) => {
  // Insert siswa dulu
  const { data: newSiswa, error } = await supabase
    .from("siswa")
    .insert({
      nama: siswa.nama,
      email: siswa.email,
      ttl: siswa.ttl,
      alamat: siswa.alamat,
      kontak: siswa.kontak,
      sekolah: siswa.sekolah,
      status: siswa.status,
      total_spp: programs.reduce((a, b) => a + (b.spp || 0), 0),
      tgl_daftar: new Date().toISOString().split("T")[0],
    })
    .select()
    .single();
  if (error) throw error;

  // Insert programs siswa
  if (programs.length > 0) {
    const { error: progError } = await supabase
      .from("siswa_programs")
      .insert(programs.map(p => ({
        siswa_id: newSiswa.id,
        nama_program: p.nama,
        spp: p.spp,
      })));
    if (progError) throw progError;

    if (progError) throw progError;

    // Sinkronisasi SPP bulan berjalan — isNew=true (set ke Lunas)
    await syncSiswaSppIni(newSiswa.id, true);
  }

  return newSiswa;
};

// Helper sinkronisasi SPP bulan berjalan
export const syncSiswaSppIni = async (id, isNew = false) => {
  const now = new Date();
  const bulanIni = now.toLocaleDateString("id-ID", { month: "long" });
  const tahunIni = now.getFullYear().toString();
  const tglBayar = now.toLocaleDateString("id-ID");

  // Ambil data siswa & programs terbaru
  const { data: s, error: sErr } = await supabase
    .from("siswa")
    .select("nama, status, programs:siswa_programs(nama_program, spp)")
    .eq("id", id)
    .single();

  if (sErr || !s || s.status !== "Aktif") return;

  for (const p of s.programs) {
    // Cek apakah sudah ada SPP bulan ini untuk program ini
    const { data: existing } = await supabase
      .from("spp_data")
      .select("id, status")
      .eq("siswa_id", id)
      .eq("program", p.nama_program)
      .eq("bulan", bulanIni)
      .eq("tahun", tahunIni)
      .maybeSingle();

    if (existing) {
      // Sudah ada → update nominal saja jika belum lunas
      if (existing.status !== "Lunas") {
        await supabase
          .from("spp_data")
          .update({ nominal: p.spp })
          .eq("id", existing.id);
      }
    } else {
      // Belum ada → insert
      // Jika isNew=true (pendaftaran baru), set sebagai Lunas
      await supabase.from("spp_data").insert({
        siswa_id: id,
        siswa_nama: s.nama,
        program: p.nama_program,
        nominal: p.spp,
        bulan: bulanIni,
        tahun: tahunIni,
        status: isNew ? "Lunas" : "Belum Bayar",
        tgl_bayar: isNew ? tglBayar : null,
      });
    }
  }
};

export const updateSiswa = async (id, siswa, programs) => {
  const { error } = await supabase
    .from("siswa")
    .update({
      nama: siswa.nama,
      email: siswa.email,
      ttl: siswa.ttl,
      alamat: siswa.alamat,
      kontak: siswa.kontak,
      sekolah: siswa.sekolah,
      status: siswa.status,
      total_spp: programs.reduce((a, b) => a + (b.spp || 0), 0),
    })
    .eq("id", id);
  if (error) throw error;

  // Hapus programs lama, insert baru
  await supabase.from("siswa_programs").delete().eq("siswa_id", id);
  if (programs.length > 0) {
    const { error: progError } = await supabase
      .from("siswa_programs")
      .insert(programs.map(p => ({
        siswa_id: id,
        nama_program: p.nama,
        spp: p.spp,
      })));
    if (progError) throw progError;

    // Sinkronisasi spp_data bulan berjalan
    await syncSiswaSppIni(id, false);
  }
};

export const updateStatusSiswa = async (id, status) => {
  const { error } = await supabase
    .from("siswa")
    .update({ status })
    .eq("id", id);
  if (error) throw error;

  // Jika diaktifkan, pastikan ada SPP bulan ini
  if (status === "Aktif") {
    await syncSiswaSppIni(id, false);
  }
};

export const deleteSiswa = async (id) => {
  // Hapus siswa_programs dulu (foreign key constraint)
  await supabase.from("siswa_programs").delete().eq("siswa_id", id);
  const { error } = await supabase.from("siswa").delete().eq("id", id);
  if (error) throw error;
};

// ── SPP EXPIRED ───────────────────────────────────────────────
export const getSppExpired = async () => {
  const { data, error } = await supabase
    .from("spp_expired")
    .select("*");
  if (error) return []; // jangan throw — kembalikan array kosong jika tabel belum ada kolom program
  return data;
};

// upsert expired per (siswa_id, program)
export const upsertSppExpired = async (siswa_id, program, expired) => {
  const { error } = await supabase
    .from("spp_expired")
    .upsert({ siswa_id, program, expired }, { onConflict: "siswa_id,program" });
  if (error) throw error;
};

// ── SPP DATA ──────────────────────────────────────────────────
export const getSppData = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("spp_data")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .order("siswa_nama");
  if (error) throw error;
  return data;
};

// Ambil SPP untuk 1 tahun penuh
export const getSppDataByTahun = async (tahun) => {
  const { data, error } = await supabase
    .from("spp_data")
    .select("*")
    .eq("tahun", tahun)
    .order("bulan")
    .order("siswa_nama");
  if (error) throw error;
  return data;
};

// Generate tagihan SPP untuk SEMUA siswa aktif di bulan/tahun tertentu

import { addOneMonth, subtractOneMonth } from "../utils/dateHelper.js";

// ... (BULAN_LIST depends on location, I'll keep it local to the function or global in a separate file if needed, but for now I'll keep it as I did earlier)
const BULAN_LIST = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

export const generateAllSppBulan = async (bulan, tahun) => {
  // 1. Hitung tanggal terakhir bulan target (misal: April 2026 -> 2026-04-30)
  const monthIdx = BULAN_LIST.indexOf(bulan);
  const lastDay = new Date(tahun, monthIdx + 1, 0); // Tanggal terakhir bulan target
  const lastDayStr = lastDay.toISOString().split("T")[0];

  // 2. Ambil semua siswa aktif Beserta programnya dan tanggal bergabung (created_at)
  const { data: siswas, error } = await supabase
    .from("siswa")
    .select("id, nama, status, created_at, programs:siswa_programs(nama_program, spp)")
    .eq("status", "Aktif");
  if (error) throw error;

  // 3. Ambil semua data expired untuk pengecekan Lunas otomatis
  const { data: expiredList } = await supabase
    .from("spp_expired")
    .select("siswa_id, program, expired");

  let created = 0;
  const todayStr = new Date().toLocaleDateString("id-ID");

  for (const s of siswas || []) {
    // PROTEKSI JOIN DATE: Jika siswa baru terdaftar SETELAH bulan target berakhir, lewati.
    if (s.created_at && s.created_at.split("T")[0] > lastDayStr) {
      continue;
    }

    for (const p of s.programs || []) {
      // Cek apakah tagihan sudah ada di bulan/tahun ini
      const { data: existing } = await supabase
        .from("spp_data")
        .select("id")
        .eq("siswa_id", s.id)
        .eq("program", p.nama_program)
        .eq("bulan", bulan)
        .eq("tahun", tahun)
        .maybeSingle();

      if (!existing) {
        // CEK AUTO-LUNAS
        const exp = (expiredList || []).find(e => e.siswa_id === s.id && e.program === p.nama_program);
        // Jika tgl expired siswa >= tanggal terakhir bulan target, maka status = Lunas
        const isAutoLunas = exp && exp.expired && exp.expired >= lastDayStr;

        await supabase.from("spp_data").insert({
          siswa_id:   s.id,
          siswa_nama: s.nama,
          program:    p.nama_program,
          nominal:    p.spp,
          bulan,
          tahun,
          status:     isAutoLunas ? "Lunas" : "Belum Bayar",
          tgl_bayar:  isAutoLunas ? todayStr : null,
        });
        created++;
      }
    }
  }
  return created;
};

export const updateSppStatus = async (id, status) => {
  // 1. Ambil status sebelum update untuk deteksi toggle
  const { data: before, error: getErr } = await supabase
    .from("spp_data")
    .select("siswa_id, program, status")
    .eq("id", id)
    .single();
  if (getErr) throw getErr;

  // 2. Update status & tgl_bayar
  const { error } = await supabase
    .from("spp_data")
    .update({ 
      status, 
      tgl_bayar: status === "Lunas" 
        ? new Date().toLocaleDateString("id-ID") 
        : "-" 
    })
    .eq("id", id);
  if (error) throw error;

  // 3. Logika OTOMATISASI EXPIRED (Undo/Redo)
  const { siswa_id, program } = before;
  
  // Ambil data expired saat ini
  const { data: cur } = await supabase
    .from("spp_expired")
    .select("expired")
    .eq("siswa_id", siswa_id)
    .eq("program", program || "")
    .maybeSingle();

  if (cur && cur.expired) {
    let nextExp = null;

    if (status === "Lunas" && before.status === "Belum Bayar") {
      // Tambah 1 bulan
      nextExp = addOneMonth(cur.expired);
    } else if (status === "Belum Bayar" && before.status === "Lunas") {
      // Kurangi 1 bulan (Undo)
      nextExp = subtractOneMonth(cur.expired);
    }

    if (nextExp) {
      await upsertSppExpired(siswa_id, program || "", nextExp);
    }
  }
};

export const deleteSppData = async (id) => {
  // 1. Ambil data sebelum hapus
  const { data: target, error: getErr } = await supabase
    .from("spp_data")
    .select("siswa_id, program, status")
    .eq("id", id)
    .single();
  
  if (getErr) throw getErr;

  // 2. Hapus data rincian SPP
  const { error } = await supabase.from("spp_data").delete().eq("id", id);
  if (error) throw error;

  // 3. Efek Samping: Jika yang dihapus berstatus Lunas, Undo masa aktifnya
  if (target.status === "Lunas") {
    const { data: cur } = await supabase
      .from("spp_expired")
      .select("expired")
      .eq("siswa_id", target.siswa_id)
      .eq("program", target.program || "")
      .maybeSingle();

    if (cur && cur.expired) {
      const undoExp = subtractOneMonth(cur.expired);
      if (undoExp) {
        await upsertSppExpired(target.siswa_id, target.program || "", undoExp);
      }
    }
  }
};

// ── HONOR SETTING ─────────────────────────────────────────────
export const getHonorSetting = async () => {
  const { data, error } = await supabase
    .from("honor_setting")
    .select("*");
  if (error) throw error;
  return data;
};

export const upsertHonorSetting = async (guru_id, program, honor_per_siswa) => {
  const { error } = await supabase
    .from("honor_setting")
    .upsert({ guru_id, program, honor_per_siswa }, { onConflict: "guru_id,program" });
  if (error) throw error;
};

export const deleteHonorSetting = async (guru_id, program) => {
  const { error } = await supabase
    .from("honor_setting")
    .delete()
    .eq("guru_id", guru_id)
    .eq("program", program);
  if (error) throw error;
};

// ── ABSENSI ───────────────────────────────────────────────────
export const getAbsensi = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("absensi")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .order("tanggal");
  if (error) throw error;
  return data;
};

export const insertAbsensi = async (rows) => {
  const { error } = await supabase
    .from("absensi")
    .insert(rows);
  if (error) throw error;
};

export const verifikasiAbsensi = async (id, verified) => {
  const { error } = await supabase
    .from("absensi")
    .update({ verified })
    .eq("id", id);
  if (error) throw error;
};

export const verifikasiAbsensiSemua = async (ids) => {
  const { error } = await supabase
    .from("absensi")
    .update({ verified: true })
    .in("id", ids);
  if (error) throw error;
};

// ── HONOR DATA ────────────────────────────────────────────────
export const getHonorData = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("honor_data")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;
  return data;
};

export const upsertHonorData = async (honor) => {
  const { data, error } = await supabase
    .from("honor_data")
    .upsert(honor, { onConflict: "guru_id,bulan,tahun" })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── PEMASUKAN ─────────────────────────────────────────────────
export const getPemasukan = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("pemasukan")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  // Filter by bulan/tahun
  return data.filter(d => {
    const date = new Date(d.tanggal);
    return date.toLocaleDateString("id-ID", { month: "long" }) === bulan
      && date.getFullYear().toString() === tahun;
  });
};

export const addPemasukan = async (item) => {
  const { data, error } = await supabase
    .from("pemasukan")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePemasukan = async (id) => {
  const { error } = await supabase.from("pemasukan").delete().eq("id", id);
  if (error) throw error;
};

export const updatePemasukan = async (id, updates) => {
  const { data, error } = await supabase
    .from("pemasukan")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── PENGELUARAN ───────────────────────────────────────────────
export const getPengeluaran = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("pengeluaran")
    .select("*")
    .order("tanggal", { ascending: false });
  if (error) throw error;
  return data.filter(d => {
    const date = new Date(d.tanggal);
    return date.toLocaleDateString("id-ID", { month: "long" }) === bulan
      && date.getFullYear().toString() === tahun;
  });
};

export const addPengeluaran = async (item) => {
  const { data, error } = await supabase
    .from("pengeluaran")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deletePengeluaran = async (id) => {
  const { error } = await supabase.from("pengeluaran").delete().eq("id", id);
  if (error) throw error;
};

export const updatePengeluaran = async (id, updates) => {
  const { data, error } = await supabase
    .from("pengeluaran")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── ARTIKEL ───────────────────────────────────────────────────
export const getArtikel = async () => {
  const { data, error } = await supabase
    .from("artikel")
    .select("*")
    .order("id", { ascending: false });
  if (error) throw error;
  return data;
};

export const addArtikel = async (item) => {
  const { data, error } = await supabase
    .from("artikel")
    .insert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateArtikel = async (id, updates) => {
  const { data, error } = await supabase
    .from("artikel")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteArtikel = async (id) => {
  const { error } = await supabase.from("artikel").delete().eq("id", id);
  if (error) throw error;
};

// ── SITE SETTINGS ─────────────────────────────────────────────
export const getSiteSettings = async () => {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single();
  if (error) return {
    id: "default", nama: "Al-Adzkiya", tagline: "Lembaga Bimbingan Belajar",
    logo: "🎓", alamat: "", kontak: "", email: "", wa: "", ig: "", fb: "",
    maps: "", kwitansi_prefix: "KWT", copyright: "Al-Adzkiya. All rights reserved.",
    visi: "", misi: "", tentang: "",
    template_wa_spp: "Assalamu'alaikum, {nama_siswa}. Mohon segera melakukan pembayaran SPP {bulan} {tahun} di {nama_bimbel}. Terima kasih.",
    template_wa_sambutan: "Selamat datang, {nama_siswa}! 🎉 Anda telah terdaftar di {nama_bimbel}. Silakan login untuk mulai belajar.",
  };
  return data;
};

export const updateSiteSettings = async (updates) => {
  const { data, error } = await supabase
    .from("site_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", "default")
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── WA TEMPLATE ───────────────────────────────────────────────
export const getWaTemplate = async () => {
  const { data, error } = await supabase
    .from("wa_template")
    .select("*")
    .eq("id", "spp")
    .single();
  if (error) return {
    id: "spp",
    template: "Assalamualaikum, {nama}. Mengingatkan pembayaran SPP bulan {bulan} {tahun} belum terlunasi. Mohon segera diselesaikan. Terima kasih - {nama_bimbel}",
  };
  return data;
};

export const updateWaTemplate = async (template) => {
  const { data, error } = await supabase
    .from("wa_template")
    .update({ template, updated_at: new Date().toISOString() })
    .eq("id", "spp")
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── LANDING PAGE ──────────────────────────────────────────────
export const getLandingSection = async (id) => {
  const { data, error } = await supabase
    .from("landing_page")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data?.content || null;
};

export const getAllLandingSections = async () => {
  const { data, error } = await supabase
    .from("landing_page")
    .select("*");
  if (error) return {};
  const result = {};
  (data || []).forEach(row => { result[row.id] = row.content; });
  return result;
};

// Alias untuk kompatibilitas dengan AdminNewPages.jsx
export const getLandingSections = async () => getAllLandingSections();

export const updateLandingSection = async (id, content) => {
  const { error } = await supabase
    .from("landing_page")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
};

// ── PROGRAM MAPEL ──────────────────────────────────────────────
export const getProgramMapel = async () => {
  const { data, error } = await supabase
    .from("program_mapel")
    .select("*")
    .order("program").order("urutan");
  if (error) return [];
  return data;
};

export const upsertProgramMapel = async (row) => {
  const { data, error } = await supabase
    .from("program_mapel")
    .upsert(row, { onConflict: "program,mapel" })
    .select().single();
  if (error) throw error;
  return data;
};

export const deleteProgramMapel = async (id) => {
  const { error } = await supabase.from("program_mapel").delete().eq("id", id);
  if (error) throw error;
};

// ── RAPORT ────────────────────────────────────────────────────
// Ambil semua raport (admin) — filter bulan/tahun
export const getRaport = async (bulan, tahun) => {
  const { data, error } = await supabase
    .from("raport")
    .select("*")
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .order("siswa_nama").order("mata_pelajaran");
  if (error) throw error;
  return data;
};

// Raport yang diisi oleh guru tertentu
export const getRaportGuru = async (guru_id, bulan, tahun) => {
  const { data, error } = await supabase
    .from("raport")
    .select("*")
    .eq("guru_id", guru_id)
    .eq("bulan", bulan)
    .eq("tahun", tahun)
    .order("siswa_nama").order("mata_pelajaran");
  if (error) throw error;
  return data;
};

// Semua raport milik siswa (semua periode)
export const getRaportSiswa = async (siswa_id) => {
  const { data, error } = await supabase
    .from("raport")
    .select("*")
    .eq("siswa_id", siswa_id)
    .order("tahun", { ascending: false })
    .order("bulan", { ascending: false })
    .order("mata_pelajaran");
  if (error) throw error;
  return data;
};

export const upsertRaport = async (row) => {
  const { data, error } = await supabase
    .from("raport")
    .upsert(row, { onConflict: "siswa_id,program,mata_pelajaran,bulan,tahun" })
    .select().single();
  if (error) throw error;
  return data;
};

// Hapus raport
export const deleteRaport = async (id) => {
  const { error } = await supabase.from("raport").delete().eq("id", id);
  if (error) throw error;
};

// Admin finalisasi raport: set status Validated
export const setRaportFinal = async (siswa_id, program, bulan, tahun) => {
  const { error } = await supabase
    .from("raport")
    .update({ validated: true })
    .eq("siswa_id", siswa_id)
    .eq("program", program)
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;
};

// Kembalikan ke Draft
export const setRaportDraft = async (siswa_id, program, bulan, tahun) => {
  const { error } = await supabase
    .from("raport")
    .update({ validated: false })
    .eq("siswa_id", siswa_id)
    .eq("program", program)
    .eq("bulan", bulan)
    .eq("tahun", tahun);
  if (error) throw error;
};

