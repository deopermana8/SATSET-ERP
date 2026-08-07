# ErpWisata Report

## Summary

Blueprint ERP Wisata untuk operasional destinasi, paket, hotel, kendaraan, guide, reservasi, ticketing, pembayaran, kas, jurnal, dan laporan.

## Metrics

### Laporan Operasional Wisata

{{#each this.metrics}}- {
  "name": "wisata-operasional",
  "title": "Laporan Operasional Wisata",
  "metrics": [
    "status",
    "nama"
  ]
}
### Laporan Keuangan Wisata

{{#each this.metrics}}- {
  "name": "wisata-keuangan",
  "title": "Laporan Keuangan Wisata",
  "metrics": [
    "nominal",
    "status"
  ]
}
### Laporan Reservasi Wisata

{{#each this.metrics}}- {
  "name": "wisata-reservasi",
  "title": "Laporan Reservasi Wisata",
  "metrics": [
    "tanggal",
    "status"
  ]
}

{{/each}}

## Permissions

- `wisata.read`: Baca data ERP Wisata.
- `wisata.write`: Kelola data ERP Wisata.
- `wisata.master`: Kelola master data wisata.
- `wisata.reservasi`: Kelola reservasi wisata.
- `wisata.keuangan`: Kelola keuangan wisata.
- `wisata.laporan`: Akses laporan wisata.
