# Coding Standards

Aturan dasar pengembangan di SATSET ERP:

- TypeScript strict: `strict` aktif di `tsconfig.json`.
- Modul terpisah: setiap package harus memiliki `src` dan `tsconfig.json` yang spesifik.
- No runtime secrets in code: gunakan env vars dan secret manager.
- Testing: unit test pada level paket; contract tests untuk integrasi antar paket.
- Linting & Formatting: ESLint terpusat; ikuti aturan yang sudah ada di root `.eslintrc.json`.
- Commits: gunakan Conventional Commits (chore, feat, fix, docs, etc.).

Review code harus fokus pada kebersihan API publik paket, dependency direction, dan tidak ada kebocoran domain antar paket.
