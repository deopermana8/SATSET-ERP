# Sprint 28 Regression Checklist

## Checklist
- [ ] Dashboard opens and shows enterprise widgets.
- [ ] Ticketing opens and shows workspace, quick actions, chart, and table.
- [ ] Booking opens and shows workspace, quick actions, chart, and table.
- [ ] Cafe POS opens and shows workspace, quick actions, chart, and table.
- [ ] Outbound opens and shows workspace, quick actions, chart, and table.
- [ ] Finance opens and shows workspace, quick actions, chart, and table.
- [ ] Accounting opens and shows workspace, quick actions, chart, and table.
- [ ] Laporan group items open correctly.
- [ ] Master Data group items open correctly.
- [ ] pageErrors, consoleErrors, networkErrors, and failedResponses are empty.
- [ ] visible skeleton count is zero on the active page.
- [ ] no modal remains visible.

## Cara Menjalankan Playwright
- Jalankan semua regression: `npm run playwright:regression`
- Jalankan smoke suite: `npm run playwright:smoke`
- Jalankan full automation chain: `npm run smoke`

## Cara Update Baseline Screenshot
- Re-run regression setelah UI berubah secara sengaja.
- Perbarui file baseline di `playwright/baseline/sprint-27/` dengan screenshot terbaru yang sudah divalidasi.
- Pastikan hasil perubahan memang diharapkan sebelum mengganti baseline.

## Cara Membaca Hasil Regression
- Test lulus jika semua assertion state lolos dan screenshot baseline cocok.
- Test gagal jika ada page error, console error, request failed, failed response, atau screenshot berbeda.
- Jika screenshot berbeda, bandingkan DOM state aktif dan file baseline yang dipakai pada test terkait.

## Struktur Baseline
- `playwright/baseline/sprint-27/dashboard.png`
- `playwright/baseline/sprint-27/ticketing.png`
- `playwright/baseline/sprint-27/booking.png`
- `playwright/baseline/sprint-27/cafe-pos.png`
- `playwright/baseline/sprint-27/outbound.png`
- `playwright/baseline/sprint-27/finance.png`
- `playwright/baseline/sprint-27/accounting.png`
- `playwright/baseline/sprint-27/laporan.png`
- `playwright/baseline/sprint-27/master-data.png`
