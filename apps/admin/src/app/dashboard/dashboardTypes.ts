export type DashboardWidgetSize = "xs" | "sm" | "md" | "lg" | "xl";

export type EnterpriseRole =
  | "super-admin"
  | "owner"
  | "manager"
  | "kasir-cafe"
  | "loket"
  | "booking"
  | "ticketing"
  | "finance"
  | "accounting"
  | "instruktur"
  | "maintenance";

export type DashboardAccessGroup = "super-admin" | "admin" | "staff";

export type DashboardWidgetComponent =
  | "WidgetCard"
  | "StatCard"
  | "InsightCard"
  | "TimelineCard"
  | "HealthCard"
  | "ChartCard"
  | "ActionPanel"
  | "Header"
  | "Sidebar"
  | "Toolbar";

export type DashboardWidget = {
  id: string;
  title: string;
  icon: string;
  permission: string;
  roles: DashboardAccessGroup[];
  size: DashboardWidgetSize;
  priority: number;
  refreshInterval: number;
  component: DashboardWidgetComponent;
  visible: boolean;
  favorite?: boolean;
  pinned?: boolean;
  layout?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
};

export type DashboardInsight = {
  severity: "low" | "medium" | "high";
  category: "pendapatan" | "reservasi" | "operasional" | "keuangan";
  title: string;
  description: string;
  action: string;
  priority: number;
  source: string;
  timestamp: number;
};

export type DashboardActivity = {
  time: string;
  title: string;
  timestamp: number;
};

export type HealthBadge = "Normal" | "Perhatian" | "Gangguan";

export type DashboardHealth = {
  name: "Server" | "Database" | "Cache" | "Storage" | "Memory" | "API" | "Queue";
  status: HealthBadge;
  detail: string;
};

export type CommandCenterState = {
  pekerjaanSaya: number;
  approval: number;
  tugasHariIni: number;
  notifikasiPenting: number;
  targetHariIni: string;
};

export type DashboardStoreState = {
  widgets: DashboardWidget[];
  insights: DashboardInsight[];
  activities: DashboardActivity[];
  health: DashboardHealth[];
  commandCenter: CommandCenterState;
  loading: boolean;
  offline: boolean;
  slowNetwork: boolean;
  noData: boolean;
  retryCount: number;
  lastUpdated: number;
};
