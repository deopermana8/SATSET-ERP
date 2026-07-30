import type { PromptTemplate } from "./PromptTemplate.js";

export const SCHOOL_PROMPTS: PromptTemplate[] = [
  { id: "school-sisfo", category: "school", title: "School Information System", template: "Buat sistem informasi sekolah {{school_name}} dengan fitur: siswa, guru, nilai, absensi, dan laporan akademik.", variables: ["school_name"] },
  { id: "school-elearning", category: "school", title: "E-Learning Platform", template: "Buat platform e-learning untuk {{school_name}} dengan fitur: materi, tugas, ujian online, dan progres belajar siswa.", variables: ["school_name"] },
  { id: "school-ppdb", category: "school", title: "PPDB System", template: "Buat sistem PPDB (Penerimaan Peserta Didik Baru) untuk {{school_name}} dengan fitur: pendaftaran online, seleksi, dan pengumuman.", variables: ["school_name"] },
  { id: "school-library", category: "school", title: "School Library", template: "Buat sistem perpustakaan sekolah {{school_name}} dengan fitur: katalog buku, peminjaman, pengembalian, dan laporan.", variables: ["school_name"] },
];
