import type { PromptTemplate } from "./PromptTemplate.js";

export const ERP_PROMPTS: PromptTemplate[] = [
  { id: "erp-full", category: "erp", title: "Full ERP System", template: "Buat sistem ERP untuk perusahaan {{company_type}} dengan modul: {{modules}}. Gunakan teknologi {{stack}} dengan database {{database}}.", variables: ["company_type", "modules", "stack", "database"] },
  { id: "erp-finance", category: "erp", title: "Finance Module", template: "Buat modul keuangan ERP dengan fitur: akuntansi, hutang piutang, payroll, dan laporan keuangan untuk {{company}}.", variables: ["company"] },
  { id: "erp-inventory", category: "erp", title: "Inventory Module", template: "Buat modul inventori ERP dengan fitur: stok masuk/keluar, FIFO/LIFO, barcode, dan laporan stok untuk {{company}}.", variables: ["company"] },
  { id: "erp-hr", category: "erp", title: "HR Module", template: "Buat modul HRD ERP dengan fitur: rekrutmen, absensi, payroll, dan penilaian kinerja untuk {{company}} dengan {{employees}} karyawan.", variables: ["company", "employees"] },
  { id: "erp-procurement", category: "erp", title: "Procurement Module", template: "Buat modul pengadaan ERP dengan fitur: purchase order, vendor management, dan approval workflow untuk {{company}}.", variables: ["company"] },
];
