// ============================================================
// exportHelper.js — Utilitas Export Excel & PDF
// Butuh: npm install jspdf xlsx-js-style
// ============================================================
import * as XLSX from "xlsx-js-style";

// ── EXCEL (SheetJS Style) ────────────────────────────────────
export const exportExcel = (filename, sheets) => {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, headers, rows, colWidths }) => {
    // Buat data dengan header
    const wsData = [headers, ...rows];
    const ws     = XLSX.utils.aoa_to_sheet(wsData);

    // Style header (bold, background)
    const headerRange = XLSX.utils.decode_range(ws["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
      const cellAddr = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddr]) continue;
      ws[cellAddr].s = {
        font:      { bold: true, color: { rgb: "FFFFFF" } },
        fill:      { fgColor: { rgb: "2563EB" } },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
          top:    { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } },
          left:   { style: "thin", color: { rgb: "000000" } },
          right:  { style: "thin", color: { rgb: "000000" } },
        },
      };
    }

      // Style semua cell data
      for (let R = 1; R <= rows.length; R++) {
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
          const cellAddr = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddr]) continue;
          ws[cellAddr].s = {
            alignment: { vertical: "center", wrapText: true, horizontal: "left" },
            fill:      { fgColor: { rgb: R % 2 === 0 ? "F1F5F9" : "FFFFFF" } },
            border: {
              top:    { style: "thin", color: { rgb: "94A3B8" } },
              bottom: { style: "thin", color: { rgb: "94A3B8" } },
              left:   { style: "thin", color: { rgb: "94A3B8" } },
              right:  { style: "thin", color: { rgb: "94A3B8" } },
            },
            font: { sz: 10 }
          };
        }
      }

    // Set lebar kolom
    if (colWidths) {
      ws["!cols"] = colWidths.map(w => ({ wch: w }));
    } else {
      // Auto width berdasarkan konten
      const maxWidths = headers.map((h, i) => {
        const maxData = Math.max(...rows.map(r => String(r[i] || "").length));
        return { wch: Math.max(String(h).length, maxData, 10) + 2 };
      });
      ws["!cols"] = maxWidths;
    }

    // Row height header
    ws["!rows"] = [{ hpt: 24 }];

    XLSX.utils.book_append_sheet(wb, ws, name);
  });

  XLSX.writeFile(wb, filename + ".xlsx");
};

