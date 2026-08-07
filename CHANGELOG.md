# Changelog

All notable changes to this project will be documented in this file.

## [Sprint 24.2] - 2026-08-07

### Added
- Tidak ada penambahan fitur baru pada fase Post Release.

### Fixed
- Customer Portal logout blocker tervalidasi:
  - Logout action aktif setelah login.
  - Session/token dibersihkan saat logout.
  - Redirect ke `/customer/login`.
  - Protected route tetap terkunci setelah logout.

### Security
- Tidak ada perubahan security baru pada fase Post Release.
- Security hardening dari fase RC tetap lolos validasi build/lint/test.

### Validation
- `npm run build` -> PASS (`EXIT_CODE=0`)
- `npm run lint` -> PASS (`EXIT_CODE=0`)
- `npm run playwright:smoke` -> PASS (`5 passed`, `EXIT_CODE=0`)
- `npm run playwright:regression` -> PASS (`15 passed`, `EXIT_CODE=0`)

### Notes
- Log teardown Playwright masih menampilkan `Lifecycle script start failed` pada beberapa workspace, namun suite tetap PASS dan tidak menjadi blocker pada verifikasi ini.
- Audit workspace root: file temporary/debug/artifact lokal telah dibersihkan.
- Audit marker `TODO|FIXME|HACK` pada area Customer Portal tidak menemukan sisa marker.
