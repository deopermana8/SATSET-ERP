import { duration, easing } from "./animation.js";
import { breakpoints } from "./breakpoints.js";
import { darkColors, lightColors } from "./colors.js";
import { radius } from "./radius.js";
import { shadow } from "./shadow.js";
import { spacing } from "./spacing.js";
import { fontFamily, fontSize, fontWeight } from "./typography.js";
import { zIndex } from "./zindex.js";

export const satsetTheme = {
  colors: {
    light: lightColors,
    dark: darkColors,
  },
  spacing,
  radius,
  shadow,
  typography: {
    fontFamily,
    fontSize,
    fontWeight,
  },
  animation: {
    duration,
    easing,
  },
  zIndex,
  breakpoints,
} as const;

export type SatsetTheme = typeof satsetTheme;

export function buildThemeCssVariables(isDark = true): string {
  const semantic = isDark ? satsetTheme.colors.dark : satsetTheme.colors.light;
  return [
    `--ds-color-primary:${semantic.primary};`,
    `--ds-color-primary-hover:${semantic.primaryHover};`,
    `--ds-color-bg:${semantic.background};`,
    `--ds-color-surface:${semantic.surface};`,
    `--ds-color-elevated:${semantic.elevatedSurface};`,
    `--ds-color-card:${semantic.card};`,
    `--ds-color-modal:${semantic.modal};`,
    `--ds-color-dropdown:${semantic.dropdown};`,
    `--ds-color-tooltip:${semantic.tooltip};`,
    `--ds-color-border:${semantic.border};`,
    `--ds-color-text:${semantic.textPrimary};`,
    `--ds-color-text-secondary:${semantic.textSecondary};`,
    `--ds-color-text-muted:${semantic.textMuted};`,
    `--ds-color-text-hint:${semantic.textMuted};`,
    `--ds-color-success:${semantic.success};`,
    `--ds-color-danger:${semantic.danger};`,
    `--ds-color-warning:${semantic.warning};`,
    `--ds-color-info:${semantic.info};`,
    `--ds-radius-sm:${satsetTheme.radius.sm};`,
    `--ds-radius-md:${satsetTheme.radius.md};`,
    `--ds-radius-lg:${satsetTheme.radius.lg};`,
    `--ds-radius-xl:${satsetTheme.radius.xl};`,
    `--ds-shadow-sm:${satsetTheme.shadow.sm};`,
    `--ds-shadow-md:${satsetTheme.shadow.md};`,
    `--ds-shadow-lg:${satsetTheme.shadow.lg};`,
    `--ds-shadow-xl:${satsetTheme.shadow.xl};`,
    `--ds-shadow-glass:${satsetTheme.shadow.glass};`,
  ].join("");
}
