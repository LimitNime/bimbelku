/**
 * Menambahkan 1 bulan ke tanggal yang diberikan (YYYY-MM-DD)
 * Menangani overflow akhir bulan (misal Jan 31 -> Feb 28/29)
 * @param {string} dateString 
 * @returns {string} YYYY-MM-DD
 */
export const addOneMonth = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const currentMonth = date.getMonth();
  
  // Tambah 1 bulan
  date.setMonth(currentMonth + 1);

  // Jika bulan melompat lebih dari 1 (misal 31 Jan -> 3 Mar)
  // Kembalikan ke hari terakhir bulan sebelumnya
  if (date.getMonth() !== (currentMonth + 1) % 12) {
    date.setDate(0);
  }

  return date.toISOString().split("T")[0];
};

/**
 * Mengurangi 1 bulan dari tanggal yang diberikan (YYYY-MM-DD)
 * @param {string} dateString 
 * @returns {string} YYYY-MM-DD
 */
export const subtractOneMonth = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const currentMonth = date.getMonth();
  
  // Kurangi 1 bulan
  date.setMonth(currentMonth - 1);

  // Jika bulan melompat tidak sesuai target (misal Mar 31 -> Jan 31, atau Mar 3 -> Feb 28)
  if (date.getMonth() !== (currentMonth + 11) % 12) {
    date.setDate(0);
  }

  return date.toISOString().split("T")[0];
};
