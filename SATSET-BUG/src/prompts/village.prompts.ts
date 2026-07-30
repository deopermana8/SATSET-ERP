import type { PromptTemplate } from "./PromptTemplate.js";

export const VILLAGE_PROMPTS: PromptTemplate[] = [
  { id: "village-admin", category: "village", title: "Village Administration", template: "Buat sistem administrasi desa {{village_name}} dengan fitur: kependudukan, surat menyurat, APBDes, dan laporan.", variables: ["village_name"] },
  { id: "village-sop", category: "village", title: "Village SOP", template: "Buat SOP pemerintahan desa {{village_name}} meliputi pelayanan masyarakat, administrasi, dan pengelolaan keuangan.", variables: ["village_name"] },
  { id: "village-fund", category: "village", title: "Village Fund Management", template: "Buat sistem pengelolaan dana desa {{village_name}} dengan fitur: perencanaan, realisasi, pelaporan, dan monitoring.", variables: ["village_name"] },
  { id: "village-portal", category: "village", title: "Village Portal", template: "Buat portal desa {{village_name}} dengan fitur: profil desa, berita, pengumuman, layanan online, dan galeri.", variables: ["village_name"] },
];
