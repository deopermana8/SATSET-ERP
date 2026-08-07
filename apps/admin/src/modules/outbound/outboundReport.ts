import type { OutboundRecord, OutboundReportKey } from "./outboundTypes.js";

export function buildOutboundReport(rows: OutboundRecord[], mode: OutboundReportKey) {
  if (mode === "peserta") {
    return rows.flatMap((row) => row.peserta.map((peserta) => ({ nama: peserta.nama, bookingNo: peserta.bookingNo, statusHadir: peserta.statusHadir, paket: row.paket.namaPaket })));
  }
  if (mode === "instruktur") {
    return rows.flatMap((row) => row.instruktur.map((ins) => ({ nama: ins.nama, sertifikasi: ins.sertifikasi, shift: ins.shift, paket: row.paket.namaPaket })));
  }
  if (mode === "peralatan") {
    return rows.flatMap((row) => row.peralatan.map((alat) => ({ nama: alat.nama, dipakai: alat.dipakai, rusak: alat.rusak, maintenance: alat.maintenance })));
  }
  if (mode === "voucher") {
    return rows.filter((row) => row.voucher).map((row) => ({ kode: row.voucher?.kode || "", nilai: row.voucher?.nilai || 0, dipakai: row.voucher?.dipakai || false }));
  }
  if (mode === "pembayaran") {
    return rows.map((row) => ({ referensi: row.id, metode: row.pembayaran.metode, nominal: row.pembayaran.nominal }));
  }
  if (mode === "kehadiran") {
    return rows.flatMap((row) => row.peserta.map((peserta) => ({ nama: peserta.nama, hadir: peserta.statusHadir, sesi: row.sesi.namaSesi })));
  }
  if (mode === "jadwal") {
    return rows.map((row) => ({ paket: row.paket.namaPaket, tanggal: row.jadwal.tanggal, slot: row.jadwal.slot, status: row.jadwal.status }));
  }
  return rows.map((row) => ({ paket: row.paket.namaPaket, pendapatan: row.pendapatan, sesi: row.sesi.namaSesi }));
}

export function buildOutboundCsvReport(rows: OutboundRecord[]): string {
  const columns = ["id", "paket", "tanggal", "status", "pendapatan"];
  const head = columns.join(",");
  const body = rows.map((row) => [row.id, row.paket.namaPaket, row.jadwal.tanggal, row.status, row.pendapatan].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
  return `${head}\n${body}`;
}
