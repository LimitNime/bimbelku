// ============================================================
// DATA — BimbelKu
// Semua data statis / mock data terpusat di sini
// ============================================================

// ── Demo Accounts ────────────────────────────────────────────
export const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@bimbelku.com", pass: "admin123", color: "#8b5cf6" },
  { role: "Guru",  email: "guru@bimbelku.com",  pass: "guru123",  color: "#3b82f6" },
  { role: "Siswa", email: "siswa@bimbelku.com", pass: "siswa123", color: "#22c55e" },
];

// ── Program Bimbel ────────────────────────────────────────────
export const PROGRAMS = [
  { id: 1, nama: "Calistung",        jenjang: "TK / SD Awal",  spp: 150000 },
  { id: 2, nama: "Matematika SD",    jenjang: "SD",             spp: 175000 },
  { id: 3, nama: "Matematika SMP",   jenjang: "SMP",            spp: 200000 },
  { id: 4, nama: "Matematika SMA",   jenjang: "SMA",            spp: 225000 },
  { id: 5, nama: "Bahasa Inggris",   jenjang: "Semua Jenjang",  spp: 175000 },
  { id: 6, nama: "IPA Terpadu",      jenjang: "SMP",            spp: 200000 },
  { id: 7, nama: "Persiapan UN",     jenjang: "SD / SMP / SMA", spp: 250000 },
  { id: 8, nama: "Baca Tulis Quran", jenjang: "Semua Usia",     spp: 125000 },
];

// ── Data Siswa ────────────────────────────────────────────────
export const STUDENTS_DATA = [
  {
    id: 1,
    nama:         "Andi Pratama",
    email:        "andi@email.com",
    ttl:          "Jakarta, 12 Januari 2010",
    alamat:       "Jl. Mawar No. 12, Jakarta Selatan",
    kontak:       "08111111111",
    sekolah:      "SMPN 1 Jakarta",
    program:      "Matematika SMP",
    besaran_spp:  200000,
    status:       "Aktif",
    guru:         "Drs. Budi Santoso",
    tgl_daftar:   "2025-01-10",
  },
  {
    id: 2,
    nama:         "Siti Rahma",
    email:        "siti@email.com",
    ttl:          "Bandung, 5 Maret 2012",
    alamat:       "Jl. Melati No. 5, Bandung",
    kontak:       "08222222222",
    sekolah:      "SDN 2 Bandung",
    program:      "Calistung",
    besaran_spp:  150000,
    status:       "Aktif",
    guru:         "Ibu Sari Dewi",
    tgl_daftar:   "2025-02-01",
  },
  {
    id: 3,
    nama:         "Budi Wijaya",
    email:        "budi@email.com",
    ttl:          "Surabaya, 20 Juli 2009",
    alamat:       "Jl. Kenanga No. 8, Surabaya",
    kontak:       "08333333333",
    sekolah:      "SMAN 3 Surabaya",
    program:      "Matematika SMA",
    besaran_spp:  225000,
    status:       "Aktif",
    guru:         "Drs. Budi Santoso",
    tgl_daftar:   "2025-01-15",
  },
  {
    id: 4,
    nama:         "Dewi Lestari",
    email:        "dewi@email.com",
    ttl:          "Yogyakarta, 3 November 2011",
    alamat:       "Jl. Flamboyan No. 3, Yogyakarta",
    kontak:       "08444444444",
    sekolah:      "SMPN 5 Yogyakarta",
    program:      "Bahasa Inggris",
    besaran_spp:  175000,
    status:       "Nonaktif",
    guru:         "Ibu Sari Dewi",
    tgl_daftar:   "2025-03-01",
  },
  {
    id: 5,
    nama:         "Rizal Maulana",
    email:        "rizal@email.com",
    ttl:          "Medan, 15 April 2010",
    alamat:       "Jl. Anggrek No. 7, Medan",
    kontak:       "08555555555",
    sekolah:      "SMPN 2 Medan",
    program:      "IPA Terpadu",
    besaran_spp:  200000,
    status:       "Aktif",
    guru:         "Pak Rizky Maulana",
    tgl_daftar:   "2025-02-15",
  },
  {
    id: 6,
    nama:         "Putri Amalia",
    email:        "putri@email.com",
    ttl:          "Semarang, 28 Agustus 2013",
    alamat:       "Jl. Dahlia No. 15, Semarang",
    kontak:       "08666666666",
    sekolah:      "SDN 3 Semarang",
    program:      "Matematika SD",
    besaran_spp:  175000,
    status:       "Cuti",
    guru:         "Ibu Sari Dewi",
    tgl_daftar:   "2025-01-20",
  },
];

