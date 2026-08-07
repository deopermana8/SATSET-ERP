import { dashboardRoleAccessGroup } from "./dashboardConfig.js";
import { mobileDashboardProfiles } from "./mobileDashboardProfiles.js";
import type { EnterpriseRole } from "./dashboardTypes.js";
import { renderMobileDashboardLayout } from "../../components/dashboard/MobileDashboardLayout.js";

export function resolveDashboardAccessGroup(role: EnterpriseRole): "super-admin" | "admin" | "staff" {
  return dashboardRoleAccessGroup[role] || "staff";
}

export function renderMobileDashboardSection(role: EnterpriseRole): string {
  return renderMobileDashboardLayout(mobileDashboardProfiles[role] || mobileDashboardProfiles["super-admin"]);
}

export function buildMobileDashboardCss(): string {
  return `
#v-mobile{display:none}
.mobile-shell{display:flex;flex-direction:column;gap:14px;padding:14px 14px 108px}
.mobile-hero{position:relative;display:flex;flex-direction:column;gap:10px;padding:18px;border-radius:26px;background:linear-gradient(135deg,color-mix(in oklab,var(--brand) 24%,var(--surface)),color-mix(in oklab,var(--info) 14%,var(--surface)));border:1px solid var(--border);box-shadow:0 18px 40px rgba(2,6,23,.22)}
.mobile-hero-top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.mobile-role-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;background:color-mix(in oklab,var(--brand) 22%,transparent);color:var(--text)}
.mobile-clock{font-size:12px;font-weight:700;color:var(--text-2)}
.mobile-hero-title{font-family:var(--font-display);font-size:24px;line-height:1.05;font-weight:800;color:var(--text)}
.mobile-hero-greeting{font-size:16px;font-weight:700;color:var(--text)}
.mobile-hero-meta{display:flex;flex-wrap:wrap;gap:8px}
.mobile-hero-shift,.mobile-hero-note{display:inline-flex;align-items:center;padding:6px 10px;border-radius:999px;background:color-mix(in oklab,var(--surface) 70%,transparent);border:1px solid var(--border-2);font-size:11px;color:var(--text-2)}
.mobile-hero-summary{font-size:13px;line-height:1.6;color:var(--text-2)}
.mobile-panel{display:flex;flex-direction:column;gap:12px;padding:14px;border-radius:22px;background:color-mix(in oklab,var(--surface) 94%,transparent);border:1px solid var(--border);box-shadow:0 14px 34px rgba(2,6,23,.16)}
.mobile-panel-tight{padding-bottom:16px}
.mobile-panel-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.mobile-panel-title{font-size:14px;font-weight:800;color:var(--text)}
.mobile-panel-sub{font-size:11px;color:var(--text-3)}
.mobile-panel-count{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 8px;border-radius:999px;background:color-mix(in oklab,var(--brand) 20%,transparent);font-size:12px;font-weight:700;color:var(--text)}
.mobile-stat-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.mobile-stat{display:flex;align-items:flex-start;gap:10px;padding:12px;border-radius:18px;border:1px solid var(--border);background:color-mix(in oklab,var(--surface) 88%,transparent);text-align:left;color:var(--text);transition:transform var(--t-base),border-color var(--t-base),box-shadow var(--t-base)}
.mobile-stat:hover{transform:translateY(-1px);border-color:color-mix(in oklab,var(--brand) 45%,var(--border));box-shadow:0 10px 24px rgba(2,6,23,.14)}
.mobile-stat[data-tone="brand"]{background:linear-gradient(135deg,color-mix(in oklab,var(--brand) 18%,var(--surface)),var(--surface))}
.mobile-stat[data-tone="info"]{background:linear-gradient(135deg,color-mix(in oklab,var(--info) 16%,var(--surface)),var(--surface))}
.mobile-stat[data-tone="success"]{background:linear-gradient(135deg,color-mix(in oklab,var(--success) 16%,var(--surface)),var(--surface))}
.mobile-stat[data-tone="warn"]{background:linear-gradient(135deg,color-mix(in oklab,var(--warn) 16%,var(--surface)),var(--surface))}
.mobile-stat[data-tone="danger"]{background:linear-gradient(135deg,color-mix(in oklab,var(--danger) 16%,var(--surface)),var(--surface))}
.mobile-stat-ic{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:12px;background:color-mix(in oklab,var(--surface) 72%,transparent);color:var(--text)}
.mobile-stat-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:3px}
.mobile-stat-lbl{font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.03em}
.mobile-stat-val{font-size:16px;font-weight:800;color:var(--text);line-height:1.1}
.mobile-stat-hint{font-size:11px;color:var(--text-3)}
.mobile-action-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.mobile-action-grid-compact{grid-template-columns:repeat(2,minmax(0,1fr))}
.mobile-action{display:flex;align-items:flex-start;gap:10px;padding:12px;border-radius:18px;border:1px solid var(--border);background:var(--surface);color:var(--text);text-align:left;box-shadow:0 8px 20px rgba(2,6,23,.12)}
.mobile-action-compact{padding:10px}
.mobile-action[data-tone="brand"]{background:linear-gradient(135deg,color-mix(in oklab,var(--brand) 20%,var(--surface)),var(--surface))}
.mobile-action[data-tone="info"]{background:linear-gradient(135deg,color-mix(in oklab,var(--info) 18%,var(--surface)),var(--surface))}
.mobile-action[data-tone="success"]{background:linear-gradient(135deg,color-mix(in oklab,var(--success) 18%,var(--surface)),var(--surface))}
.mobile-action[data-tone="warn"]{background:linear-gradient(135deg,color-mix(in oklab,var(--warn) 18%,var(--surface)),var(--surface))}
.mobile-action[data-tone="danger"]{background:linear-gradient(135deg,color-mix(in oklab,var(--danger) 18%,var(--surface)),var(--surface))}
.mobile-action-ic{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:12px;background:color-mix(in oklab,var(--surface) 80%,transparent)}
.mobile-action-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:2px}
.mobile-action-lbl{font-size:12px;font-weight:800;color:var(--text)}
.mobile-action-desc{font-size:11px;line-height:1.35;color:var(--text-3)}
.mobile-task-list{display:flex;flex-direction:column;gap:10px}
.mobile-task{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:12px;border-radius:16px;border:1px solid var(--border);background:color-mix(in oklab,var(--surface) 92%,transparent);color:var(--text);text-align:left}
.mobile-task-copy{display:flex;flex:1;flex-direction:column;gap:3px}
.mobile-task-lbl{font-size:13px;font-weight:800;color:var(--text)}
.mobile-task-desc{font-size:11px;line-height:1.4;color:var(--text-3)}
.mobile-task-badge{white-space:nowrap}
.mobile-nav{position:fixed;left:10px;right:10px;bottom:10px;z-index:220;display:none;align-items:center;justify-content:space-between;gap:6px;padding:10px;border-radius:24px;background:color-mix(in oklab,var(--surface) 92%,transparent);border:1px solid var(--border);backdrop-filter:blur(18px);box-shadow:0 20px 44px rgba(2,6,23,.26)}
.mobile-nav-item{display:flex;min-width:0;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px 6px;border-radius:16px;color:var(--text-3);font-size:10px;font-weight:700;text-align:center}
.mobile-nav-item svg{width:18px;height:18px}
.mobile-nav-item.active{color:var(--text);background:color-mix(in oklab,var(--brand) 18%,transparent)}

@media (max-width: 767px){
  #sidebar,#navbar{display:none !important}
  #wrap{margin-left:0 !important}
  #content{padding-bottom:96px}
  #v-mobile{display:block !important}
  #v-dash{display:none !important}
  .mobile-nav{display:flex}
}

@media (max-width: 540px){
  .mobile-shell{padding:12px 12px 108px}
  .mobile-stat-grid,.mobile-action-grid,.mobile-action-grid-compact{grid-template-columns:1fr}
  .mobile-hero-title{font-size:22px}
}
`;
}