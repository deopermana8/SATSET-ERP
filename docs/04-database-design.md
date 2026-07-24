# Desain Database SATSET ERP

Pendekatan database untuk blueprint ini bersifat konseptual, tanpa implementasi konkrit.

Prinsip desain:

- Satu sumber data utama untuk transaksi dan reservasi.
- Partisi domain sesuai bounded context untuk mengurangi keterkaitan.
- Skema dirancang dengan keys bisnis jelas: ticket_id, reservation_id, user_id, stock_id.
- Integritas data dikontrol melalui relasi eksplisit dan constraint bisnis.

Komponen utama:

- Tabel tiket dan transaksi pembayaran
- Tabel reservasi dan jadwal kunjungan
- Tabel stock inventory dan penjualan on-site
- Tabel akses gate dan event scanner
- Tabel pengguna dan peran akses

Catatan:
- Struktur data dirancang untuk melayani laporan operasional dan audit.
- Normalisasi disesuaikan dengan kebutuhan performa pembacaan dan penulisan.
