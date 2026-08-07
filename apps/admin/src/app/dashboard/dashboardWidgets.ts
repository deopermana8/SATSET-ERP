import { renderActionPanel } from "../../components/dashboard/ActionPanel.js";
import { renderChartCard } from "../../components/dashboard/ChartCard.js";
import { renderDashboardHeader } from "../../components/dashboard/Header.js";
import { renderHealthCard } from "../../components/dashboard/HealthCard.js";
import { renderInsightCard } from "../../components/dashboard/InsightCard.js";
import { renderDashboardSidebar } from "../../components/dashboard/Sidebar.js";
import { renderStatCard } from "../../components/dashboard/StatCard.js";
import { renderTimelineCard } from "../../components/dashboard/TimelineCard.js";
import { renderDashboardToolbar } from "../../components/dashboard/Toolbar.js";
import { renderWidgetCard } from "../../components/dashboard/WidgetCard.js";
import { getDashboardIcon, type DashboardIconName } from "./iconRegistry.js";
import type { DashboardWidget } from "./dashboardTypes.js";

export const dashboardWidgetDefinitions: DashboardWidget[] = [
  { id: "enterprise-showcase", title: "Ringkasan Enterprise", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "xl", priority: 5, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 12, tablet: 6, mobile: 1 } },
  { id: "enterprise-showcase-chart", title: "Grafik Enterprise", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "xl", priority: 8, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 12, tablet: 6, mobile: 1 } },
  { id: "ringkasan-harian", title: "Ringkasan Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 10, refreshInterval: 15000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "kpi-premium", title: "KPI Premium", icon: "dashboard", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "xl", priority: 20, refreshInterval: 12000, component: "StatCard", visible: true, pinned: true, layout: { desktop: 12, tablet: 6, mobile: 1 } },
  { id: "insight-bisnis", title: "Insight Bisnis", icon: "insight", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 30, refreshInterval: 16000, component: "InsightCard", visible: true, favorite: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "aksi-cepat", title: "Aksi Cepat", icon: "action", permission: "dashboard.write", roles: ["super-admin", "admin"], size: "lg", priority: 40, refreshInterval: 20000, component: "ActionPanel", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "pendapatan", title: "Pendapatan", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 50, refreshInterval: 17000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "reservasi", title: "Booking", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 60, refreshInterval: 17000, component: "ChartCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "ringkasan-entitas", title: "Pengunjung", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 70, refreshInterval: 20000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "arus-kas", title: "Arus Kas", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 80, refreshInterval: 17000, component: "ChartCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "tingkat-hunian", title: "Tingkat Hunian", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 90, refreshInterval: 17000, component: "ChartCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "aktivitas-terbaru", title: "Aktivitas Terbaru", icon: "timeline", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 100, refreshInterval: 12000, component: "TimelineCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "kesehatan-sistem", title: "Kesehatan Sistem", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 110, refreshInterval: 10000, component: "HealthCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "tiket-ringkas", title: "Dashboard Tiket", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 115, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "tiket-grafik", title: "Grafik Tiket", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 118, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "operasional-hari-ini", title: "Operasional Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "lg", priority: 119, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "operasional-grafik", title: "Grafik Operasional", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 120, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "antrian-checkin", title: "Antrian Check In", icon: "timeline", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 121, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "gate-monitoring", title: "Gate Monitoring", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 122, refreshInterval: 10000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-pendapatan", title: "Pendapatan Cafe Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 123, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-total-order", title: "Total Order Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 124, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-menu-terlaris", title: "Menu Terlaris", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 125, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-produk-terlaris", title: "Produk Terlaris", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 126, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-jam-ramai", title: "Jam Ramai", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 127, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-order-diproses", title: "Order Diproses", icon: "timeline", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 128, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-order-selesai", title: "Order Selesai", icon: "timeline", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 129, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-rata-transaksi", title: "Nilai Rata-rata Transaksi", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 130, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "cafe-kas-aktif", title: "Kas Aktif", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 131, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-peserta", title: "Peserta Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 132, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-sesi", title: "Sesi Hari Ini", icon: "timeline", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 133, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-pendapatan", title: "Pendapatan Outbound", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 134, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-kuota-terpakai", title: "Kuota Terpakai", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 135, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-kuota-tersisa", title: "Kuota Tersisa", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 136, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-instruktur", title: "Instruktur Bertugas", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 137, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-peralatan", title: "Peralatan Dipakai", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 138, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-kehadiran", title: "Tingkat Kehadiran", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 139, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "outbound-grafik-peserta", title: "Grafik Peserta", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 140, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "outbound-grafik-pendapatan", title: "Grafik Pendapatan Outbound", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 141, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "finance-saldo-kas", title: "Saldo Kas", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 142, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-saldo-bank", title: "Saldo Bank", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 143, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-pendapatan-hari-ini", title: "Pendapatan Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 144, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-pengeluaran-hari-ini", title: "Pengeluaran Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 145, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-laba-hari-ini", title: "Laba Operasional Hari Ini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 146, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-cash-flow", title: "Cash Flow", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 147, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "finance-per-modul", title: "Pendapatan Per Modul", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 148, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "finance-grafik-kas", title: "Grafik Kas", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 149, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "finance-grafik-pendapatan", title: "Grafik Pendapatan", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 150, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "finance-grafik-pengeluaran", title: "Grafik Pengeluaran", icon: "chart", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "lg", priority: 151, refreshInterval: 12000, component: "ChartCard", visible: true, layout: { desktop: 6, tablet: 6, mobile: 1 } },
  { id: "accounting-jumlah-jurnal", title: "Jumlah Jurnal", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 152, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-saldo-kas", title: "Saldo Kas", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 153, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-saldo-bank", title: "Saldo Bank", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 154, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-pendapatan", title: "Pendapatan", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 155, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-beban", title: "Beban", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 156, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-laba-bersih", title: "Laba Bersih", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 157, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-neraca", title: "Neraca", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 158, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-cash-flow", title: "Cash Flow", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 159, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-trial-balance", title: "Trial Balance", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 160, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "accounting-closing-status", title: "Closing Status", icon: "health", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "md", priority: 161, refreshInterval: 12000, component: "WidgetCard", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
  { id: "data-terkini", title: "Data Terkini", icon: "summary", permission: "dashboard.read", roles: ["super-admin", "admin"], size: "xl", priority: 120, refreshInterval: 22000, component: "WidgetCard", visible: true, layout: { desktop: 12, tablet: 6, mobile: 1 } },
  { id: "command-center", title: "Command Center", icon: "command", permission: "dashboard.read", roles: ["super-admin", "admin", "staff"], size: "md", priority: 130, refreshInterval: 10000, component: "Sidebar", visible: true, layout: { desktop: 4, tablet: 6, mobile: 1 } },
];

function widgetSizeClass(size: DashboardWidget["size"]): string {
  if (size === "xs") return "wg-xs";
  if (size === "sm") return "wg-sm";
  if (size === "md") return "wg-md";
  if (size === "lg") return "wg-lg";
  return "wg-xl";
}

function resolveWidgetBody(widget: DashboardWidget): string {
  if (widget.id === "enterprise-showcase") return "<div class=\"intel-summary\" id=\"enterprise-summary\"></div>";
  if (widget.id === "enterprise-showcase-chart") return renderChartCard("bar-enterprise-showcase");
  if (widget.component === "StatCard") return renderStatCard();
  if (widget.component === "InsightCard") return renderInsightCard();
  if (widget.component === "TimelineCard") return renderTimelineCard();
  if (widget.component === "HealthCard") return renderHealthCard();
  if (widget.component === "ActionPanel") return renderActionPanel();
  if (widget.component === "Sidebar") return renderDashboardSidebar();
  if (widget.id === "tiket-ringkas") return "<div class=\"intel-summary\" id=\"ticket-summary\"></div>";
  if (widget.id === "tiket-grafik") return renderChartCard("bar-ticket");
  if (widget.id === "operasional-hari-ini") return "<div class=\"intel-summary\" id=\"operasional-summary\"></div>";
  if (widget.id === "operasional-grafik") return renderChartCard("bar-operasional");
  if (widget.id === "antrian-checkin") return "<div class=\"intel-summary\" id=\"checkin-queue-summary\"></div>";
  if (widget.id === "gate-monitoring") return "<div class=\"intel-summary\" id=\"gate-monitoring-summary\"></div>";
  if (widget.id === "cafe-pendapatan") return "<div class=\"intel-summary\" id=\"cafe-pendapatan-summary\"></div>";
  if (widget.id === "cafe-total-order") return "<div class=\"intel-summary\" id=\"cafe-total-order-summary\"></div>";
  if (widget.id === "cafe-menu-terlaris") return "<div class=\"intel-summary\" id=\"cafe-menu-terlaris-summary\"></div>";
  if (widget.id === "cafe-produk-terlaris") return "<div class=\"intel-summary\" id=\"cafe-produk-terlaris-summary\"></div>";
  if (widget.id === "cafe-jam-ramai") return "<div class=\"intel-summary\" id=\"cafe-jam-ramai-summary\"></div>";
  if (widget.id === "cafe-order-diproses") return "<div class=\"intel-summary\" id=\"cafe-order-diproses-summary\"></div>";
  if (widget.id === "cafe-order-selesai") return "<div class=\"intel-summary\" id=\"cafe-order-selesai-summary\"></div>";
  if (widget.id === "cafe-rata-transaksi") return "<div class=\"intel-summary\" id=\"cafe-rata-transaksi-summary\"></div>";
  if (widget.id === "cafe-kas-aktif") return "<div class=\"intel-summary\" id=\"cafe-kas-aktif-summary\"></div>";
  if (widget.id === "outbound-peserta") return "<div class=\"intel-summary\" id=\"outbound-peserta-summary\"></div>";
  if (widget.id === "outbound-sesi") return "<div class=\"intel-summary\" id=\"outbound-sesi-summary\"></div>";
  if (widget.id === "outbound-pendapatan") return "<div class=\"intel-summary\" id=\"outbound-pendapatan-summary\"></div>";
  if (widget.id === "outbound-kuota-terpakai") return "<div class=\"intel-summary\" id=\"outbound-kuota-terpakai-summary\"></div>";
  if (widget.id === "outbound-kuota-tersisa") return "<div class=\"intel-summary\" id=\"outbound-kuota-tersisa-summary\"></div>";
  if (widget.id === "outbound-instruktur") return "<div class=\"intel-summary\" id=\"outbound-instruktur-summary\"></div>";
  if (widget.id === "outbound-peralatan") return "<div class=\"intel-summary\" id=\"outbound-peralatan-summary\"></div>";
  if (widget.id === "outbound-kehadiran") return "<div class=\"intel-summary\" id=\"outbound-kehadiran-summary\"></div>";
  if (widget.id === "outbound-grafik-peserta") return renderChartCard("bar-outbound-participant");
  if (widget.id === "outbound-grafik-pendapatan") return renderChartCard("bar-outbound-revenue");
  if (widget.id === "finance-saldo-kas") return "<div class=\"intel-summary\" id=\"finance-saldo-kas-summary\"></div>";
  if (widget.id === "finance-saldo-bank") return "<div class=\"intel-summary\" id=\"finance-saldo-bank-summary\"></div>";
  if (widget.id === "finance-pendapatan-hari-ini") return "<div class=\"intel-summary\" id=\"finance-pendapatan-summary\"></div>";
  if (widget.id === "finance-pengeluaran-hari-ini") return "<div class=\"intel-summary\" id=\"finance-pengeluaran-summary\"></div>";
  if (widget.id === "finance-laba-hari-ini") return "<div class=\"intel-summary\" id=\"finance-laba-summary\"></div>";
  if (widget.id === "finance-cash-flow") return "<div class=\"intel-summary\" id=\"finance-cash-flow-summary\"></div>";
  if (widget.id === "finance-per-modul") return "<div class=\"intel-summary\" id=\"finance-per-modul-summary\"></div>";
  if (widget.id === "finance-grafik-kas") return renderChartCard("bar-finance-cash");
  if (widget.id === "finance-grafik-pendapatan") return renderChartCard("bar-finance-income");
  if (widget.id === "finance-grafik-pengeluaran") return renderChartCard("bar-finance-expense");
  if (widget.id === "accounting-jumlah-jurnal") return "<div class=\"intel-summary\" id=\"accounting-jumlah-jurnal-summary\"></div>";
  if (widget.id === "accounting-saldo-kas") return "<div class=\"intel-summary\" id=\"accounting-saldo-kas-summary\"></div>";
  if (widget.id === "accounting-saldo-bank") return "<div class=\"intel-summary\" id=\"accounting-saldo-bank-summary\"></div>";
  if (widget.id === "accounting-pendapatan") return "<div class=\"intel-summary\" id=\"accounting-pendapatan-summary\"></div>";
  if (widget.id === "accounting-beban") return "<div class=\"intel-summary\" id=\"accounting-beban-summary\"></div>";
  if (widget.id === "accounting-laba-bersih") return "<div class=\"intel-summary\" id=\"accounting-laba-bersih-summary\"></div>";
  if (widget.id === "accounting-neraca") return "<div class=\"intel-summary\" id=\"accounting-neraca-summary\"></div>";
  if (widget.id === "accounting-cash-flow") return "<div class=\"intel-summary\" id=\"accounting-cash-flow-summary\"></div>";
  if (widget.id === "accounting-trial-balance") return "<div class=\"intel-summary\" id=\"accounting-trial-balance-summary\"></div>";
  if (widget.id === "accounting-closing-status") return "<div class=\"intel-summary\" id=\"accounting-closing-status-summary\"></div>";
  if (widget.id === "ringkasan-harian") return "<div class=\"intel-summary\" id=\"today-summary\"></div>";
  if (widget.id === "data-terkini") return "<div class=\"tbl-w\"><table class=\"tbl\"><thead><tr><th>Modul</th><th>Status</th><th>Jumlah</th><th>Aksi</th></tr></thead><tbody id=\"rBody\"></tbody></table></div>";
  if (widget.id === "pendapatan") return renderChartCard("bar-rev");
  if (widget.id === "reservasi") return renderChartCard("bar-res");
  if (widget.id === "ringkasan-entitas") return renderChartCard("bar-ent");
  if (widget.id === "arus-kas") return renderChartCard("bar-cash");
  if (widget.id === "tingkat-hunian") return renderChartCard("bar-occupancy");
  return "<div class=\"empty\">Widget belum tersedia</div>";
}

export function renderDashboardWidgets(widgets: DashboardWidget[]): string {
  return widgets
    .filter((widget) => widget.visible)
    .sort((a, b) => a.priority - b.priority)
    .map((widget) => renderWidgetCard({
      id: widget.id,
      title: widget.title,
      icon: getDashboardIcon(widget.icon as DashboardIconName),
      sizeClass: widgetSizeClass(widget.size),
      body: resolveWidgetBody(widget),
    }))
    .join("");
}

export function renderDashboardSection(widgets: DashboardWidget[] = dashboardWidgetDefinitions): string {
  return `<section class="view on" id="v-dash">${renderDashboardHeader()}${renderDashboardToolbar()}<div class="dash-widget-grid" id="dash-widget-grid">${renderDashboardWidgets(widgets)}</div></section>`;
}
