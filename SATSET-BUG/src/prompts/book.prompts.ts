import type { PromptTemplate } from "./PromptTemplate.js";

export const BOOK_PROMPTS: PromptTemplate[] = [
  { id: "book-sop", category: "book", title: "SOP Book", template: "Buat buku SOP untuk {{organization}} dengan topik {{topic}}. Sertakan prosedur lengkap, diagram alur, dan formulir pendukung.", variables: ["organization", "topic"] },
  { id: "book-academic", category: "book", title: "Academic Paper", template: "Tulis karya ilmiah tentang {{subject}} untuk {{institution}}. Gunakan metodologi {{methodology}} dengan referensi akademik.", variables: ["subject", "institution", "methodology"] },
  { id: "book-technical", category: "book", title: "Technical Guide", template: "Buat panduan teknis {{technology}} untuk developer level {{level}}. Sertakan contoh kode, diagram arsitektur, dan troubleshooting.", variables: ["technology", "level"] },
  { id: "book-manual", category: "book", title: "User Manual", template: "Buat manual pengguna untuk {{product}}. Sertakan instalasi, konfigurasi, dan panduan penggunaan harian.", variables: ["product"] },
  { id: "book-proposal", category: "book", title: "Project Proposal", template: "Buat proposal proyek {{project_name}} untuk {{client}} dengan anggaran {{budget}} dan timeline {{timeline}}.", variables: ["project_name", "client", "budget", "timeline"] },
];
