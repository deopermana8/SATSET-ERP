# @satset/reservation

Paket domain `reservation` untuk SATSET ERP. Paket ini berfokus pada model domain inti, value object, repository interface, dan use case aplikasi untuk mengelola siklus hidup reservasi.

## Struktur

- `src/domain`: entitas domain dan value object
  - `entities/Reservation`
  - `entities/Guest`
  - `entities/Package`
  - `entities/Schedule`
  - `value-objects/ReservationId`
  - `value-objects/ReservationStatus`
  - `value-objects/GuestCount`
  - `repositories/ReservationRepository`
- `src/application`: use case domain (`CreateReservation`, `CancelReservation`)
- `src/infrastructure`: adapter in-memory untuk prototipe domain
- `src/shared`: abstraksi DDD umum (`Entity`, `ValueObject`, `AggregateRoot`)

## Tujuan

Paket ini menginisialisasi bounded context `reservation` tanpa membuat layer API, UI, Prisma, database eksternal, CRUD, atau React. Fokus utamanya pada Domain Driven Design dan workflow domain reservation:

- menyatakan entity dan value object yang kuat
- mengisolasi logika status reservasi
- menyediakan kontrak repository domain
- mendefinisikan workflow quotation, konfirmasi, invoice, dan pembayaran
- memodelkan event domain untuk setiap transisi kunci

## Workflow Reservation

1. `CreateQuotation` membuat penawaran dengan line item dan tanggal kedaluwarsa.
2. `ConfirmReservation` memindahkan reservasi ke status `CONFIRMED`.
3. `GenerateInvoice` menghasilkan invoice berdasarkan reservasi dan line item tagihan.
4. `ReceivePayment` menerima pembayaran untuk reservasi dan memodelkan event `PaymentReceived`.

## Domain Events

- `ReservationCreated`
- `ReservationConfirmed`
- `ReservationCancelled`
- `PaymentReceived`
- `TicketIssued`

## Penggunaan

Gunakan paket ini untuk merancang reservation engine yang didorong oleh domain event dan workflow bisnis, dengan infrastruktur adapter yang dapat dikembangkan nanti.
