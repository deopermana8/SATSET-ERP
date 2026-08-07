CREATE TABLE erp-wisata_kendaraan (
  id String NOT NULL UNIQUE,
  kode String NOT NULL UNIQUE,
  nama String NOT NULL,
  status String NOT NULL DEFAULT "aktif",
  keterangan String,
  PRIMARY KEY (id)
);
