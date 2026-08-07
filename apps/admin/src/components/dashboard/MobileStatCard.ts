import { getDashboardIcon } from "../../app/dashboard/iconRegistry.js";
import type { MobileStatCardData } from "../../app/dashboard/mobileDashboardTypes.js";

export function renderMobileStatCard(card: MobileStatCardData): string {
  return `<button class="mobile-stat" id="${card.id}" data-stat-source="${card.source}" data-tone="${card.tone}" onclick="${card.action}"><span class="mobile-stat-ic">${getDashboardIcon(card.icon)}</span><span class="mobile-stat-copy"><span class="mobile-stat-lbl">${card.label}</span><span class="mobile-stat-val" data-stat-value>${card.value}</span><span class="mobile-stat-hint">${card.hint}</span></span></button>`;
}