export type DetectedLanguage = "id" | "en" | "mixed";

export interface ParsedRequirement {
  projectType: string;
  modules: string[];
  database: string[];
  ui: string[];
  api: string[];
  language: DetectedLanguage;
}

const ID_MARKERS = ["buat", "buatkan", "aplikasi", "sistem", "dengan", "dan", "untuk", "pada", "menggunakan", "laporan", "pengguna", "data", "modul", "fitur", "serta", "beserta"];
const EN_MARKERS = ["create", "build", "make", "generate", "system", "application", "with", "and", "for", "using", "report", "user", "module", "feature"];

function detectLanguage(text: string): DetectedLanguage {
  const lower = text.toLowerCase();
  const idCount = ID_MARKERS.filter((w) => lower.includes(w)).length;
  const enCount = EN_MARKERS.filter((w) => lower.includes(w)).length;
  if (idCount > 0 && enCount > 0) return "mixed";
  if (idCount > enCount) return "id";
  if (enCount > idCount) return "en";
  return "mixed";
}

// Normalization map: Indonesian terms → canonical internal form
// (generation output is unchanged because the keyword maps already handle both)
const ID_TO_EN_NORMALIZE: Array<[RegExp, string]> = [
  [/\bbuat(kan)?\b/gi, "create"],
  [/\baplikasi\b/gi, "application"],
  [/\bsistem\b/gi, "system"],
  [/\bdengan\b/gi, "with"],
  [/\buntuk\b/gi, "for"],
  [/\blaporan\b/gi, "report"],
  [/\bpengguna\b/gi, "user"],
  [/\bpelanggan\b/gi, "customer"],
  [/\bproduk\b/gi, "product"],
  [/\bbarang\b/gi, "product"],
  [/\bkategori\b/gi, "category"],
  [/\bpesanan\b/gi, "order"],
  [/\bpembayaran\b/gi, "payment"],
  [/\bkaryawan\b/gi, "employee"],
  [/\bpegawai\b/gi, "employee"],
  [/\bkehadiran\b/gi, "attendance"],
  [/\bpenggajian\b/gi, "payroll"],
  [/\brekrutmen\b/gi, "recruitment"],
  [/\btiket\b/gi, "ticket"],
  [/\bpengunjung\b/gi, "visitor"],
  [/\bpenduduk\b/gi, "citizen"],
  [/\bkeuangan\b/gi, "finance"],
  [/\banggaran\b/gi, "budget"],
];