// ── PDF — Slip Gaji Guru ─────────────────────────────────────
// site: objek dari getSiteSettings() — opsional, fallback ke default
export const cetakSlipGajiPDF = (honor, guru, site = {}) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW      = 210;
  const margin     = 20;
  const colW       = pageW - margin * 2;
  let y            = 20;
  const namaBimbel = site.nama    || "Al-Adzkiya";
  const tagline    = site.tagline || "Lembaga Bimbingan Belajar";

  const fmt    = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
  const line   = () => { doc.setDrawColor(0); doc.setLineWidth(0.3); doc.line(margin, y, pageW - margin, y); y += 1; };
  const thickLine = () => { doc.setDrawColor(0); doc.setLineWidth(0.8); doc.line(margin, y, pageW - margin, y); y += 2; };

  // ── Header ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SLIP GAJI", pageW / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(11);
  doc.text(namaBimbel, pageW / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(tagline, pageW / 2, y, { align: "center" });
  y += 8;

  thickLine();

  // ── Info Guru ─────────────────────────────────────────────
  doc.setFontSize(9);
  
  // Format nomor slip: SLIP/GURU/ID/MM/YYYY
  const guruIdShort = (guru?.id || "G").substring(0, 4).toUpperCase();
  const mm = (honor.bulan_id || 0).toString().padStart(2, '0');
  const noSlip = `No: SLIP/${guruIdShort}/${mm}/${honor.tahun}`;

  const infoRows = [
    ["No. Slip",   noSlip],
    ["Nama",       honor.guru_nama],
    ["Periode",    honor.bulan + " " + honor.tahun],
    ["Tanggal",    new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })],
    ["Status",     honor.status === "Dibayar" ? "SUDAH DIBAYAR" : "BELUM DIBAYAR"],
  ];

  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 30, y);
    doc.text(String(val), margin + 35, y);
    y += 6;
  });

  y += 2;
  thickLine();

  // ── Helper: Section Header ─────────────────────────────────
  const sectionHeader = (title) => {
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, colW, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(title, margin + 2, y + 5);
    y += 9;
  };

  // ── Helper: Table Row ──────────────────────────────────────
  const tableRow = (label, right, isBold = false) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(9);
    doc.text(String(label), margin + 2, y);
    doc.text(String(right), pageW - margin - 2, y, { align: "right" });
    y += 6;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.1);
    doc.line(margin, y - 1, pageW - margin, y - 1);
  };

  // ── Helper: JSON Parser untuk field Array ───────────────────
  const parseJson = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch { return []; }
  };

  // ── Bagian 1: Honor Mengajar ──────────────────────────────
  sectionHeader("1. HONOR MENGAJAR");

  const mengajar = parseJson(honor.mengajar);
  let subtotalMengajar = 0;

  mengajar.forEach(m => {
    const pertemuan = m.jumlah_pertemuan || m.jumlah_siswa || 0;
    const sub = pertemuan * (m.honor_per_siswa || 0);
    subtotalMengajar += sub;
    tableRow(`${m.program}  (${pertemuan} pertemuan × ${fmt(m.honor_per_siswa)})`, fmt(sub));
  });

  y += 1;
  line();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Subtotal Honor Mengajar", margin + 2, y + 4);
  doc.text(fmt(subtotalMengajar), pageW - margin - 2, y + 4, { align: "right" });
  y += 8;

  // ── Bagian 2: Komponen Tetap ──────────────────────────────
  const komponen = parseJson(honor.komponen_tetap);
  if (komponen.length > 0) {
    y += 3;
    sectionHeader("2. KOMPONEN TETAP");
    let subtotalKomponen = 0;
    komponen.forEach(k => {
      subtotalKomponen += k.nominal || 0;
      tableRow(k.nama, fmt(k.nominal));
    });
    y += 1;
    line();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Subtotal Komponen Tetap", margin + 2, y + 4);
    doc.text(fmt(subtotalKomponen), pageW - margin - 2, y + 4, { align: "right" });
    y += 8;
  }

  // ── Bagian 3: Honor Tambahan ──────────────────────────────
  const tambahan = parseJson(honor.honor_tambahan);
  if (tambahan.length > 0) {
    y += 3;
    sectionHeader("3. HONOR TAMBAHAN");
    let subtotalTambahan = 0;
    tambahan.forEach(t => {
      subtotalTambahan += t.nominal || 0;
      tableRow(t.nama, fmt(t.nominal));
    });
    y += 1;
    line();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Subtotal Honor Tambahan", margin + 2, y + 4);
    doc.text(fmt(subtotalTambahan), pageW - margin - 2, y + 4, { align: "right" });
    y += 8;
  }

  // ── Total Gaji ────────────────────────────────────────────
  y += 3;
  const totalMengajar = mengajar.reduce((a, b) => a + (b.jumlah_siswa || 0) * (b.honor_per_siswa || 0), 0);
  const totalKomponen = komponen.reduce((a, b) => a + (b.nominal || 0), 0);
  const totalTambahan = tambahan.reduce((a, b) => a + (b.nominal || 0), 0);
  const totalGaji     = totalMengajar + totalKomponen + totalTambahan;

  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 2;
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, y, colW, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("TOTAL GAJI", margin + 4, y + 7);
  doc.text(fmt(totalGaji), pageW - margin - 4, y + 7, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 14;

  // ── Tanda Tangan ─────────────────────────────────────────
  y += 5;
  const col1 = margin;
  const col2 = pageW / 2 + 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Mengetahui,", col1, y);
  doc.text("Penerima,", col2, y);
  y += 5;
  doc.text(`Kepala ${namaBimbel}`, col1, y);
  doc.text(honor.guru_nama, col2, y);
  y += 20;

  doc.line(col1, y, col1 + 50, y);
  doc.line(col2, y, col2 + 50, y);
  y += 5;
  doc.text("(................................)", col1, y);
  doc.text(`(${honor.guru_nama})`, col2, y);

  // ── Footer ────────────────────────────────────────────────
  y += 15;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Dokumen ini dicetak secara otomatis oleh sistem ${namaBimbel}`, pageW / 2, y, { align: "center" });

  doc.save(`slip-gaji-${honor.guru_nama.replace(/ /g, "-")}-${honor.bulan}-${honor.tahun}.pdf`);
};

// ── PDF — Kwitansi SPP ───────────────────────────────────────
// site: objek dari getSiteSettings() — opsional, fallback ke default
export const cetakKwitansiPDF = (spp, siswa, site = {}) => {
  const { jsPDF } = window.jspdf;
  // Ukuran kwitansi: A5 landscape
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

  const pageW  = 210;
  const pageH  = 148;
  const margin = 15;
  let y        = 15;

  const fmt         = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
  const namaBimbel  = site.nama    || "Al-Adzkiya";
  const tagline     = site.tagline || "Lembaga Bimbingan Belajar";
  const prefix      = site.kwitansi_prefix || "KWT";
  // Nomor kwitansi: PREFIX-8KARAKTER_UUID-BLN-THN
  const shortId     = (spp.siswa_id || spp.id || "").toString().replace(/-/g,"").substring(0, 8).toUpperCase();
  const noKwitansi  = `${prefix}-${shortId}-${spp.bulan?.substring(0,3)?.toUpperCase()}-${spp.tahun}`;

  // Border luar
  doc.setDrawColor(0);
  doc.setLineWidth(0.8);
  doc.rect(margin - 5, margin - 5, pageW - (margin - 5) * 2, pageH - (margin - 5) * 2);

  // ── Header ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("KWITANSI", pageW / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(11);
  doc.text(namaBimbel, pageW / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(tagline, pageW / 2, y, { align: "center" });
  y += 6;

  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── No Kwitansi ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`No: ${noKwitansi}`, pageW - margin, y, { align: "right" });
  doc.text(`Tanggal: ${spp.tgl_bayar}`, margin, y);
  y += 8;

  // ── Isi Kwitansi ──────────────────────────────────────────
  const rows = [
    ["Telah diterima dari", ":", siswa?.nama || spp.siswa_nama || "-"],
    ["Program",             ":", spp.program || "-"],
    ["Keperluan",           ":", `Pembayaran SPP Bulan ${spp.bulan} ${spp.tahun}`],
    ["Jumlah",              ":", fmt(spp.nominal)],
  ];

  doc.setFontSize(9);
  rows.forEach(([label, sep, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(sep, margin + 45, y);
    if (label === "Jumlah") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
    }
    doc.text(val, margin + 50, y);
    doc.setFontSize(9);
    y += 8;
  });

  // ── Nominal Box ───────────────────────────────────────────
  y += 2;
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageW - margin * 2, 12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(fmt(spp.nominal), pageW / 2, y + 8, { align: "center" });
  y += 16;

  // ── Status ────────────────────────────────────────────────
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Status: `, margin, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(spp.status === "Lunas" ? 0 : 200, spp.status === "Lunas" ? 128 : 0, 0);
  doc.text(spp.status === "Lunas" ? "✓ LUNAS" : "BELUM LUNAS", margin + 15, y);
  doc.setTextColor(0, 0, 0);
  y += 8;

  // ── Tanda Tangan ─────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const ttdX = pageW - margin - 45;
  doc.text("Hormat kami,", ttdX, y, { align: "center" });
  y += 3;
  doc.text(namaBimbel, ttdX, y, { align: "center" });
  y += 16;
  doc.setLineWidth(0.3);
  doc.line(ttdX - 20, y, ttdX + 20, y);
  y += 4;
  doc.text("(Bendahara)", ttdX, y, { align: "center" });

  // ── Footer ────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text("Simpan kwitansi ini sebagai bukti pembayaran yang sah", pageW / 2, pageH - 8, { align: "center" });

  doc.save(`kwitansi-spp-${spp.siswa_nama}-${spp.bulan}-${spp.tahun}.pdf`);
};

