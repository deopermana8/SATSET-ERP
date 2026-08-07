import { dashboardThemeMotion } from "./themeEngine.js";

export const dashboardAnimationSystem = {
  fade: `opacity ${dashboardThemeMotion.normal}`,
  slide: `transform ${dashboardThemeMotion.slow}`,
  zoom: `transform ${dashboardThemeMotion.fast}`,
  drawer: `transform ${dashboardThemeMotion.slow}, opacity ${dashboardThemeMotion.normal}`,
  modal: `transform ${dashboardThemeMotion.slow}, opacity ${dashboardThemeMotion.normal}`,
  toast: `transform ${dashboardThemeMotion.normal}, opacity ${dashboardThemeMotion.normal}`,
  ripple: `transform ${dashboardThemeMotion.fast}, opacity ${dashboardThemeMotion.fast}`,
  pageTransition: `opacity ${dashboardThemeMotion.normal}, transform ${dashboardThemeMotion.normal}`,
} as const;

export function buildDashboardAnimationCss(): string {
  return `
.ds-anim-fade{transition:${dashboardAnimationSystem.fade}}
.ds-anim-slide{transition:${dashboardAnimationSystem.slide}}
.ds-anim-zoom{transition:${dashboardAnimationSystem.zoom}}
.ds-anim-drawer{transition:${dashboardAnimationSystem.drawer}}
.ds-anim-modal{transition:${dashboardAnimationSystem.modal}}
.ds-anim-toast{transition:${dashboardAnimationSystem.toast}}
.ds-anim-ripple{transition:${dashboardAnimationSystem.ripple}}
.ds-anim-page{transition:${dashboardAnimationSystem.pageTransition}}
`;
}
