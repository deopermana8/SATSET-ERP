-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "WorkspaceRecord" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket_wisata" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paket_wisata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kendaraan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kendaraan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_wisata" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_wisata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kas_wisata" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "nominal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kas_wisata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jurnal_wisata" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "keterangan" TEXT,
    "nominal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jurnal_wisata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkspaceRecord_status_idx" ON "WorkspaceRecord"("status");

-- CreateIndex
CREATE UNIQUE INDEX "paket_wisata_kode_key" ON "paket_wisata"("kode");

-- CreateIndex
CREATE INDEX "paket_wisata_status_idx" ON "paket_wisata"("status");

-- CreateIndex
CREATE UNIQUE INDEX "hotel_kode_key" ON "hotel"("kode");

-- CreateIndex
CREATE INDEX "hotel_status_idx" ON "hotel"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kendaraan_kode_key" ON "kendaraan"("kode");

-- CreateIndex
CREATE INDEX "kendaraan_status_idx" ON "kendaraan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "guide_wisata_kode_key" ON "guide_wisata"("kode");

-- CreateIndex
CREATE INDEX "guide_wisata_status_idx" ON "guide_wisata"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kas_wisata_kode_key" ON "kas_wisata"("kode");

-- CreateIndex
CREATE INDEX "kas_wisata_status_idx" ON "kas_wisata"("status");

-- CreateIndex
CREATE UNIQUE INDEX "jurnal_wisata_kode_key" ON "jurnal_wisata"("kode");

-- CreateIndex
CREATE INDEX "jurnal_wisata_status_idx" ON "jurnal_wisata"("status");
