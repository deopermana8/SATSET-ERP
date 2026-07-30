import type { PromptTemplate } from "./PromptTemplate.js";

export const STORE_PROMPTS: PromptTemplate[] = [
  { id: "store-ecommerce", category: "store", title: "E-Commerce Store", template: "Buat toko online {{store_name}} dengan fitur: produk, kategori, keranjang, checkout, payment gateway {{payment}}, dan dashboard admin.", variables: ["store_name", "payment"] },
  { id: "store-fashion", category: "store", title: "Fashion Store", template: "Buat toko fashion {{brand}} dengan fitur: katalog produk dengan variasi ukuran/warna, wishlist, ulasan, dan pengiriman.", variables: ["brand"] },
  { id: "store-digital", category: "store", title: "Digital Product Store", template: "Buat toko produk digital {{store}} dengan fitur: download setelah bayar, lisensi, dan manajemen file.", variables: ["store"] },
  { id: "store-subscription", category: "store", title: "Subscription Store", template: "Buat toko berlangganan {{service}} dengan fitur: paket berlangganan, auto-renewal, invoicing, dan portal pelanggan.", variables: ["service"] },
];
