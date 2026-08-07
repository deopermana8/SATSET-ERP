# ErpWisata Module

Blueprint ERP Wisata untuk operasional destinasi, paket, hotel, kendaraan, guide, reservasi, ticketing, pembayaran, kas, jurnal, dan laporan.

## Entity

- Name: Destinasi
- Module Path: erp-wisata
- Generated At: 2026-08-05T15:45:30.528Z

## Fields

- **ID** (`id`) type `String`, input `text`, required `true`
- **Kode** (`kode`) type `String`, input `text`, required `true`
- **Nama** (`nama`) type `String`, input `text`, required `true`
- **Status** (`status`) type `String`, input `select`, required `true`
- **Keterangan** (`keterangan`) type `String`, input `textarea`, required `false`


## Relations

- `pemesan` -> `Pelanggan` (many-to-one)


## Permissions

- `wisata.read`: Baca data ERP Wisata.
- `wisata.write`: Kelola data ERP Wisata.
- `wisata.master`: Kelola master data wisata.
- `wisata.reservasi`: Kelola reservasi wisata.
- `wisata.keuangan`: Kelola keuangan wisata.
- `wisata.laporan`: Akses laporan wisata.
