# ErpWisata Database Design

## Entity

Destinasi

## Fields

- id: String required=true unique=true
- kode: String required=true unique=true
- nama: String required=true unique=false
- status: String required=true unique=false
- keterangan: String required=false unique=false


## Relations

- pemesan -> Pelanggan (many-to-one)


## Validation

- id: required => ID must be valid
- kode: required => Kode must be valid
- nama: required => Nama must be valid
- status: required => Status must be valid
- keterangan: optional => Keterangan must be valid


## Seed

- DestinasiSeed
