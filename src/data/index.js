// ============================================================
// DATA — BimbelKu
// Semua data statis / mock data terpusat di sini
// ============================================================

export const PACKAGES = [
  {
    id: 1,
    name: "Paket Basic",
    price: "Rp 299.000",
    period: "/bulan",
    color: "#22c55e",
    desc: "Cocok untuk pemula yang ingin memulai belajar dengan bimbingan intensif.",
    features: ["4 sesi/bulan", "Akses modul dasar", "Grup diskusi", "Evaluasi bulanan"],
    badge: null,
  },
  {
    id: 2,
    name: "Paket Premium",
    price: "Rp 599.000",
    period: "/bulan",
    color: "#3b82f6",
    desc: "Untuk siswa yang ingin belajar lebih intensif dengan mentor berpengalaman.",
    features: ["8 sesi/bulan", "Akses semua modul", "Grup diskusi prioritas", "Try out mingguan", "Konsultasi via chat"],
    badge: "Terpopuler",
  },
  {
    id: 3,
    name: "Paket Private",
    price: "Rp 1.299.000",
    period: "/bulan",
    color: "#f59e0b",
    desc: "Belajar 1-on-1 dengan tentor pilihan, jadwal fleksibel sesuai kebutuhanmu.",
    features: ["12 sesi/bulan", "Tentor eksklusif", "Jadwal fleksibel", "Materi disesuaikan", "Laporan perkembangan"],
    badge: "Eksklusif",
  },
];

export const ARTICLES = [
  {
    id: 1,
    title: "5 Teknik Belajar Efektif untuk Persiapan UN",
    author: "Admin BimbelKu",
    date: "10 Mar 2026",
    category: "Tips Belajar",
    img: "📚",
    excerpt: "Persiapan ujian nasional membutuhkan strategi yang tepat. Berikut teknik belajar yang terbukti efektif meningkatkan nilai...",
    content: `Persiapan ujian nasional membutuhkan strategi yang tepat. Berikut adalah 5 teknik belajar yang terbukti efektif:

1. Teknik Pomodoro — Belajar 25 menit, istirahat 5 menit. Metode ini membantu fokus dan mencegah kelelahan otak.

2. Mind Mapping — Buat peta konsep untuk menghubungkan materi satu dengan lainnya. Sangat efektif untuk pelajaran hafalan.

3. Active Recall — Ujikan diri sendiri tanpa melihat catatan. Lebih efektif daripada membaca ulang.

4. Spaced Repetition — Ulangi materi secara berkala dengan jeda yang makin panjang.

5. Feynman Technique — Jelaskan materi seolah mengajari orang lain. Jika bisa menjelaskan dengan sederhana, berarti kamu sudah paham.`,
  },
  {
    id: 2,
    title: "Pengumuman: Jadwal Try Out Nasional Maret 2026",
    author: "Admin BimbelKu",
    date: "8 Mar 2026",
    category: "Pengumuman",
    img: "📢",
    excerpt: "Kami dengan bangga mengumumkan Try Out Nasional yang akan diselenggarakan pada bulan Maret 2026...",
    content: `Kami dengan bangga mengumumkan Try Out Nasional yang akan diselenggarakan:

Tanggal: 20–21 Maret 2026
Waktu: 08.00 – 12.00 WIB
Format: Online via platform BimbelKu

Materi yang diujikan:
- Matematika
- Bahasa Indonesia
- Bahasa Inggris
- IPA / IPS (sesuai jurusan)

Pendaftaran dibuka hingga 18 Maret 2026. Segera daftarkan diri kamu!`,
  },
  {
    id: 3,
    title: "Mengapa Bimbingan Belajar Penting di Era Digital?",
    author: "Drs. Budi Santoso",
    date: "5 Mar 2026",
    category: "Informasi",
    img: "💡",
    excerpt: "Di era digital ini, bimbingan belajar telah bertransformasi menjadi lebih dari sekadar tempat belajar tambahan...",
    content: `Di era digital ini, bimbingan belajar telah bertransformasi. Berikut alasan mengapa bimbel tetap relevan:

1. Pembelajaran Terstruktur — Bimbel menyediakan kurikulum yang terstruktur dan terarah.

2. Mentoring Personal — Interaksi langsung dengan tentor membantu siswa memahami konsep yang sulit.

3. Motivasi Belajar — Lingkungan belajar yang kondusif meningkatkan semangat siswa.

4. Persiapan Ujian — Program khusus untuk mempersiapkan siswa menghadapi ujian penting.`,
  },
  {
    id: 4,
    title: "Strategi Menghadapi Matematika dengan Metode ABCD",
    author: "Ibu Sari Dewi",
    date: "1 Mar 2026",
    category: "Tips Belajar",
    img: "🔢",
    excerpt: "Matematika sering dianggap momok bagi banyak siswa. Dengan metode ABCD, belajar matematika jadi lebih mudah...",
    content: `Matematika sering dianggap momok bagi banyak siswa. Namun dengan metode ABCD:

A — Analyze (Analisis soal dengan teliti)
B — Blueprint (Buat rencana penyelesaian)
C — Calculate (Hitung dengan cermat)
D — Double-check (Periksa kembali jawaban)

Metode ini membantu siswa untuk lebih sistematis dalam mengerjakan soal matematika.`,
  },
];