// ── Data Guru ─────────────────────────────────────────────────
export const TEACHERS_DATA = [
  {
    id:       1,
    nama:     "Drs. Budi Santoso",
    email:    "budi.s@bimbelku.com",
    kontak:   "08711111111",
    program:  ["Matematika SMP", "Matematika SMA"],
    status:   "Aktif",
    honor_per_siswa: 15000,
  },
  {
    id:       2,
    nama:     "Ibu Sari Dewi",
    email:    "sari.d@bimbelku.com",
    kontak:   "08722222222",
    program:  ["Calistung", "Bahasa Inggris", "Matematika SD"],
    status:   "Aktif",
    honor_per_siswa: 12000,
  },
  {
    id:       3,
    nama:     "Pak Rizky Maulana",
    email:    "rizky.m@bimbelku.com",
    kontak:   "08733333333",
    program:  ["IPA Terpadu", "Persiapan UN"],
    status:   "Aktif",
    honor_per_siswa: 15000,
  },
];

// ── Data SPP per Siswa ────────────────────────────────────────
export const SPP_DATA = [
  // Andi Pratama
  { id: 1,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", bulan: "Januari",  tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "3 Jan 2026"  },
  { id: 2,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", bulan: "Februari", tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "2 Feb 2026"  },
  { id: 3,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", bulan: "Maret",    tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "4 Mar 2026"  },
  // Siti Rahma
  { id: 4,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      bulan: "Januari",  tahun: "2026", nominal: 150000, status: "Lunas",       tgl_bayar: "5 Jan 2026"  },
  { id: 5,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      bulan: "Februari", tahun: "2026", nominal: 150000, status: "Lunas",       tgl_bayar: "6 Feb 2026"  },
  { id: 6,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      bulan: "Maret",    tahun: "2026", nominal: 150000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Budi Wijaya
  { id: 7,  siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", bulan: "Januari",  tahun: "2026", nominal: 225000, status: "Lunas",       tgl_bayar: "4 Jan 2026"  },
  { id: 8,  siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", bulan: "Februari", tahun: "2026", nominal: 225000, status: "Lunas",       tgl_bayar: "3 Feb 2026"  },
  { id: 9,  siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", bulan: "Maret",    tahun: "2026", nominal: 225000, status: "Belum Bayar", tgl_bayar: "-"           },
  // Rizal Maulana
  { id: 10, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    bulan: "Januari",  tahun: "2026", nominal: 200000, status: "Lunas",       tgl_bayar: "7 Jan 2026"  },
  { id: 11, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    bulan: "Februari", tahun: "2026", nominal: 200000, status: "Belum Bayar", tgl_bayar: "-"           },
  { id: 12, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    bulan: "Maret",    tahun: "2026", nominal: 200000, status: "Belum Bayar", tgl_bayar: "-"           },
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
  { id: 1, tanggal: "2026-01-03", keterangan: "SPP Andi Pratama - Januari",   kategori: "SPP",               nominal: 200000 },
  { id: 2, tanggal: "2026-01-04", keterangan: "SPP Budi Wijaya - Januari",    kategori: "SPP",               nominal: 225000 },
  { id: 3, tanggal: "2026-01-05", keterangan: "SPP Siti Rahma - Januari",     kategori: "SPP",               nominal: 150000 },
  { id: 4, tanggal: "2026-01-10", keterangan: "Biaya daftar siswa baru",      kategori: "Biaya Pendaftaran", nominal: 100000 },
  { id: 5, tanggal: "2026-01-15", keterangan: "Penjualan modul Matematika",   kategori: "Modul / Buku",      nominal: 50000  },
  { id: 6, tanggal: "2026-02-02", keterangan: "SPP Andi Pratama - Februari",  kategori: "SPP",               nominal: 200000 },
  { id: 7, tanggal: "2026-02-03", keterangan: "SPP Siti Rahma - Februari",    kategori: "SPP",               nominal: 150000 },
  { id: 8, tanggal: "2026-02-04", keterangan: "SPP Budi Wijaya - Februari",   kategori: "SPP",               nominal: 225000 },
  { id: 9, tanggal: "2026-03-04", keterangan: "SPP Andi Pratama - Maret",     kategori: "SPP",               nominal: 200000 },
  { id: 10,tanggal: "2026-03-05", keterangan: "Program khusus Try Out",       kategori: "Program Khusus",    nominal: 500000 },
];

// ── Data Pengeluaran ──────────────────────────────────────────
export const PENGELUARAN_DATA = [
  { id: 1, tanggal: "2026-01-10", keterangan: "Honor Budi Santoso - Januari",  kategori: "Honor Guru",  nominal: 1500000 },
  { id: 2, tanggal: "2026-01-10", keterangan: "Honor Sari Dewi - Januari",     kategori: "Honor Guru",  nominal: 1200000 },
  { id: 3, tanggal: "2026-01-15", keterangan: "Listrik & Internet",            kategori: "Operasional", nominal: 350000  },
  { id: 4, tanggal: "2026-01-20", keterangan: "ATK & Fotokopi",               kategori: "Operasional", nominal: 85000   },
  { id: 5, tanggal: "2026-02-10", keterangan: "Honor Budi Santoso - Februari", kategori: "Honor Guru",  nominal: 1500000 },
  { id: 6, tanggal: "2026-02-10", keterangan: "Honor Sari Dewi - Februari",    kategori: "Honor Guru",  nominal: 1200000 },
  { id: 7, tanggal: "2026-02-15", keterangan: "Listrik & Internet",            kategori: "Operasional", nominal: 350000  },
  { id: 8, tanggal: "2026-02-20", keterangan: "Beli modul baru",              kategori: "Modul / Buku", nominal: 200000 },
  { id: 9, tanggal: "2026-03-10", keterangan: "Honor Budi Santoso - Maret",   kategori: "Honor Guru",  nominal: 1500000 },
  { id: 10,tanggal: "2026-03-12", keterangan: "Perbaikan AC ruang belajar",   kategori: "Tak Terduga", nominal: 750000  },
];

// ── Data Honor Guru ───────────────────────────────────────────
export const HONOR_DATA = [
  {
    id:          1,
    guru_id:     1,
    guru_nama:   "Drs. Budi Santoso",
    bulan:       "Maret",
    tahun:       "2026",
    honor_per_siswa: 15000,
    status:      "Belum",
    tgl_bayar:   "-",
    rincian: [
      { program: "Matematika SMP", jumlah_siswa: 8  },
      { program: "Matematika SMA", jumlah_siswa: 5  },
    ],
  },
  {
    id:          2,
    guru_id:     2,
    guru_nama:   "Ibu Sari Dewi",
    bulan:       "Maret",
    tahun:       "2026",
    honor_per_siswa: 12000,
    status:      "Belum",
    tgl_bayar:   "-",
    rincian: [
      { program: "Calistung",      jumlah_siswa: 12 },
      { program: "Bahasa Inggris", jumlah_siswa: 7  },
      { program: "Matematika SD",  jumlah_siswa: 6  },
    ],
  },
  {
    id:          3,
    guru_id:     3,
    guru_nama:   "Pak Rizky Maulana",
    bulan:       "Maret",
    tahun:       "2026",
    honor_per_siswa: 15000,
    status:      "Dibayar",
    tgl_bayar:   "10 Mar 2026",
    rincian: [
      { program: "IPA Terpadu",    jumlah_siswa: 5  },
      { program: "Persiapan UN",   jumlah_siswa: 3  },
    ],
  },
];

// ── Data Absensi Siswa ────────────────────────────────────────
export const ABSENSI_DATA = [
  // Absensi Andi Pratama
  { id: 1,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, tanggal: "2026-03-03", status: "Hadir"        },
  { id: 2,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, tanggal: "2026-03-06", status: "Hadir"        },
  { id: 3,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, tanggal: "2026-03-10", status: "Tidak Hadir"  },
  { id: 4,  siswa_id: 1, siswa_nama: "Andi Pratama",  program: "Matematika SMP", guru_id: 1, tanggal: "2026-03-13", status: "Hadir"        },
  // Absensi Siti Rahma
  { id: 5,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, tanggal: "2026-03-03", status: "Hadir"        },
  { id: 6,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, tanggal: "2026-03-06", status: "Hadir"        },
  { id: 7,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, tanggal: "2026-03-10", status: "Hadir"        },
  { id: 8,  siswa_id: 2, siswa_nama: "Siti Rahma",    program: "Calistung",      guru_id: 2, tanggal: "2026-03-13", status: "Tidak Hadir"  },
  // Absensi Budi Wijaya
  { id: 9,  siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, tanggal: "2026-03-03", status: "Hadir"        },
  { id: 10, siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, tanggal: "2026-03-06", status: "Tidak Hadir"  },
  { id: 11, siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, tanggal: "2026-03-10", status: "Hadir"        },
  { id: 12, siswa_id: 3, siswa_nama: "Budi Wijaya",   program: "Matematika SMA", guru_id: 1, tanggal: "2026-03-13", status: "Hadir"        },
  // Absensi Rizal Maulana
  { id: 13, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, tanggal: "2026-03-04", status: "Hadir"        },
  { id: 14, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, tanggal: "2026-03-07", status: "Hadir"        },
  { id: 15, siswa_id: 5, siswa_nama: "Rizal Maulana", program: "IPA Terpadu",    guru_id: 3, tanggal: "2026-03-11", status: "Tidak Hadir"  },
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
  "Januari", "Februari", "Maret", "April",
  "Mei", "Juni", "Juli", "Agustus",
  "September", "Oktober", "November", "Desember",
];

export const TAHUN_LIST = ["2024", "2025", "2026"];