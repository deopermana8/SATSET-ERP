import type { DashboardIconName } from "./iconRegistry.js";
import type { EnterpriseRole } from "./dashboardTypes.js";

export type MobileStatCardData = {
  id: string;
  label: string;
  source: string;
  value: string;
  hint: string;
  tone: "brand" | "info" | "success" | "warn" | "danger";
  action: string;
  icon: DashboardIconName;
};

export type MobileQuickActionData = {
  label: string;
  description: string;
  action: string;
  icon: DashboardIconName;
  tone: "brand" | "info" | "success" | "warn" | "danger";
};

export type MobileTaskItem = {
  title: string;
  detail: string;
  badge: string;
  action: string;
  tone: "brand" | "info" | "success" | "warn" | "danger";
};

export type MobileNotificationItem = {
  title: string;
  detail: string;
  time: string;
  tone: "brand" | "info" | "success" | "warn" | "danger";
  action?: string;
  badge?: string;
};

export type MobileNavItem = {
  label: string;
  action: string;
  icon: DashboardIconName;
  route?: string;
};

export type MobileDashboardProfile = {
  role: EnterpriseRole;
  badge: string;
  title: string;
  greeting: string;
  shiftLabel: string;
  shiftHint: string;
  summary: string;
  statCards: MobileStatCardData[];
  shortcuts: MobileQuickActionData[];
  tasks: MobileTaskItem[];
  notifications: MobileNotificationItem[];
  quickActions: MobileQuickActionData[];
  navItems: MobileNavItem[];
};