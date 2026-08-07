generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model WorkspaceRecord {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  createdAt DateTime @default(now())
}

// ERP Wisata domain models
model PaketWisata {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("paket_wisata")
}

model Hotel {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("hotel")
}

model Kendaraan {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("kendaraan")
}

model GuideWisata {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("guide_wisata")
}

model KasWisata {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  nominal    Float    @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("kas_wisata")
}

model JurnalWisata {
  id         String   @id @default(cuid())
  kode       String   @unique
  nama       String
  status     String   @default("aktif")
  keterangan String?
  nominal    Float    @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("jurnal_wisata")
}