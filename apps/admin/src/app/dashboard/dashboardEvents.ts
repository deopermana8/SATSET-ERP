export const dashboardEvents = {
  refresh: "dashboard:refresh",
  retry: "dashboard:retry",
  toggleWidget: "dashboard:toggle-widget",
  openCommandCenter: "dashboard:open-command-center",
} as const;

export type DashboardEventKey = keyof typeof dashboardEvents;

export const dashboardShortcutMap = {
  openCommand: "Ctrl+K",
  refreshDashboard: "Ctrl+R",
  toggleTheme: "Ctrl+J",
  focusSearch: "/",
} as const;
