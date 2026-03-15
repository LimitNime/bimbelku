// ============================================================
// exportHelper.js — Utilitas Export Excel & PDF
// Butuh: npm install jspdf xlsx
// ============================================================

// ── EXCEL (SheetJS) ──────────────────────────────────────────
export const exportExcel = (filename, sheets) => {
  const XLSX = window.XLSX || require("xlsx");

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
          alignment: { vertical: "center", wrapText: true },
          fill:      { fgColor: { rgb: R % 2 === 0 ? "F8FAFC" : "FFFFFF" } },
          border: {
            top:    { style: "thin", color: { rgb: "E2E8F0" } },
            bottom: { style: "thin", color: { rgb: "E2E8F0" } },
            left:   { style: "thin", color: { rgb: "E2E8F0" } },
            right:  { style: "thin", color: { rgb: "E2E8F0" } },
          },
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
export const cetakSlipGajiPDF = (honor, guru) => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW  = 210;
  const margin = 20;
  const colW   = pageW - margin * 2;
  let y        = 20;

  const fmt    = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
  const line   = () => { doc.setDrawColor(0); doc.setLineWidth(0.3); doc.line(margin, y, pageW - margin, y); y += 1; };
  const thickLine = () => { doc.setDrawColor(0); doc.setLineWidth(0.8); doc.line(margin, y, pageW - margin, y); y += 2; };

  // ── Header ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SLIP GAJI", pageW / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(11);
  doc.text("BimbelKu", pageW / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Lembaga Bimbingan Belajar", pageW / 2, y, { align: "center" });
  y += 8;

  thickLine();

  // ── Info Guru ─────────────────────────────────────────────
  doc.setFontSize(9);
  const infoRows = [
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

  // ── Bagian 1: Honor Mengajar ──────────────────────────────
  sectionHeader("1. HONOR MENGAJAR");

  const mengajar = honor.mengajar || [];
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
  const komponen = honor.komponen_tetap || [];
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
  const tambahan = honor.honor_tambahan || [];
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
  doc.text("Kepala BimbelKu", col1, y);
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
  doc.text("Dokumen ini dicetak secara otomatis oleh sistem BimbelKu", pageW / 2, y, { align: "center" });

  doc.save(`slip-gaji-${honor.guru_nama.replace(/ /g, "-")}-${honor.bulan}-${honor.tahun}.pdf`);
};

// ── PDF — Kwitansi SPP ───────────────────────────────────────
export const cetakKwitansiPDF = (spp, siswa) => {
  const { jsPDF } = window.jspdf;
  // Ukuran kwitansi: A5 landscape
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

  const pageW  = 210;
  const pageH  = 148;
  const margin = 15;
  let y        = 15;

  const fmt = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

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
  doc.text("BimbelKu", pageW / 2, y, { align: "center" });
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Lembaga Bimbingan Belajar", pageW / 2, y, { align: "center" });
  y += 6;

  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── No Kwitansi ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`No: KWT-${spp.siswa_id}-${spp.bulan?.substring(0,3)?.toUpperCase()}-${spp.tahun}`, pageW - margin, y, { align: "right" });
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
  doc.text("BimbelKu", ttdX, y, { align: "center" });
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