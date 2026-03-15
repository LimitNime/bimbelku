// ============================================================
// DATA — BimbelKu
// Semua data statis / mock data terpusat di sini
// Nanti diganti dengan query Supabase satu per satu
// ============================================================

// ── Demo Accounts ────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@bimbelku.com", pass: "admin123", color: "#8b5cf6" },
  { role: "Guru",  email: "guru@bimbelku.com",  pass: "guru123",  color: "#3b82f6" },
  { role: "Siswa", email: "siswa@bimbelku.com", pass: "siswa123", color: "#22c55e" },
];

// ── Program Bimbel ────────────────────────────────────────────
// Tidak ada harga SPP — karena tiap siswa beda nominal
export const PROGRAMS = [
  { id: 1, nama: "Calistung",        jenjang: "TK / SD Awal"  },
  { id: 2, nama: "Matematika SD",    jenjang: "SD"             },
  { id: 3, nama: "Matematika SMP",   jenjang: "SMP"            },
  { id: 4, nama: "Matematika SMA",   jenjang: "SMA"            },
  { id: 5, nama: "Bahasa Inggris",   jenjang: "Semua Jenjang"  },
  { id: 6, nama: "IPA Terpadu",      jenjang: "SMP"            },
  { id: 7, nama: "Persiapan UN",     jenjang: "SD / SMP / SMA" },
  { id: 8, nama: "Baca Tulis Quran", jenjang: "Semua Usia"     },
];

// ── Setting Honor per Guru per Program ───────────────────────
export const HONOR_SETTING = [
  { id: 1, guru_id: 1, guru_nama: "Drs. Budi Santoso", program: "Matematika SMP", honor_per_siswa: 13000 },
  { id: 2, guru_id: 1, guru_nama: "Drs. Budi Santoso", program: "Matematika SMA", honor_per_siswa: 15000 },
  { id: 3, guru_id: 2, guru_nama: "Ibu Sari Dewi",     program: "Calistung",      honor_per_siswa: 6000  },
  { id: 4, guru_id: 2, guru_nama: "Ibu Sari Dewi",     program: "Bahasa Inggris", honor_per_siswa: 10000 },
  { id: 5, guru_id: 2, guru_nama: "Ibu Sari Dewi",     program: "Matematika SD",  honor_per_siswa: 8000  },
  { id: 6, guru_id: 3, guru_nama: "Pak Rizky Maulana", program: "IPA Terpadu",    honor_per_siswa: 12000 },
  { id: 7, guru_id: 3, guru_nama: "Pak Rizky Maulana", program: "Persiapan UN",   honor_per_siswa: 14000 },
];

// ── Data Guru ─────────────────────────────────────────────────
// Hanya identitas — program & jumlah siswa tidak disimpan di sini
export const TEACHERS_DATA = [
  {
    id:      1,
    nama:    "Drs. Budi Santoso",
    ttl:     "Bandung, 15 Februari 1980",
    alamat:  "Jl. Merdeka No. 10, Bandung",
    email:   "budi.s@bimbelku.com",
    kontak:  "08711111111",
    status:  "Aktif",
  },
  {
    id:      2,
    nama:    "Ibu Sari Dewi",
    ttl:     "Jakarta, 3 Maret 1985",
    alamat:  "Jl. Kenanga No. 5, Jakarta Selatan",
    email:   "sari.d@bimbelku.com",
    kontak:  "08722222222",
    status:  "Aktif",
  },
  {
    id:      3,
    nama:    "Pak Rizky Maulana",
    ttl:     "Surabaya, 21 Juli 1990",
    alamat:  "Jl. Anggrek No. 3, Surabaya",
    email:   "rizky.m@bimbelku.com",
    kontak:  "08733333333",
    status:  "Aktif",
  },
];

