import type { OutboundInstructor } from "./outboundTypes.js";

export const defaultOutboundInstructors: OutboundInstructor[] = [
  { id: "ins-adi", nama: "Adi Pratama", sertifikasi: "Trainer Outbound Level 1", shift: "Pagi", status: "Aktif" },
  { id: "ins-sinta", nama: "Sinta Lestari", sertifikasi: "Trainer Outbound Level 2", shift: "Siang", status: "Aktif" },
  { id: "ins-bayu", nama: "Bayu Nugroho", sertifikasi: "Safety & Rescue", shift: "Pagi", status: "Siaga" },
];