// ── PDF — Raport Siswa ──────────────────────────────────────
// rows: array { mapel, guru_nama, nilai, keterangan }
export const cetakRaportPDF = (siswa, program, bulan, tahun, rows, site = {}) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW      = 210;
  const margin     = 20;
  const colW       = pageW - margin * 2;
  let y            = 18;
  const namaBimbel = site.nama    || "Al-Adzkiya";
  const tagline    = site.tagline || "Lembaga Bimbingan Belajar";

  const line       = () => { doc.setDrawColor(220); doc.setLineWidth(0.2); doc.line(margin, y, pageW - margin, y); y += 1; };
  const thickLine  = () => { doc.setDrawColor(0);   doc.setLineWidth(0.6); doc.line(margin, y, pageW - margin, y); y += 2; };

  // ── Header ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("RAPORT SISWA", pageW / 2, y, { align: "center" }); y += 7;

  doc.setFontSize(11);
  doc.text(namaBimbel, pageW / 2, y, { align: "center" }); y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(tagline, pageW / 2, y, { align: "center" }); y += 8;
  thickLine();

  // ── Info Siswa ────────────────────────────────────────────
  const infoRows = [
    ["Nama Siswa", siswa.nama || "-"],
    ["Program",    program    || "-"],
    ["Periode",    `${bulan} ${tahun}`],
    ["Sekolah",   siswa.sekolah || "-"],
  ];
  doc.setFontSize(9);
  infoRows.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(":", margin + 32, y);
    doc.text(String(val), margin + 36, y);
    y += 6;
  });
  y += 2; thickLine();

  // ── Tabel Nilai ───────────────────────────────────────────
  const colMapel = margin;
  const colGuru  = margin + 60;
  const colNilai = margin + 120;
  const colKet   = margin + 140;

  // Header tabel
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, colW, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Mata Pelajaran", colMapel + 2, y + 5.5);
  doc.text("Guru",          colGuru  + 2, y + 5.5);
  doc.text("Nilai",         colNilai + 2, y + 5.5);
  doc.text("Keterangan",    colKet   + 2, y + 5.5);
  doc.setTextColor(0, 0, 0);
  y += 10;

  // Baris nilai
  rows.forEach((r, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y - 2, colW, 8, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(String(r.mapel || "-"),      colMapel + 2, y + 4);
    doc.text(String(r.guru_nama || "-"),  colGuru  + 2, y + 4);

    const nilaiStr = r.nilai !== null && r.nilai !== undefined ? String(r.nilai) : "-";
    const nilaiNum = parseFloat(nilaiStr);
    if (!isNaN(nilaiNum)) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(nilaiNum >= 75 ? 22 : 185, nilaiNum >= 75 ? 163 : 28, nilaiNum >= 75 ? 74 : 26);
    }
    doc.text(nilaiStr, colNilai + 2, y + 4);
    doc.setTextColor(0, 0, 0); doc.setFont("helvetica", "normal");
    doc.text(String(r.keterangan || "-").substring(0, 25), colKet + 2, y + 4);

    doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.1);
    doc.line(margin, y + 6, pageW - margin, y + 6);
    y += 8;
  });

  // Rata-rata
  const validNilai = rows.filter(r => r.nilai !== null && r.nilai !== undefined && !isNaN(parseFloat(r.nilai)));
  if (validNilai.length > 0) {
    const rata = validNilai.reduce((a, b) => a + parseFloat(b.nilai), 0) / validNilai.length;
    y += 2; thickLine();
    doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("Rata-rata Nilai", margin, y);
    doc.setTextColor(37, 99, 235);
    doc.text(rata.toFixed(1), pageW - margin, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 8;
  }

  y += 4; thickLine();

  // ── Tanda Tangan ─────────────────────────────────────────
  const col1 = margin;
  const col2 = pageW / 2 + 10;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text("Mengetahui,", col1, y);
  doc.text("Orang Tua / Wali,", col2, y); y += 5;
  doc.text(`Kepala ${namaBimbel}`, col1, y);
  doc.text(siswa.nama || "", col2, y); y += 20;
  doc.setLineWidth(0.3);
  doc.line(col1, y, col1 + 50, y);
  doc.line(col2, y, col2 + 50, y); y += 4;
  doc.setFontSize(8);
  doc.text("(................................)", col1, y);
  doc.text("(................................)", col2, y);

  // ── Footer ────────────────────────────────────────────────
  y += 14;
  doc.setFontSize(7); doc.setTextColor(150, 150, 150);
  doc.text(`Dicetak otomatis oleh sistem ${namaBimbel} | ${new Date().toLocaleDateString("id-ID")}`, pageW / 2, y, { align: "center" });

  doc.save(`raport-${(siswa.nama || "siswa").replace(/ /g, "-")}-${program}-${bulan}-${tahun}.pdf`);
};