// ── Data Siswa ────────────────────────────────────────────────
// programs = array, tiap item punya nama program & spp sendiri
// total_spp = jumlah semua program (dihitung otomatis)
export const STUDENTS_DATA = [
  {
    id:         1,
    nama:       "Andi Pratama",
    email:      "andi@email.com",
    ttl:        "Jakarta, 12 Januari 2010",
    alamat:     "Jl. Mawar No. 12, Jakarta Selatan",
    kontak:     "08111111111",
    sekolah:    "SMPN 1 Jakarta",
    programs:   [
      { nama: "Matematika SMP", spp: 200000 },
      { nama: "Bahasa Inggris", spp: 175000 },
    ],
    total_spp:  375000,
    status:     "Aktif",
    tgl_daftar: "2025-01-10",
  },
  {
    id:         2,
    nama:       "Siti Rahma",
    email:      "siti@email.com",
    ttl:        "Bandung, 5 Maret 2012",
    alamat:     "Jl. Melati No. 5, Bandung",
    kontak:     "08222222222",
    sekolah:    "SDN 2 Bandung",
    programs:   [
      { nama: "Calistung", spp: 150000 },
    ],
    total_spp:  150000,
    status:     "Aktif",
    tgl_daftar: "2025-02-01",
  },
  {
    id:         3,
    nama:       "Budi Wijaya",
    email:      "budi@email.com",
    ttl:        "Surabaya, 20 Juli 2009",
    alamat:     "Jl. Kenanga No. 8, Surabaya",
    kontak:     "08333333333",
    sekolah:    "SMAN 3 Surabaya",
    programs:   [
      { nama: "Matematika SMA", spp: 225000 },
    ],
    total_spp:  225000,
    status:     "Aktif",
    tgl_daftar: "2025-01-15",
  },
  {
    id:         4,
    nama:       "Dewi Lestari",
    email:      "dewi@email.com",
    ttl:        "Yogyakarta, 3 November 2011",
    alamat:     "Jl. Flamboyan No. 3, Yogyakarta",
    kontak:     "08444444444",
    sekolah:    "SMPN 5 Yogyakarta",
    programs:   [
      { nama: "Bahasa Inggris", spp: 175000 },
    ],
    total_spp:  175000,
    status:     "Nonaktif",
    tgl_daftar: "2025-03-01",
  },
  {
    id:         5,
    nama:       "Rizal Maulana",
    email:      "rizal@email.com",
    ttl:        "Medan, 15 April 2010",
    alamat:     "Jl. Anggrek No. 7, Medan",
    kontak:     "08555555555",
    sekolah:    "SMPN 2 Medan",
    programs:   [
      { nama: "IPA Terpadu",  spp: 200000 },
      { nama: "Matematika SMP", spp: 180000 },
    ],
    total_spp:  380000,
    status:     "Aktif",
    tgl_daftar: "2025-02-15",
  },
  {
    id:         6,
    nama:       "Putri Amalia",
    email:      "putri@email.com",
    ttl:        "Semarang, 28 Agustus 2013",
    alamat:     "Jl. Dahlia No. 15, Semarang",
    kontak:     "08666666666",
    sekolah:    "SDN 3 Semarang",
    programs:   [
      { nama: "Matematika SD", spp: 175000 },
      { nama: "Calistung",     spp: 150000 },
    ],
    total_spp:  325000,
    status:     "Cuti",
    tgl_daftar: "2025-01-20",
  },
];

