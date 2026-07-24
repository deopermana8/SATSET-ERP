# Domain Overview

Bounded contexts utama:
- Ticketing: penerbitan tiket, validasi, lifecycle ticket.
- Reservation: reservasi slot/kapasitas, hold dan release flows.
- Gate: validasi akses di titik masuk (scanner integration).
- Inventory: manajemen stok souvenir, cafe, dan material terkait.
- Finance & Accounting: pencatatan transaksi, settlement, dan reporting.
- CRM: data pelanggan, sesi interaksi, loyalty dan promocode.

Setiap konteks memiliki kontrak domain (DTOs, events) yang harus terdokumentasi di `packages/*` dan diuji dengan integration contracts.
