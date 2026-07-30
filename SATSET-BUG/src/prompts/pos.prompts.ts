import type { PromptTemplate } from "./PromptTemplate.js";

export const POS_PROMPTS: PromptTemplate[] = [
  { id: "pos-retail", category: "pos", title: "Retail POS", template: "Buat sistem kasir untuk toko {{store_name}} dengan fitur: transaksi, stok, laporan penjualan, dan manajemen member.", variables: ["store_name"] },
  { id: "pos-restaurant", category: "pos", title: "Restaurant POS", template: "Buat sistem kasir restoran {{restaurant_name}} dengan fitur: order meja, dapur, split bill, dan laporan harian.", variables: ["restaurant_name"] },
  { id: "pos-wisata", category: "pos", title: "Tourism POS", template: "Buat sistem kasir wisata {{location}} dengan fitur: tiket masuk, retribusi, laporan per wahana, dan integrasi printer thermal.", variables: ["location"] },
  { id: "pos-marketplace", category: "pos", title: "Marketplace POS", template: "Buat sistem kasir marketplace {{market_name}} dengan fitur: multi-tenant, laporan per tenant, dan dashboard admin.", variables: ["market_name"] },
];
