import { jsPDF } from "jspdf";

/**
 * fiksi: exportRaportPDF
 * Mengkonversi data raport naratif ke file PDF profesional.
 */
export function exportRaportPDF(raportList, siteInfo) {
  if (!raportList || raportList.length === 0) return;

  const doc = new jsPDF("p", "pt", "a4");
  const marginX = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - (marginX * 2);

  raportList.forEach((raport, index) => {
    if (index > 0) doc.addPage();

    let y = 60;

    // --- Header / Kop ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // var(--blue)
    doc.text(siteInfo.nama.toUpperCase(), marginX, y);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // var(--muted)
    y += 15;
    doc.text(siteInfo.tagline || "", marginX, y);
    
    y += 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, y, pageWidth - marginX, y);

    // --- Judul Raport ---
    y += 40;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // var(--slate-800)
    doc.text("LAPORAN PERKEMBANGAN BELAJAR", marginX, y);
    
    y += 20;
    doc.setFontSize(11);
    doc.text(`${raport.bulan} ${raport.tahun}`, marginX, y);

    // --- Info Siswa & Program ---
    y += 40;
    // Box background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(marginX, y - 15, contentWidth, 75, 5, 5, "F");
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Informasi Siswa", marginX + 15, y);
    doc.text("Detail Program", marginX + (contentWidth / 2) + 15, y);

    doc.setFont("helvetica", "normal");
    y += 20;
    doc.text(`Nama: ${raport.siswa_nama}`, marginX + 15, y);
    doc.text(`Program: ${raport.program}`, marginX + (contentWidth / 2) + 15, y);
    y += 18;
    doc.text(`Kelas: ${raport.kelas}`, marginX + 15, y);
    if (raport.mata_pelajaran) {
      doc.text(`Mapel: ${raport.mata_pelajaran}`, marginX + (contentWidth / 2) + 15, y);
    }

    // --- Pembelajaran & Catatan ---
    y += 60;
    doc.setFont("helvetica", "bold");
    doc.text("I. MATERI PEMBELAJARAN", marginX, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    const materiLines = doc.splitTextToSize(raport.materi || "-", contentWidth);
    doc.text(materiLines, marginX, y);
    y += (materiLines.length * 14) + 20;

    doc.setFont("helvetica", "bold");
    doc.text("II. FOKUS DAN SASARAN PEMBELAJARAN", marginX, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    const fokusLines = doc.splitTextToSize(raport.fokus_sasaran || "-", contentWidth);
    doc.text(fokusLines, marginX, y);
    y += (fokusLines.length * 14) + 20;

    doc.setFont("helvetica", "bold");
    doc.text("III. ANALISIS PERKEMBANGAN (NARATIF)", marginX, y);
    y += 18;
    doc.setFont("helvetica", "normal");
    const catatanLines = doc.splitTextToSize(raport.catatan || "-", contentWidth);
    doc.text(catatanLines, marginX, y, { lineHeightFactor: 1.5 });
    
    // --- Tanda Tangan ---
    y = 700;
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, marginX, y);
    
    y += 40;
    doc.text("Mengetahui,", marginX, y);
    doc.text("Guru Pengampu,", marginX + 350, y);
    
    y += 60;
    doc.setFont("helvetica", "bold");
    doc.text("Administrator", marginX, y);
    doc.text(raport.guru_nama, marginX + 350, y);
    
    doc.setFont("helvetica", "normal");
    y += 14;
    doc.text(siteInfo.nama, marginX, y);
  });

  const nameFile = raportList.length === 1 
    ? `Raport_${raportList[0].siswa_nama}_${raportList[0].bulan}_${raportList[0].tahun}.pdf`
    : `Raport_Kolektif_${raportList[0].siswa_nama}.pdf`;

  doc.save(nameFile.replace(/\s+/g, "_"));
}