export const STUDENTS_DATA = [
  { id: 1, name: "Andi Pratama",  email: "andi@email.com",  package: "Premium", grade: "XII IPA", status: "Aktif",    teacher: "Drs. Budi Santoso" },
  { id: 2, name: "Siti Rahma",    email: "siti@email.com",  package: "Basic",   grade: "X IPS",  status: "Aktif",    teacher: "Ibu Sari Dewi" },
  { id: 3, name: "Budi Wijaya",   email: "budi@email.com",  package: "Private", grade: "XI IPA", status: "Aktif",    teacher: "Pak Rizky" },
  { id: 4, name: "Dewi Lestari",  email: "dewi@email.com",  package: "Premium", grade: "XII IPS",status: "Nonaktif", teacher: "Ibu Sari Dewi" },
];

export const TEACHERS_DATA = [
  { id: 1, name: "Drs. Budi Santoso",  email: "budi.s@bimbelku.com",  subject: "Matematika & Fisika",          students: 12, status: "Aktif" },
  { id: 2, name: "Ibu Sari Dewi",      email: "sari.d@bimbelku.com",  subject: "Bahasa Indonesia & Inggris",   students: 9,  status: "Aktif" },
  { id: 3, name: "Pak Rizky Maulana",  email: "rizky.m@bimbelku.com", subject: "Kimia & Biologi",              students: 7,  status: "Aktif" },
];

export const SCHEDULE_GURU = [
  { day: "Senin",  time: "14.00–16.00", subject: "Matematika",  students: ["Andi P.", "Budi W."],            room: "Ruang A" },
  { day: "Rabu",   time: "15.00–17.00", subject: "Fisika",      students: ["Andi P."],                       room: "Ruang B" },
  { day: "Jumat",  time: "13.00–15.00", subject: "Matematika",  students: ["Andi P.", "Budi W.", "Dewi L."], room: "Ruang A" },
];

export const SCHEDULE_SISWA = [
  { day: "Senin",  time: "14.00–16.00", subject: "Matematika",    teacher: "Drs. Budi Santoso", room: "Ruang A" },
  { day: "Rabu",   time: "15.00–17.00", subject: "Fisika",        teacher: "Drs. Budi Santoso", room: "Ruang B" },
  { day: "Sabtu",  time: "09.00–11.00", subject: "Bahasa Inggris",teacher: "Ibu Sari Dewi",     room: "Online"  },
];

export const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@bimbelku.com", pass: "admin123", color: "#8b5cf6" },
  { role: "Guru",  email: "guru@bimbelku.com",  pass: "guru123",  color: "#3b82f6" },
  { role: "Siswa", email: "siswa@bimbelku.com", pass: "siswa123", color: "#22c55e" },
];

export const FEATURES = [
  { icon: "🏆", color: "#fef9c3", title: "Tentor Berpengalaman",  desc: "Tentor kami telah berpengalaman 5–15 tahun dan memiliki track record mengantarkan siswa ke PTN favorit." },
  { icon: "📱", color: "#dbeafe", title: "Belajar Fleksibel",     desc: "Belajar online maupun offline, jadwal bisa disesuaikan dengan kesibukan siswa." },
  { icon: "📊", color: "#dcfce7", title: "Laporan Berkala",       desc: "Orang tua mendapat laporan perkembangan belajar siswa setiap bulan secara lengkap." },
  { icon: "🎯", color: "#f3e8ff", title: "Kurikulum Terstruktur", desc: "Materi pembelajaran mengacu pada kurikulum terbaru dan disesuaikan dengan ujian nasional." },
];
