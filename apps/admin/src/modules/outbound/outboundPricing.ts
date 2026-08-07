import type { OutboundPackage } from "./outboundTypes.js";

export function calculateOutboundPrice(paket: OutboundPackage, peserta: number, voucherNilai = 0) {
  const qty = Math.max(0, Number(peserta || 0));
  const subtotal = qty * Number(paket.harga || 0);
  const diskon = Math.max(0, Number(voucherNilai || 0));
  const total = Math.max(0, subtotal - diskon);
  return { subtotal, diskon, total };
}
