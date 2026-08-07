import { duration, easing } from "../../design-system/tokens/animation.js";
import { darkColor, lightColor, type SemanticColorSet } from "../../design-system/tokens/color.js";

export type DashboardThemeMode = "light" | "dark" | "corporate" | "emerald";

export type DashboardThemePreset = {
  mode: DashboardThemeMode;
  colors: SemanticColorSet;
};

const corporateColor: SemanticColorSet = {
  ...darkColor,
  primary: darkColor.info,
  primaryHover: darkColor.primaryHover,
  info: darkColor.info,
  warning: darkColor.warning,
  success: darkColor.success,
  danger: darkColor.danger,
};

const emeraldColor: SemanticColorSet = {
  ...darkColor,
  primary: darkColor.success,
  primaryHover: "#059669",
  info: "#34D399",
  warning: darkColor.warning,
  success: darkColor.success,
  danger: darkColor.danger,
};

export const dashboardThemePresets: DashboardThemePreset[] = [
  { mode: "light", colors: lightColor },
  { mode: "dark", colors: darkColor },
  { mode: "corporate", colors: corporateColor },
  { mode: "emerald", colors: emeraldColor },
];

function toLegacyVars(colors: SemanticColorSet): string {
  return [
    `--bg:${colors.background};`,
    `--surface:${colors.surface};`,
    `--surface-2:${colors.elevatedSurface};`,
    `--surface-3:${colors.tooltip};`,
    `--border:${colors.border};`,
    `--border-2:${colors.border};`,
    `--text:${colors.textPrimary};`,
    `--text-2:${colors.textSecondary};`,
    `--text-3:${colors.textMuted};`,
    `--brand:${colors.primary};`,
    `--brand-soft:color-mix(in oklab,${colors.primary} 16%,transparent);`,
    `--success:${colors.success};`,
    `--success-soft:color-mix(in oklab,${colors.success} 18%,transparent);`,
    `--warn:${colors.warning};`,
    `--warn-soft:color-mix(in oklab,${colors.warning} 18%,transparent);`,
    `--danger:${colors.danger};`,
    `--danger-soft:color-mix(in oklab,${colors.danger} 18%,transparent);`,
    `--info:${colors.info};`,
    `--info-soft:color-mix(in oklab,${colors.info} 18%,transparent);`,
    `--sb:${colors.surface};`,
    `--sb-t:${colors.textSecondary};`,
    `--sb-at:${colors.textPrimary};`,
    `--sb-h:${colors.elevatedSurface};`,
    `--sb-a:color-mix(in oklab,${colors.primary} 22%,transparent);`,
  ].join("");
}

export function buildDashboardThemeCss(): string {
  const rows = dashboardThemePresets.map((preset) => {
    return `html[data-theme=\"${preset.mode}\"]{${toLegacyVars(preset.colors)}}`;
  });
  return rows.join("");
}

export const dashboardThemeMotion = {
  fast: `${duration.fast} ${easing.standard}`,
  normal: `${duration.normal} ${easing.standard}`,
  slow: `${duration.slow} ${easing.emphasized}`,
} as const;
