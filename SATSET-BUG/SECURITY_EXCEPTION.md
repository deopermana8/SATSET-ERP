# Security Exception - CommandExecutor shell:true

Date: 2026-07-29
Scope: src/commands/CommandExecutor.ts

## Alasan
- Phase 7 mencoba hardening minimal dengan mengganti child process dari shell:true menjadi shell:false.
- Perubahan tersebut memicu regresi runtime di Windows (spawn EINVAL) pada alur compile/repair yang dipakai lintas engine.
- Karena aturan release readiness melarang perubahan perilaku publik, perubahan hardening tidak dapat dipertahankan pada fase ini.

## Risiko
- DEP0190 warning tetap muncul: argumen pada child process dengan shell:true dirangkai sebagai string command shell.
- Jika input command/args tidak dikontrol ketat, ada risiko command injection.

## Mitigasi
- Semua pemanggilan CommandExecutor saat ini berasal dari jalur internal engine, bukan input bebas end-user.
- Daftar command yang dipakai bersifat terbatas (pnpm/npm/npx/prisma/git/docker/turbo/next/node/tsc/eslint/prettier/vitest/jest).
- CWD dan env dibentuk dari konteks internal proses.
- Tambahkan review wajib untuk setiap callsite baru yang melewatkan argumen dinamis dari luar sistem.

## Rekomendasi
- Lakukan hardening lanjutan pada release berikutnya dengan salah satu pendekatan berikut:
  1. Implementasi allowlist command + argument sanitization ketat per command.
  2. Migrasi ke shell:false secara bertahap per command dengan kompatibilitas Windows yang tervalidasi.
  3. Tambahkan test keamanan khusus untuk payload metacharacter shell pada CommandExecutor.
- Target: hapus penggunaan shell:true setelah kompatibilitas lintas platform tervalidasi.
