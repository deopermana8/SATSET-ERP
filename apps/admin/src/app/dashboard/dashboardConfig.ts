import type { DashboardAccessGroup, EnterpriseRole, DashboardWidget } from "./dashboardTypes.js";

export type DashboardLayoutConfig = {
  columns: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  widgetMinWidth: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
};

export const dashboardLayoutConfig: DashboardLayoutConfig = {
  columns: {
    desktop: 12,
    tablet: 6,
    mobile: 1,
  },
  widgetMinWidth: {
    desktop: 260,
    tablet: 220,
    mobile: 0,
  },
};

export type DashboardRuntimeConfig = {
  role: EnterpriseRole;
  visibility: Record<string, boolean>;
  order: string[];
  sizeOverrides: Partial<Record<string, DashboardWidget["size"]>>;
};

export const defaultDashboardRuntimeConfig: DashboardRuntimeConfig = {
  role: "super-admin",
  visibility: {},
  order: [],
  sizeOverrides: {},
};

export const dashboardRoleAccessGroup: Record<EnterpriseRole, DashboardAccessGroup> = {
  "super-admin": "super-admin",
  owner: "admin",
  manager: "admin",
  "kasir-cafe": "staff",
  loket: "staff",
  booking: "staff",
  ticketing: "staff",
  finance: "admin",
  accounting: "admin",
  instruktur: "staff",
  maintenance: "staff",
};
