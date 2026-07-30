import type { PromptTemplate } from "./PromptTemplate.js";

export const WEBSITE_PROMPTS: PromptTemplate[] = [
  { id: "website-company", category: "website", title: "Company Website", template: "Buat website perusahaan {{company}} dengan halaman: beranda, tentang kami, layanan, portofolio, dan kontak. Teknologi: {{stack}}.", variables: ["company", "stack"] },
  { id: "website-landing", category: "website", title: "Landing Page", template: "Buat landing page untuk produk {{product}} dengan hero section, fitur, testimonial, harga, dan CTA.", variables: ["product"] },
  { id: "website-blog", category: "website", title: "Blog / CMS", template: "Buat website blog/CMS untuk {{brand}} dengan fitur: artikel, kategori, komentar, SEO, dan panel admin.", variables: ["brand"] },
  { id: "website-portfolio", category: "website", title: "Portfolio", template: "Buat website portofolio untuk {{name}} dengan galeri proyek, keahlian, timeline karir, dan formulir kontak.", variables: ["name"] },
];
