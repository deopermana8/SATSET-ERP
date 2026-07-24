# Panduan Pengembangan SATSET ERP

Panduan ini memberi arahan umum pengembangan tanpa membuat kode.

Aturan dasar:

- Ikuti arsitektur modular: tambahkan fitur ke paket yang sesuai.
- Gunakan `packages/shared` untuk model dan utilitas umum.
- Simpan logika domain di paket domain, bukan di aplikasi UI.
- Pastikan setiap paket memiliki testability dan tipe yang jelas.

Proses implementasi:

1. Definisikan kontrak bisnis bersama stakeholder.
2. Rancang model domain dalam `packages/*`.
3. Tambahkan interface publik dan dokumentasi internal.
4. Integrasikan ke aplikasi yang butuh fitur tersebut.

Poin penting:
- Dokumentasikan setiap keputusan arsitektur di `docs/12-decision-log.md`.
- Tulis glossary bisnis di `docs/13-glossary.md`.
- Gunakan `roadmap` untuk sinkronisasi prioritas fitur.
