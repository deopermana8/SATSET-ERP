export interface OutlineSubchapter {
  title: string;
}

export interface OutlineChapter {
  title: string;
  subchapters: OutlineSubchapter[];
}

export interface BookOutline {
  title: string;
  subtitle: string;
  preface: string;
  chapters: OutlineChapter[];
  appendix: string[];
  glossary: string[];
  references: string[];
}

// --- Rule maps ---

const TOPIC_MAP: Array<{ keywords: string[]; title: string; subtitle: string; chapters: OutlineChapter[]; appendix: string[]; glossary: string[]; references: string[] }> = [
  {
    keywords: ["sop", "standar operasional", "prosedur", "procedure", "standard operating"],
    title: "Standar Operasional Prosedur",
    subtitle: "Panduan Operasional Resmi",
    chapters: [
      { title: "Pendahuluan", subchapters: [{ title: "Latar Belakang" }, { title: "Tujuan" }, { title: "Ruang Lingkup" }] },
      { title: "Dasar Hukum dan Kebijakan", subchapters: [{ title: "Peraturan Terkait" }, { title: "Kebijakan Internal" }] },
      { title: "Struktur Organisasi", subchapters: [{ title: "Tugas dan Fungsi" }, { title: "Alur Tanggung Jawab" }] },
      { title: "Prosedur Operasional", subchapters: [{ title: "Alur Kerja" }, { title: "Instruksi Langkah-Langkah" }, { title: "Formulir dan Dokumen" }] },
      { title: "Pemantauan dan Evaluasi", subchapters: [{ title: "Indikator Kinerja" }, { title: "Mekanisme Pelaporan" }] },
    ],
    appendix: ["Formulir SOP", "Bagan Alur", "Daftar Dokumen Pendukung"],
    glossary: ["SOP", "Prosedur", "Evaluasi", "Pelaporan"],
    references: ["Peraturan Pemerintah terkait", "Pedoman Kementerian"],
  },
  {
    keywords: ["desa", "village", "kelurahan"],
    title: "Panduan Pemerintahan Desa",
    subtitle: "Tata Kelola dan Administrasi Desa",
    chapters: [
      { title: "Pengantar Pemerintahan Desa", subchapters: [{ title: "Sejarah Desa" }, { title: "Visi dan Misi" }] },
      { title: "Struktur Pemerintahan Desa", subchapters: [{ title: "Kepala Desa" }, { title: "Perangkat Desa" }, { title: "BPD" }] },
      { title: "Administrasi dan Keuangan", subchapters: [{ title: "Pengelolaan APBDes" }, { title: "Laporan Keuangan" }] },
      { title: "Pelayanan Masyarakat", subchapters: [{ title: "Layanan Kependudukan" }, { title: "Layanan Sosial" }] },
      { title: "Pembangunan Desa", subchapters: [{ title: "Perencanaan" }, { title: "Pelaksanaan" }, { title: "Monitoring" }] },
    ],
    appendix: ["Formulir Administrasi", "Contoh APBDes", "Peraturan Desa"],
    glossary: ["APBDes", "BPD", "Musrenbang", "ADD"],
    references: ["UU No. 6 Tahun 2014 tentang Desa", "Permendagri terkait"],
  },
  {
    keywords: ["teknis", "technical", "engineering", "rekayasa", "software", "perangkat lunak"],
    title: "Buku Teknis",
    subtitle: "Panduan Teknis Lengkap",
    chapters: [
      { title: "Pendahuluan", subchapters: [{ title: "Latar Belakang" }, { title: "Tujuan" }] },
      { title: "Konsep Dasar", subchapters: [{ title: "Teori Fondasi" }, { title: "Arsitektur Sistem" }] },
      { title: "Implementasi", subchapters: [{ title: "Persiapan Lingkungan" }, { title: "Langkah Implementasi" }, { title: "Konfigurasi" }] },
      { title: "Pengujian", subchapters: [{ title: "Strategi Pengujian" }, { title: "Skenario Uji" }] },
      { title: "Pemeliharaan", subchapters: [{ title: "Pembaruan" }, { title: "Troubleshooting" }] },
    ],
    appendix: ["Kode Contoh", "Diagram Teknis", "Spesifikasi"],
    glossary: ["API", "Deploy", "Konfigurasi", "Arsitektur"],
    references: ["Dokumentasi Resmi", "RFC terkait"],
  },
  {
    keywords: ["bisnis", "business", "perusahaan", "company", "usaha", "enterprise"],
    title: "Panduan Bisnis",
    subtitle: "Strategi dan Operasional Bisnis",
    chapters: [
      { title: "Profil Perusahaan", subchapters: [{ title: "Sejarah" }, { title: "Visi, Misi, Nilai" }] },
      { title: "Struktur Organisasi", subchapters: [{ title: "Divisi dan Departemen" }, { title: "Tugas Pokok" }] },
      { title: "Proses Bisnis", subchapters: [{ title: "Alur Utama" }, { title: "Prosedur Kerja" }] },
      { title: "Pemasaran", subchapters: [{ title: "Strategi Pemasaran" }, { title: "Segmentasi Pasar" }] },
      { title: "Keuangan", subchapters: [{ title: "Penganggaran" }, { title: "Laporan Keuangan" }] },
    ],
    appendix: ["Template Laporan", "Formulir Internal", "KPI Dashboard"],
    glossary: ["KPI", "ROI", "B2B", "SLA"],
    references: ["Standar Akuntansi", "Regulasi Industri"],
  },
];

const DEFAULT_OUTLINE: Omit<typeof TOPIC_MAP[number], "keywords"> = {
  title: "Panduan Umum",
  subtitle: "Referensi Komprehensif",
  chapters: [
    { title: "Pendahuluan", subchapters: [{ title: "Latar Belakang" }, { title: "Tujuan" }, { title: "Sistematika Penulisan" }] },
    { title: "Tinjauan Pustaka", subchapters: [{ title: "Kajian Teori" }, { title: "Penelitian Terdahulu" }] },
    { title: "Pembahasan Utama", subchapters: [{ title: "Konsep Dasar" }, { title: "Penerapan" }, { title: "Studi Kasus" }] },
    { title: "Implementasi", subchapters: [{ title: "Langkah-Langkah" }, { title: "Rekomendasi" }] },
    { title: "Penutup", subchapters: [{ title: "Kesimpulan" }, { title: "Saran" }] },
  ],
  appendix: ["Lampiran A: Data Pendukung", "Lampiran B: Formulir"],
  glossary: ["Istilah Kunci"],
  references: ["Referensi Utama"],
};

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

export class OutlineGenerator {
  generate(input: string): BookOutline {
    const text = normalize(input);

    let matched = TOPIC_MAP.find((t) => t.keywords.some((kw) => text.includes(kw)));

    // Compose title from input if no exact match
    const inputTitle = input
      .replace(/^buat\s+/i, "")
      .replace(/^create\s+/i, "")
      .replace(/^tulis\s+/i, "")
      .replace(/^generate\s+/i, "")
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const base = matched ?? DEFAULT_OUTLINE;

    return {
      title: inputTitle || base.title,
      subtitle: base.subtitle,
      preface: `Buku ini disusun sebagai panduan lengkap mengenai "${inputTitle || base.title}". Diharapkan dapat menjadi referensi yang berguna bagi pembaca.`,
      chapters: base.chapters,
      appendix: base.appendix,
      glossary: base.glossary,
      references: base.references,
    };
  }
}
