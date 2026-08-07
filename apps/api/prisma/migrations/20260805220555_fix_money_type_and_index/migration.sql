/*
  Warnings:

  - You are about to alter the column `nominal` on the `jurnal_wisata` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - You are about to alter the column `nominal` on the `kas_wisata` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_jurnal_wisata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "nominal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_jurnal_wisata" ("createdAt", "id", "keterangan", "kode", "nama", "nominal", "status", "updatedAt") SELECT "createdAt", "id", "keterangan", "kode", "nama", "nominal", "status", "updatedAt" FROM "jurnal_wisata";
DROP TABLE "jurnal_wisata";
ALTER TABLE "new_jurnal_wisata" RENAME TO "jurnal_wisata";
CREATE UNIQUE INDEX "jurnal_wisata_kode_key" ON "jurnal_wisata"("kode");
CREATE INDEX "jurnal_wisata_status_idx" ON "jurnal_wisata"("status");
CREATE TABLE "new_kas_wisata" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "nominal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_kas_wisata" ("createdAt", "id", "keterangan", "kode", "nama", "nominal", "status", "updatedAt") SELECT "createdAt", "id", "keterangan", "kode", "nama", "nominal", "status", "updatedAt" FROM "kas_wisata";
DROP TABLE "kas_wisata";
ALTER TABLE "new_kas_wisata" RENAME TO "kas_wisata";
CREATE UNIQUE INDEX "kas_wisata_kode_key" ON "kas_wisata"("kode");
CREATE INDEX "kas_wisata_status_idx" ON "kas_wisata"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