function normalizeInput(text: string): string {
  let result = text;
  for (const [pattern, replacement] of ID_TO_EN_NORMALIZE) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

const PROJECT_TYPE_MAP: Array<{ keywords: string[]; type: string }> = [
  { keywords: ["kasir", "pos", "point of sale"], type: "pos" },
  { keywords: ["erp", "enterprise resource", "sistem terpadu"], type: "erp" },
  { keywords: ["hris", "hr system", "human resource", "sdm", "kepegawaian"], type: "hris" },
  { keywords: ["lms", "learning management", "e-learning", "elearning", "kursus", "pelatihan online"], type: "lms" },
  { keywords: ["desa", "village", "kelurahan", "pemerintahan desa"], type: "village" },
  { keywords: ["wisata", "tourism", "pariwisata", "tiket masuk", "objek wisata"], type: "tourism" },
  { keywords: ["toko", "shop", "store", "ecommerce", "e-commerce"], type: "ecommerce" },
  { keywords: ["buku", "book", "sop book", "dokumen", "panduan"], type: "book" },
  { keywords: ["website", "web company", "profil perusahaan"], type: "website" },
  { keywords: ["landing page", "landing", "halaman promosi"], type: "landing" },
  { keywords: ["blog", "artikel", "cms", "content"], type: "cms" },
  { keywords: ["dashboard", "admin", "panel"], type: "admin" },
  { keywords: ["api", "backend", "service", "microservice"], type: "api" },
  { keywords: ["mobile", "android", "ios", "react native"], type: "mobile" },
];

const MODULE_MAP: Array<{ keywords: string[]; module: string }> = [
  { keywords: ["login", "auth", "autentikasi", "register", "signup"], module: "auth" },
  { keywords: ["user", "pengguna", "akun", "account"], module: "user" },
  { keywords: ["produk", "product", "barang", "item"], module: "product" },
  { keywords: ["order", "pesanan", "transaksi", "transaction"], module: "order" },
  { keywords: ["payment", "pembayaran", "bayar"], module: "payment" },
  { keywords: ["report", "laporan", "rekap"], module: "report" },
  { keywords: ["notifikasi", "notification", "email"], module: "notification" },
  { keywords: ["cart", "keranjang"], module: "cart" },
  { keywords: ["inventory", "inventori", "stok", "stock", "gudang"], module: "inventory" },
  { keywords: ["supplier", "suplier", "vendor", "pemasok"], module: "supplier" },
  { keywords: ["kategori", "category"], module: "category" },
  { keywords: ["karyawan", "pegawai", "employee", "staff"], module: "employee" },
  { keywords: ["absensi", "attendance", "presensi"], module: "attendance" },
  { keywords: ["payroll", "gaji", "salary", "penggajian"], module: "payroll" },
  { keywords: ["rekrutmen", "recruitment", "lamaran", "hiring"], module: "recruitment" },
  { keywords: ["kursus", "course", "materi", "modul belajar"], module: "course" },
  { keywords: ["ujian", "quiz", "tes", "exam", "assessment"], module: "exam" },
  { keywords: ["sertifikat", "certificate", "ijazah"], module: "certificate" },
  { keywords: ["tiket", "ticket", "karcis", "retribusi"], module: "ticket" },
  { keywords: ["wisatawan", "visitor", "pengunjung"], module: "visitor" },
  { keywords: ["wahana", "attraction", "fasilitas wisata"], module: "attraction" },
  { keywords: ["penduduk", "citizen", "kependudukan", "warga"], module: "citizen" },
  { keywords: ["keluarga", "family", "kk", "kartu keluarga"], module: "family" },
  { keywords: ["surat", "letter", "dokumen resmi"], module: "letter" },
  { keywords: ["bantuan", "aid", "sosial", "social"], module: "aid" },
  { keywords: ["umkm", "usaha mikro", "small business"], module: "umkm" },
  { keywords: ["bumdes", "bum desa", "badan usaha desa"], module: "bumdes" },
  { keywords: ["keuangan", "keuangan desa", "finance desa"], module: "finance" },
  { keywords: ["aset", "asset", "inventarisasi"], module: "asset" },
  { keywords: ["agenda", "schedule", "jadwal", "kegiatan"], module: "agenda" },
  { keywords: ["pengumuman", "announcement", "berita", "news"], module: "announcement" },
  { keywords: ["booking", "reservasi", "book", "reserve"], module: "booking" },
  { keywords: ["outbound", "tour", "paket wisata", "travel package"], module: "outbound" },
  { keywords: ["event", "acara", "festival"], module: "event" },
  { keywords: ["warehouse", "gudang", "storage", "stok gudang"], module: "warehouse" },
  { keywords: ["invoice", "faktur", "tagihan"], module: "invoice" },
  { keywords: ["accounting", "akuntansi", "jurnal", "ledger"], module: "accounting" },
  { keywords: ["journal", "jurnal akuntansi", "journal entry"], module: "journal" },
  { keywords: ["asset", "aset tetap", "fixed asset"], module: "asset" },
  { keywords: ["setting", "settings", "pengaturan", "konfigurasi"], module: "settings" },
  { keywords: ["role", "peran", "jabatan role"], module: "role" },
  { keywords: ["permission", "izin akses", "hak akses"], module: "permission" },
  { keywords: ["purchase", "pembelian", "beli"], module: "purchase" },
  { keywords: ["sales", "penjualan", "jual"], module: "sales" },
  { keywords: ["apbdes", "dana desa", "anggaran desa"], module: "budget" },
];

const DATABASE_MAP: Array<{ keywords: string[]; db: string }> = [
  { keywords: ["postgres", "postgresql", "pg"], db: "postgresql" },
  { keywords: ["mysql", "mariadb"], db: "mysql" },
  { keywords: ["mongo", "mongodb", "nosql"], db: "mongodb" },
  { keywords: ["sqlite"], db: "sqlite" },
  { keywords: ["prisma"], db: "prisma" },
];

const UI_MAP: Array<{ keywords: string[]; ui: string }> = [
  { keywords: ["react", "reactjs"], ui: "react" },
  { keywords: ["next", "nextjs", "next.js"], ui: "next" },
  { keywords: ["vue", "vuejs"], ui: "vue" },
  { keywords: ["tailwind"], ui: "tailwind" },
  { keywords: ["shadcn", "shadcn/ui"], ui: "shadcn" },
  { keywords: ["mobile", "react native"], ui: "react-native" },
];

const API_MAP: Array<{ keywords: string[]; api: string }> = [
  { keywords: ["rest", "restful", "rest api"], api: "rest" },
  { keywords: ["graphql", "graph ql"], api: "graphql" },
  { keywords: ["trpc"], api: "trpc" },
  { keywords: ["websocket", "ws", "realtime", "socket"], api: "websocket" },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function matchKeywords(text: string, map: Array<{ keywords: string[] }>): number[] {
  return map.reduce<number[]>((acc, entry, idx) => {
    if (entry.keywords.some((kw) => text.includes(kw))) acc.push(idx);
    return acc;
  }, []);
}

export function parseRequirement(input: string): ParsedRequirement {
  const language = detectLanguage(input);
  // Normalize for broader keyword matching — does not change generation output
  const normalized = normalizeInput(input);
  const text = normalize(normalized);

  const typeIdx = matchKeywords(text, PROJECT_TYPE_MAP);
  const projectType = typeIdx.length > 0 ? PROJECT_TYPE_MAP[typeIdx[0]!]!.type : "web";

  const moduleIdxs = matchKeywords(text, MODULE_MAP);
  const modules = moduleIdxs.map((i) => MODULE_MAP[i]!.module);

  const dbIdxs = matchKeywords(text, DATABASE_MAP);
  const database = dbIdxs.length > 0
    ? dbIdxs.map((i) => DATABASE_MAP[i]!.db)
    : ["postgresql"];

  const uiIdxs = matchKeywords(text, UI_MAP);
  const ui = uiIdxs.length > 0 ? uiIdxs.map((i) => UI_MAP[i]!.ui) : ["next"];

  const apiIdxs = matchKeywords(text, API_MAP);
  const api = apiIdxs.length > 0 ? apiIdxs.map((i) => API_MAP[i]!.api) : ["rest"];

  return { projectType, modules, database, ui, api, language };
}

const CAPABILITY_MAP: Record<string, import("../generator/IGenerator.js").GeneratorCapability> = {
  pos: "app", erp: "app", hris: "app", lms: "app", village: "app", tourism: "app",
  ecommerce: "app", admin: "app", web: "app",
  book: "ebook",
  website: "website",
  landing: "landing",
  api: "api",
  mobile: "mobile",
  cms: "documentation",
  documentation: "documentation",
};

export function detectCapability(input: string): import("../generator/IGenerator.js").GeneratorCapability {
  const parsed = parseRequirement(input);
  return CAPABILITY_MAP[parsed.projectType] ?? "app";
}
