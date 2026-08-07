# RELEASE NOTE

## SATSET ERP - Customer Portal Sprint 24.2 (Post Release Verification)
Date: 2026-08-07
Release Status: Verified

## 1) Fitur Baru
- Tidak ada fitur baru tambahan pada fase Post Release.
- Scope release tetap sesuai Sprint 24.2 RC: stabilisasi dan kesiapan production.

## 2) Bug yang Diperbaiki
- Customer Portal logout blocker telah ditutup pada fase RC sebelumnya:
  - Aksi logout tersedia pada header saat user sudah login.
  - Session/token dibersihkan saat logout.
  - User diarahkan kembali ke `/customer/login`.
  - Protected route kembali ter-guard setelah logout.

## 3) Security Hardening
- Tidak ada hardening baru pada fase Post Release.
- Hardening yang sudah ada dari RC tetap tervalidasi melalui build/lint/playwright PASS.

## 4) Hasil Build/Lint/Playwright
Perintah yang dijalankan:

1. `npm run build`
- Output:
  - `> build`
  - `> tsc -b`
  - `EXIT_CODE=0`

2. `npm run lint`
- Output:
  - `> lint`
  - `> tsc --noEmit -p tsconfig.json`
  - `EXIT_CODE=0`

3. `npm run playwright:smoke`
- Output ringkas:
  - `Running 5 tests using 2 workers`
  - `5 passed (48.0s)`
  - `EXIT_CODE=0`

4. `npm run playwright:regression`
- Output ringkas:
  - `Running 15 tests using 2 workers`
  - `15 passed (1.5m)`
  - `EXIT_CODE=0`

## 5) Known Issue
- Pada teardown webServer Playwright, muncul log `npm error Lifecycle script start failed` dari beberapa workspace.
- Dampak:
  - Tidak memblokir release pada verifikasi ini.
  - Seluruh suite tetap PASS dengan `EXIT_CODE=0`.

## 6) Audit Debug/Temporary/Artifact
Audit root workspace menemukan artefak lokal non-source dan telah dibersihkan:
- `test-results/`
- `.tmp-admin-script.js`
- `tmp-inline.js`
- `tmp-served.js`
- `test-content-actual.png`
- `admin*.log`, `api*.log`

## 7) Audit TODO/FIXME/HACK (Area Customer Portal)
Pencarian pada area berikut tidak menemukan marker tersisa:
- `apps/customer`
- `apps/api/src`
- `playwright/tests`
Pattern: `TODO|FIXME|HACK`

## 8) Daftar File Berubah Sejak Release Sebelumnya
- Tidak dapat diverifikasi otomatis pada environment ini karena metadata git tidak tersedia (`.git` tidak ditemukan), sehingga command git (`git status`, `git tag`, `git log`) tidak bisa dijalankan.
- Untuk daftar perubahan berbasis commit, jalankan verifikasi pada clone repository yang memiliki histori git.
