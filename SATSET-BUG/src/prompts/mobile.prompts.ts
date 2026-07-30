import type { PromptTemplate } from "./PromptTemplate.js";

export const MOBILE_PROMPTS: PromptTemplate[] = [
  { id: "mobile-react-native", category: "mobile", title: "React Native App", template: "Buat aplikasi mobile {{app_name}} menggunakan React Native dengan fitur: {{features}}, autentikasi, dan notifikasi push.", variables: ["app_name", "features"] },
  { id: "mobile-pos", category: "mobile", title: "Mobile POS", template: "Buat aplikasi kasir mobile untuk {{store}} dengan fitur: scan barcode, transaksi offline, Bluetooth printer, dan sinkronisasi cloud.", variables: ["store"] },
  { id: "mobile-delivery", category: "mobile", title: "Delivery App", template: "Buat aplikasi pengiriman untuk {{company}} dengan fitur: tracking realtime, riwayat pengiriman, konfirmasi penerima, dan laporan kurir.", variables: ["company"] },
  { id: "mobile-attendance", category: "mobile", title: "Attendance App", template: "Buat aplikasi absensi mobile untuk {{organization}} dengan fitur: face recognition, GPS, laporan kehadiran, dan integrasi HR.", variables: ["organization"] },
];
