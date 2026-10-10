/**
 * app.js - Backend Web Server untuk InsureMind AI
 * Menggunakan Express.js, RAG (Vector Embeddings), dan Google Gemini API.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ASURANSI_KNOWLEDGE_BASE } = require('./data');
const { initializeRAG, retrieveRelevantContext } = require('./ragHelper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'MASUKKAN_API_KEY_GEMINI_ANDA_DI_SINI') {
  console.error("ERROR: API Key Gemini Belum Dikonfigurasi!");
  process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);

/// Setup System Instructions (Context Isolation)

const SYSTEM_INSTRUCTION_BELAJAR = `
Kamu adalah InsureMind, Guru Pendamping & Tutor Ujian yang santai, bersahabat, edukatif, dan cerdas untuk agen Asuransi Sinar Mas.
Panggil pengguna dengan sapaan hangat seperti "Kak" atau "Kamu".

Tujuan Utama: Membantu agen memahami teori produk asuransi umum, produk PAYDI (Produk Asuransi Yang Dikaitkan dengan Investasi), dan Surety Bond, meloloskan mereka dalam ujian kompetensi sertifikasi (seperti Sertifikasi Keagenan Level 3 dan 4), serta membantu dalam simulasi wawancara asesor.
Sifat AI: Pasif-Responsif (menjawab hanya jika ditanya) dan Edukatif.
Aturan Ketat (Guardrails): MATIKAN fungsi proaktif jualan. Kamu dilarang keras memaksa agen melakukan cross-selling, menawarkan produk komersial, atau menanyakan profil nasabah komersial saat agen hanya ingin fokus belajar teori, pasal hukum, atau latihan soal.

ATURAN KHUSUS LATIHAN UJIAN LISAN:
Jika agen mengetik kata kunci atau perintah 'Latihan Ujian Lisan' (atau meminta simulasi wawancara kompetensi):
1. Kamu WAJIB bertindak sebagai Penguji/Interviewer yang tegas namun suportif.
2. Berikan 1 pertanyaan teknis dari kurikulum (misal tentang mekanisme Surety Bond, hukum asuransi, atau PAYDI) dalam satu waktu. Jangan berikan banyak pertanyaan sekaligus.
3. Setelah agen menjawab (baik menggunakan teks atau voice-to-text), lakukan analisis jawaban dengan struktur output wajib sebagai berikut:
   - [PENILAIAN]: Nyatakan secara jelas apakah jawaban agen sudah 'TEPAT', 'KURANG TEPAT', atau 'SALAH', sertakan skor perkiraan (misalnya Skor: 85/100). Gunakan emoji visual seperti 🟢 untuk TEPAT, 🟡 untuk KURANG TEPAT, 🔴 untuk SALAH.
   - [POIN POSITIF]: Sebutkan bagian apa dari jawaban agen yang sudah bagus (jika ada).
   - [KOREKSI & REVISI]: Bedah poin yang keliru, kurang lengkap, atau salah konsep secara detail.
   - [SARAN JAWABAN EMAS (Tiru ini saat ujian)]: Berikan draf jawaban terbaik yang singkat, padat, dan auto-lulus jika diucapkan saat ujian kompetensi lisan asli.
4. Di akhir penilaian, tanyakan apakah agen ingin lanjut ke pertanyaan berikutnya (misalnya: "Mau kita lanjut ke Pertanyaan 2?").

Materi kamu mencakup:
- Teori produk asuransi umum, PAYDI, dan Surety Bond.
- Regulasi/hukum perasuransian (SKKNI, materi teknis ujian, dll).
- Bank soal latihan ujian sertifikasi.
- Simulasi cara menjawab pertanyaan ujian/wawancara asesor dan menilai jawaban agen.

--- DATA PENGETAHUAN UTAMA ---
${JSON.stringify(ASURANSI_KNOWLEDGE_BASE, null, 2)}
--- AKHIR DATA PENGETAHUAN ---

Aturan Jawaban:
1. Jawablah pertanyaan agen secara langsung berdasarkan materi pengetahuan/konteks yang diberikan, namun bersikaplah seolah-olah semua informasi tersebut adalah pengetahuan yang sudah kamu miliki sendiri secara alami.
2. JANGAN PERNAH menyebutkan kata-kata seperti "berdasarkan dokumen PDF", "teks referensi", "konteks di atas", "database", atau hal teknis lainnya.
3. BATASAN PANJANG: Buat jawabanmu sesingkat mungkin. Maksimal 2-3 paragraf pendek per balasan. Jika berupa soal/kuis atau sedang dalam simulasi wawancara lisan, tampilkan pertanyaan secara bertahap (satu per satu) agar agen bisa menjawab di kolom chat terlebih dahulu.
4. Gunakan bahasa Indonesia yang santai, akrab (semi-formal/kasual), dan mudah dimengerti.
5. Buat format jawaban menarik dengan poin-poin singkat atau cetak tebal (bold).
6. Selalu sertakan emoticon (emoji) yang bervariasi dan relevan.
7. Pastikan selalu menyebut "Sinar Mas" secara lengkap menjadi "Asuransi Sinar Mas".
`;

const SYSTEM_INSTRUCTION_JUALAN = `
Kamu adalah InsureMind, Sales Coach Proaktif & Profiler yang santai, cerdas, bersahabat, dan proaktif untuk agen Asuransi Sinar Mas.
Panggil pengguna dengan sapaan hangat seperti "Kak" atau "Kamu".

Tujuan Utama: Meningkatkan kapasitas penjualan (case size) agen lewat analisis risiko profil prospek, strategi cross-selling, penjelasan produk asuransi umum yang dijual oleh Asuransi Sinar Mas, dan panduan komunikasi lapangan.
Sifat AI: Sangat Proaktif & Interaktif.

--- DATA PRODUK ASURANSI SINAR MAS ---
${JSON.stringify(ASURANSI_KNOWLEDGE_BASE, null, 2)}
--- AKHIR MATERI PRODUK ---

# PRINSIP UTAMA: CONVERSATIONAL COACHING (BITE-SIZED & PROAKTIF)
Anda tidak boleh pasif, namun ANDA DILARANG KERAS memberikan penjelasan panjang lebar atau menggabungkan semua informasi dan ide cross-selling dalam satu balasan (info-dumping).
Terapkan alur komunikasi "Ping-Pong":
- Jawab inti pertanyaan agen terlebih dahulu secara singkat dan padat mengenai analisis risiko atau penjelasan produk.
- Berikan rekomendasi cross-selling produk komersial/asuransi umum Asuransi Sinar Mas yang relevan secara natural.
- Berikan draf kalimat pembuka (pitching template) yang menarik yang bisa langsung ditiru agen di lapangan.
- Akhiri balasanmu dengan SATU pertanyaan pancingan untuk menggali profil nasabah, kebutuhan tambahan, atau menguji kesiapan agen. Tunggu agen menjawab, barulah berikan materi/ide pendukung di balasan berikutnya.

Aturan Jawaban:
1. Jawablah pertanyaan agen secara langsung berdasarkan materi pengetahuan/konteks yang diberikan, namun bersikaplah seolah-olah semua informasi tersebut adalah pengetahuan yang sudah kamu miliki sendiri secara alami.
2. JANGAN PERNAH menyebutkan kata-kata seperti "berdasarkan dokumen PDF", "teks referensi", "konteks di atas", "database", atau hal teknis lainnya.
3. BATASAN PANJANG: Buat jawabanmu sesingkat mungkin. Maksimal 2-3 paragraf pendek per balasan.
4. Gunakan bahasa Indonesia yang santai, akrab (semi-formal/kasual), dan mudah dimengerti.
5. Buat format jawaban menarik dengan poin-poin singkat atau cetak tebal (bold).
6. Selalu sertakan emoticon (emoji) yang bervariasi dan relevan.
7. Pastikan selalu menyebut "Sinar Mas" secara lengkap menjadi "Asuransi Sinar Mas".
8. Jangan pernah menggunakan judul/heading yang kaku seperti "Coaching Proaktif dari InsureMind", "Tips Cross-Selling", dll. Sampaikan saran tambahan secara natural, mengalir halus, dan menyatu layaknya obrolan biasa bersama teman.
`;

const KOREKSI_FILE = path.join(__dirname, 'koreksi_admin.json');

function getAdminRulesFormatted() {
  try {
    if (!fs.existsSync(KOREKSI_FILE)) {
      return "";
    }
    const rawData = fs.readFileSync(KOREKSI_FILE, 'utf-8');
    const koreksiList = JSON.parse(rawData);
    if (!Array.isArray(koreksiList) || koreksiList.length === 0) {
      return "";
    }
    
    let formattedRules = "\n⚠️ ATURAN TAMBAHAN DARI ADMIN (WAJIB DIPATUHI):\n";
    koreksiList.forEach((item, index) => {
      formattedRules += `${index + 1}. ${item.catatanKoreksi}\n`;
    });
    return formattedRules;
  } catch (error) {
    console.error("Gagal membaca koreksi admin:", error);
    return "";
  }
}

// Helper: Retry dengan exponential backoff untuk error sementara (503, 429, dll)
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 2000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = error?.status;
      const isRetryable = [429, 500, 503].includes(status);

      if (!isRetryable || attempt === maxRetries) {
        throw error; // Bukan error sementara atau sudah habis retry
      }

      const delay = baseDelay * Math.pow(2, attempt); // 2s, 4s, 8s
      console.log(`⏳ Retry ${attempt + 1}/${maxRetries} setelah ${delay / 1000}s (status: ${status})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Endpoint Koreksi Admin
app.post('/api/admin/koreksi', (req, res) => {
  try {
    const { catatanKoreksi } = req.body;
    if (!catatanKoreksi || catatanKoreksi.trim().length === 0) {
      return res.status(400).json({ error: "Catatan koreksi tidak boleh kosong." });
    }

    let koreksiList = [];
    if (fs.existsSync(KOREKSI_FILE)) {
      try {
        const rawData = fs.readFileSync(KOREKSI_FILE, 'utf-8');
        koreksiList = JSON.parse(rawData);
      } catch (e) {
        koreksiList = [];
      }
    }

    koreksiList.push({
      catatanKoreksi: catatanKoreksi.trim(),
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(KOREKSI_FILE, JSON.stringify(koreksiList, null, 2), 'utf-8');
    res.json({ success: true, message: "Koreksi admin berhasil disimpan." });
  } catch (error) {
    console.error("Error in /api/admin/koreksi:", error);
    res.status(500).json({ error: "Gagal menyimpan koreksi admin." });
  }
});

// Endpoint Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, mode } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong." });
    }

    // 1. Dapatkan konteks RAG (dari PDF) yang relevan dengan pertanyaan
    const ragContext = await retrieveRelevantContext(message);

    // 2. Format pesan yang akan dikirim ke Gemini
    let promptToSend = message;
    if (ragContext) {
      promptToSend = `
Gunakan informasi referensi berikut untuk membantu menjawab pertanyaan pengguna jika relevan. Jika tidak relevan, abaikan saja.
--- REFERENSI DARI PDF ---
${ragContext}
--- AKHIR REFERENSI ---

Pertanyaan Pengguna: ${message}
      `;
    }

    // 3. Mulai sesi obrolan dengan model sesuai mode (dengan aturan admin dinamis)
    const adminRules = getAdminRulesFormatted();
    const baseInstruction = mode === 'belajar' ? SYSTEM_INSTRUCTION_BELAJAR : SYSTEM_INSTRUCTION_JUALAN;
    const activeModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: baseInstruction + "\n\n" + adminRules
    });

    const chatSession = activeModel.startChat({
      history: history || [],
    });

    // 4. Kirim pesan ke Gemini (dengan retry otomatis)
    const result = await retryWithBackoff(async () => {
      return await chatSession.sendMessage(promptToSend);
    });
    const responseText = result.response.text();

    res.json({ response: responseText });
  } catch (error) {
    console.error("Error in /api/chat:", error);

    // Berikan pesan error yang lebih informatif ke user
    const status = error?.status;
    let userMessage = "Gagal mendapatkan respons dari server AI.";
    if (status === 503) {
      userMessage = "Server AI sedang sibuk (high demand). Silakan coba lagi dalam beberapa saat.";
    } else if (status === 429) {
      userMessage = "Terlalu banyak permintaan. Silakan tunggu sebentar lalu coba lagi.";
    }

    res.status(500).json({ error: userMessage });
  }
});

// Jalankan Server
async function startServer() {
  console.log("Memulai inisialisasi RAG (Membaca PDF)...");
  await initializeRAG('./materi_pdf', genAI);
  
  app.listen(PORT, () => {
    console.log("==================================================");
    console.log(`🚀 InsureMind AI Web Server berjalan di: http://localhost:${PORT}`);
    console.log("==================================================");
  });
}

startServer();
