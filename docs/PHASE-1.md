# SATSET ERP — Phase 1 Database/RBAC Fix

## Source basis
Schema canonical disusun dari migration PostgreSQL yang sudah ada:
`prisma/migrations/20260804_baseline_existing/migration.sql`
dan diselaraskan dengan kode RBAC yang sekarang memakai:
`User`, `Role`, `Permission`, `UserPermission`, `RolePermission`.

## Perubahan
- Satu schema canonical PostgreSQL.
- User ID `Int`, sesuai migration dan kode permission.
- RBAC model dan relations tersedia.
- Cookie permission disatukan ke `accessToken`.
- JWT hanya memakai `JWT_ACCESS_SECRET`; tidak ada fallback secret.
- Environment tidak lagi memakai fallback SQLite/secret.
- Seed admin memakai `ADMIN_INITIAL_PASSWORD` (minimal 12 karakter).

## Wajib sebelum mengganti schema
Backup database PostgreSQL dan simpan migration history.

JANGAN jalankan `prisma migrate reset` pada database yang berisi data.

## Environment
Tambahkan:
`DATABASE_URL=postgresql://...`
`JWT_ACCESS_SECRET=<minimal 32 karakter>`
`ADMIN_INITIAL_PASSWORD=<minimal 12 karakter>`

## Verifikasi di root project
```powershell
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm exec prisma generate --schema prisma/schema.prisma
pnpm exec prisma migrate status
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Jangan membuat migration baru sebelum `prisma migrate status` diperiksa.

## Status
Source alignment Phase 1: selesai.
Validasi terhadap database target: masih harus dilakukan di mesin project karena database connection tidak tersedia di sesi audit ini.
