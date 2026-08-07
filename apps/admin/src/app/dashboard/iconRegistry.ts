import { icons } from "../../design-system/icons/index.js";

export const dashboardIconRegistry = {
  menu: icons.menu,
  search: icons.search,
  bell: icons.bell,
  chevronRight: icons.chevronRight,
  dashboard: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M3 3h6v6H3zM11 3h6v4h-6zM11 9h6v8h-6zM3 11h6v6H3z'/></svg>",
  summary: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M4 4h12v3H4zM4 9h8v3H4zM4 14h12v2H4z'/></svg>",
  insight: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M10 2l8 4v5c0 5-3.5 7-8 7s-8-2-8-7V6l8-4z'/></svg>",
  action: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M10 2v16M2 10h16' stroke='currentColor' stroke-width='2'/></svg>",
  chart: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M3 16h14v2H3zM5 14V8h2v6zm4 0V4h2v10zm4 0v-5h2v5z'/></svg>",
  timeline: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M10 2a2 2 0 110 4 2 2 0 010-4zm0 6a2 2 0 110 4 2 2 0 010-4zm0 6a2 2 0 110 4 2 2 0 010-4z'/></svg>",
  health: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M10 18s7-4.2 7-9a4 4 0 00-7-2.6A4 4 0 003 9c0 4.8 7 9 7 9z'/></svg>",
  command: "<svg viewBox='0 0 20 20' fill='currentColor'><path d='M6 3a3 3 0 013 3v1H8a2 2 0 000 4h1v1a3 3 0 11-3-3H5a2 2 0 110-4h1V6a3 3 0 013-3zm8 0a3 3 0 013 3v1h-1a2 2 0 100 4h1v1a3 3 0 11-3-3h-1a2 2 0 110-4h1V6a3 3 0 013-3z'/></svg>",
} as const;

export type DashboardIconName = keyof typeof dashboardIconRegistry;

export function getDashboardIcon(name: DashboardIconName): string {
  return dashboardIconRegistry[name];
}
