# Decision Log SATSET ERP

Dokumentasikan keputusan arsitektur dan bisnis penting di sini.

Contoh keputusan:

- Memilih arsitektur monorepo untuk mempermudah manajemen paket.
- Memisahkan domain `ticketing`, `reservation`, dan `gate` untuk kejelasan batas bisnis.
- Menetapkan `finance` dan `accounting` sebagai modul pendukung pencatatan transaksi inti.
- Menyimpan model shared di `packages/shared` untuk konsistensi antar modul.

Setiap entri harus mencakup:
- Tanggal
- Masalah yang dihadapi
- Keputusan yang diambil
- Alasan dan alternatif yang ditolak
