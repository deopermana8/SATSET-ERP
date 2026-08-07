import type { OutboundEquipment } from "./outboundTypes.js";

export const defaultOutboundEquipment: OutboundEquipment[] = [
  { id: "eq-helm", nama: "Helm Safety", stok: 60, dipakai: 0, rusak: 2, maintenance: 1 },
  { id: "eq-harness", nama: "Harness", stok: 40, dipakai: 0, rusak: 1, maintenance: 2 },
  { id: "eq-rompi", nama: "Rompi", stok: 80, dipakai: 0, rusak: 0, maintenance: 0 },
];
