import { getDashboardIcon } from "../../app/dashboard/iconRegistry.js";
import type { MobileNavItem } from "../../app/dashboard/mobileDashboardTypes.js";

export function renderBottomNavigation(items: MobileNavItem[]): string {
  return `<nav class="mobile-nav" id="mobile-nav" aria-label="Navigasi bawah">${items.map((item) => `<button class="mobile-nav-item" data-nav="${item.route ?? ''}" onclick="${item.action}" aria-label="${item.label}">${getDashboardIcon(item.icon)}<span>${item.label}</span></button>`).join('')}</nav>`;
}