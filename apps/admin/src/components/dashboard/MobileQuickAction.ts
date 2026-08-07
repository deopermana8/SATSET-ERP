import { getDashboardIcon } from "../../app/dashboard/iconRegistry.js";
import type { MobileQuickActionData } from "../../app/dashboard/mobileDashboardTypes.js";

export function renderMobileQuickAction(action: MobileQuickActionData, extraClass = ""): string {
  return `<button class="mobile-action ${extraClass}" data-tone="${action.tone}" onclick="${action.action}"><span class="mobile-action-ic">${getDashboardIcon(action.icon)}</span><span class="mobile-action-copy"><span class="mobile-action-lbl">${action.label}</span><span class="mobile-action-desc">${action.description}</span></span></button>`;
}