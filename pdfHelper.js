/**
 * pdfHelper.js - Utilitas untuk Ekstraksi Teks dari File PDF & Folder
 * Menggunakan library 'pdf-parse' untuk membaca dokumen secara asinkron.
 */

const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

/**
 * Membaca file PDF dari path lokal dan mengekstrak semua konten teksnya.
 * @param {string} filePath - Path ke file PDF (misal: './materi_pdf/modul_asuransi.pdf')
 * @returns {Promise<string>} - Konten teks hasil ekstraksi
 */
async function extractTextFromPDF(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File tidak ditemukan di path: ${filePath}`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`\n[PDF Error] Gagal membaca file ${path.basename(filePath)}: ${error.message}`);
    return "";
  }
}

/**
 * Membaca semua file PDF di dalam sebuah folder dan menggabungkan teksnya.
 * @param {string} dirPath - Path ke folder berisi file-file PDF (misal: './materi_pdf')
 * @returns {Promise<{text: string, count: number}>} - Teks gabungan dan jumlah file yang dibaca
 */
async function extractTextFromFolder(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      // Jika folder tidak ada, buat folder baru
      fs.mkdirSync(dirPath, { recursive: true });
      return { text: "", count: 0 };
    }

    const files = fs.readdirSync(dirPath);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

    if (pdfFiles.length === 0) {
      return { text: "", count: 0 };
    }

    let combinedText = "";
    let processedCount = 0;

    for (const file of pdfFiles) {
      const filePath = path.join(dirPath, file);
      const text = await extractTextFromPDF(filePath);
      
      if (text && text.trim().length > 0) {
        combinedText += `\n\n--- DOKUMEN: ${file.toUpperCase()} ---\n`;
        combinedText += text;
        combinedText += `\n--- AKHIR DOKUMEN: ${file.toUpperCase()} ---\n`;
        processedCount++;
      }
    }

    return { text: combinedText, count: processedCount };
  } catch (error) {
    console.error(`\n[PDF Directory Error] Gagal memproses folder PDF: ${error.message}`);
    return { text: "", count: 0 };
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromFolder
};