// ── Data SPP per Siswa ────────────────────────────────────────
// Tiap baris = 1 program 1 siswa 1 bulan
// Siswa multi program = banyak baris per bulan
export const SPP_DATA = [
  // Andi Pratama — Matematika SMP
  { id: 1,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Matematika SMP", bulan: "Januari",  tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "3 Jan 2026"  },
  { id: 2,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Matematika SMP", bulan: "Februari", tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "2 Feb 2026"  },
  { id: 3,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Matematika SMP", bulan: "Maret",    tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "4 Mar 2026"  },
  // Andi Pratama — Bahasa Inggris
  { id: 4,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Bahasa Inggris", bulan: "Januari",  tahun: "2026", nominal: 175000, status: "Lunas",       tgl_bayar: "3 Jan 2026"  },
  { id: 5,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Bahasa Inggris", bulan: "Februari", tahun: "2026", nominal: 175000, status: "Lunas",       tgl_bayar: "2 Feb 2026"  },
  { id: 6,  siswa_id: 1, siswa_nama: "Andi Pratama", program: "Bahasa Inggris", bulan: "Maret",    tahun: "2026", nominal: 175000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Siti Rahma — Calistung
  { id: 7,  siswa_id: 2, siswa_nama: "Siti Rahma",   program: "Calistung",      bulan: "Januari",  tahun: "2026", nominal: 150000, status: "Lunas",       tgl_bayar: "5 Jan 2026"  },
  { id: 8,  siswa_id: 2, siswa_nama: "Siti Rahma",   program: "Calistung",      bulan: "Februari", tahun: "2026", nominal: 150000, status: "Lunas",       tgl_bayar: "6 Feb 2026"  },
  { id: 9,  siswa_id: 2, siswa_nama: "Siti Rahma",   program: "Calistung",      bulan: "Maret",    tahun: "2026", nominal: 150000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Budi Wijaya — Matematika SMA
  { id: 10, siswa_id: 3, siswa_nama: "Budi Wijaya",  program: "Matematika SMA", bulan: "Januari",  tahun: "2026", nominal: 225000, status: "Lunas",       tgl_bayar: "4 Jan 2026"  },
  { id: 11, siswa_id: 3, siswa_nama: "Budi Wijaya",  program: "Matematika SMA", bulan: "Februari", tahun: "2026", nominal: 225000, status: "Lunas",       tgl_bayar: "3 Feb 2026"  },
  { id: 12, siswa_id: 3, siswa_nama: "Budi Wijaya",  program: "Matematika SMA", bulan: "Maret",    tahun: "2026", nominal: 225000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Rizal Maulana — IPA Terpadu
  { id: 13, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "IPA Terpadu",    bulan: "Januari",  tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "7 Jan 2026"  },
  { id: 14, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "IPA Terpadu",    bulan: "Februari", tahun: "2026", nominal: 200000, status: "Belum Bayar", tgl_bayar: "-"           },
  { id: 15, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "IPA Terpadu",    bulan: "Maret",    tahun: "2026", nominal: 200000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Rizal Maulana — Matematika SMP
  { id: 16, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "Matematika SMP", bulan: "Januari",  tahun: "2026", nominal: 180000, status: "Lunas",       tgl_bayar: "7 Jan 2026"  },
  { id: 17, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "Matematika SMP", bulan: "Februari", tahun: "2026", nominal: 180000, status: "Belum Bayar", tgl_bayar: "-"           },
  { id: 18, siswa_id: 5, siswa_nama: "Rizal Maulana",program: "Matematika SMP", bulan: "Maret",    tahun: "2026", nominal: 180000, status: "Belum Bayar", tgl_bayar: "-"           },
];

// ── Kategori Pemasukan ────────────────────────────────────────
export const KATEGORI_PEMASUKAN = [
  "SPP",
  "Biaya Pendaftaran",
  "Modul / Buku",
  "Donasi",
  "Program Khusus",
  "Lainnya",
];

// ── Kategori Pengeluaran ──────────────────────────────────────
export const KATEGORI_PENGELUARAN = [
  "Honor Guru",
  "Operasional",
  "Modul / Buku",
  "Tak Terduga",
  "Lainnya",
];

// ── Data Pemasukan ────────────────────────────────────────────
export const PEMASUKAN_DATA = [
  { id: 1,  tanggal: "2026-01-03", keterangan: "SPP Andi Pratama - Januari",   kategori: "SPP",               nominal: 200000  },
  { id: 2,  tanggal: "2026-01-04", keterangan: "SPP Budi Wijaya - Januari",    kategori: "SPP",               nominal: 225000  },
  { id: 3,  tanggal: "2026-01-05", keterangan: "SPP Siti Rahma - Januari",     kategori: "SPP",               nominal: 150000  },
  { id: 4,  tanggal: "2026-01-10", keterangan: "Biaya daftar siswa baru",      kategori: "Biaya Pendaftaran", nominal: 100000  },
  { id: 5,  tanggal: "2026-01-15", keterangan: "Penjualan modul Matematika",   kategori: "Modul / Buku",      nominal: 50000   },
  { id: 6,  tanggal: "2026-02-02", keterangan: "SPP Andi Pratama - Februari",  kategori: "SPP",               nominal: 200000  },
  { id: 7,  tanggal: "2026-02-03", keterangan: "SPP Siti Rahma - Februari",    kategori: "SPP",               nominal: 150000  },
  { id: 8,  tanggal: "2026-02-04", keterangan: "SPP Budi Wijaya - Februari",   kategori: "SPP",               nominal: 225000  },
  { id: 9,  tanggal: "2026-03-04", keterangan: "SPP Andi Pratama - Maret",     kategori: "SPP",               nominal: 200000  },
  { id: 10, tanggal: "2026-03-05", keterangan: "Program khusus Try Out",       kategori: "Program Khusus",    nominal: 500000  },
];

// ── Data Pengeluaran ──────────────────────────────────────────
export const PENGELUARAN_DATA = [
  { id: 1,  tanggal: "2026-01-10", keterangan: "Honor Budi Santoso - Januari",  kategori: "Honor Guru",   nominal: 1500000 },
  { id: 2,  tanggal: "2026-01-10", keterangan: "Honor Sari Dewi - Januari",     kategori: "Honor Guru",   nominal: 1200000 },
  { id: 3,  tanggal: "2026-01-15", keterangan: "Listrik & Internet",            kategori: "Operasional",  nominal: 350000  },
  { id: 4,  tanggal: "2026-01-20", keterangan: "ATK & Fotokopi",               kategori: "Operasional",  nominal: 85000   },
  { id: 5,  tanggal: "2026-02-10", keterangan: "Honor Budi Santoso - Februari", kategori: "Honor Guru",   nominal: 1500000 },
  { id: 6,  tanggal: "2026-02-10", keterangan: "Honor Sari Dewi - Februari",    kategori: "Honor Guru",   nominal: 1200000 },
  { id: 7,  tanggal: "2026-02-15", keterangan: "Listrik & Internet",            kategori: "Operasional",  nominal: 350000  },
  { id: 8,  tanggal: "2026-02-20", keterangan: "Beli modul baru",              kategori: "Modul / Buku",  nominal: 200000  },
  { id: 9,  tanggal: "2026-03-10", keterangan: "Honor Budi Santoso - Maret",   kategori: "Honor Guru",   nominal: 1500000 },
  { id: 10, tanggal: "2026-03-12", keterangan: "Perbaikan AC ruang belajar",   kategori: "Tak Terduga",  nominal: 750000  },
];

// ── Data Honor Guru ───────────────────────────────────────────
// Struktur honor 3 bagian:
// 1. mengajar     → admin input jumlah siswa per program
// 2. komponen_tetap → dari KOMPONEN_HONOR_SETTING, nominal bisa diedit tiap bulan
// 3. honor_tambahan → tidak permanen, admin tambah/edit/hapus tiap bulan
export const HONOR_DATA = [
  {
    id:        1,
    guru_id:   1,
    guru_nama: "Drs. Budi Santoso",
    bulan:     "Maret",
    tahun:     "2026",
    status:    "Belum",
    tgl_bayar: "-",

    // Bagian 1: Honor mengajar per program
    mengajar: [
      { program: "Matematika SMP", jumlah_pertemuan: 4, honor_per_siswa: 13000 },
      { program: "Matematika SMA", jumlah_pertemuan: 4, honor_per_siswa: 15000 },
    ],

    // Bagian 2: Komponen tetap (dari setting, nominal bisa diedit per bulan)
    komponen_tetap: [
      { nama: "Gaji Pokok",   nominal: 500000 },
      { nama: "Transportasi", nominal: 50000  },
    ],

    // Bagian 3: Honor tambahan (tidak permanen, bebas tambah/edit/hapus)
    honor_tambahan: [
      { id: 1, nama: "Bonus Ujian Semester", nominal: 150000 },
    ],
  },
  {
    id:        2,
    guru_id:   2,
    guru_nama: "Ibu Sari Dewi",
    bulan:     "Maret",
    tahun:     "2026",
    status:    "Belum",
    tgl_bayar: "-",

    mengajar: [
      { program: "Calistung",      jumlah_pertemuan: 4, honor_per_siswa: 6000  },
      { program: "Bahasa Inggris", jumlah_pertemuan: 3, honor_per_siswa: 10000 },
      { program: "Matematika SD",  jumlah_pertemuan: 3, honor_per_siswa: 8000  },
    ],

    komponen_tetap: [
      { nama: "Gaji Pokok",   nominal: 450000 },
      { nama: "Transportasi", nominal: 50000  },
      { nama: "Insentif",     nominal: 75000  },
    ],

    // Tidak ada honor tambahan bulan ini
    honor_tambahan: [],
  },
  {
    id:        3,
    guru_id:   3,
    guru_nama: "Pak Rizky Maulana",
    bulan:     "Maret",
    tahun:     "2026",
    status:    "Dibayar",
    tgl_bayar: "10 Mar 2026",

    mengajar: [
      { program: "IPA Terpadu",  jumlah_pertemuan: 3, honor_per_siswa: 12000 },
      { program: "Persiapan UN", jumlah_pertemuan: 2, honor_per_siswa: 14000 },
    ],

    komponen_tetap: [
      { nama: "Gaji Pokok", nominal: 400000 },
    ],

    honor_tambahan: [
      { id: 1, nama: "Lembur Persiapan UN", nominal: 200000 },
    ],
  },
];

// ── Data Absensi Siswa ────────────────────────────────────────
// Tiap baris = 1 siswa + 1 hari + guru yang ngisi
// Guru bisa ngisi siswa siapa saja (bukan hanya siswa dia)
// verified = admin sudah verifikasi atau belum
export const ABSENSI_DATA = [
  // 3 Mar 2026 — diisi Pak Budi
  { id: 1,  tanggal: "2026-03-03", siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: true  },
  { id: 2,  tanggal: "2026-03-03", siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: true  },
  // 3 Mar 2026 — diisi Bu Sari
  { id: 3,  tanggal: "2026-03-03", siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: true  },
  { id: 4,  tanggal: "2026-03-03", siswa_id: 6, siswa_nama: "Putri Amalia",  program: "Matematika SD",  guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Izin",        verified: true  },
  // 3 Mar 2026 — diisi Pak Rizky
  { id: 5,  tanggal: "2026-03-03", siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, guru_nama: "Pak Rizky Maulana",   status: "Hadir",       verified: true  },

  // 6 Mar 2026 — diisi Pak Budi
  { id: 6,  tanggal: "2026-03-06", siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: true  },
  { id: 7,  tanggal: "2026-03-06", siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Alpha",       verified: true  },
  // 6 Mar 2026 — diisi Bu Sari
  { id: 8,  tanggal: "2026-03-06", siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: true  },
  // Bu Sari ngisi siswa lain (diminta admin offline)
  { id: 9,  tanggal: "2026-03-06", siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Bahasa Inggris", guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: true  },
  // 6 Mar 2026 — diisi Pak Rizky
  { id: 10, tanggal: "2026-03-06", siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, guru_nama: "Pak Rizky Maulana",   status: "Hadir",       verified: true  },

  // 10 Mar 2026 — diisi Pak Budi
  { id: 11, tanggal: "2026-03-10", siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Sakit",       verified: false },
  { id: 12, tanggal: "2026-03-10", siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: false },
  // 10 Mar 2026 — diisi Bu Sari
  { id: 13, tanggal: "2026-03-10", siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: false },
  { id: 14, tanggal: "2026-03-10", siswa_id: 6, siswa_nama: "Putri Amalia",  program: "Matematika SD",  guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: false },
  // 10 Mar 2026 — diisi Pak Rizky
  { id: 15, tanggal: "2026-03-10", siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, guru_nama: "Pak Rizky Maulana",   status: "Tidak Hadir", verified: false },

  // 13 Mar 2026 — diisi Pak Budi
  { id: 16, tanggal: "2026-03-13", siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: false },
  { id: 17, tanggal: "2026-03-13", siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, guru_nama: "Drs. Budi Santoso",  status: "Hadir",       verified: false },
  // 13 Mar 2026 — diisi Bu Sari
  { id: 18, tanggal: "2026-03-13", siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Tidak Hadir", verified: false },
  { id: 19, tanggal: "2026-03-13", siswa_id: 4, siswa_nama: "Dewi Lestari",  program: "Bahasa Inggris", guru_id: 2, guru_nama: "Ibu Sari Dewi",       status: "Hadir",       verified: false },
  // 13 Mar 2026 — diisi Pak Rizky
  { id: 20, tanggal: "2026-03-13", siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, guru_nama: "Pak Rizky Maulana",   status: "Hadir",       verified: false },
];

// ── Data Artikel ──────────────────────────────────────────────
export const ARTICLES = [
  {
    id:       1,
    title:    "5 Teknik Belajar Efektif untuk Persiapan UN",
    author:   "Admin BimbelKu",
    date:     "10 Mar 2026",
    category: "Tips Belajar",
    img:      "📚",
    excerpt:  "Persiapan ujian nasional membutuhkan strategi yang tepat. Berikut teknik belajar yang terbukti efektif meningkatkan nilai...",
    content:  `Persiapan ujian nasional membutuhkan strategi yang tepat. Berikut adalah 5 teknik belajar yang terbukti efektif:

1. Teknik Pomodoro — Belajar 25 menit, istirahat 5 menit. Metode ini membantu fokus dan mencegah kelelahan otak.

2. Mind Mapping — Buat peta konsep untuk menghubungkan materi satu dengan lainnya. Sangat efektif untuk pelajaran hafalan.

3. Active Recall — Ujikan diri sendiri tanpa melihat catatan. Lebih efektif daripada membaca ulang.

4. Spaced Repetition — Ulangi materi secara berkala dengan jeda yang makin panjang.

5. Feynman Technique — Jelaskan materi seolah mengajari orang lain. Jika bisa menjelaskan dengan sederhana, berarti kamu sudah paham.`,
  },
  {
    id:       2,
    title:    "Pengumuman: Try Out Nasional Maret 2026",
    author:   "Admin BimbelKu",
    date:     "8 Mar 2026",
    category: "Pengumuman",
    img:      "📢",
    excerpt:  "Kami dengan bangga mengumumkan Try Out Nasional yang akan diselenggarakan pada bulan Maret 2026...",
    content:  `Kami dengan bangga mengumumkan Try Out Nasional:

Tanggal : 20–21 Maret 2026
Waktu   : 08.00 – 12.00 WIB
Format  : Online via platform BimbelKu

Materi yang diujikan:
- Matematika
- Bahasa Indonesia
- Bahasa Inggris
- IPA / IPS (sesuai jenjang)

Pendaftaran dibuka hingga 18 Maret 2026.`,
  },
  {
    id:       3,
    title:    "Mengapa Bimbingan Belajar Penting di Era Digital?",
    author:   "Drs. Budi Santoso",
    date:     "5 Mar 2026",
    category: "Informasi",
    img:      "💡",
    excerpt:  "Di era digital ini, bimbingan belajar telah bertransformasi menjadi lebih dari sekadar tempat belajar tambahan...",
    content:  `Di era digital ini, bimbingan belajar tetap relevan karena:

1. Pembelajaran Terstruktur — Bimbel menyediakan kurikulum yang terstruktur dan terarah.

2. Mentoring Personal — Interaksi langsung dengan tentor membantu siswa memahami konsep yang sulit.

3. Motivasi Belajar — Lingkungan belajar yang kondusif meningkatkan semangat siswa.

4. Persiapan Ujian — Program khusus untuk mempersiapkan siswa menghadapi ujian penting.`,
  },
  {
    id:       4,
    title:    "Strategi Menghadapi Matematika dengan Metode ABCD",
    author:   "Ibu Sari Dewi",
    date:     "1 Mar 2026",
    category: "Tips Belajar",
    img:      "🔢",
    excerpt:  "Matematika sering dianggap momok bagi banyak siswa. Dengan metode ABCD, belajar matematika jadi lebih mudah...",
    content:  `Matematika sering dianggap momok. Namun dengan metode ABCD:

A — Analyze     (Analisis soal dengan teliti)
B — Blueprint   (Buat rencana penyelesaian)
C — Calculate   (Hitung dengan cermat)
D — Double-check(Periksa kembali jawaban)

Metode ini membantu siswa lebih sistematis dalam mengerjakan soal.`,
  },
];

// ── Bulan & Tahun (untuk filter) ──────────────────────────────
export const BULAN_LIST = [
  "Januari", "Februari", "Maret",    "April",
  "Mei",     "Juni",     "Juli",     "Agustus",
  "September","Oktober", "November", "Desember",
];

export const TAHUN_LIST = ["2024", "2025", "2026"];

// ── Komponen Tetap Honor per Guru ─────────────────────────────
// Setting komponen tetap per guru (admin setting sekali)
// Nominal bisa diedit tiap bulan
// Beda guru bisa beda komponen
export const KOMPONEN_HONOR_SETTING = [
  // Drs. Budi Santoso
  { id: 1, guru_id: 1, nama: "Gaji Pokok",   nominal_default: 500000, aktif: true  },
  { id: 2, guru_id: 1, nama: "Transportasi", nominal_default: 50000,  aktif: true  },
  { id: 3, guru_id: 1, nama: "Insentif",     nominal_default: 100000, aktif: false },

  // Ibu Sari Dewi
  { id: 4, guru_id: 2, nama: "Gaji Pokok",   nominal_default: 450000, aktif: true  },
  { id: 5, guru_id: 2, nama: "Transportasi", nominal_default: 50000,  aktif: true  },
  { id: 6, guru_id: 2, nama: "Insentif",     nominal_default: 75000,  aktif: true  },

  // Pak Rizky Maulana
  { id: 7, guru_id: 3, nama: "Gaji Pokok",   nominal_default: 400000, aktif: true  },
  { id: 8, guru_id: 3, nama: "Transportasi", nominal_default: 0,      aktif: false },
  { id: 9, guru_id: 3, nama: "Insentif",     nominal_default: 0,      aktif: false },
];