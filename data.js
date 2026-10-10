/**
 * data.js - Knowledge Base untuk Chatbot Asuransi Agen
 * Berisi informasi terstruktur mengenai sertifikasi asuransi (Level 3 dan Level 4)
 * serta produk penjaminan (Bonding / Surety Bond).
 */

const ASURANSI_KNOWLEDGE_BASE = {
  certifications: {
    "level 3": {
      title: "Sertifikasi Asuransi Level 3 (Ajun Ahli / Kompetensi Teknis & Operasional)",
      description: "Jenjang sertifikasi yang ditujukan untuk agen tingkat menengah (Ajun Ahli) yang berfokus pada operasional keagenan, analisis kebutuhan nasabah secara mendalam, serta pengenalan produk asuransi komersial.",
      topics: [
        "Prinsip Dasar Asuransi: Insurable Interest, Utmost Good Faith, Indemnity, Subrogation, Contribution, Proximate Cause.",
        "Prosedur Underwriting Dasar: Penilaian risiko awal, pengisian Surat Permohonan Penutupan Asuransi (SPPA).",
        "Kepatuhan & Regulasi OJK: Aturan perlindungan konsumen, batasan komisi agen, dan kode etik keagenan.",
        "Analisis Kebutuhan Nasabah (Fact Finding): Mengidentifikasi profil risiko nasabah individu maupun usaha kecil."
      ],
      tips_ujian: "Fokus pada pemahaman studi kasus sederhana mengenai klaim dan penerapan prinsip asuransi (terutama Proximate Cause dan Indemnity)."
    },
    "level 4": {
      title: "Sertifikasi Asuransi Level 4 (Ahli / Kompetensi Manajemen Risiko & Underwriting Lanjut)",
      description: "Jenjang sertifikasi tingkat ahli untuk agen senior yang mencakup manajemen risiko tingkat lanjut, penyusunan proposal asuransi korporasi, serta pemahaman reasuransi.",
      topics: [
        "Manajemen Risiko Korporasi: Identifikasi, penilaian, pengendalian, serta pembiayaan risiko (Risk Financing).",
        "Underwriting Tingkat Lanjut: Struktur tarif, reasuransi (proporsional dan non-proporsional), serta retensi sendiri.",
        "Aspek Hukum Kontrak Asuransi: Penyusunan klausul khusus (clauses/warranties) pada polis komersial.",
        "Klaim Kompleks: Prosedur investigasi klaim besar dan penyelesaian sengketa (Arbitrase / LAPS SJK)."
      ],
      tips_ujian: "Pelajari perhitungan reasuransi, pembagian risiko, serta analisis laporan keuangan perusahaan untuk underwriting komersial."
    }
  },
  bonding: {
    general: {
      title: "Surety Bond (Asuransi Penjaminan)",
      description: "Produk jaminan tertulis tiga pihak (tripartite agreement) di mana perusahaan asuransi (Surety) menjamin pemilik proyek (Obligee) bahwa pelaksana proyek (Principal) akan memenuhi kewajibannya sesuai kontrak.",
      parties: [
        "Surety (Penjamin): Perusahaan asuransi yang menerbitkan jaminan.",
        "Principal (Terjamin): Kontraktor atau penyedia barang/jasa yang wajib melaksanakan proyek.",
        "Obligee (Penerima Jaminan): Pemilik proyek atau instansi pemerintah/swasta pemberi kerja."
      ],
      types: [
        "Bid Bond (Jaminan Penawaran): Menjamin Principal tidak mundur saat tender atau jika memenangkan tender.",
        "Performance Bond (Jaminan Pelaksanaan): Menjamin Principal menyelesaikan pekerjaan proyek sesuai standar kontrak.",
        "Advance Payment Bond (Jaminan Uang Muka): Menjamin pengembalian uang muka yang telah diterima jika Principal gagal melaksanakan pekerjaan.",
        "Maintenance Bond (Jaminan Pemeliharaan): Menjamin Principal melakukan perbaikan atas cacat/kerusakan setelah proyek selesai."
      ],
      underwriting_3c: "Penilaian kelayakan Principal berdasarkan: Character (Karakter/Reputasi), Capacity (Kemampuan Teknis), dan Capital (Kapasitas Keuangan/Aset)."
    },

    "level 4 bonding": {
      title: "Kompetensi Level 4 Bonding (Ahli - Surety Bond Analisis & Manajemen Risiko)",
      description: "Fokus pada analisis risiko mendalam dan keputusan akseptasi (underwriting) untuk penjaminan proyek bernilai besar (megaproyek/infrastruktur).",
      topics: [
        "Analisis Keuangan Kontraktor: Evaluasi Neraca Saldo, Laporan Laba Rugi, Cash Flow, serta rasio keuangan (Liquidity, Leverage, Activity, Profitability).",
        "Penilaian Kapasitas Teknis (Capacity): Menilai rekam jejak proyek serupa yang pernah dikerjakan kontraktor dan ketersediaan alat.",
        "Manajemen Kontra-Jaminan (Counter Guarantee): Strukturisasi agunan tambahan (deposito, sertifikat tanah, personal/corporate guarantee) untuk mitigasi risiko tinggi.",
        "Reasuransi Surety Bond: Mengatur penempatan reasuransi untuk menyebarkan risiko jaminan bernilai besar."
      ],
      underwriting_focus: "Keputusan akseptasi risiko kompleks, penentuan rate premium (fee jaminan), dan penanganan klaim pencairan jaminan oleh Obligee."
    }
  },
  produk_sinarmas: {
    kesehatan: {
      "simas sehat gold": {
        title: "Simas Sehat Gold",
        description: "Asuransi kesehatan unggulan dari Asuransi Sinar Mas yang memberikan penggantian biaya perawatan rumah sakit, pembedahan, dan perawatan lainnya.",
        manfaat_utama: [
          "Tidak perlu pemeriksaan kesehatan awal (No Medical Check Up).",
          "Fasilitas Cashless di rumah sakit provider Sinar Mas.",
          "Jaminan Rawat Inap, Rawat Jalan Darurat akibat kecelakaan, dan Santunan Meninggal Dunia akibat kecelakaan.",
          "Limit tahunan yang besar menyesuaikan plan yang dipilih."
        ],
        target_market: "Keluarga muda, pekerja lepas (freelancer), atau individu yang mencari asuransi kesehatan yang praktis dan terjangkau."
      },
      "simas sehat executive": {
        title: "Simas Sehat Executive",
        description: "Asuransi kesehatan premium yang dirancang untuk eksekutif dengan jaminan perlindungan menyeluruh hingga ke seluruh dunia.",
        manfaat_utama: [
          "Perlindungan komprehensif seluruh dunia (Worldwide coverage).",
          "Fasilitas Cashless di jaringan rumah sakit luas.",
          "Limit tahunan sangat besar untuk mengcover biaya rumah sakit VIP.",
          "Termasuk jaminan rawat jalan (opsional), rawat gigi (opsional), dan melahirkan (opsional)."
        ],
        target_market: "Eksekutif perusahaan, pengusaha, atau keluarga menengah ke atas yang sering bepergian ke luar negeri dan menginginkan pelayanan VIP."
      }
    },
    kendaraan: {
      "simas mobil": {
        title: "Simas Mobil (Asuransi Kendaraan Bermotor)",
        description: "Perlindungan standar untuk kendaraan bermotor (mobil) terhadap risiko tabrakan, pencurian, atau kerusakan lainnya.",
        jenis_pertanggungan: [
          "Comprehensive (All Risk): Menjamin kerugian/kerusakan sebagian maupun total akibat tabrakan, benturan, terbalik, tergelincir, perbuatan jahat, dan pencurian.",
          "Total Loss Only (TLO): Menjamin kerugian/kerusakan total (biaya perbaikan di atas 75% dari harga kendaraan) atau hilang karena dicuri."
        ],
        target_market: "Pemilik mobil pribadi atau perusahaan operasional."
      },
      "simas mobil exclusive": {
        title: "Simas Mobil Exclusive",
        description: "Asuransi mobil premium dengan layanan ekstra dan perlindungan lebih komprehensif dibandingkan Simas Mobil standar.",
        manfaat_tambahan: [
          "Authorized Workshop (Bengkel Resmi) untuk perbaikan kendaraan.",
          "Layanan mobil derek gratis (Towing service) dan bantuan darurat 24 jam.",
          "Penggantian kendaraan sementara selama mobil diperbaiki (sesuai ketentuan).",
          "Tanggung Jawab Hukum (TJH) Pihak Ketiga dengan limit lebih tinggi."
        ],
        target_market: "Pemilik mobil mewah/premium, mobil baru, atau individu yang mengutamakan kenyamanan maksimal saat terjadi klaim."
      }
    },
    kecelakaan: {
      "simas personal accident": {
        title: "Simas Personal Accident (Kecelakaan Diri)",
        description: "Asuransi kecelakaan diri yang memberikan santunan jika tertanggung mengalami kecelakaan yang mengakibatkan meninggal dunia, cacat tetap, atau memerlukan biaya perawatan medis.",
        manfaat_utama: [
          "Santunan Meninggal Dunia akibat kecelakaan.",
          "Santunan Cacat Tetap Keseluruhan atau Sebagian akibat kecelakaan.",
          "Penggantian biaya perawatan medis akibat kecelakaan (sesuai kuitansi rumah sakit).",
          "Sangat cocok ditawarkan sebagai produk tambahan (cross-selling) bagi pembeli polis asuransi mobil atau asuransi jiwa."
        ],
        target_market: "Semua profesi, terutama pengemudi, pekerja lapangan, kepala keluarga, atau nasabah asuransi kendaraan."
      }
    }
  }
};

module.exports = {
  ASURANSI_KNOWLEDGE_BASE
};