// ── PDF — Laporan Keuangan ───────────────────────────────────
export const cetakLaporanKeuangan = (bulan, tahun, data, site = {}) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW      = 210;
  const margin     = 20;
  let y            = 20;
  const namaBimbel = site.nama    || "Al-Adzkiya";

  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN KEUANGAN BULANAN", pageW / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(11);
  doc.text(`${namaBimbel} - Periode ${bulan} ${tahun}`, pageW / 2, y, { align: "center" });
  y += 15;

  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 10;

  const rows = [
    ["Pemasukan SPP", fmt(data.spp)],
    ["Pemasukan Lain", fmt(data.masuk)],
    ["TOTAL PEMASUKAN", fmt(data.totalMasuk), true],
    ["", ""],
    ["Pengeluaran Operasional", fmt(data.keluar)],
    ["Pengeluaran Honor Guru", fmt(data.honor)],
    ["TOTAL PENGELUARAN", fmt(data.totalKeluar), true],
    ["", ""],
    ["SALDO AKHIR", fmt(data.saldo), true]
  ];

  rows.forEach(([label, val, isBold]) => {
    if (!label) { y += 6; return; }
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(10);
    doc.text(label, margin, y);
    doc.text(val, pageW - margin, y, { align: "right" });
    y += 8;
  });

  y += 20;
  doc.setFontSize(8);
  doc.text(`Dicetak pada: ${new Date().toLocaleString("id-ID")}`, margin, y);
  
  doc.save(`laporan-keuangan-${bulan}-${tahun}.pdf`);
};