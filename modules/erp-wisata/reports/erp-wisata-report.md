# ErpWisata Report

## Summary

Dokumen kontrak laporan agregasi ERP Wisata untuk operasional, keuangan, dan reservasi.

## Endpoint

- Method: `GET`
- Path: `/api/erp-wisata/report`
- Permission: `wisata.laporan`
- Authorization Header: `Authorization: Bearer <token>`

## Query Filter

- `from` (optional): format `YYYY-MM-DD`
- `to` (optional): format `YYYY-MM-DD`
- Validation:
  - jika `from` diisi, wajib format `YYYY-MM-DD`
  - jika `to` diisi, wajib format `YYYY-MM-DD`
  - jika `from` dan `to` diisi, `from` tidak boleh lebih besar dari `to`

## Response Contract (200)

```json
{
  "period": {
    "from": "2026-08-01",
    "to": "2026-08-08"
  },
  "operational": {
    "ticketSales": {
      "total": 0,
      "paid": 0,
      "checkedIn": 0,
      "void": 0,
      "grossSales": 0
    },
    "reservations": {
      "total": 0,
      "paid": 0,
      "waitingPayment": 0,
      "cancelled": 0
    },
    "activityBookings": {
      "total": 0,
      "confirmed": 0,
      "checkedIn": 0,
      "completed": 0,
      "cancelled": 0
    },
    "cafeOrders": {
      "total": 0,
      "paid": 0,
      "completed": 0,
      "void": 0,
      "totalSales": 0
    },
    "inventory": {
      "items": 0,
      "lowStock": 0,
      "inventoryValue": 0,
      "stockMovements": 0
    }
  },
  "financial": {
    "grossSales": 0,
    "paidSales": 0,
    "outstanding": 0,
    "cancelled": 0
  },
  "reservation": {
    "total": 0,
    "confirmed": 0,
    "checkedIn": 0,
    "cancelled": 0
  }
}
```

## Error Contract

- `403 Forbidden`: token tidak memiliki izin `wisata.laporan`
- `400 Bad Request`: period query tidak valid
- `405 Method Not Allowed`: method selain `GET`

## Master Data -> Reporting Integration

Ringkasan integrasi sumber data yang dipakai agregasi:

- Ticketing report: data transaksi tiket (`ticket sale`).
- Reservasi report: data booking reservasi.
- Activity booking report: data booking aktivitas outbound.
- Cafe report: data order cafe.
- Inventory report: data item inventory + stock movement.

Catatan:
- Metrik agregasi dihitung dari data operasional yang ada, tidak menambah metrik sintetis.
- Entitas master data (`/erp-wisata/*`) mempengaruhi hasil report secara tidak langsung melalui transaksi operasional.

## Permissions

- `wisata.read`: Baca data ERP Wisata.
- `wisata.write`: Kelola data ERP Wisata.
- `wisata.master`: Kelola master data wisata.
- `wisata.reservasi`: Kelola reservasi wisata.
- `wisata.keuangan`: Kelola keuangan wisata.
- `wisata.laporan`: Akses laporan wisata.
