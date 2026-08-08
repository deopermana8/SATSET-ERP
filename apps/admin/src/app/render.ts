import { designSystemCss } from "../design-system/styles/designSystemCss.js";
import { buildDataLayerScript } from "../services/dataLayerScript.js";
import { buildThemeCssVariables } from "../design-system/tokens/theme.js";
import {
  buildDashboardAnimationCss,
  buildMobileDashboardCss,
  buildDashboardThemeCss,
  dashboardLayoutConfig,
  dashboardRoleAccessGroup,
  dashboardWidgetDefinitions,
  defaultDashboardRuntimeConfig,
  renderMobileDashboardSection,
  renderDashboardSection,
} from "./dashboard/index.js";
import { accountingJournalTypes, defaultChartOfAccounts } from "../modules/accounting/index.js";
import { bookingStatuses } from "../modules/booking/index.js";
import { cafeOrderStatuses, cafePaymentMethods, cafeKitchenStatuses } from "../modules/cafe/index.js";
import { defaultCafeFinancialConfig } from "../modules/cafe/cafePayment.js";
import { defaultCafeMenus } from "../modules/cafe/cafeEngine.js";
import { defaultFinanceBankAccounts, defaultFinanceCashAccounts, financePaymentMethods as financePaymentMethodList, financeTransactionTypes } from "../modules/finance/index.js";
import { defaultOutboundEquipment, defaultOutboundInstructors, defaultOutboundPackages, outboundPaymentMethods, outboundSessionStatuses } from "../modules/outbound/index.js";
import { ticketPaymentMethods, ticketStatuses, ticketTariffs } from "../modules/ticketing/index.js";
import { createMasterDataEngine, getMasterLabelMap, getMasterSearchPool, masterModuleKeys, standardMasterEntities } from "../modules/master/index.js";

const dsLightVars = buildThemeCssVariables(false);
const dsDarkVars = buildThemeCssVariables(true);
const masterEngine = createMasterDataEngine({
  entities: standardMasterEntities,
  request: async () => null,
});
const mergedMasterLabels = {
  ...getMasterLabelMap(),
  ...Object.fromEntries(standardMasterEntities.map((entity) => [entity.key, entity.name])),
  accounting: "Accounting Core",
  cafe: "Cafe",
  finance: "Keuangan Inti",
  outbound: "Outbound",
};
const masterLabels = JSON.stringify(mergedMasterLabels);
const masterEntityKeys = JSON.stringify(masterModuleKeys);
const masterSearchPool = JSON.stringify(getMasterSearchPool());
const masterEntityConfigMap = JSON.stringify(Object.fromEntries(masterEngine.registry.list().map((entity) => [entity.key, {
  key: entity.key,
  name: entity.name,
  endpoint: entity.endpoint,
  searchableFields: entity.searchableFields,
  sortableFields: entity.sortableFields,
  defaultSort: entity.defaultSort ?? { field: "name", direction: "asc" },
  defaultSearch: entity.defaultSearch ?? "name",
  defaultPageSize: entity.defaultPageSize ?? 10,
  fields: entity.fields,
  permissions: entity.permissions,
}])));
const masterToolbarMap = JSON.stringify(Object.fromEntries(masterEngine.registry.list().map((entity) => {
  const runtime = masterEngine.createRuntime(entity.key);
  const userPermissions = Object.values(entity.permissions).filter((code): code is string => typeof code === "string");
  return [entity.key, runtime.buildToolbar({ userPermissions })];
})));
const dashboardWidgetMetadata = JSON.stringify(dashboardWidgetDefinitions);
const dashboardRuntimeConfig = JSON.stringify(defaultDashboardRuntimeConfig);
const dashboardLayoutMetadata = JSON.stringify(dashboardLayoutConfig);
const dashboardRoleAccessMetadata = JSON.stringify(dashboardRoleAccessGroup);
const dashboardSectionMarkup = renderDashboardSection(dashboardWidgetDefinitions);
const mobileDashboardSectionMarkup = renderMobileDashboardSection(defaultDashboardRuntimeConfig.role);
const dashboardThemeCss = buildDashboardThemeCss();
const dashboardAnimationCss = buildDashboardAnimationCss();
const mobileDashboardCss = buildMobileDashboardCss();
const ticketTariffConfig = JSON.stringify(ticketTariffs);
const ticketStatusConfig = JSON.stringify(ticketStatuses);
const ticketPaymentConfig = JSON.stringify(ticketPaymentMethods);
const bookingStatusConfig = JSON.stringify(bookingStatuses);
const accountingChartConfig = JSON.stringify(defaultChartOfAccounts);
const accountingJournalTypeConfig = JSON.stringify(accountingJournalTypes);
const cafeOrderStatusConfig = JSON.stringify(cafeOrderStatuses);
const cafePaymentConfig = JSON.stringify(cafePaymentMethods);
const cafeKitchenStatusConfig = JSON.stringify(cafeKitchenStatuses);
const cafeMenuConfig = JSON.stringify(defaultCafeMenus);
const cafeFinancialConfig = JSON.stringify(defaultCafeFinancialConfig);
const financeTransactionConfig = JSON.stringify(financeTransactionTypes);
const financePaymentConfig = JSON.stringify(financePaymentMethodList);
const financeCashConfig = JSON.stringify(defaultFinanceCashAccounts);
const financeBankConfig = JSON.stringify(defaultFinanceBankAccounts);
const outboundStatusConfig = JSON.stringify(outboundSessionStatuses);
const outboundPaymentConfig = JSON.stringify(outboundPaymentMethods);
const outboundPackageConfig = JSON.stringify(defaultOutboundPackages);
const outboundInstructorConfig = JSON.stringify(defaultOutboundInstructors);
const outboundEquipmentConfig = JSON.stringify(defaultOutboundEquipment);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const renderAdminHtml = (api: string): string => String.raw`<!doctype html>
<html lang="id" class="dark" data-theme="dark">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>SATSET ERP</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet"/>
<style>
${designSystemCss()}
${dashboardAnimationCss}
${mobileDashboardCss}
:root{--font:"IBM Plex Sans",system-ui,sans-serif;--font-display:"Manrope","IBM Plex Sans",system-ui,sans-serif;--s1:8px;--s2:8px;--s3:16px;--s4:24px;--s5:32px;--s6:48px;--s8:64px;--s10:64px;--r1:8px;--r2:10px;--r3:14px;--r4:18px;--rf:9999px;--t-fast:150ms ease;--t-base:200ms ease;--t-slow:240ms ease;--sidebar-w:264px;--sidebar-col:72px;--nav-h:60px;--ring:0 0 0 3px rgba(245,158,11,.35);--accent-indigo:#3B82F6;${dsLightVars}}
${dashboardThemeCss}
html[data-theme="light"]{${dsLightVars}}
html[data-theme="dark"],html[data-theme="corporate"],html[data-theme="emerald"]{${dsDarkVars}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-family:var(--font);font-size:14px;line-height:1.5;color:var(--text);background:var(--bg)}
body{display:flex;min-height:100vh;overflow-x:hidden;background:radial-gradient(circle at 12% -6%,var(--info-soft),transparent 36%),radial-gradient(circle at 86% -8%,var(--brand-soft),transparent 34%),var(--bg)}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(color-mix(in oklab,var(--text-3) 24%,transparent) 1px, transparent 1px);background-size:18px 18px;opacity:.3}
button{font-family:inherit;cursor:pointer}input,select,textarea{font-family:inherit}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,[tabindex]:focus-visible{outline:none;box-shadow:var(--ring)}
*{scrollbar-width:thin;scrollbar-color:var(--border-2) transparent}
::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:3px}

/* layout */
#sidebar{position:fixed;top:10px;left:10px;width:var(--sidebar-w);height:calc(100vh - 20px);background:color-mix(in oklab,var(--sb) 94%,transparent);backdrop-filter:blur(14px);border:1px solid var(--border);border-radius:20px;display:flex;flex-direction:column;transition:width var(--t-slow),transform var(--t-slow);z-index:100;overflow:hidden;box-shadow:0 18px 36px rgba(2,6,23,.26)}
#sidebar.col{width:var(--sidebar-col)}
#wrap{margin-left:calc(var(--sidebar-w) + 10px);flex:1;display:flex;flex-direction:column;min-height:100vh;transition:margin-left var(--t-slow)}
#sidebar.col~#wrap{margin-left:var(--sidebar-col)}
#navbar{position:sticky;top:10px;z-index:50;height:var(--nav-h);margin:8px 10px 0;border-radius:16px;background:color-mix(in oklab,var(--surface) 90%,transparent);backdrop-filter:blur(10px);border:1px solid var(--border);display:flex;align-items:center;padding:0 var(--s4);gap:var(--s3);flex-shrink:0;box-shadow:0 12px 28px rgba(2,6,23,.18)}

/* sidebar logo */
.sb-logo{height:var(--nav-h);display:flex;align-items:center;gap:var(--s3);padding:0 var(--s4);border-bottom:1px solid rgba(255,255,255,.04);flex-shrink:0}
.sb-logo-ic{width:32px;height:32px;border-radius:var(--r2);flex-shrink:0;background:linear-gradient(135deg,var(--info),var(--brand));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px}
.sb-logo-n{color:#f1f5f9;font-weight:700;font-size:15px;white-space:nowrap}
.sb-logo-s{color:var(--text-3);font-size:11px;white-space:nowrap}
#sidebar.col .sb-logo-n,#sidebar.col .sb-logo-s{display:none}

/* sidebar nav */
.sb-nav{flex:1;overflow-y:auto;padding:var(--s2) 0}
.fav-wrap{padding:0 var(--s3) var(--s2)}
.fav-hd{display:flex;align-items:center;justify-content:space-between;margin:6px 2px 8px;color:var(--text-3);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.fav-list{display:flex;flex-wrap:wrap;gap:6px}
.fav-chip{display:inline-flex;align-items:center;gap:4px;padding:5px 8px;border:1px solid rgba(255,255,255,.08);border-radius:999px;color:#cbd5e1;background:rgba(255,255,255,.02);font-size:11px;cursor:pointer;transition:all var(--t-fast)}
.fav-chip:hover{color:#fff;background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18)}
#sidebar.col .fav-wrap{display:none}
.sb-lbl{padding:var(--s2) var(--s4) var(--s1);color:var(--text-3);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;transition:opacity var(--t-base);border-top:1px solid rgba(148,163,184,.14);margin-top:6px}
#sidebar.col .sb-lbl{opacity:0}
.sb-item{display:flex;align-items:center;gap:var(--s3);padding:8px var(--s4);color:var(--sb-t);cursor:pointer;white-space:nowrap;overflow:hidden;transition:background var(--t-fast),color var(--t-fast),transform var(--t-fast);user-select:none;border-radius:10px;margin:0 8px}
.sb-item:hover{background:var(--sb-h);color:var(--sb-at);transform:translateX(2px)}
.sb-item.active{background:var(--sb-a);color:var(--sb-at);position:relative}
.sb-item.active::before{content:"";position:absolute;left:-8px;top:6px;bottom:6px;width:4px;border-radius:0 6px 6px 0;background:var(--brand)}
.sb-item .ic{width:17px;height:17px;flex-shrink:0}
.sb-item .lbl{font-size:13px;font-weight:500}
.sb-item .badge{margin-left:auto;padding:2px 7px;font-size:10px}
#sidebar.col .sb-item .lbl{display:none}
#sidebar.col .sb-item .badge{display:none}
#sidebar.col .sb-item{justify-content:center;padding:8px}
.sb-grp .chv{margin-left:auto;transition:transform var(--t-base);flex-shrink:0}
.sb-grp.open .chv{transform:rotate(90deg)}
.sb-sub{overflow:hidden;max-height:0;transition:max-height var(--t-slow)}
.sb-sub.open{max-height:500px}
.sb-sub .sb-item{padding-left:42px;font-size:12.5px}
#sidebar.col .sb-sub{display:none}
.sb-foot{border-top:1px solid var(--border);padding:var(--s3) var(--s4)}
.sb-user{display:flex;align-items:center;gap:var(--s3);cursor:pointer}
.sb-av{width:32px;height:32px;border-radius:var(--rf);flex-shrink:0;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px}
.sb-un{color:#e2e8f0;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-ur{color:#374151;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#sidebar.col .sb-ui{display:none}
#sidebar.col .sb-user{justify-content:center}

/* navbar */
.nav-tog{background:none;border:none;color:var(--text-2);padding:var(--s2);border-radius:var(--r2);transition:background var(--t-fast)}
.nav-tog:hover{background:var(--surface-2)}
#bc{display:flex;align-items:center;gap:var(--s2);font-size:13px;flex:1;min-width:0}
#bc .cr{color:var(--text-3)}
#bc .cr.now{color:var(--text);font-weight:600}
#bc .sep{color:var(--text-3);font-size:11px}
.nav-srch{display:flex;align-items:center;gap:var(--s2);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r2);padding:8px var(--s3);width:310px;transition:border-color var(--t-fast),box-shadow var(--t-fast)}
.nav-srch:focus-within{border-color:var(--brand);box-shadow:0 0 0 3px rgba(245,158,11,.2)}
.nav-srch input{background:none;border:none;outline:none;color:var(--text);font-size:13px;width:100%}
.nav-btn{background:none;border:1px solid var(--border);color:var(--text-2);width:36px;height:36px;border-radius:var(--r2);display:flex;align-items:center;justify-content:center;transition:all var(--t-fast);position:relative;cursor:pointer}
.nav-btn:hover{background:var(--surface-2);color:var(--text)}
.nav-dot{position:absolute;top:7px;right:7px;width:6px;height:6px;border-radius:var(--rf);background:var(--danger);border:2px solid var(--surface)}
.nav-usr{display:flex;align-items:center;gap:var(--s2);padding:6px var(--s3);border:1px solid var(--border);border-radius:var(--r2);cursor:pointer;transition:all var(--t-fast)}
.nav-usr:hover{background:var(--surface-2)}
.nav-av{width:28px;height:28px;border-radius:var(--rf);background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px}
.kbd{font-size:11px;border:1px solid var(--border);padding:2px 6px;border-radius:8px;color:var(--text-2);background:var(--surface)}

/* content */
#content{padding:var(--s6);flex:1}
.view{display:none}.view.on{display:block}
.ph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:var(--s6);gap:var(--s4)}
.ph-title{font-family:var(--font-display);font-size:28px;font-weight:800;letter-spacing:-.02em;line-height:1.15}
.ph-sub{color:var(--text-2);font-size:14px;margin-top:6px}
.dash-head-right{display:flex;align-items:center;gap:10px}
.dash-state{padding:6px 10px;border:1px solid var(--border);border-radius:999px;font-size:11px;color:var(--text-2);background:var(--surface-2)}
.dash-refresh{font-size:12px;color:var(--text-3)}

/* buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);padding:0 var(--s3);min-height:36px;border-radius:var(--r2);font-size:13px;font-weight:600;cursor:pointer;transition:all var(--t-fast);border:1px solid transparent;white-space:nowrap}
.btn-p{background:var(--brand);color:#111827;border-color:var(--brand)}.btn-p:hover{background:#d97706;color:#fff;transform:translateY(-1px)}
.btn-o{background:none;color:var(--text-2);border-color:var(--border-2)}.btn-o:hover{background:var(--surface-2);color:var(--text)}
.btn-d{background:none;color:var(--danger);border-color:var(--danger)}.btn-d:hover{background:var(--danger-soft)}
.btn-g{background:none;border-color:transparent;color:var(--text-2)}.btn-g:hover{background:var(--surface-2);color:var(--text)}
.btn-sm{min-height:32px;padding:0 12px;font-size:12px}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn.load{position:relative;pointer-events:none;opacity:.9}
.btn.load::after{content:"";width:12px;height:12px;border:2px solid rgba(255,255,255,.55);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .7s linear infinite}

/* kpi */
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(185px,1fr));gap:var(--s4);margin-bottom:var(--s6)}
.kpi-card{position:relative;overflow:hidden;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r3);padding:var(--s4);transition:box-shadow var(--t-base),transform var(--t-fast),border-color var(--t-fast);cursor:pointer;text-align:left}
.kpi-card:hover{box-shadow:0 8px 18px rgba(2,6,23,.22);transform:translateY(-1px);border-color:color-mix(in oklab,var(--brand) 45%,var(--border))}
.kpi-card:active{transform:scale(.992)}
.kpi-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s3)}
.kpi-lbl{font-size:11px;font-weight:600;color:var(--text-2);text-transform:uppercase;letter-spacing:.06em}
.kpi-ic{width:36px;height:36px;border-radius:var(--r2);display:flex;align-items:center;justify-content:center}
.kpi-val{font-size:30px;font-weight:700;line-height:1;margin-bottom:var(--s1)}
.kpi-trend{font-size:12px;display:flex;align-items:center;gap:3px}
.kpi-comp{font-size:11px;color:var(--text-3);margin-top:6px}
.kpi-spark{width:100%;height:24px;display:block;margin-top:8px}
.kpi-spark polyline{fill:none;stroke:var(--brand);stroke-width:2}
.kpi-meta{display:block;margin-top:7px;font-size:11px;color:var(--text-3)}
.kpi-ripple{position:absolute;inset:auto auto -50px -50px;width:100px;height:100px;border-radius:999px;background:var(--brand-soft);transform:scale(0);opacity:0;transition:transform .28s ease,opacity .28s ease}
.kpi-card:active .kpi-ripple{transform:scale(1);opacity:1}
.t-up{color:var(--success)}.t-dn{color:var(--danger)}

/* dash grid */
.dg{display:grid;grid-template-columns:1fr 300px;gap:var(--s4)}
@media(max-width:1100px){.dg{grid-template-columns:1fr}}

/* card */
.card{background:color-mix(in oklab,var(--surface-2) 92%,transparent);backdrop-filter:blur(6px);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden;box-shadow:0 1px 0 rgba(0,0,0,.02),0 12px 28px rgba(2,6,23,.12)}
.card-hd{padding:var(--s4) var(--s5);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.card-title{font-size:14px;font-weight:600}
.card-body{padding:var(--s5)}
svg.chart{width:100%;overflow:visible}

/* timeline */
.tl{display:flex;flex-direction:column}
.tl-row{display:flex;gap:var(--s3);padding:10px 0;position:relative}
.tl-row:not(:last-child)::before{content:"";position:absolute;left:15px;top:36px;bottom:0;width:1px;background:var(--border)}
.tl-dot{width:32px;height:32px;border-radius:var(--rf);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px}
.tl-dot-soft{background:var(--brand-soft)}
.tl-body{flex:1;padding-top:5px}
.tl-txt{font-size:13px}.tl-time{font-size:11px;color:var(--text-3);margin-top:2px}

/* qa */
.qa-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--s3)}
.qa-btn{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r2);padding:var(--s3);display:flex;flex-direction:column;align-items:flex-start;gap:3px;cursor:pointer;transition:all var(--t-fast);text-align:left}
.qa-btn:hover{background:var(--brand-soft);border-color:var(--brand);transform:translateY(-1px) scale(1.01)}
.qa-ic{width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center}.qa-ic svg{width:18px;height:18px;display:block}
.qa-n{font-size:12px;font-weight:600;color:var(--text)}.qa-d{font-size:11px;color:var(--text-3)}

.intel-grid{display:grid;grid-template-columns:2fr 1fr;gap:var(--s4);margin-bottom:var(--s4)}
.intel-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.sum-card{border:1px solid var(--border);border-radius:14px;background:var(--surface-2);padding:12px}
.sum-name{font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em}
.sum-val{font-size:22px;font-weight:700;line-height:1.1;margin-top:6px}
.module-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}
.module-card{border:1px solid var(--border);border-radius:14px;background:var(--surface-2);padding:12px;display:flex;flex-direction:column;gap:10px}
.module-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
.module-title{font-size:13px;font-weight:700;color:var(--text)}
.module-desc{font-size:11px;color:var(--text-3);margin-top:3px}
.module-actions{display:flex;gap:6px;flex-wrap:wrap}
.module-progress{height:6px;border-radius:999px;background:var(--surface-3);overflow:hidden}
.module-progress > span{display:block;height:100%;background:linear-gradient(90deg,var(--brand),var(--info))}
.module-chart-wrap{margin-top:12px;padding-top:10px;border-top:1px solid var(--border)}
.module-chart-wrap .sum-name{margin-bottom:6px}
.module-inline-actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.ins-list{display:flex;flex-direction:column;gap:8px}
.ins-item{padding:9px 10px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2);font-size:12px;display:flex;justify-content:space-between;gap:8px}
.ins-act{display:flex;align-items:center;gap:8px}
.ins-pos{color:var(--success)}.ins-neg{color:var(--danger)}.ins-mid{color:var(--warn)}
.health-meta{font-size:11px;color:var(--text-3);margin:0 2px 2px}

.tl-time2{font-size:11px;color:var(--text-3);min-width:44px}

.notify-wrap{display:flex;flex-direction:column;gap:8px;padding:10px}
.notify-tools{display:flex;gap:6px;flex-wrap:wrap}
.n-chip{border:1px solid var(--border);background:var(--surface-2);color:var(--text-2);padding:4px 8px;border-radius:999px;font-size:11px;cursor:pointer}
.n-chip.on{border-color:var(--brand);color:var(--brand);background:var(--brand-soft)}
.notify-search{padding:8px 10px;border:1px solid var(--border);border-radius:10px;background:var(--surface-2);font-size:12px;color:var(--text);outline:none}
.notify-list{max-height:260px;overflow:auto;border:1px solid var(--border);border-radius:12px}
.notify-row{display:flex;gap:8px;padding:10px;border-bottom:1px solid var(--border);align-items:flex-start}
.notify-row:last-child{border-bottom:none}
.notify-row.unread{background:color-mix(in oklab,var(--brand-soft) 58%,transparent)}
.notify-k{font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:var(--text-3)}
.notify-read{margin-left:auto;background:none;border:none;color:var(--brand);font-size:11px}

.cp-head{padding:8px 12px;border-bottom:1px solid var(--border);font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em}
.cp-item.on{background:var(--brand-soft);outline:1px solid color-mix(in oklab,var(--brand) 45%,transparent)}

.widget-toolbar{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.wm-grp{display:inline-flex;align-items:center;gap:4px}
.tix-only{display:none}
.dash-widget-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:var(--s4)}
.widget-shell{animation:fadeIn .28s ease both}
.widget-shell[data-favorite="1"]{border-color:color-mix(in oklab,var(--brand) 55%,var(--border));box-shadow:0 0 0 1px color-mix(in oklab,var(--brand) 35%,transparent) inset}
.widget-shell.wg-xs{grid-column:span 2}
.widget-shell.wg-sm{grid-column:span 3}
.widget-shell.wg-md{grid-column:span 4}
.widget-shell.wg-lg{grid-column:span 6}
.widget-shell.wg-xl{grid-column:span 12}
.health-list .wid-row{padding:8px 10px}
@media(max-width:1080px){.widget-shell.wg-xs,.widget-shell.wg-sm,.widget-shell.wg-md{grid-column:span 6}.widget-shell.wg-lg,.widget-shell.wg-xl{grid-column:span 12}}
@media(max-width:760px){.dash-widget-grid{grid-template-columns:repeat(1,minmax(0,1fr))}.widget-shell.wg-xs,.widget-shell.wg-sm,.widget-shell.wg-md,.widget-shell.wg-lg,.widget-shell.wg-xl{grid-column:span 1}.dash-head-right{width:100%;justify-content:space-between}}
.ghost{opacity:.5}
.dragging{outline:2px dashed var(--brand)}

.fchips{display:none;gap:6px;padding:8px 12px;border-top:1px solid var(--border);flex-wrap:wrap;background:var(--surface-2)}
.fchips.on{display:flex}
.fchip{font-size:11px;padding:3px 8px;border-radius:999px;border:1px solid var(--brand);background:var(--brand-soft);color:var(--brand)}

.empty-ill{font-size:44px;line-height:1;margin-bottom:8px}
.empty-title{font-size:15px;font-weight:700;margin-bottom:4px}
.empty-desc{font-size:12px;color:var(--text-3);margin-bottom:10px}
.empty-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}

.tbl tbody tr:focus-visible{outline:2px solid color-mix(in oklab,var(--brand) 40%,transparent)}
.tbl th.pin,.tbl td.pin{position:sticky;left:0;background:color-mix(in oklab,var(--surface) 88%,transparent);z-index:2}

/* widgets */
.wid-list{display:flex;flex-direction:column;gap:10px}
.wid-row{display:flex;align-items:center;justify-content:space-between;padding:10px;border:1px solid var(--border);border-radius:14px;background:var(--surface-2)}
.task{display:flex;align-items:center;gap:10px}
.task input{accent-color:var(--brand)}

/* table */
.tbl-top{display:flex;align-items:center;gap:var(--s3);padding:var(--s3) var(--s4);border-bottom:1px solid var(--border);flex-wrap:wrap;position:sticky;top:0;background:var(--surface-2);z-index:4}
.tbl-srch{display:flex;align-items:center;gap:var(--s2);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r2);padding:6px var(--s3);flex:1;min-width:140px;max-width:260px}
.tbl-srch input{background:none;border:none;outline:none;color:var(--text);font-size:13px;width:100%}
.spc{flex:1}
.fc{padding:6px var(--s3);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r2);color:var(--text);font-size:13px;outline:none}
.fadv{display:none;gap:10px;align-items:center;padding:10px 12px;border-top:1px solid var(--border);background:var(--surface-2);flex-wrap:wrap}
.fadv.on{display:flex}
.tbl-w{overflow-x:auto}
.tbl{width:100%;border-collapse:collapse;font-size:13px}
.tbl th,.tbl td{padding:12px var(--s4);text-align:left}
.tbl th{background:var(--surface-2);color:var(--text-2);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;position:sticky;top:0;z-index:1;border-bottom:1px solid var(--border);white-space:nowrap;resize:horizontal;overflow:auto;min-width:72px}
.tbl th.srt{cursor:pointer}.tbl th.srt:hover{color:var(--text)}
.tbl td{border-bottom:1px solid var(--border);color:var(--text)}
.tbl tr:last-child td{border-bottom:none}
.tbl tbody tr{transition:background var(--t-fast)}.tbl tbody tr:hover{background:color-mix(in oklab,var(--surface-3) 86%,transparent)}
.tbl.compact th,.tbl.compact td{padding:8px 12px}
.tbl.compact{font-size:12px}
.tbl tbody tr.sel{background:var(--brand-soft)}
.tbl td[contenteditable="true"]{outline:1px dashed color-mix(in oklab,var(--brand) 45%,transparent);outline-offset:-4px;background:color-mix(in oklab,var(--brand-soft) 60%,transparent)}
.tbl input[type=checkbox]{accent-color:var(--brand);width:15px;height:15px;cursor:pointer}
.badge{display:inline-flex;align-items:center;gap:3px;padding:4px 10px;border-radius:var(--rf);font-size:11px;font-weight:600}
.b-aktif,.b-active,.b-lunas{background:var(--success-soft);color:var(--success)}
.b-nonaktif,.b-inactive{background:var(--surface-3);color:var(--text-3)}
.b-pending{background:var(--warn-soft);color:var(--warn)}
.b-draft{background:rgba(148,163,184,.14);color:#CBD5E1}
.b-menunggu{background:var(--warn-soft);color:var(--warn)}
.b-diproses{background:var(--info-soft);color:var(--info)}
.b-selesai{background:var(--success-soft);color:var(--success)}
.b-dibatalkan{background:var(--danger-soft);color:var(--danger)}
.b-belumlunas{background:rgba(251,191,36,.16);color:var(--warn)}
.tbl-pg{display:flex;align-items:center;justify-content:space-between;padding:var(--s3) var(--s5);border-top:1px solid var(--border);font-size:12px;color:var(--text-2);flex-wrap:wrap;gap:var(--s3)}
.pages{display:flex;gap:4px}
.pgb{width:30px;height:30px;border-radius:var(--r2);border:1px solid var(--border);background:none;color:var(--text-2);font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all var(--t-fast)}
.pgb:hover{background:var(--surface-2)}.pgb.on{background:var(--brand);color:#fff;border-color:var(--brand)}.pgb:disabled{opacity:.4;cursor:not-allowed}
.bulk{display:none;align-items:center;gap:var(--s3);background:var(--brand);color:#fff;padding:7px var(--s5);font-size:13px;font-weight:500}
.bulk.on{display:flex}
.bk-btn{background:rgba(255,255,255,.2);color:#fff;border:none;padding:4px var(--s3);border-radius:var(--r1);cursor:pointer;font-size:12px;transition:background var(--t-fast)}
.bk-btn:hover{background:rgba(255,255,255,.3)}
.ld-row td{text-align:center;padding:var(--s10);color:var(--text-3)}

/* form */
.fcard{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r3);overflow:hidden;max-width:760px;box-shadow:0 14px 30px rgba(2,6,23,.16)}
.fhd{padding:var(--s5) var(--s6);border-bottom:1px solid var(--border)}
.fbody{padding:var(--s6)}
.fg{margin-bottom:var(--s5)}
.fl{display:block;font-size:12px;font-weight:600;color:var(--text-2);margin-bottom:var(--s2);text-transform:uppercase;letter-spacing:.04em}
.fc2{width:100%;padding:9px var(--s4);background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r2);color:var(--text);font-size:13px;outline:none;transition:border-color var(--t-fast),box-shadow var(--t-fast)}
.fc2:focus{border-color:var(--brand);box-shadow:0 0 0 3px rgba(245,158,11,.2)}
.fc2.err{border-color:var(--danger)}
.fe{font-size:11px;color:var(--danger);margin-top:4px}
.fh{font-size:11px;color:var(--text-3);margin-top:4px}
.fft{padding:var(--s4) var(--s6);border-top:1px solid var(--border);display:flex;align-items:center;gap:var(--s3);flex-wrap:wrap}
.saved{font-size:12px;color:var(--success);display:flex;align-items:center;gap:4px}

/* enterprise shell */
.ws{display:flex;align-items:center;gap:var(--s2);padding:6px var(--s3);border:1px solid var(--border);border-radius:var(--r2);background:var(--surface-2);color:var(--text-2);font-size:12px}
.ws select{background:none;border:none;color:var(--text);font-size:12px;outline:none;min-width:116px}
.nav-pop{position:absolute;top:calc(100% + 8px);right:0;background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);width:300px;box-shadow:0 20px 45px rgba(2,6,23,.28);display:none;overflow:hidden}
.nav-pop.on{display:block}
.pop-hd{padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;font-weight:700;letter-spacing:.04em;color:var(--text-2);text-transform:uppercase}
.pop-row{padding:10px 12px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:flex-start}
.pop-row:last-child{border-bottom:none}
.pop-row:hover{background:var(--surface-2)}
.pop-ic{width:26px;height:26px;border-radius:var(--rf);display:flex;align-items:center;justify-content:center;background:var(--brand-soft);color:var(--brand);font-size:12px;flex-shrink:0}
.pop-t{font-size:12px;color:var(--text)}
.pop-d{font-size:11px;color:var(--text-3)}
.nav-usr-wrap{position:relative}
.usr-menu{position:absolute;top:calc(100% + 8px);right:0;width:220px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r3);box-shadow:0 20px 45px rgba(2,6,23,.28);display:none;overflow:hidden}
.usr-menu.on{display:block}
.usr-it{padding:10px 12px;font-size:13px;color:var(--text);cursor:pointer;display:flex;align-items:center;gap:8px}
.usr-it:hover{background:var(--surface-2)}

/* crud enhancements */
.tbl-tools{position:relative}
.cmenu{position:absolute;right:0;top:calc(100% + 6px);min-width:180px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r2);box-shadow:0 16px 35px rgba(2,6,23,.24);padding:6px;display:none;z-index:30}
.cmenu.on{display:block}
.cm-it{display:flex;align-items:center;gap:8px;padding:7px 8px;font-size:12px;color:var(--text);border-radius:var(--r1)}
.cm-it:hover{background:var(--surface-2)}
.cm-it input{accent-color:var(--brand)}
.row-actions{display:flex;gap:8px;align-items:center;position:relative}
.avt{width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#14b8a6,#0ea5e9);color:#fff;font-size:11px;font-weight:700;margin-right:8px}
.rmenu{position:absolute;right:0;top:calc(100% + 4px);min-width:120px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 26px rgba(2,6,23,.2);display:none;z-index:20}
.rmenu.on{display:block}
.rmi{display:block;width:100%;text-align:left;padding:8px 10px;background:none;border:none;color:var(--text);font-size:12px}
.rmi:hover{background:var(--surface-2)}

/* drawer detail */
.draw{position:fixed;top:0;right:-420px;width:400px;max-width:calc(100vw - 12px);height:100vh;background:var(--surface);border-left:1px solid var(--border);z-index:260;transition:right var(--t-slow);box-shadow:-20px 0 44px rgba(2,6,23,.25);display:flex;flex-direction:column}
.draw.on{right:0}
.draw-hd{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.draw-bd{padding:16px;display:flex;flex-direction:column;gap:12px;overflow:auto}
.kv{padding:10px;border:1px solid var(--border);border-radius:var(--r2);background:var(--surface-2)}
.kv-k{font-size:11px;color:var(--text-3);text-transform:uppercase;letter-spacing:.04em}
.kv-v{font-size:13px;color:var(--text);margin-top:3px;word-break:break-word}

/* form sections */
.sect{padding:12px;border:1px solid var(--border);border-radius:var(--r2);background:linear-gradient(180deg,var(--surface),var(--surface-2));margin-bottom:14px}
.sect-title{font-family:var(--font-display);font-size:13px;font-weight:700;margin-bottom:10px}
.auto{font-size:12px;color:var(--text-3)}
.auto.saving{color:var(--warn)}
.auto.ok{color:var(--success)}
.valsum{display:none;border:1px solid var(--danger);background:var(--danger-soft);color:var(--danger);border-radius:12px;padding:10px 12px;font-size:12px;margin-bottom:12px}
.valsum.on{display:block}

.stepper{display:flex;gap:8px;margin-bottom:14px}
.stp{flex:1;padding:8px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2);font-size:12px;color:var(--text-2);text-align:center}
.stp.on{border-color:var(--brand);color:var(--brand);font-weight:700}

.sk{height:12px;border-radius:10px;background:linear-gradient(90deg,var(--surface-2),var(--surface-3),var(--surface-2));background-size:200% 100%;animation:sk 1.3s infinite}
.sk-lg{height:30px;border-radius:12px}
@keyframes sk{0%{background-position:0% 50%}100%{background-position:200% 50%}}

/* command palette */
.cpv{position:fixed;inset:0;background:rgba(2,6,23,.45);backdrop-filter:blur(2px);z-index:380;display:none;align-items:flex-start;justify-content:center;padding-top:8vh}
.cpv.on{display:flex}
.cp{width:min(700px,94vw);background:var(--surface-2);border:1px solid var(--border);border-radius:18px;box-shadow:0 24px 60px rgba(2,6,23,.35);overflow:hidden}
.cp-in{display:flex;align-items:center;gap:10px;padding:12px;border-bottom:1px solid var(--border)}
.cp-in input{width:100%;border:none;background:none;color:var(--text);font-size:14px;outline:none}
.cp-list{max-height:42vh;overflow:auto}
.cp-item{padding:11px 12px;display:flex;align-items:center;justify-content:space-between;cursor:pointer}
.cp-item:hover{background:var(--surface-2)}

.overlay{position:absolute;inset:0;display:none;align-items:center;justify-content:center;background:rgba(2,6,23,.35);backdrop-filter:blur(2px);z-index:4}
.overlay.on{display:flex}
.ov-card{display:flex;align-items:center;gap:10px;background:var(--surface);padding:10px 14px;border:1px solid var(--border);border-radius:12px;box-shadow:0 14px 28px rgba(2,6,23,.25)}
.prog{width:140px;height:6px;border-radius:999px;background:var(--surface-3);overflow:hidden}
.prog > span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--brand),var(--accent-indigo));transition:width .24s ease}

.wig-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:var(--s4)}
@media(max-width:980px){.wig-grid-2{grid-template-columns:1fr}}
@media(max-width:980px){.intel-grid{grid-template-columns:1fr}}

@keyframes spin{to{transform:rotate(360deg)}}

/* motion */
.view.on{animation:fadeIn .22s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}

/* modal */
.mov{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:200;opacity:0;pointer-events:none;transition:opacity var(--t-base)}
.mov.on{opacity:1;pointer-events:all}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:var(--r4);padding:var(--s6);width:400px;max-width:calc(100vw - 32px);transform:scale(.96);transition:transform var(--t-base)}
.mov.on .modal{transform:scale(1)}
.m-title{font-size:16px;font-weight:700;margin-bottom:var(--s2)}
.m-desc{font-size:13px;color:var(--text-2);margin-bottom:var(--s6)}
.m-ft{display:flex;gap:var(--s3);justify-content:flex-end}

/* toast */
#toasts{position:fixed;bottom:var(--s6);right:var(--s6);display:flex;flex-direction:column;gap:var(--s3);z-index:300}
.toast{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r3);padding:10px var(--s3);box-shadow:0 10px 28px rgba(2,6,23,.28);font-size:13px;display:flex;align-items:center;gap:var(--s3);min-width:280px;animation:tin .18s ease}
.toast.ok{border-left:3px solid var(--success)}.toast.er{border-left:3px solid var(--danger)}

#sidebar.col .sb-item[title]{position:relative}
#sidebar.col .sb-item[title]:hover::after{content:attr(title);position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);padding:6px 10px;border-radius:8px;background:#0b1220;border:1px solid var(--border);color:var(--text);font-size:12px;white-space:nowrap;box-shadow:0 10px 24px rgba(2,6,23,.3)}

.density-toggle.on{background:var(--brand-soft)!important;color:var(--brand)!important;border-color:color-mix(in oklab,var(--brand) 55%,var(--border))!important}
@keyframes tin{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

/* back */
.back{display:inline-flex;align-items:center;gap:var(--s2);color:var(--text-2);font-size:13px;cursor:pointer;margin-bottom:var(--s4);transition:color var(--t-fast)}
.back:hover{color:var(--text)}

/* utils */
.mu{color:var(--text-3)}.xs{font-size:11px}.sm{font-size:12px}.sb{font-weight:600}
.flex{display:flex}.ic{align-items:center}.gap2{gap:var(--s2)}
.skip-nav{position:absolute;left:-999px;top:0;padding:8px 12px;background:var(--surface);color:var(--text);z-index:999}
.skip-nav:focus{left:12px;top:10px;border:1px solid var(--border);border-radius:8px}
.w-ic{display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;margin-right:6px;color:var(--text-2)}
.w-ic svg{width:16px;height:16px;display:block}
.mw-none{max-width:none}
.mb-8{margin-bottom:8px}
.mt-10{margin-top:10px}
.pos-rel{position:relative}
.ml-8{margin-left:8px}
.nav-user-name{font-size:13px;font-weight:500}
.grow{flex:1}
.req{color:var(--danger)}
.hidden{display:none}
.mb0{margin-bottom:0}
.w-40{width:40px}
.w-140{width:140px}

@media(max-width:1100px){.nav-srch{display:none}.ws{display:none}}
@media(max-width:768px){#sidebar{left:0;top:0;height:100vh;border-radius:0;transform:translateX(-100%)}#sidebar.mob{transform:none}#wrap{margin-left:0!important}.kpi-grid{grid-template-columns:1fr 1fr}.draw{width:100%}.cpv{padding-top:4vh}#navbar{top:0;margin:0;border-radius:0}}
@media(max-width:680px){
  .tbl thead{display:none}
  .tbl,.tbl tbody,.tbl tr,.tbl td{display:block;width:100%}
  .tbl tr{border-bottom:1px solid var(--border);padding:8px 0}
  .tbl td{border:none;padding:6px var(--s4)}
  .tbl td::before{content:attr(data-label);display:block;color:var(--text-3);font-size:10px;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}
}
@media(max-width:580px){.kpi-grid{grid-template-columns:1fr}.nav-usr span{display:none}.fbody{padding:14px}.fft{padding:12px}#content{padding:14px}.sb-logo{padding:0 14px}}
</style>
</head>
<body>
<a href="#content" class="skip-nav">Lewati ke konten utama</a>

<nav id="sidebar" class="ds-sidebar" aria-label="Sidebar Navigation">
  <div class="sb-logo">
    <div class="sb-logo-ic">SE</div>
    <div><div class="sb-logo-n">SATSET ERP</div><div class="sb-logo-s">Wisata Management</div></div>
  </div>
  <div class="sb-nav">
    <div class="fav-wrap" aria-label="Menu Favorit">
      <div class="fav-hd"><span>Favorit</span><span>★</span></div>
      <div class="tbl-srch mw-none mb-8"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg><input id="side-search" placeholder="Cari menu cepat..." oninput="fltSideMenu(this.value)"/></div>
      <div class="fav-list">
        <button class="fav-chip" onclick="gt('list','reservasi')" aria-label="Buka favorit reservasi">Reservasi <span class="badge b-pending">12</span></button>
        <button class="fav-chip" onclick="gt('list','pembayaran')" aria-label="Buka favorit pembayaran">Pembayaran <span class="badge b-active">8</span></button>
        <button class="fav-chip" onclick="gt('list','jurnal')" aria-label="Buka favorit jurnal">Jurnal <span class="badge b-draft">4</span></button>
      </div>
      <div class="fav-hd mt-10"><span>Terakhir Dibuka</span><span>⟳</span></div>
      <div class="fav-list">
        <button class="fav-chip" onclick="openRecent('customer')">Pelanggan</button>
        <button class="fav-chip" onclick="openRecent('supplier')">Pemasok</button>
        <button class="fav-chip" onclick="openRecent('barang')">Barang</button>
      </div>
      <div class="fav-hd mt-10"><span>Pin Favorit</span><span>📌</span></div>
      <div class="fav-list">
        <button class="fav-chip" onclick="pinFavorite('reservasi')">Reservasi</button>
        <button class="fav-chip" onclick="pinFavorite('laporan')">Laporan</button>
      </div>
    </div>
    <div class="sb-item active" data-nav="dashboard" onclick="gt('dashboard')" tabindex="0" role="button" aria-label="Dashboard">
      <svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>
      <span class="lbl">Dashboard</span>
    </div>
    <div class="sb-lbl">Operasional</div>
    <div class="sb-item" data-nav="ticketing" onclick="gt('list','ticketing')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 100 4v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2a2 2 0 100-4V6z"/></svg><span class="lbl">Ticketing</span></div>
    <div class="sb-item" data-nav="reservasi" onclick="gt('list','reservasi')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/></svg><span class="lbl">Booking</span></div>
    <div class="sb-item" data-nav="cafe" onclick="gt('list','cafe')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4h11v8a4 4 0 01-4 4H7a4 4 0 01-4-4V4zm12 2h1a2 2 0 110 4h-1V6z"/></svg><span class="lbl">Cafe POS</span></div>
    <div class="sb-item" data-nav="outbound" onclick="gt('list','outbound')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 15l4-10 4 6 4-4v8H4z"/></svg><span class="lbl">Outbound</span></div>
    <div class="sb-lbl">Keuangan</div>
    <div class="sb-item" data-nav="finance" onclick="gt('list','finance')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"/></svg><span class="lbl">Finance</span></div>
    <div class="sb-item" data-nav="accounting" onclick="gt('list','accounting')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg><span class="lbl">Accounting</span></div>
    <div class="sb-lbl">Laporan</div>
    <div class="sb-item" data-nav="laporan" onclick="gt('report')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">ERP Wisata</span></div>
    <div class="sb-item" data-nav="ticketing" onclick="gt('list','ticketing')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Ticket</span></div>
    <div class="sb-item" data-nav="reservasi" onclick="gt('list','reservasi')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Booking</span></div>
    <div class="sb-item" data-nav="cafe" onclick="gt('list','cafe')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Cafe</span></div>
    <div class="sb-item" data-nav="outbound" onclick="gt('list','outbound')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Outbound</span></div>
    <div class="sb-item" data-nav="finance" onclick="gt('list','finance')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3h12v14H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Finance</span></div>
    <div class="sb-lbl">Master Data</div>
    <div class="sb-item" data-nav="ticketing" onclick="gt('list','ticketing')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/></svg><span class="lbl">Tarif</span></div>
    <div class="sb-item" data-nav="paket-wisata" onclick="gt('list','paket-wisata')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fill-rule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clip-rule="evenodd"/></svg><span class="lbl">Paket</span></div>
    <div class="sb-item" data-nav="supplier" onclick="gt('list','supplier')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v12H4zM6 6h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Supplier</span></div>
    <div class="sb-item" data-nav="purchase-order" onclick="gt('list','purchase-order')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h10l2 3v11H3V6l2-3zm1 5h8v2H6zm0 4h8v2H6z"/></svg><span class="lbl">Purchasing</span></div>
    <div class="sb-item" data-nav="stock-movement" onclick="gt('list','stock-movement')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M4 15h12v2H4zm1-3l3-3 2 2 4-5 1 1-5 6-2-2-2 2z"/></svg><span class="lbl">Stock Movement</span></div>
    <div class="sb-item" data-nav="menu-category" onclick="gt('list','menu-category')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4h14v3H3zM3 9h14v3H3zM3 14h14v3H3z"/></svg><span class="lbl">Menu Category</span></div>
    <div class="sb-item" data-nav="menu-item" onclick="gt('list','menu-item')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2h8l1 6H5l1-6zm-1 8h10v8H5v-8z"/></svg><span class="lbl">Menu Item</span></div>
    <div class="sb-item" data-nav="inventory" onclick="gt('list','inventory')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M3 5l7-3 7 3-7 3-7-3zm0 3l7 3 7-3v7l-7 3-7-3V8z"/></svg><span class="lbl">Inventory</span></div>
    <div class="sb-item" data-nav="cafe" onclick="gt('list','cafe')"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4h11v8a4 4 0 01-4 4H7a4 4 0 01-4-4V4zm12 2h1a2 2 0 110 4h-1V6z"/></svg><span class="lbl">Menu</span></div>
    <div class="sb-item" data-nav="outbound" onclick="openOutboundEquipment()"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path d="M3 5l7-3 7 3-7 3-7-3zm0 3l7 3 7-3v7l-7 3-7-3V8z"/></svg><span class="lbl">Peralatan</span></div>
    <div class="sb-item" data-nav="outbound" onclick="openOutboundInstructor()"><svg class="ic" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg><span class="lbl">Instruktur</span></div>
  </div>
  <div class="sb-foot">
    <div class="sb-user"><div class="sb-av">AD</div><div class="sb-ui"><div class="sb-un">Administrator</div><div class="sb-ur">Super Admin</div></div></div>
  </div>
</nav>

<div id="wrap" class="ds-app-shell-wrap">
  <header id="navbar" class="ds-topbar" role="banner">
    <button class="nav-tog" onclick="tSB()" aria-label="Toggle Sidebar">
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>
    </button>
    <nav id="bc"><span class="cr now">Beranda</span></nav>
    <div class="ws">
      <span>Workspace</span>
      <select id="workspace" onchange="setWorkspace(this.value)">
        <option value="erp-wisata">ERP Wisata</option>
        <option value="satset-core">SATSET Core</option>
        <option value="corporate">Corporate</option>
      </select>
    </div>
    <div class="nav-srch" aria-label="Cari Global">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg>
      <input id="g-search" placeholder="Cari menu, pelanggan, transaksi, laporan..." onfocus="openCmd()" aria-label="Cari"/>
      <span class="kbd">Ctrl+K</span>
    </div>
    <button class="btn btn-o btn-sm" onclick="toggleQuickCreate(event)">+ Buat Cepat</button>
    <div class="tbl-tools">
      <div class="cmenu" id="qc-menu">
        <button class="rmi" onclick="gt('form','destinasi')">Destinasi</button>
        <button class="rmi" onclick="gt('form','reservasi')">Reservasi</button>
        <button class="rmi" onclick="gt('form','hotel')">Hotel</button>
      </div>
    </div>
    <button class="nav-btn" onclick="tDark()" title="Ubah tema" aria-label="Tema">
      <svg id="dkic" width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
    </button>
    <div class="pos-rel">
    <button class="nav-btn" title="Notifikasi" onclick="toggleNotif(event)" aria-label="Buka Notifikasi">
      <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
      <span class="nav-dot"></span>
    </button>
    <div class="nav-pop" id="notif-pop">
      <div class="pop-hd">Pusat Notifikasi <span id="notif-unread" class="badge b-pending ml-8">0</span></div>
      <div class="notify-wrap">
        <input id="notif-search" class="notify-search" placeholder="Cari notifikasi..." oninput="renderNotif()" aria-label="Cari Notifikasi"/>
        <div class="notify-tools" id="notif-cats">
          <button class="n-chip on" data-cat="all" onclick="setNotifCat('all')">Semua</button>
          <button class="n-chip" data-cat="success" onclick="setNotifCat('success')">Berhasil</button>
          <button class="n-chip" data-cat="warning" onclick="setNotifCat('warning')">Peringatan</button>
          <button class="n-chip" data-cat="info" onclick="setNotifCat('info')">Informasi</button>
          <button class="n-chip" data-cat="error" onclick="setNotifCat('error')">Terjadi Kesalahan</button>
          <button class="n-chip" data-cat="support" onclick="setNotifCat('support')">Dukungan</button>
        </div>
        <div class="notify-tools"><button class="btn btn-o btn-sm" onclick="markAllNotif()">Tandai Semua Dibaca</button></div>
        <div class="notify-list" id="notif-list"></div>
      </div>
    </div>
    </div>
    <div class="nav-usr-wrap" aria-label="User Menu">
      <div class="nav-usr" onclick="toggleUserMenu(event)"><div class="nav-av">AD</div><span class="nav-user-name">Admin</span><svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/></svg></div>
      <div class="usr-menu" id="usr-menu">
        <div class="usr-it">Profil</div>
        <div class="usr-it">Pengaturan</div>
        <div class="usr-it" onclick="tDark()">Tema</div>
        <div class="usr-it">Keluar</div>
      </div>
    </div>
  </header>

  <main id="content" class="ds-page-content">
    <!-- DASHBOARD -->
    ${dashboardSectionMarkup}
    ${mobileDashboardSectionMarkup}

    <!-- LIST -->
    <section class="view" id="v-list">
      <div class="back" onclick="gt('dashboard')">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg>
        Beranda
      </div>
      <div class="ph">
        <div><div class="ph-title" id="lt">Data</div><div class="ph-sub" id="ls">Kelola data</div></div>
        <button class="btn btn-p" id="btn-add"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/></svg> Tambah</button>
      </div>
        <div class="card">
          <div class="card-hd"><div class="card-title" id="module-panel-title">Workspace Modul</div><span class="badge b-active" id="module-panel-badge">Live</span></div>
          <div class="card-body">
            <div class="intel-summary" id="module-showcase"></div>
            <div class="module-inline-actions" id="module-inline-actions"></div>
            <div class="module-board" id="module-workspace"></div>
            <div class="module-chart-wrap">
              <div class="sum-name">Trend Aktivitas Modul</div>
              <svg id="module-mini-chart" class="chart" height="160" viewBox="0 0 560 160" preserveAspectRatio="xMidYMid meet"></svg>
            </div>
          </div>
        </div>
      <div class="card">
        <div class="bulk" id="bk"><span id="bk-c">0 dipilih</span><button id="bk-del" class="bk-btn" onclick="bulkDel()">🗑 Hapus</button><span class="grow"></span><button class="bk-btn" onclick="clrSel()">✕ Batal</button></div>
        <div class="tbl-top">
          <div class="tbl-srch"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg><input id="sinp" placeholder="Cari nama…" oninput="flt()"/></div>
          <select id="sst" class="fc" onchange="flt()"><option value="">Semua Status</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option></select>
          <div class="spc"></div>
          <button id="btn-exp-csv" class="btn btn-o btn-sm" onclick="expCSV()"><svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/></svg> CSV</button>
          <button id="btn-exp-xls" class="btn btn-o btn-sm" onclick="expXLS()">Excel</button>
          <button id="btn-import" class="btn btn-o btn-sm" onclick="triggerImport()">Impor CSV</button>
          <button id="btn-ticket-sale" class="btn btn-o btn-sm tix-only" onclick="quickTicketSale()">Jual Tiket</button>
          <button id="btn-ticket-scan" class="btn btn-o btn-sm tix-only" onclick="openTicketScanner()">Scan Tiket</button>
          <button id="btn-ticket-report-sale" class="btn btn-o btn-sm tix-only" onclick="exportTicketReport('penjualan')">Laporan Penjualan</button>
          <button id="btn-ticket-report-usage" class="btn btn-o btn-sm tix-only" onclick="exportTicketReport('penggunaan')">Laporan Penggunaan</button>
          <button id="btn-ticket-report-refund" class="btn btn-o btn-sm tix-only" onclick="exportTicketReport('refund')">Laporan Refund</button>
          <button id="btn-ticket-report-void" class="btn btn-o btn-sm tix-only" onclick="exportTicketReport('void')">Laporan Void</button>
          <button id="btn-density" class="btn btn-o btn-sm density-toggle" onclick="toggleDensity()">Kepadatan</button>
          <button class="btn btn-o btn-sm" onclick="toggleAdvFilter()">Filter Lanjutan</button>
          <button class="btn btn-o btn-sm" onclick="saveFilter()">Simpan Filter</button>
          <button class="btn btn-o btn-sm" onclick="loadFilter()">Terapkan Filter</button>
          <div class="tbl-tools">
            <button class="btn btn-o btn-sm" onclick="toggleColMenu(event)">Kolom</button>
            <div class="cmenu" id="col-menu">
              <label class="cm-it"><input type="checkbox" checked onchange="toggleColumn('id',this.checked)"/>ID</label>
              <label class="cm-it"><input type="checkbox" checked onchange="toggleColumn('name',this.checked)"/>Nama</label>
              <label class="cm-it"><input type="checkbox" checked onchange="toggleColumn('status',this.checked)"/>Status</label>
              <button class="rmi" onclick="reorderCols()">Urutkan Ulang Kolom</button>
            </div>
          </div>
          <button class="btn btn-o btn-sm" onclick="rld()">↻</button>
        </div>
        <div class="fadv" id="fadv">
          <select id="sf-status" class="fc" onchange="flt()"><option value="">Status: Semua</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option></select>
          <select id="sf-sort" class="fc" onchange="advSort(this.value)"><option value="">Urutan Default</option><option value="name-asc">Nama A-Z</option><option value="name-desc">Nama Z-A</option><option value="status-asc">Status A-Z</option></select>
          <button class="btn btn-o btn-sm" onclick="resetAdvFilter()">Reset</button>
        </div>
        <div class="fchips" id="fchips"></div>
        <div class="tbl-w">
          <table class="tbl" id="grid-main" aria-label="Data Grid">
            <thead><tr>
              <th class="pin w-40"><input type="checkbox" id="chkA" onchange="tAll(this.checked)"/></th>
              <th class="h-id pin" data-col="id">ID</th>
              <th class="srt h-name" data-col="name" onclick="sBy('name', event)">Nama <span id="si-name"></span></th>
              <th class="srt h-status" data-col="status" onclick="sBy('status', event)">Status <span id="si-status"></span></th>
              <th class="w-140">Aksi</th>
            </tr></thead>
            <tbody id="tbody"><tr class="ld-row"><td colspan="5"><div class="sk sk-lg"></div><div class="sk mt-10"></div></td></tr></tbody>
          </table>
        </div>
        <div class="tbl-pg"><span id="pgi">0 data</span><div class="pages" id="pgp"></div></div>
      </div>
    </section>

    <!-- REPORT -->
    <section class="view" id="v-report">
      <div class="back" onclick="gt('dashboard')"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg> Beranda</div>
      <div class="ph">
        <div><div class="ph-title">Laporan ERP Wisata</div><div class="ph-sub">Ringkasan operasional, financial, dan reservation dari API.</div></div>
      </div>
      <div class="card">
        <div class="card-hd"><div class="card-title">Filter Periode</div><span class="badge b-active">Live API</span></div>
        <div class="card-body">
          <div class="form-grid" style="grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;align-items:end;">
            <div><label>Dari Tanggal</label><input id="report-from" type="date"/></div>
            <div><label>Sampai Tanggal</label><input id="report-to" type="date"/></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
              <button class="btn btn-o" id="report-reset" type="button">Reset</button>
              <button class="btn btn-p" id="report-load" type="button">Muat Laporan</button>
            </div>
          </div>
          <div id="report-state" class="mt-10"></div>
        </div>
      </div>
      <div class="grid grid-3" id="report-sections">
        <article class="card">
          <h3 style="margin-bottom:10px;">Operational</h3>
          <pre id="report-operational" style="white-space:pre-wrap;font:12px/1.4 monospace;">-</pre>
        </article>
        <article class="card">
          <h3 style="margin-bottom:10px;">Financial</h3>
          <pre id="report-financial" style="white-space:pre-wrap;font:12px/1.4 monospace;">-</pre>
        </article>
        <article class="card">
          <h3 style="margin-bottom:10px;">Reservation</h3>
          <pre id="report-reservation" style="white-space:pre-wrap;font:12px/1.4 monospace;">-</pre>
        </article>
      </div>
      <div class="card" id="report-empty" style="display:none;">
        <div class="empty-ill">🧭</div>
        <div class="empty-title">Data Laporan Belum Tersedia</div>
        <div class="empty-desc">Tidak ada nilai report pada periode yang dipilih.</div>
      </div>
    </section>

    <!-- FORM -->
    <section class="view" id="v-form">
      <div class="back" id="fbk"><svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/></svg> Kembali</div>
      <div class="fcard">
        <div class="fhd"><div class="ph-title" id="ftitle">Tambah</div><div class="ph-sub" id="fsub">Isi form dengan benar</div></div>
        <div class="fbody">
          <div class="valsum" id="valsum">Periksa kembali field wajib sebelum menyimpan.</div>
          <div class="stepper" aria-label="Tahapan Form"><div class="stp on" id="stp-main">1. Informasi</div><div class="stp" id="stp-extra">2. Detail</div><div class="stp" id="stp-review">3. Tinjau</div></div>
          <div class="sect">
            <div class="sect-title">Informasi Utama</div>
            <div class="fg"><label class="fl">Nama <span class="req">*</span></label><input class="fc2" id="fn" placeholder="Masukkan nama…"/><div class="fe" id="fne"></div></div>
            <div class="fg"><label class="fl">Status</label><select class="fc2" id="fst"><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option></select></div>
          </div>
          <div class="sect hidden" id="fkg"><div class="sect-title">Keterangan Tambahan</div><div class="fg mb0"><label class="fl">Keterangan</label><textarea class="fc2" id="fket" rows="3" placeholder="Keterangan tambahan…"></textarea><div class="fh">Opsional</div></div></div>
        </div>
        <div class="fft">
          <button class="btn btn-p" id="bsave" onclick="subForm()"><span id="slbl">Simpan</span></button>
          <button class="btn btn-o" id="bcancel">Batal</button>
          <div class="auto" id="auto-state">Simpan Otomatis nonaktif</div>
          <div class="saved hidden" id="savedmsg"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg> Tersimpan</div>
        </div>
      </div>
      <div class="overlay" id="f-overlay" aria-live="polite">
        <div class="ov-card">
          <div class="ds-spinner"></div>
          <div>
            <div class="sm sb">Menyimpan...</div>
            <div class="prog"><span id="f-prog"></span></div>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>

<div class="mov" id="dmod"><div class="modal"><div class="m-title">Hapus Data</div><div class="m-desc">Yakin hapus data ini? Tidak dapat dibatalkan.</div><div class="m-ft"><button class="btn btn-o" onclick="cMod()">Batal</button><button class="btn btn-d" onclick="cfDel()">Hapus</button></div></div></div>
<aside class="draw" id="detail-drawer">
  <div class="draw-hd"><div><div class="sb" id="dr-title">Detail</div><div class="xs mu" id="dr-sub">Detail Baris</div></div><button class="btn btn-o btn-sm" onclick="closeDrawer()">Tutup</button></div>
  <div class="draw-bd">
    <div class="kv"><div class="kv-k">ID</div><div class="kv-v" id="dr-id">-</div></div>
    <div class="kv"><div class="kv-k">Nama</div><div class="kv-v" id="dr-name">-</div></div>
    <div class="kv"><div class="kv-k">Status</div><div class="kv-v" id="dr-status">-</div></div>
  </div>
</aside>
<div class="cpv" id="cmd-pal" role="dialog" aria-modal="true" aria-label="Palet Perintah">
  <div class="cp">
    <div class="cp-in"><svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/></svg><input id="cmd-in" placeholder="Cari menu, pelanggan, transaksi, laporan..." oninput="fltCmd(this.value)"/></div>
    <div class="cp-head" id="cp-head">Saran</div>
    <div class="cp-list" id="cmd-list"></div>
  </div>
</div>
<div id="toasts"></div>
<input id="imp-file" type="file" accept=".csv" class="hidden" onchange="handleImportFile(this.files)"/>

<script>
${buildDataLayerScript(api)}
</script>
<script>
var API='${api}',LABELS=${masterLabels};
var ENT=${masterEntityKeys},ent='destinasi',allR=[],fltR=[],pg=1,PS=10,sk='',sa=true,eId=null,dId=null,sel=new Set(),dldd=false,autoTimer=null,isDirty=false,inlineEditing=true,activeEditRow=null;
var DataLayer=window.__satsetData;
var EL={};
function byId(id){if(!EL[id])EL[id]=document.getElementById(id);return EL[id]}
var visCols={id:true,name:true,status:true};
var colOrder='default';
var sortStack=[];
var notifCat='all';
var cmdItems=[];
var cmdIdx=-1;
var recentSearches=JSON.parse(localStorage.getItem('satset-recent-search')||'[]');
var widgetCfg=JSON.parse(localStorage.getItem('satset-widget-config')||'{}');
var customizing=false;
var vrt={enabled:true,rowH:46,viewport:12};
var TIMELINE=[
  {h:'09:20',t:'Reservasi dibuat',ic:'RS',at:Date.now()-1000*60*7},
  {h:'09:25',t:'Invoice diterbitkan',ic:'IV',at:Date.now()-1000*60*16},
  {h:'09:30',t:'Pembayaran diterima',ic:'BY',at:Date.now()-1000*60*22},
  {h:'09:40',t:'Hotel diperbarui',ic:'HT',at:Date.now()-1000*60*35}
];
var NOTIFS=[
  {id:'n1',cat:'success',title:'Pembayaran diterima',desc:'Tagihan #INV-0244 telah dibayar',at:Date.now()-1000*60*3,unread:true},
  {id:'n2',cat:'warning',title:'Reservasi menunggu konfirmasi',desc:'3 reservasi butuh verifikasi',at:Date.now()-1000*60*12,unread:true},
  {id:'n3',cat:'info',title:'Guide tersedia',desc:'12 guide siap bertugas hari ini',at:Date.now()-1000*60*35,unread:false},
  {id:'n4',cat:'error',title:'Koneksi ERP API terganggu',desc:'Terjadi timeout pada endpoint pembayaran',at:Date.now()-1000*60*58,unread:true},
  {id:'n5',cat:'support',title:'Tiket dukungan dibalas',desc:'Tim dukungan menanggapi isu ekspor',at:Date.now()-1000*60*120,unread:false}
];
var CMD=[
  {n:'Beranda',a:function(){gt('dashboard')}},
  {n:'Lihat Destinasi',a:function(){gt('list','destinasi')}},
  {n:'Lihat Reservasi',a:function(){gt('list','reservasi')}},
  {n:'Tambah Hotel',a:function(){gt('form','hotel')}},
  {n:'Tema',a:function(){tDark()}},
  {n:'Muat Ulang Data',a:function(){rld()}}
];
var SEARCH_POOL=${masterSearchPool};
var EMAP=${masterEntityConfigMap};
var ETOOL=${masterToolbarMap};
var DASH_WIDGET_META=${dashboardWidgetMetadata};
var DASH_RUNTIME=${dashboardRuntimeConfig};
var DASH_LAYOUT=${dashboardLayoutMetadata};
var DASH_ROLE_GROUPS=${dashboardRoleAccessMetadata};
var TICKET_TARIFF=${ticketTariffConfig};
var TICKET_STATUS=${ticketStatusConfig};
var TICKET_PAYMENT=${ticketPaymentConfig};
var BOOKING_STATUS=${bookingStatusConfig};
var ACCOUNTING_CHART_SEED=${accountingChartConfig};
var ACCOUNTING_JOURNAL_TYPES=${accountingJournalTypeConfig};
var CAFE_ORDER_STATUS=${cafeOrderStatusConfig};
var CAFE_PAYMENT=${cafePaymentConfig};
var CAFE_KITCHEN_STATUS=${cafeKitchenStatusConfig};
var CAFE_MENU_SEED=${cafeMenuConfig};
var CAFE_FINANCE=${cafeFinancialConfig};
var FINANCE_TRANSACTION=${financeTransactionConfig};
var FINANCE_PAYMENT=${financePaymentConfig};
var FINANCE_CASH_SEED=${financeCashConfig};
var FINANCE_BANK_SEED=${financeBankConfig};
var OUTBOUND_STATUS=${outboundStatusConfig};
var OUTBOUND_PAYMENT=${outboundPaymentConfig};
var OUTBOUND_PACKAGE_SEED=${outboundPackageConfig};
var OUTBOUND_INSTRUCTOR_SEED=${outboundInstructorConfig};
var OUTBOUND_EQUIPMENT_SEED=${outboundEquipmentConfig};
var AUD=[];
var denseMode=false;
var activeTheme=localStorage.getItem('satset-theme-mode')||'dark';
var ticketScanHistory=JSON.parse(localStorage.getItem('satset-ticket-scan-history')||'[]');
var checkInQueue=JSON.parse(localStorage.getItem('satset-checkin-queue')||'[]');
var bookingCounter=JSON.parse(localStorage.getItem('satset-booking-counter')||'{}');
var reportState={from:'',to:'',loading:false,data:null,error:'',bound:false};
var accountingJournals=JSON.parse(localStorage.getItem('satset-accounting-journals')||'[]');
var accountingClosings=JSON.parse(localStorage.getItem('satset-accounting-closing')||'[]');
var cafeOrders=JSON.parse(localStorage.getItem('satset-cafe-orders')||'[]');
var cafeShifts=JSON.parse(localStorage.getItem('satset-cafe-shifts')||'[]');
var cafeJournals=JSON.parse(localStorage.getItem('satset-cafe-journal')||'[]');
var financeTransactions=JSON.parse(localStorage.getItem('satset-finance-transactions')||'[]');
var outboundRecords=JSON.parse(localStorage.getItem('satset-outbound-records')||'[]');
var outboundJournals=JSON.parse(localStorage.getItem('satset-outbound-journal')||'[]');
var outboundScanHistory=JSON.parse(localStorage.getItem('satset-outbound-scan-history')||'[]');
var cafeMenus=(function(){
  try{
    var raw=localStorage.getItem('satset-cafe-menus');
    if(raw){return JSON.parse(raw)||[]}
  }catch(_e){}
  localStorage.setItem('satset-cafe-menus',JSON.stringify(CAFE_MENU_SEED||[]));
  return (CAFE_MENU_SEED||[]).slice();
})();
var financeCashAccounts=(function(){
  try{var raw=localStorage.getItem('satset-finance-cash');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-finance-cash',JSON.stringify(FINANCE_CASH_SEED||[]));
  return (FINANCE_CASH_SEED||[]).slice();
})();
var financeBankAccounts=(function(){
  try{var raw=localStorage.getItem('satset-finance-bank');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-finance-bank',JSON.stringify(FINANCE_BANK_SEED||[]));
  return (FINANCE_BANK_SEED||[]).slice();
})();
var accountingChart=(function(){
  try{var raw=localStorage.getItem('satset-accounting-coa');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-accounting-coa',JSON.stringify(ACCOUNTING_CHART_SEED||[]));
  return (ACCOUNTING_CHART_SEED||[]).slice();
})();
var outboundPackages=(function(){
  try{var raw=localStorage.getItem('satset-outbound-packages');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-outbound-packages',JSON.stringify(OUTBOUND_PACKAGE_SEED||[]));
  return (OUTBOUND_PACKAGE_SEED||[]).slice();
})();
var outboundInstructors=(function(){
  try{var raw=localStorage.getItem('satset-outbound-instructors');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-outbound-instructors',JSON.stringify(OUTBOUND_INSTRUCTOR_SEED||[]));
  return (OUTBOUND_INSTRUCTOR_SEED||[]).slice();
})();
var outboundEquipment=(function(){
  try{var raw=localStorage.getItem('satset-outbound-equipment');if(raw){return JSON.parse(raw)||[]}}catch(_e){}
  localStorage.setItem('satset-outbound-equipment',JSON.stringify(OUTBOUND_EQUIPMENT_SEED||[]));
  return (OUTBOUND_EQUIPMENT_SEED||[]).slice();
})();

function saveCheckInQueue(){localStorage.setItem('satset-checkin-queue',JSON.stringify(checkInQueue))}
function saveAccountingJournals(){localStorage.setItem('satset-accounting-journals',JSON.stringify(accountingJournals))}
function saveAccountingClosings(){localStorage.setItem('satset-accounting-closing',JSON.stringify(accountingClosings))}
function saveCafeOrders(){localStorage.setItem('satset-cafe-orders',JSON.stringify(cafeOrders))}
function saveCafeShifts(){localStorage.setItem('satset-cafe-shifts',JSON.stringify(cafeShifts))}
function saveCafeJournals(){localStorage.setItem('satset-cafe-journal',JSON.stringify(cafeJournals))}
function saveFinanceTransactions(){localStorage.setItem('satset-finance-transactions',JSON.stringify(financeTransactions))}
function saveFinanceCashAccounts(){localStorage.setItem('satset-finance-cash',JSON.stringify(financeCashAccounts))}
function saveFinanceBankAccounts(){localStorage.setItem('satset-finance-bank',JSON.stringify(financeBankAccounts))}
function saveOutboundRecords(){localStorage.setItem('satset-outbound-records',JSON.stringify(outboundRecords))}
function saveOutboundJournals(){localStorage.setItem('satset-outbound-journal',JSON.stringify(outboundJournals))}
function saveOutboundScanHistory(){localStorage.setItem('satset-outbound-scan-history',JSON.stringify(outboundScanHistory))}
function activeCafeShift(){return cafeShifts.find(function(x){return x.aktif})||null}
function cafeTodayKey(){return new Date().toISOString().slice(0,10)}
function outboundTodayKey(){return new Date().toISOString().slice(0,10)}
function genCafeOrderNo(){var d=new Date();return 'POS-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getTime()).slice(-6)}
function genCafeQueueNo(){var d=new Date();return 'AN-'+String(d.getHours()).padStart(2,'0')+String(d.getMinutes()).padStart(2,'0')+String(d.getTime()).slice(-2)}
function genOutboundNo(prefix){var d=new Date();return prefix+'-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getTime()).slice(-6)}
function calcCafeTotals(menu,qty){
  var subtotal=Math.max(1,Number(qty||1))*Number(menu.harga||0);
  var diskon=subtotal*Number(menu.diskonPercent||0)/100;
  var net=subtotal-diskon;
  var pajak=net*Number(menu.pajakPercent||0)/100;
  var serviceCharge=net*Number(menu.serviceChargePercent||0)/100;
  var total=net+pajak+serviceCharge;
  var pembulatan=Math.round(total/100)*100-total;
  return {subtotal:subtotal,diskon:diskon,pajak:pajak,serviceCharge:serviceCharge,pembulatan:pembulatan,total:total+pembulatan};
}
function buildCafeJournalEntry(order){
  var debit=order.pembayaran&&order.pembayaran.metode==='Tunai'?CAFE_FINANCE.debitKas:(order.pembayaran&&order.pembayaran.metode==='QRIS'?CAFE_FINANCE.debitQris:CAFE_FINANCE.debitPiutang);
  var journal={referensi:order.orderNo,keterangan:'Jurnal operasional cafe '+order.orderNo,lines:[
    {akun:debit,posisi:'Debit',nominal:Number(order.total||0)},
    {akun:CAFE_FINANCE.kreditPendapatan,posisi:'Kredit',nominal:Math.max(0,Number(order.subtotal||0)-Number(order.diskon||0))},
    {akun:CAFE_FINANCE.kreditPajak,posisi:'Kredit',nominal:Number(order.pajak||0)},
    {akun:CAFE_FINANCE.kreditServiceCharge,posisi:'Kredit',nominal:Number(order.serviceCharge||0)}
  ].filter(function(line){return line.nominal>0})};
  cafeJournals.unshift(journal);
  cafeJournals=cafeJournals.slice(0,500);
  saveCafeJournals();
  recordFinanceTransaction({jenis:'Pemasukan',sumber:'Cafe',kategori:'Cafe',metodePembayaran:(order.pembayaran&&order.pembayaran.metode)||'Cash',nominal:Number(order.total||0),referensi:order.orderNo,akunKredit:'Pendapatan Cafe'});
  return journal;
}
function createCafeShiftPayload(namaKasir,modalAwal){
  return {id:'SHIFT-'+Date.now(),namaKasir:namaKasir,modalAwal:Number(modalAwal||0),jamBuka:new Date().toISOString(),totalPenjualan:0,totalTunai:0,totalNonTunai:0,selisihKas:0,ringkasanShift:'Shift dibuka',aktif:true};
}
function genAccountingJournalNo(){var d=new Date();return 'JR-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getTime()).slice(-6)}
function ensureAccountingClosing(){if(accountingClosings.length)return;accountingClosings=[{period:new Date().toISOString().slice(0,7),closed:false}];saveAccountingClosings()}
function createAccountingJournalFromFinance(record){
  if(!record)return null;
  var existing=accountingJournals.find(function(journal){return journal.reference===record.referensi&&journal.source===record.sumber});
  if(existing)return existing;
  var debit=(record.metodePembayaran==='Cash'?{code:'1001',name:'Kas Utama'}:(record.metodePembayaran==='QRIS'?{code:'1101',name:'Bank BCA'}:{code:'1102',name:'Bank BRI'}));
  var credit=record.sumber==='Ticketing'?{code:'4001',name:'Pendapatan Tiket'}:record.sumber==='Booking'?{code:'4002',name:'Pendapatan Booking'}:record.sumber==='Cafe'?{code:'4003',name:'Pendapatan Cafe'}:record.sumber==='Outbound'?{code:'4004',name:'Pendapatan Outbound'}:{code:'7001',name:'Pendapatan Lainnya'};
  var type=record.jenis==='Pemasukan'?'Cash Receipt':record.jenis==='Pengeluaran'?'Cash Payment':'General Journal';
  var journal={id:genAccountingJournalNo(),journalNo:genAccountingJournalNo(),type:type,source:record.sumber,reference:record.referensi,description:record.deskripsi||('Jurnal '+record.referensi),lines:[{accountCode:debit.code,accountName:debit.name,debit:Number(record.nominal||0),credit:0,memo:record.deskripsi||''},{accountCode:credit.code,accountName:credit.name,debit:0,credit:Number(record.nominal||0),memo:record.deskripsi||''}],posted:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  accountingJournals.unshift(journal);
  accountingJournals=accountingJournals.slice(0,1000);
  saveAccountingJournals();
  ensureAccountingClosing();
  return journal;
}
function summarizeAccountingJournals(){
  ensureAccountingClosing();
  var pendapatan=0,beban=0,saldoKas=0,saldoBank=0;
  accountingJournals.forEach(function(journal){journal.lines.forEach(function(line){if(String(line.accountCode).startsWith('4')||String(line.accountCode).startsWith('7'))pendapatan+=Number(line.credit||0)-Number(line.debit||0);if(String(line.accountCode).startsWith('5')||String(line.accountCode).startsWith('6')||String(line.accountCode).startsWith('8'))beban+=Number(line.debit||0)-Number(line.credit||0);if(['1001','1002','1003','1004'].indexOf(String(line.accountCode))>=0)saldoKas+=Number(line.debit||0)-Number(line.credit||0);if(['1101','1102'].indexOf(String(line.accountCode))>=0)saldoBank+=Number(line.debit||0)-Number(line.credit||0);});});
  var debit=accountingJournals.reduce(function(acc,journal){return acc+journal.lines.reduce(function(sum,line){return sum+Number(line.debit||0)},0)},0);
  var credit=accountingJournals.reduce(function(acc,journal){return acc+journal.lines.reduce(function(sum,line){return sum+Number(line.credit||0)},0)},0);
  return {jumlahJurnal:accountingJournals.length,saldoKas:saldoKas,saldoBank:saldoBank,pendapatan:pendapatan,beban:beban,labaBersih:pendapatan-beban,neraca:Math.round(debit)===Math.round(credit),cashFlow:saldoKas+saldoBank,trialBalance:Math.round(debit)===Math.round(credit),closingStatus:(accountingClosings[0]&&accountingClosings[0].closed)?'Tutup':'Terbuka'};
}
function renderAccountingMetric(id,label,value){var root=byId(id);if(!root)return;root.innerHTML='<div class="sum-card"><div class="sum-name">'+label+'</div><div class="sum-val">'+value+'</div></div>'}
function renderAccountingDashboardWidgets(){
  var summary=summarizeAccountingJournals();
  renderAccountingMetric('accounting-jumlah-jurnal-summary','Jumlah Jurnal',summary.jumlahJurnal);
  renderAccountingMetric('accounting-saldo-kas-summary','Saldo Kas',fmtIdr(summary.saldoKas));
  renderAccountingMetric('accounting-saldo-bank-summary','Saldo Bank',fmtIdr(summary.saldoBank));
  renderAccountingMetric('accounting-pendapatan-summary','Pendapatan',fmtIdr(summary.pendapatan));
  renderAccountingMetric('accounting-beban-summary','Beban',fmtIdr(summary.beban));
  renderAccountingMetric('accounting-laba-bersih-summary','Laba Bersih',fmtIdr(summary.labaBersih));
  renderAccountingMetric('accounting-neraca-summary','Neraca',summary.neraca?'Seimbang':'Tidak Seimbang');
  renderAccountingMetric('accounting-cash-flow-summary','Cash Flow',fmtIdr(summary.cashFlow));
  renderAccountingMetric('accounting-trial-balance-summary','Trial Balance',summary.trialBalance?'Seimbang':'Tidak Seimbang');
  renderAccountingMetric('accounting-closing-status-summary','Closing Status',summary.closingStatus);
}
function openAccountingJournalInput(){gt('form','accounting')}
function postLatestAccountingJournal(){if(!accountingJournals.length){toast('Belum ada jurnal','error');return}accountingJournals[0].posted=true;accountingJournals[0].updatedAt=new Date().toISOString();saveAccountingJournals();pushNotif('success','Posting Jurnal','Jurnal terakhir berhasil diposting');toast('Jurnal berhasil diposting','success');ldDash()}
function openAccountingLedger(){gt('list','accounting');toast('Buku besar tersedia melalui daftar jurnal','success')}
function openAccountingTrialBalance(){gt('dashboard');toast('Neraca saldo ditampilkan di widget Accounting','success')}
function openAccountingIncomeStatement(){gt('dashboard');toast('Laba rugi ditampilkan di widget Accounting','success')}
function openAccountingBalanceSheet(){gt('dashboard');toast('Neraca ditampilkan di widget Accounting','success')}
function closeAccountingBook(){ensureAccountingClosing();accountingClosings[0].closed=true;accountingClosings[0].closedAt=new Date().toISOString();saveAccountingClosings();pushNotif('info','Closing Buku','Periode akuntansi ditutup');toast('Closing buku selesai','success');ldDash()}
function genFinanceNo(){var d=new Date();return 'FIN-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getTime()).slice(-6)}
function normalizeFinanceMethod(input){if(input==='QRIS')return 'QRIS';if(input==='Transfer')return 'Transfer';if(input==='VA')return 'VA';if(input==='EDC')return 'EDC';return 'Cash'}
function defaultFinanceCategory(source){if(source==='Ticketing')return 'Tiket';if(source==='Cafe')return 'Cafe';if(source==='Outbound')return 'Outbound';return 'Lainnya'}
function defaultCashId(source){if(source==='Ticketing'||source==='Booking')return 'kas-loket';if(source==='Cafe')return 'kas-cafe';if(source==='Outbound')return 'kas-outbound';return 'kas-utama'}
function mutateFinanceAccounts(record){
  financeCashAccounts=financeCashAccounts.map(function(account){
    if(account.id!==(record.kasId||defaultCashId(record.sumber)))return account;
    var direction=(record.jenis==='Pengeluaran'||record.jenis==='Refund')?-1:1;
    return Object.assign({},account,{saldoSaatIni:Number(account.saldoSaatIni||0)+(direction*Number(record.nominal||0)),mutasi:Number(account.mutasi||0)+(direction*Number(record.nominal||0))});
  });
  if(record.rekeningId){
    financeBankAccounts=financeBankAccounts.map(function(account){
      if(account.id!==record.rekeningId)return account;
      var direction=(record.jenis==='Pengeluaran'||record.jenis==='Refund')?-1:1;
      return Object.assign({},account,{saldo:Number(account.saldo||0)+(direction*Number(record.nominal||0)),rekonsiliasiTerakhir:new Date().toISOString()});
    });
  }
  saveFinanceCashAccounts();
  saveFinanceBankAccounts();
}
function findFinanceDuplicate(record){
  var key=[record.jenis,record.sumber,record.referensi,record.nominal].join(':');
  return financeTransactions.some(function(row){return [row.jenis,row.sumber,row.referensi,row.nominal].join(':')===key});
}
function createFinanceRecord(input){
  return {id:genFinanceNo(),name:(input.jenis||'Pemasukan')+' '+input.referensi,status:input.jenis,jenis:input.jenis,sumber:input.sumber,kategori:input.kategori||defaultFinanceCategory(input.sumber),metodePembayaran:normalizeFinanceMethod(input.metodePembayaran||'Cash'),nominal:Math.max(0,Number(input.nominal||0)),kasId:input.kasId||defaultCashId(input.sumber),rekeningId:input.rekeningId,referensi:input.referensi,deskripsi:input.deskripsi||('Transaksi '+input.sumber+' '+input.referensi),jurnal:input.jurnal,dibuatPada:new Date().toISOString(),diperbaruiPada:new Date().toISOString()};
}
function createFinanceJournal(input){
  var debit=input.metodePembayaran==='Cash'?'Kas':normalizeFinanceMethod(input.metodePembayaran||'Cash');
  return {referensi:input.referensi,sumber:input.sumber,keterangan:'Metadata jurnal '+input.sumber+' '+input.referensi,lines:[{akun:debit,posisi:'Debit',nominal:Number(input.nominal||0)},{akun:input.akunKredit||'Pendapatan Lainnya',posisi:'Kredit',nominal:Number(input.nominal||0)}]};
}
function recordFinanceTransaction(input){
  if(Number(input.nominal||0)<=0)return null;
  var record=createFinanceRecord(Object.assign({},input,{jurnal:input.jurnal||createFinanceJournal(input)}));
  if(findFinanceDuplicate(record))return null;
  if((record.jenis==='Pengeluaran'||record.jenis==='Refund')){
    var cash=financeCashAccounts.find(function(account){return account.id===record.kasId});
    if(cash&&Number(cash.saldoSaatIni||0)<Number(record.nominal||0))return null;
  }
  financeTransactions.unshift(record);
  financeTransactions=financeTransactions.slice(0,1000);
  mutateFinanceAccounts(record);
  saveFinanceTransactions();
  createAccountingJournalFromFinance(record);
  return record;
}
function summarizeFinanceTransactions(){
  var today=new Date().toISOString().slice(0,10);
  var rows=financeTransactions.filter(function(row){return String(row.dibuatPada||'').slice(0,10)===today});
  var pendapatan=rows.filter(function(row){return row.jenis==='Pemasukan'}).reduce(function(acc,row){return acc+Number(row.nominal||0)},0);
  var pengeluaran=rows.filter(function(row){return row.jenis==='Pengeluaran'||row.jenis==='Refund'}).reduce(function(acc,row){return acc+Number(row.nominal||0)},0);
  var saldoKas=financeCashAccounts.reduce(function(acc,row){return acc+Number(row.saldoSaatIni||0)},0);
  var saldoBank=financeBankAccounts.reduce(function(acc,row){return acc+Number(row.saldo||0)},0);
  var perModul=['Ticketing','Booking','Cafe','Outbound','Manual'].map(function(modul){return {modul:modul,nominal:financeTransactions.filter(function(row){return row.sumber===modul&&row.jenis==='Pemasukan'}).reduce(function(acc,row){return acc+Number(row.nominal||0)},0)}});
  return {saldoKas:saldoKas,saldoBank:saldoBank,pendapatanHariIni:pendapatan,pengeluaranHariIni:pengeluaran,labaOperasionalHariIni:pendapatan-pengeluaran,cashFlow:pendapatan-pengeluaran,pendapatanPerModul:perModul};
}
function renderFinanceMetric(id,label,value){var root=byId(id);if(!root)return;root.innerHTML='<div class="sum-card"><div class="sum-name">'+label+'</div><div class="sum-val">'+value+'</div></div>'}
function renderFinanceDashboardWidgets(){
  var summary=summarizeFinanceTransactions();
  renderFinanceMetric('finance-saldo-kas-summary','Saldo Kas',fmtIdr(summary.saldoKas));
  renderFinanceMetric('finance-saldo-bank-summary','Saldo Bank',fmtIdr(summary.saldoBank));
  renderFinanceMetric('finance-pendapatan-summary','Pendapatan Hari Ini',fmtIdr(summary.pendapatanHariIni));
  renderFinanceMetric('finance-pengeluaran-summary','Pengeluaran Hari Ini',fmtIdr(summary.pengeluaranHariIni));
  renderFinanceMetric('finance-laba-summary','Laba Operasional Hari Ini',fmtIdr(summary.labaOperasionalHariIni));
  renderFinanceMetric('finance-cash-flow-summary','Cash Flow',fmtIdr(summary.cashFlow));
  var perModul=byId('finance-per-modul-summary');
  if(perModul)perModul.innerHTML=summary.pendapatanPerModul.map(function(item){return '<div class="sum-card"><div class="sum-name">'+item.modul+'</div><div class="sum-val">'+fmtIdr(item.nominal)+'</div></div>'}).join('');
}
function drawFinanceBar(id,rows,key){
  var sv=byId(id);if(!sv)return;var max=Math.max.apply(null,rows.map(function(row){return Number(row[key]||0)}).concat([1]));sv.innerHTML='';rows.slice(0,6).forEach(function(row,idx){var x=40+idx*82;var val=Number(row[key]||0);var h=Math.max(6,Math.round((val/max)*100));var y=145-h;var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',String(x));rect.setAttribute('y',String(y));rect.setAttribute('width','56');rect.setAttribute('height',String(h));rect.setAttribute('rx','8');rect.setAttribute('fill',id==='bar-finance-expense'?'var(--danger)':(id==='bar-finance-cash'?'var(--brand)':'var(--success)'));rect.setAttribute('opacity','0.88');sv.appendChild(rect);var txt=document.createElementNS('http://www.w3.org/2000/svg','text');txt.setAttribute('x',String(x+28));txt.setAttribute('y',String(y-8));txt.setAttribute('text-anchor','middle');txt.setAttribute('font-size','10');txt.setAttribute('fill','currentColor');txt.textContent=String(Math.round(val/1000))+'k';sv.appendChild(txt);var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',String(x+28));lbl.setAttribute('y','165');lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','9');lbl.setAttribute('fill','currentColor');lbl.setAttribute('opacity','0.65');lbl.textContent=String(row.label||row.modul||row.tanggal||'').substring(0,8);sv.appendChild(lbl)});
}
function drawFinanceCharts(){
  var summary=summarizeFinanceTransactions();
  var cashRows=financeCashAccounts.map(function(row){return {label:row.nama,value:row.saldoSaatIni}});
  var incomeRows=summary.pendapatanPerModul.map(function(row){return {modul:row.modul,value:row.nominal}});
  var expenseMap={};financeTransactions.filter(function(row){return row.jenis==='Pengeluaran'||row.jenis==='Refund'}).forEach(function(row){expenseMap[row.kategori]=(expenseMap[row.kategori]||0)+Number(row.nominal||0)});
  var expenseRows=Object.keys(expenseMap).map(function(key){return {label:key,value:expenseMap[key]}});
  drawFinanceBar('bar-finance-cash',cashRows,'value');
  drawFinanceBar('bar-finance-income',incomeRows,'value');
  drawFinanceBar('bar-finance-expense',expenseRows,'value');
}
function openFinanceCashIn(){var nominal=Number(window.prompt('Nominal kas masuk','100000')||0);if(nominal<=0){toast('Nominal tidak valid','error');return}var ref=genFinanceNo();var saved=recordFinanceTransaction({jenis:'Pemasukan',sumber:'Manual',kategori:'Lainnya',metodePembayaran:'Cash',nominal:nominal,referensi:ref,akunKredit:'Pendapatan Lainnya'});if(!saved){toast('Transaksi gagal disimpan','error');return}pushNotif('success','Kas Masuk','Kas masuk '+fmtIdr(nominal)+' disimpan');toast('Kas masuk disimpan','success');ldDash()}
function openFinanceCashOut(){var nominal=Number(window.prompt('Nominal kas keluar','50000')||0);if(nominal<=0){toast('Nominal tidak valid','error');return}var ref=genFinanceNo();var saved=recordFinanceTransaction({jenis:'Pengeluaran',sumber:'Manual',kategori:'Operasional',metodePembayaran:'Cash',nominal:nominal,referensi:ref,akunKredit:'Kas'});if(!saved){toast('Kas tidak cukup atau transaksi duplikat','error');return}pushNotif('warning','Kas Keluar','Kas keluar '+fmtIdr(nominal)+' disimpan');toast('Kas keluar disimpan','success');ldDash()}
function openFinanceTransfer(){var nominal=Number(window.prompt('Nominal transfer bank','250000')||0);if(nominal<=0){toast('Nominal tidak valid','error');return}var rekening=(financeBankAccounts[0]&&financeBankAccounts[0].id)||'';var ref=genFinanceNo();var saved=recordFinanceTransaction({jenis:'Transfer',sumber:'Manual',kategori:'Lainnya',metodePembayaran:'Transfer',nominal:nominal,referensi:ref,rekeningId:rekening,akunKredit:'Transfer Bank'});if(!saved){toast('Transfer gagal disimpan','error');return}pushNotif('info','Transfer Bank','Transfer bank '+fmtIdr(nominal)+' disimpan');toast('Transfer bank disimpan','success');ldDash()}
function openFinanceReconcile(){financeBankAccounts=financeBankAccounts.map(function(account){return Object.assign({},account,{rekonsiliasiTerakhir:new Date().toISOString()})});saveFinanceBankAccounts();pushNotif('success','Rekonsiliasi','Rekonsiliasi bank diperbarui');toast('Rekonsiliasi selesai','success');ldDash()}
function openFinanceReport(){gt('list','finance');toast('Laporan keuangan siap ditinjau','success')}
function createOutboundJournalEntry(record){
  var debit=record.pembayaran&&record.pembayaran.metode==='Cash'?'Kas':(record.pembayaran&&record.pembayaran.metode==='QRIS'?'QRIS':'Piutang');
  var journal={referensi:record.id,keterangan:'Metadata jurnal outbound '+record.id,lines:[{akun:debit,posisi:'Debit',nominal:Number(record.pembayaran.nominal||0)},{akun:'Pendapatan Outbound',posisi:'Kredit',nominal:Number(record.pendapatan||0)}]};
  outboundJournals.unshift(journal);
  outboundJournals=outboundJournals.slice(0,500);
  saveOutboundJournals();
  recordFinanceTransaction({jenis:'Pemasukan',sumber:'Outbound',kategori:'Outbound',metodePembayaran:(record.pembayaran&&record.pembayaran.metode)||'Cash',nominal:Number(record.pembayaran.nominal||0),referensi:record.id,akunKredit:'Pendapatan Outbound'});
  return journal;
}
function ensureOutboundSeed(){
  if(outboundRecords.length)return;
  var paket=(outboundPackages||[])[0]||{id:'ob-default',namaPaket:'Outbound Pagi',harga:85000,maksimalPeserta:30,minimumPeserta:5};
  var id=genOutboundNo('OB');
  outboundRecords=[{id:id,name:'Outbound Pagi',status:'Dijadwalkan',paket:paket,jadwal:{id:id+'-SCH',paketId:paket.id,tanggal:outboundTodayKey(),jamMulai:'08:00',jamSelesai:'11:00',slot:'Pagi',kuota:Number(paket.maksimalPeserta||30),sisaKuota:Number(paket.maksimalPeserta||30),bookingTerhubung:0,status:'Terbuka'},sesi:{id:id+'-SES',scheduleId:id+'-SCH',namaSesi:paket.namaPaket+' Pagi',status:'Dijadwalkan',instructorIds:(outboundInstructors||[]).slice(0,2).map(function(item){return item.id}),equipmentIds:(outboundEquipment||[]).slice(0,2).map(function(item){return item.id})},peserta:[],instruktur:(outboundInstructors||[]).slice(0,2),peralatan:(outboundEquipment||[]).slice(0,2),pembayaran:{metode:'Cash',nominal:0},voucher:null,pendapatan:0,jurnalReferensi:'JRN-'+id,dibuatPada:new Date().toISOString(),diperbaruiPada:new Date().toISOString()}];
  saveOutboundRecords();
}
function updateOutboundRevenue(record){
  var peserta=record.peserta||[];
  var voucher=record.voucher&&record.voucher.nilai?Number(record.voucher.nilai):0;
  var total=Math.max(0,(Number(record.paket&&record.paket.harga||0)*peserta.length)-voucher);
  record.pendapatan=total;
  record.pembayaran.nominal=total;
  record.diperbaruiPada=new Date().toISOString();
  return record;
}
function createOutboundParticipantEntry(booking,record){
  return {id:genOutboundNo('PST'),nomorPeserta:genOutboundNo('PST'),nama:booking.namaPemesan||booking.name||booking.bookingNo,bookingNo:booking.bookingNo,ticketNo:'',grup:'Umum',kontak:booking.nomorHp||'',statusHadir:'Belum Hadir',scheduleId:record.jadwal.id,voucherMakan:'MKN-'+booking.bookingNo,promoCafe:'Promo Peserta Outbound'};
}
function ensureOutboundParticipantFromBooking(booking){
  var source=((booking.name||'')+' '+(booking.paketWisata||'')).toLowerCase();
  if(booking.status!=='Dikonfirmasi'||source.indexOf('outbound')<0)return false;
  ensureOutboundSeed();
  var record=outboundRecords[0];
  if(!record)return false;
  if((record.peserta||[]).some(function(item){return item.bookingNo===booking.bookingNo}))return true;
  var needed=Math.max(1,Number(booking.jumlahOrang||1));
  if(Number(record.jadwal.sisaKuota||0)<needed)return false;
  for(var i=0;i<needed;i++){record.peserta.push(createOutboundParticipantEntry(booking,record))}
  record.jadwal.bookingTerhubung=Number(record.jadwal.bookingTerhubung||0)+needed;
  record.jadwal.sisaKuota=Math.max(0,Number(record.jadwal.kuota||0)-Number(record.jadwal.bookingTerhubung||0));
  record.jadwal.status=record.jadwal.sisaKuota<=0?'Penuh':'Terbuka';
  updateOutboundRevenue(record);
  createOutboundJournalEntry(record);
  saveOutboundRecords();
  pushTimeline('Peserta outbound dibuat ('+booking.bookingNo+')','OB');
  pushNotif('success','Peserta Outbound','Peserta outbound dari booking '+booking.bookingNo+' berhasil dibuat');
  return true;
}
function syncOutboundAttendanceFromTicket(ticket,gate,petugas){
  var changed=false;
  outboundRecords=outboundRecords.map(function(record){
    var idx=(record.peserta||[]).findIndex(function(item){return item.bookingNo===ticket.bookingNo||item.ticketNo===ticket.ticketNo});
    if(idx<0)return record;
    changed=true;
    var participant=record.peserta[idx];
    participant.ticketNo=ticket.ticketNo;
    participant.statusHadir='Hadir';
    record.peserta[idx]=participant;
    record.diperbaruiPada=new Date().toISOString();
    outboundScanHistory.unshift({ticketNo:ticket.ticketNo,bookingNo:ticket.bookingNo||'',participantId:participant.id,gate:gate,petugas:petugas,at:new Date().toISOString()});
    outboundScanHistory=outboundScanHistory.slice(0,500);
    return record;
  });
  if(changed){saveOutboundRecords();saveOutboundScanHistory();pushTimeline('Check in outbound '+ticket.ticketNo,'OB');pushNotif('success','Absensi Outbound','Peserta outbound hadir melalui scan tiket');}
  return changed;
}
function dateOnlyNow(){var d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')}
function genBookingNo(){
  var key=dateOnlyNow();
  var seq=Number(bookingCounter[key]||0)+1;
  bookingCounter[key]=seq;
  localStorage.setItem('satset-booking-counter',JSON.stringify(bookingCounter));
  return 'BK-'+key+'-'+String(seq).padStart(6,'0');
}
function pushTimeline(title,ic){
  var d=new Date();
  TIMELINE=[{h:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'),t:title,ic:ic||'OP',at:Date.now()}].concat(TIMELINE).slice(0,100);
}
function pushNotif(cat,title,desc){
  NOTIFS=[{id:'n'+Date.now(),cat:cat,title:title,desc:desc,at:Date.now(),unread:true}].concat(NOTIFS).slice(0,200);
  var node=byId('notif-unread');
  if(node)node.textContent=String(NOTIFS.filter(function(n){return n.unread}).length);
}
function ensureCheckInQueue(bookingNo,pelanggan){
  if(!bookingNo)return;
  var hit=checkInQueue.find(function(q){return q.bookingNo===bookingNo&&q.status!=='Selesai'});
  if(hit)return;
  checkInQueue.push({bookingNo:bookingNo,pelanggan:pelanggan||bookingNo,status:'Menunggu',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  if(checkInQueue.length>500)checkInQueue=checkInQueue.slice(checkInQueue.length-500);
  saveCheckInQueue();
}
function finishCheckInQueue(bookingNo){
  var now=new Date().toISOString();
  var hit=checkInQueue.find(function(q){return q.bookingNo===bookingNo&&q.status!=='Selesai'});
  if(!hit)return;
  hit.status='Dipanggil';
  hit.calledAt=now;
  hit.status='Selesai';
  hit.finishedAt=now;
  hit.updatedAt=now;
  saveCheckInQueue();
}

function fmtIdr(v){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v||0))}
function ticketTariffByType(type){return(TICKET_TARIFF||[]).find(function(t){return t.type===type})||TICKET_TARIFF[0]}
function genTicketNo(){var d=new Date();return 'TKT-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+String(d.getTime()).slice(-6)}
function calcTicketTotals(tariffType,qty,discountPct){
  var t=ticketTariffByType(tariffType);
  var amount=Math.max(1,Number(qty||1))*Number(t.price||0)*Number(t.seasonalFactor||1);
  var discount=amount*Math.max(0,Math.min(Number(discountPct||0),100))/100;
  var net=amount-discount;
  var tax=net*Number(t.taxPercent||0)/100;
  return {amount:amount,discount:discount,tax:tax,total:net+tax};
}
function markTicketScan(ticketNo,result,gate,petugas,reason){
  ticketScanHistory=[{ticketNo:ticketNo,scannedAt:new Date().toISOString(),gate:gate||'Gerbang Utama',petugas:petugas||'Sistem',result:result,reason:reason||''}].concat(ticketScanHistory).slice(0,500);
  localStorage.setItem('satset-ticket-scan-history',JSON.stringify(ticketScanHistory));
}
function syncStatusOptionsForEntity(en){
  var sst=byId('sst'),sf=byId('sf-status');
  if(!sst||!sf)return;
  if(en==='purchase-order'){
    var poBase='<option value="">Semua Status</option><option value="DRAFT">DRAFT</option><option value="APPROVED">APPROVED</option><option value="RECEIVED">RECEIVED</option><option value="CANCELLED">CANCELLED</option>';
    sst.innerHTML=poBase;
    sf.innerHTML=poBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en==='stock-movement'){
    var smBase='<option value="">Semua Status</option><option value="IN">IN</option><option value="OUT">OUT</option><option value="ADJUSTMENT">ADJUSTMENT</option>';
    sst.innerHTML=smBase;
    sf.innerHTML=smBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en==='finance'){
    var financeBase='<option value="">Semua Status</option>'+(FINANCE_TRANSACTION||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    sst.innerHTML=financeBase;
    sf.innerHTML=financeBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en==='outbound'){
    var outboundBase='<option value="">Semua Status</option>'+(OUTBOUND_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    sst.innerHTML=outboundBase;
    sf.innerHTML=outboundBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en==='cafe'){
    var cafeBase='<option value="">Semua Status</option>'+(CAFE_ORDER_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    sst.innerHTML=cafeBase;
    sf.innerHTML=cafeBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en==='reservasi'){
    var resBase='<option value="">Semua Status</option>'+(BOOKING_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    sst.innerHTML=resBase;
    sf.innerHTML=resBase.replace('Semua Status','Status: Semua');
    return;
  }
  if(en!=='ticketing'){sst.innerHTML='<option value="">Semua Status</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option>';sf.innerHTML='<option value="">Status: Semua</option><option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option>';return}
  var base='<option value="">Semua Status</option>'+(TICKET_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
  sst.innerHTML=base;
  sf.innerHTML=base.replace('Semua Status','Status: Semua');
}
function syncTicketingActions(en){
  document.querySelectorAll('.tix-only').forEach(function(el){el.style.display=en==='ticketing'?'':'none'});
}
function syncFormStatusOptions(en){
  var fst=byId('fst');
  if(!fst)return;
  if(en==='purchase-order'){
    fst.innerHTML='<option value="DRAFT">DRAFT</option><option value="APPROVED">APPROVED</option><option value="RECEIVED">RECEIVED</option><option value="CANCELLED">CANCELLED</option>';
    return;
  }
  if(en==='finance'){
    fst.innerHTML=(FINANCE_TRANSACTION||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    return;
  }
  if(en==='outbound'){
    fst.innerHTML=(OUTBOUND_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    return;
  }
  if(en==='cafe'){
    fst.innerHTML=(CAFE_ORDER_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    return;
  }
  if(en==='reservasi'){
    fst.innerHTML=(BOOKING_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
    return;
  }
  if(en!=='ticketing'){fst.innerHTML='<option value="aktif">Aktif</option><option value="nonaktif">Nonaktif</option><option value="pending">Pending</option>';return}
  fst.innerHTML=(TICKET_STATUS||[]).map(function(s){return '<option value="'+s+'">'+s+'</option>'}).join('');
}

function normalizeWidgetPreference(input){
  var src=input||{};
  return {hidden:!!src.hidden,pinned:!!src.pinned,favorite:!!src.favorite,width:src.width||'',order:typeof src.order==='number'?src.order:null};
}
function mergeWidgetState(meta,pref){
  var cfg=normalizeWidgetPreference(pref);
  return Object.assign({},meta,{visible:cfg.hidden?false:meta.visible,pinned:cfg.pinned||!!meta.pinned,favorite:cfg.favorite||!!meta.favorite,size:cfg.width||meta.size,priority:cfg.pinned?0:(cfg.order!==null?cfg.order:meta.priority)});
}
function hydrateRuntimeWidgetMetadata(){
  var role=(DASH_RUNTIME&&DASH_RUNTIME.role)||'super-admin';
  var accessGroup=(DASH_ROLE_GROUPS&&DASH_ROLE_GROUPS[role])||role;
  var vis=(DASH_RUNTIME&&DASH_RUNTIME.visibility)||{};
  var overrides=(DASH_RUNTIME&&DASH_RUNTIME.sizeOverrides)||{};
  return (DASH_WIDGET_META||[])
    .filter(function(w){return !Array.isArray(w.roles)||w.roles.indexOf(accessGroup)>=0})
    .map(function(w){
      var merged=mergeWidgetState(w,widgetCfg[w.id]||{});
      if(typeof vis[w.id]==='boolean')merged.visible=vis[w.id];
      if(overrides[w.id])merged.size=overrides[w.id];
      return merged;
    });
}

function createDashboardStore(init){
  var state=Object.assign({widgets:[],loading:true,offline:false,slowNetwork:false,noData:false,retryCount:0,lastUpdated:0},init||{});
  var listeners=[];
  return {
    getState:function(){return state},
    setState:function(patch){state=Object.assign({},state,patch||{});listeners.forEach(function(fn){fn(state)});return state},
    subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(x){return x!==fn})}}
  };
}
var dashboardStore=createDashboardStore({widgets:hydrateRuntimeWidgetMetadata()});
var dashboardActions={
  setLoading:function(v){dashboardStore.setState({loading:!!v})},
  setOffline:function(v){dashboardStore.setState({offline:!!v})},
  setSlowNetwork:function(v){dashboardStore.setState({slowNetwork:!!v})},
  setNoData:function(v){dashboardStore.setState({noData:!!v})},
  touch:function(){dashboardStore.setState({lastUpdated:Date.now()})}
};
var dashboardSelectors={
  visibleWidgets:function(s){return(s.widgets||[]).filter(function(w){return!!w.visible}).sort(function(a,b){return(a.priority||0)-(b.priority||0)})},
  updatedLabel:function(s){if(!s.lastUpdated)return'-';return new Date(s.lastUpdated).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}
};
function renderWidgets(){
  var root=byId('dash-widget-grid');
  if(!root)return;
  var bp=window.innerWidth<=760?'mobile':(window.innerWidth<=1080?'tablet':'desktop');
  dashboardStore.setState({widgets:hydrateRuntimeWidgetMetadata()});
  dashboardSelectors.visibleWidgets(dashboardStore.getState()).forEach(function(w){
    var el=root.querySelector('[data-widget="'+w.id+'"]');
    if(!el)return;
    el.style.display=w.visible?'':'none';
    el.style.order=String(w.priority||0);
    var span=(w.layout&&w.layout[bp])||(bp==='desktop'?4:(bp==='tablet'?6:1));
    var cols=(DASH_LAYOUT&&DASH_LAYOUT.columns&&DASH_LAYOUT.columns[bp])||12;
    el.style.gridColumn='span '+Math.min(Number(span)||1,Number(cols)||12);
    if(w.favorite)el.setAttribute('data-favorite','1');else el.removeAttribute('data-favorite');
    el.classList.remove('wg-xs','wg-sm','wg-md','wg-lg','wg-xl');
    el.classList.add('wg-'+String(w.size||'md'));
  });
  applyWidgetConfig();
  restoreWidgetOrder();
}
function renderDashboardStatus(){
  var box=byId('dash-state');
  if(!box)return;
  var s=dashboardStore.getState();
  if(s.loading){box.textContent='Memuat widget...';return}
  if(s.offline){box.textContent='Offline, menunggu koneksi';return}
  if(s.slowNetwork){box.textContent='Jaringan lambat';return}
  if(s.noData){box.textContent='Tidak ada data';return}
  box.textContent='Semua normal';
}
dashboardStore.subscribe(function(){
  var lbl=byId('dash-last-update');
  if(lbl)lbl.textContent='Pembaruan: '+dashboardSelectors.updatedLabel(dashboardStore.getState());
  renderDashboardStatus();
  renderMobileDashboard();
});

function resolveMobileMetricValue(source, counts){
  var finance=summarizeFinanceTransactions();
  var cafe=summarizeCafeOrders();
  var outbound=summarizeOutboundRecords();
  var accounting=summarizeAccountingJournals();
  var ticketRows=window.__ticketRowsCache||[];
  var today=new Date().toISOString().slice(0,10);
  var usedTickets=ticketRows.filter(function(row){return row.status==='Sudah Digunakan'}).length;
  var scanValid=ticketRows.filter(function(row){return row.status!=='Void'&&row.status!=='Refund'}).length;
  var refundCount=ticketRows.filter(function(row){return row.status==='Refund'}).length;
  var voidCount=ticketRows.filter(function(row){return row.status==='Void'}).length;
  var unreadNotif=NOTIFS.filter(function(item){return item.unread}).length;
  var queueCount=checkInQueue.filter(function(item){return item.status==='Menunggu'||item.status==='Dipanggil'}).length;
  switch(source){
    case 'ticketToday': return String(ticketRows.filter(function(row){return String(row.issuedAt||'').slice(0,10)===today}).length||0);
    case 'ticketSales': return String(ticketRows.length||0);
    case 'ticketScan': return String(scanValid||0);
    case 'ticketRefund': return String(refundCount||0);
    case 'ticketVoid': return String(voidCount||0);
    case 'bookingToday': return String(counts.reservasi||0);
    case 'bookingOccupancy': return String(Math.min(100,Math.max(20,(counts.reservasi||0)*8)))+'%';
    case 'queue': return String(queueCount||0);
    case 'cafeOrders': return String(cafe.totalOrderHariIni||0);
    case 'cafeRevenue': return fmtIdr(cafe.pendapatanCafeHariIni||0);
    case 'financeCash': return fmtIdr(finance.saldoKas||0);
    case 'financeBank': return fmtIdr(finance.saldoBank||0);
    case 'financeRevenue': return fmtIdr(finance.pendapatanHariIni||0);
    case 'financeProfit': return fmtIdr(finance.labaOperasionalHariIni||0);
    case 'financeFlow': return fmtIdr(finance.cashFlow||0);
    case 'outboundSessions': return String(outbound.sesiHariIni||0);
    case 'outboundParticipants': return String(outbound.pesertaHariIni||0);
    case 'outboundAttendance': return String(outbound.tingkatKehadiran||0)+'%';
    case 'equipmentReady': return String(outbound.peralatanDipakai||0);
    case 'vehicleCount': return String(counts.kendaraan||0);
    case 'equipmentCount': return String(Math.max(Number(counts.outbound||0), Number(outbound.peralatanDipakai||0)));
    case 'maintenanceQueue': return String(Math.max(1,Math.round((counts.kendaraan||1)*0.2)));
    case 'readiness': return String(Math.max(20,100-Math.max(1,Math.round((counts.kendaraan||1)*0.2))*10))+'%';
    case 'journalCount': return String(accounting.jumlahJurnal||0);
    case 'trialBalance': return accounting.trialBalance?'Seimbang':'Cek ulang';
    case 'neracaStatus': return accounting.neraca?'Seimbang':'Cek ulang';
    case 'closingStatus': return accounting.closingStatus||'Terbuka';
    case 'taskCount': return String((dashboardStore.getState().commandCenter&&dashboardStore.getState().commandCenter.tugasHariIni)||0);
    case 'notifCount': return String(unreadNotif||0);
    default: return '-';
  }
}

function renderMobileDashboard(){
  var shell=document.getElementById('mobile-shell');
  if(!shell)return;
  var counts=window.__dashboardCounts||{};
  var clock=document.getElementById('mobile-clock');
  if(clock)clock.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  var taskCount=document.getElementById('mobile-task-count');
  if(taskCount)taskCount.textContent=String((dashboardStore.getState().commandCenter&&dashboardStore.getState().commandCenter.tugasHariIni)||0);
  var notifCount=document.getElementById('mobile-notif-count');
  if(notifCount)notifCount.textContent=String(NOTIFS.filter(function(item){return item.unread}).length);
  shell.querySelectorAll('[data-stat-source]').forEach(function(node){
    var source=node.getAttribute('data-stat-source');
    var value=node.querySelector('[data-stat-value]');
    if(value)value.textContent=resolveMobileMetricValue(source, counts);
  });
}

function eMeta(k){return EMAP[k]||null}
function eBasePath(k){var m=eMeta(k);return m&&m.endpoint?m.endpoint:'/erp-wisata/'+k}
function eItemPath(k,id){return eBasePath(k)+(id?'/'+id:'')}
function eSearchable(k){var m=eMeta(k);return m&&Array.isArray(m.searchableFields)&&m.searchableFields.length?m.searchableFields:['id','name','status']}
function eSortable(k){var m=eMeta(k);return m&&Array.isArray(m.sortableFields)&&m.sortableFields.length?m.sortableFields:['name','status']}
function eSortDefault(k){var m=eMeta(k);return m&&m.defaultSort?m.defaultSort:{field:'name',direction:'asc'}}
function ePageSize(k){var m=eMeta(k);return m&&m.defaultPageSize?Number(m.defaultPageSize):10}
function supportsEntityCreate(entity){return entity!=='stock-movement'}
function supportsEntityUpdate(entity){return entity!=='menu-category'&&entity!=='purchase-order'&&entity!=='stock-movement'}
function supportsEntityDelete(entity){return entity!=='menu-category'&&entity!=='inventory'&&entity!=='purchase-order'&&entity!=='stock-movement'}
function supportsEntityDetail(entity){return entity==='supplier'||entity==='purchase-order'||entity==='inventory'}
function toUiStatusFromActive(active){return active===false?'nonaktif':'aktif'}
function toApiActiveFromStatus(status){return String(status||'aktif').toLowerCase()!=='nonaktif'}
function normalizeEntityRows(entity,payload){
  var rows=Array.isArray(payload)?payload:((payload&&payload.data)||[]);
  if(!Array.isArray(rows))rows=[];
  if(entity==='supplier'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.name||''),status:toUiStatusFromActive(row.active),active:!!row.active,code:String(row.code||''),phone:String(row.phone||''),email:String(row.email||''),address:String(row.address||'')}});
  }
  if(entity==='purchase-order'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.poNumber||row.name||''),status:String(row.status||'DRAFT').toUpperCase(),poNumber:String(row.poNumber||''),supplierId:String(row.supplierId||''),supplierName:String(row.supplierName||''),items:Array.isArray(row.items)?row.items:[],subtotal:Number(row.subtotal||0),total:Number(row.total||0),createdAt:String(row.createdAt||''),updatedAt:String(row.updatedAt||'')}});
  }
  if(entity==='stock-movement'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.reference||('Inventory '+String(row.inventoryId||''))),status:String(row.movementType||''),inventoryId:String(row.inventoryId||''),movementType:String(row.movementType||''),qty:Number(row.qty||0),balance:Number(row.balance||0),reference:String(row.reference||''),createdAt:String(row.createdAt||'')}});
  }
  if(entity==='menu-category'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.name||''),status:toUiStatusFromActive(row.active),active:!!row.active,code:String(row.code||'')}});
  }
  if(entity==='menu-item'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.name||''),status:toUiStatusFromActive(row.active),active:!!row.active,code:String(row.code||''),categoryId:String(row.categoryId||''),price:Number(row.price||0),stock:Number(row.stock||0)}});
  }
  if(entity==='inventory'){
    return rows.map(function(row){return{id:String(row.id||''),name:String(row.name||''),status:toUiStatusFromActive(row.active),active:!!row.active,code:String(row.code||''),unit:String(row.unit||''),category:String(row.category||''),minimumStock:Number(row.minimumStock||0),currentStock:Number(row.currentStock||0),averageCost:Number(row.averageCost||0)}});
  }
  return rows;
}
function getEntityTotal(payload,rows){
  if(payload&&typeof payload.total==='number')return Number(payload.total)||rows.length;
  return rows.length;
}
async function buildCreatePayload(entity,name,status){
  if(entity==='supplier'){
    var supplierCode=(window.prompt('Kode supplier','SUP-'+String(Date.now()).slice(-4))||'').trim();
    var supplierPhone=(window.prompt('Telepon supplier','081234567890')||'').trim();
    var supplierEmail=(window.prompt('Email supplier','supplier@test.local')||'').trim();
    var supplierAddress=(window.prompt('Alamat supplier','Alamat supplier test')||'').trim();
    if(!supplierCode)throw new Error('Kode supplier wajib diisi');
    if(!supplierPhone)throw new Error('Telepon supplier wajib diisi');
    if(!supplierEmail)throw new Error('Email supplier wajib diisi');
    if(!supplierAddress)throw new Error('Alamat supplier wajib diisi');
    return {code:supplierCode,name:name,phone:supplierPhone,email:supplierEmail,address:supplierAddress,active:toApiActiveFromStatus(status)};
  }
  if(entity==='purchase-order'){
    var supplierRows=normalizeEntityRows('supplier',await apf('/api/supplier',{method:'GET',cacheTtlMs:0}));
    var inventoryRows=normalizeEntityRows('inventory',await apf('/api/inventory',{method:'GET',cacheTtlMs:0}));
    if(!supplierRows.length)throw new Error('Supplier belum tersedia. Buat supplier terlebih dahulu.');
    if(!inventoryRows.length)throw new Error('Inventory belum tersedia. Buat inventory terlebih dahulu.');
    var supplierHint=supplierRows.slice(0,8).map(function(row){return row.id+'='+row.name}).join(', ');
    var inventoryHint=inventoryRows.slice(0,8).map(function(row){return row.id+'='+row.name}).join(', ');
    var supplierId=(window.prompt('Pilih supplierId ('+supplierHint+')',String(supplierRows[0].id||''))||'').trim();
    var inventoryId=(window.prompt('Pilih inventoryId ('+inventoryHint+')',String(inventoryRows[0].id||''))||'').trim();
    var qtyRaw=window.prompt('Qty purchase order','1');
    var unitCostRaw=window.prompt('Unit cost','1000');
    var qty=Number(qtyRaw||0);
    var unitCost=Number(unitCostRaw||0);
    var supplierRow=supplierRows.find(function(row){return row.id===supplierId});
    var inventoryRow=inventoryRows.find(function(row){return row.id===inventoryId});
    if(!supplierRow)throw new Error('supplierId tidak valid');
    if(!inventoryRow)throw new Error('inventoryId tidak valid');
    if(!Number.isInteger(qty)||qty<=0)throw new Error('Qty purchase order harus bilangan bulat > 0');
    if(!Number.isFinite(unitCost)||unitCost<0)throw new Error('Unit cost tidak valid');
    return {supplierId:supplierId,supplierName:supplierRow.name,items:[{inventoryId:inventoryId,inventoryName:inventoryRow.name,qty:qty,unitCost:unitCost,total:qty*unitCost}]};
  }
  if(entity==='menu-category'){
    var categoryCode=(window.prompt('Kode kategori menu','CAT-'+String(Date.now()).slice(-4))||'').trim();
    if(!categoryCode)throw new Error('Kode kategori wajib diisi');
    return {code:categoryCode,name:name,active:toApiActiveFromStatus(status)};
  }
  if(entity==='menu-item'){
    var categoryRows=normalizeEntityRows('menu-category',await apf('/api/menu-category',{method:'GET',cacheTtlMs:0}));
    if(!categoryRows.length)throw new Error('Menu category belum tersedia. Buat category terlebih dahulu.');
    var categoryHint=categoryRows.slice(0,8).map(function(row){return row.id+'='+row.name}).join(', ');
    var selectedCategory=(window.prompt('Pilih categoryId ('+categoryHint+')',String(categoryRows[0].id||''))||'').trim();
    if(!selectedCategory)throw new Error('categoryId wajib diisi');
    var menuCode=(window.prompt('Kode menu item','MNU-'+String(Date.now()).slice(-4))||'').trim();
    if(!menuCode)throw new Error('Kode menu item wajib diisi');
    var priceRaw=window.prompt('Harga menu','0');
    var stockRaw=window.prompt('Stok awal','0');
    var price=Number(priceRaw||0);
    var stock=Number(stockRaw||0);
    if(!Number.isFinite(price)||price<0)throw new Error('Harga menu tidak valid');
    if(!Number.isInteger(stock)||stock<0)throw new Error('Stok menu harus bilangan bulat >= 0');
    return {categoryId:selectedCategory,code:menuCode,name:name,price:price,stock:stock,active:toApiActiveFromStatus(status)};
  }
  if(entity==='inventory'){
    var invCode=(window.prompt('Kode inventory','INV-'+String(Date.now()).slice(-4))||'').trim();
    var invUnit=(window.prompt('Unit inventory','pcs')||'').trim();
    var invCategory=(window.prompt('Kategori inventory','Bahan Baku')||'').trim();
    var minimumRaw=window.prompt('Minimum stock','0');
    var currentRaw=window.prompt('Current stock','0');
    var costRaw=window.prompt('Average cost','0');
    if(!invCode)throw new Error('Kode inventory wajib diisi');
    if(!invUnit)throw new Error('Unit inventory wajib diisi');
    if(!invCategory)throw new Error('Kategori inventory wajib diisi');
    var minimumStock=Number(minimumRaw||0);
    var currentStock=Number(currentRaw||0);
    var averageCost=Number(costRaw||0);
    if(!Number.isFinite(minimumStock)||minimumStock<0)throw new Error('Minimum stock tidak valid');
    if(!Number.isFinite(currentStock)||currentStock<0)throw new Error('Current stock tidak valid');
    if(!Number.isFinite(averageCost)||averageCost<0)throw new Error('Average cost tidak valid');
    return {code:invCode,name:name,unit:invUnit,category:invCategory,minimumStock:minimumStock,currentStock:currentStock,averageCost:averageCost,active:toApiActiveFromStatus(status)};
  }
  return {name:name,status:status};
}
async function buildUpdatePayload(entity,name,status,currentRow){
  if(entity==='supplier'){
    var nextCode=(window.prompt('Kode supplier',String((currentRow&&currentRow.code)||''))||'').trim();
    var nextPhone=(window.prompt('Telepon supplier',String((currentRow&&currentRow.phone)||''))||'').trim();
    var nextEmail=(window.prompt('Email supplier',String((currentRow&&currentRow.email)||''))||'').trim();
    var nextAddress=(window.prompt('Alamat supplier',String((currentRow&&currentRow.address)||''))||'').trim();
    if(!nextCode)throw new Error('Kode supplier wajib diisi');
    if(!nextPhone)throw new Error('Telepon supplier wajib diisi');
    if(!nextEmail)throw new Error('Email supplier wajib diisi');
    if(!nextAddress)throw new Error('Alamat supplier wajib diisi');
    return {code:nextCode,name:name,phone:nextPhone,email:nextEmail,address:nextAddress,active:toApiActiveFromStatus(status)};
  }
  if(entity==='menu-item'||entity==='inventory'||entity==='menu-category'){
    return {name:name,active:toApiActiveFromStatus(status)};
  }
  return {name:name,status:status};
}
function recAudit(action,payload){AUD.push({entity:ent,action:action,at:Date.now(),payload:payload||{}});if(AUD.length>800)AUD.shift()}
function canToolbarAction(k,action){var tools=ETOOL[k]||[];var hit=tools.find(function(t){return t.key===action});return hit?!!hit.enabled:true}
function applyEntityToolbar(k){
  var m=eMeta(k);
  if(!m)return;
  var add=byId('btn-add'),csv=byId('btn-exp-csv'),xls=byId('btn-exp-xls'),imp=byId('btn-import'),bd=byId('bk-del');
  if(add)add.style.display=canToolbarAction(k,'create')?'':'none';
  if(csv)csv.style.display=canToolbarAction(k,'export')?'':'none';
  if(xls)xls.style.display=canToolbarAction(k,'export')?'':'none';
  if(imp)imp.style.display=canToolbarAction(k,'import')?'':'none';
  if(bd)bd.style.display=canToolbarAction(k,'delete')?'':'none';
  if(add&&!supportsEntityCreate(k))add.style.display='none';
  if(bd&&!supportsEntityDelete(k))bd.style.display='none';
}
function syncSidebarTooltips(){
  var collapsed=document.getElementById('sidebar').classList.contains('col');
  document.querySelectorAll('.sb-item').forEach(function(el){
    var lbl=el.querySelector('.lbl');
    if(!lbl)return;
    if(collapsed)el.setAttribute('title',lbl.textContent||'');
    else el.removeAttribute('title');
  });
}
function toggleDensity(){
  denseMode=!denseMode;
  var grid=byId('grid-main');
  var btn=byId('btn-density');
  if(grid)grid.classList.toggle('compact',denseMode);
  if(btn)btn.classList.toggle('on',denseMode);
}
function ensureKpiCompare(){
  var comps=['+8.4% vs periode lalu','+5.1% vs periode lalu','+2.3% vs periode lalu','+3.8% vs periode lalu'];
  document.querySelectorAll('.kpi-card').forEach(function(card,idx){
    if(card.querySelector('.kpi-comp'))return;
    var el=document.createElement('div');
    el.className='kpi-comp';
    el.textContent=comps[idx]||'+0.0% vs periode lalu';
    card.appendChild(el);
  });
}
function escHtml(s){return String(s||'').replace(/[&<>"']/g,function(ch){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]})}
function hiText(text,q){
  var src=String(text||'');
  var kw=(q||'').trim();
  if(!kw)return escHtml(src);
  var low=src.toLowerCase(),kl=kw.toLowerCase(),idx=low.indexOf(kl);
  if(idx<0)return escHtml(src);
  return escHtml(src.slice(0,idx))+'<mark>'+escHtml(src.slice(idx,idx+kw.length))+'</mark>'+escHtml(src.slice(idx+kw.length));
}
function parseCsvRows(csv){
  var lines=String(csv||'').split(/\r?\n/).filter(function(l){return l.trim().length>0});
  if(!lines.length)return[];
  var head=lines[0].split(',').map(function(v){return v.trim()});
  var rows=[];
  for(var i=1;i<lines.length;i++){
    var cols=lines[i].split(',');
    var row={};
    head.forEach(function(h,idx){row[h]=String(cols[idx]||'').trim()});
    rows.push(row);
  }
  return rows;
}
function validateByFieldRules(field,value,rows){
  var rules=(field&&field.validation)||[];
  for(var i=0;i<rules.length;i++){
    var r=rules[i],v=String(value||'');
    if(r.type==='required'&&v.trim().length===0)return r.message||'Wajib diisi';
    if(r.type==='min'&&v.length<Number(r.value||0))return r.message||'Minimal tidak terpenuhi';
    if(r.type==='max'&&v.length>Number(r.value||999999))return r.message||'Maksimal terlampaui';
    if(r.type==='email'&&v&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)===false)return r.message||'Email tidak valid';
    if(r.type==='phone'&&v&&/^(\+62|62|0)[0-9\-\s]{7,15}$/.test(v)===false)return r.message||'Telepon tidak valid';
    if(r.type==='unique'&&rows.some(function(x){return String(x[field.name]||'')===v}))return r.message||'Data harus unik';
  }
  return '';
}
function triggerImport(){var fi=byId('imp-file');if(fi)fi.click()}
async function handleImportFile(files){
  var file=files&&files[0];
  if(!file)return;
  var meta=eMeta(ent);
  if(!meta){toast('Entity tidak terdaftar di engine','error');return}
  var raw=await file.text();
  var rows=parseCsvRows(raw);
  if(!rows.length){toast('File kosong','error');return}
  var invalid=[];
  for(var i=0;i<rows.length;i++){
    var row=rows[i],err='';
    (meta.fields||[]).forEach(function(f){if(err)return;err=validateByFieldRules(f,row[f.name],rows)});
    if(err)invalid.push({row:i+2,error:err});
  }
  if(invalid.length){
    recAudit('import',{invalid:invalid.length,total:rows.length});
    toast('Impor gagal: '+invalid.length+' baris tidak valid','error');
    var rep='Baris,Error\n'+invalid.map(function(x){return x.row+','+x.error}).join('\n');
    var a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rep);a.download=ent+'-error-impor.csv';a.click();
    return;
  }
  for(var j=0;j<rows.length;j++){
    var payload={};
    (meta.fields||[]).forEach(function(f){if(f.name==='id')return;payload[f.name]=rows[j][f.name]||''});
    await apf(eBasePath(ent),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  }
  recAudit('import',{valid:rows.length,total:rows.length});
  toast('Impor berhasil: '+rows.length+' baris','success');
  ldList(ent);
}

function gt(v,e){
  closeMenus();
  closeDrawer();
  document.querySelectorAll('.view').forEach(function(x){x.classList.remove('on')});
  document.querySelectorAll('[data-nav]').forEach(function(x){x.classList.remove('active')});
  var nk='dashboard';
  if(v==='list'||v==='form')nk=e;
  if(v==='report')nk='laporan';
  var ne=document.querySelector('[data-nav="'+nk+'"]');
  if(ne)ne.classList.add('active');
  if(v==='dashboard'){
    document.getElementById('v-dash').classList.add('on');
    var mobileView=document.getElementById('v-mobile');
    if(mobileView)mobileView.classList.add('on');
    setCr(['Beranda']);
    renderWidgets();
    if(!dldd){ldDash();dldd=true;}
  }else if(v==='list'&&e){
    ent=e;
    PS=ePageSize(e);
    document.getElementById('v-list').classList.add('on');
    var lb=LABELS[e]||e;
    document.getElementById('lt').textContent=lb;
    document.getElementById('ls').textContent=e==='ticketing'?'Kelola penjualan, scan, dan validasi tiket':'Kelola data '+lb;
    document.getElementById('btn-add').onclick=function(){gt('form',e)};
    applyEntityToolbar(e);
    syncStatusOptionsForEntity(e);
    syncTicketingActions(e);
    setCr(['Beranda',lb]);
    ldList(e);
  }else if(v==='report'){
    document.getElementById('v-report').classList.add('on');
    setCr(['Beranda','Laporan ERP Wisata']);
    initReportView();
  }else if(v==='form'&&e){
    ent=e;
    document.getElementById('v-form').classList.add('on');
    var lb2=LABELS[e]||e,isEd=eId!==null;
    document.getElementById('ftitle').textContent=(isEd?'Edit ':'Tambah ')+lb2;
    document.getElementById('fsub').textContent=(isEd?'Ubah':'Isi')+' data '+lb2;
    document.getElementById('slbl').textContent=isEd?'Perbarui':'Simpan';
    document.getElementById('fbk').onclick=function(){eId=null;gt('list',e)};
    document.getElementById('bcancel').onclick=function(){eId=null;gt('list',e)};
    setCr(['Beranda',lb2,isEd?'Edit':'Tambah']);
    sfForm(e,isEd);
  }
}

function setCr(p){
  var bc=document.getElementById('bc');
  bc.innerHTML=p.map(function(c,i){return i===p.length-1?'<span class="cr now">'+c+'</span>':'<span class="cr">'+c+'</span><span class="sep"> / </span>'}).join('');
}
function tSB(){
  var sb=document.getElementById('sidebar');
  if(window.matchMedia('(max-width: 768px)').matches) sb.classList.toggle('mob');
  else sb.classList.toggle('col');
  syncSidebarTooltips();
}
function tgrp(el){el.classList.toggle('open');var s=el.nextElementSibling;if(s)s.classList.toggle('open')}

function tDark(){
  var h=document.documentElement;
  var modes=['light','dark','corporate','emerald'];
  var idx=modes.indexOf(activeTheme);
  activeTheme=modes[(idx+1)%modes.length];
  h.setAttribute('data-theme',activeTheme);
  h.classList.toggle('dark',activeTheme!=='light');
  localStorage.setItem('theme',activeTheme==='light'?'light':'dark');
  localStorage.setItem('satset-theme-mode',activeTheme);
  var dk=activeTheme!=='light';
  document.getElementById('dkic').innerHTML=dk?'<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>':'<path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>';
}
function setWorkspace(v){toast('Workspace: '+v,'success')}
function toggleNotif(ev){ev.stopPropagation();document.getElementById('notif-pop').classList.toggle('on');renderNotif();document.getElementById('usr-menu').classList.remove('on');document.getElementById('col-menu').classList.remove('on');document.getElementById('qc-menu').classList.remove('on')}
function toggleUserMenu(ev){ev.stopPropagation();document.getElementById('usr-menu').classList.toggle('on');document.getElementById('notif-pop').classList.remove('on');document.getElementById('col-menu').classList.remove('on');document.getElementById('qc-menu').classList.remove('on')}
function toggleColMenu(ev){ev.stopPropagation();document.getElementById('col-menu').classList.toggle('on');document.getElementById('notif-pop').classList.remove('on');document.getElementById('usr-menu').classList.remove('on');document.getElementById('qc-menu').classList.remove('on')}
function toggleQuickCreate(ev){ev.stopPropagation();document.getElementById('qc-menu').classList.toggle('on');document.getElementById('notif-pop').classList.remove('on');document.getElementById('usr-menu').classList.remove('on');document.getElementById('col-menu').classList.remove('on')}
function closeMenus(){document.getElementById('notif-pop').classList.remove('on');document.getElementById('usr-menu').classList.remove('on');document.getElementById('col-menu').classList.remove('on');document.getElementById('qc-menu').classList.remove('on');document.querySelectorAll('.rmenu').forEach(function(x){x.classList.remove('on')})}

function openCmd(){
  var p=document.getElementById('cmd-pal');
  p.classList.add('on');
  fltCmd('');
  trapFocus(document.querySelector('#cmd-pal .cp'));
  setTimeout(function(){document.getElementById('cmd-in').focus()},30);
}
function closeCmd(){document.getElementById('cmd-pal').classList.remove('on');cmdIdx=-1;cmdItems=[]}
function fuzzyScore(input,target){
  input=(input||'').toLowerCase();target=(target||'').toLowerCase();
  if(!input)return 1;
  if(target.includes(input))return 100-input.length;
  var score=0,pos=0;
  for(var i=0;i<input.length;i++){var ch=input[i],f=target.indexOf(ch,pos);if(f===-1)return -1;score+=f===pos?6:2;pos=f+1}
  return score;
}
function fltCmd(q){
  q=(q||'').toLowerCase();
  document.getElementById('cp-head').textContent=q?'Saran':'Pencarian Terbaru';
  var list=document.getElementById('cmd-list');
  list.innerHTML='';
  var recent=recentSearches.map(function(r){return {n:r,a:function(){document.getElementById('cmd-in').value=r;fltCmd(r);}}});
  var smart=SEARCH_POOL.map(function(v){return {n:v,a:function(){toast('Lihat '+v,'success');closeCmd();}}}).filter(function(x){return fuzzyScore(q,x.n)>=0}).sort(function(a,b){return fuzzyScore(q,b.n)-fuzzyScore(q,a.n)}).slice(0,8);
  var items=(q?smart:recent).concat(CMD.filter(function(c){return c.n.toLowerCase().includes(q)}));
  cmdItems=items;cmdIdx=-1;
  items.forEach(function(c,idx){
    var b=document.createElement('div');
    b.className='cp-item';
    b.innerHTML='<span>'+c.n+'</span><span class="kbd">Enter</span>';
    b.dataset.idx=String(idx);
    b.onclick=function(){if(q){recentSearches=[c.n].concat(recentSearches.filter(function(x){return x!==c.n})).slice(0,6);localStorage.setItem('satset-recent-search',JSON.stringify(recentSearches));}closeCmd();c.a()};
    list.appendChild(b);
  });
}
function moveCmd(step){
  if(!cmdItems.length)return;
  cmdIdx=(cmdIdx+step+cmdItems.length)%cmdItems.length;
  document.querySelectorAll('#cmd-list .cp-item').forEach(function(el){el.classList.remove('on')});
  var active=document.querySelector('#cmd-list .cp-item[data-idx="'+cmdIdx+'"]');
  if(active){active.classList.add('on');active.scrollIntoView({block:'nearest'});}
}

(function(){
  var stored=localStorage.getItem('satset-theme-mode')||(localStorage.getItem('theme')==='light'?'light':'dark');
  activeTheme=(stored==='corporate'||stored==='emerald'||stored==='light'||stored==='dark')?stored:'dark';
  document.documentElement.setAttribute('data-theme',activeTheme);
  document.documentElement.classList.toggle('dark',activeTheme!=='light');
})();

async function apf(p,o){return DataLayer.request(p,o||{})}
function toast(m,t){var c=document.getElementById('toasts'),el=document.createElement('div');el.className='toast '+(t==='error'?'er':'ok');var sp=document.createElement('span');sp.textContent=m;el.textContent=(t==='error'?'✕ ':'✓ ');el.appendChild(sp);c.appendChild(el);setTimeout(function(){el.remove()},3500)}
function debounce(fn,wait){var timer;return function(){var args=arguments;clearTimeout(timer);timer=setTimeout(function(){fn.apply(null,args)},wait)}}
function throttle(fn,wait){var ready=true;return function(){if(!ready)return;ready=false;fn.apply(null,arguments);setTimeout(function(){ready=true},wait)}}
function idle(cb){if('requestIdleCallback'in window)window.requestIdleCallback(cb);else setTimeout(cb,0)}
function trapFocus(root){if(!root)return;var nodes=root.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');if(!nodes.length)return;var first=nodes[0],last=nodes[nodes.length-1];root.onkeydown=function(e){if(e.key!=='Tab')return;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}
function relTime(ts){var m=Math.max(1,Math.round((Date.now()-ts)/60000));if(m<60)return m+' menit lalu';var h=Math.round(m/60);if(h<24)return h+' jam lalu';return Math.round(h/24)+' hari lalu'}
function fltSideMenu(q){
  var kw=(q||'').toLowerCase().trim();
  document.querySelectorAll('.sb-nav .sb-item[data-nav]').forEach(function(el){
    var txt=(el.querySelector('.lbl')&&el.querySelector('.lbl').textContent||'').toLowerCase();
    el.style.display=(!kw||txt.includes(kw))?'':'none';
  });
}
function dateKeyFromOffset(dayOffset){
  var d=new Date(Date.now()+dayOffset*86400000);
  return d.toISOString().slice(0,10);
}
function readReportFilters(){
  var fromInput=byId('report-from');
  var toInput=byId('report-to');
  reportState.from=(fromInput&&fromInput.value)||'';
  reportState.to=(toInput&&toInput.value)||'';
}
function updateReportStateView(){
  var stateNode=byId('report-state');
  var loadBtn=byId('report-load');
  if(loadBtn){
    loadBtn.disabled=reportState.loading;
    loadBtn.textContent=reportState.loading?'Memuat...':'Muat Laporan';
  }
  if(!stateNode)return;
  if(reportState.loading){
    stateNode.innerHTML='<div class="sk sk-lg"></div>';
    return;
  }
  if(reportState.error){
    stateNode.innerHTML='<div class="badge b-pending">Error</div> <span>'+escHtml(reportState.error)+'</span>';
    return;
  }
  if(reportState.data&&reportState.data.period){
    var pd=reportState.data.period;
    stateNode.innerHTML='<div class="badge b-active">Periode</div> <span>'+(pd.from||'-')+' s/d '+(pd.to||'-')+'</span>';
    return;
  }
  stateNode.innerHTML='';
}
function reportHasValue(node){
  if(node===null||typeof node==='undefined')return false;
  if(typeof node==='number')return node!==0;
  if(typeof node==='string')return node.trim().length>0;
  if(Array.isArray(node))return node.length>0&&node.some(reportHasValue);
  if(typeof node==='object'){
    var keys=Object.keys(node);
    if(!keys.length)return false;
    return keys.some(function(k){return reportHasValue(node[k])});
  }
  return false;
}
function renderReportSections(){
  var data=reportState.data||{};
  var operational=data.operational||{};
  var financial=data.financial||{};
  var reservation=data.reservation||{};
  var emptyNode=byId('report-empty');
  var sectionsNode=byId('report-sections');
  var isEmpty=!reportHasValue(operational)&&!reportHasValue(financial)&&!reportHasValue(reservation);
  if(emptyNode)emptyNode.style.display=(reportState.loading||reportState.error||!isEmpty)?'none':'';
  if(sectionsNode)sectionsNode.style.display=(reportState.loading||reportState.error||isEmpty)?'none':'grid';
  byId('report-operational').textContent=JSON.stringify(operational,null,2);
  byId('report-financial').textContent=JSON.stringify(financial,null,2);
  byId('report-reservation').textContent=JSON.stringify(reservation,null,2);
}
async function loadReportData(){
  readReportFilters();
  if(reportState.from&&reportState.to&&reportState.from>reportState.to){
    reportState.error='Filter periode tidak valid: from tidak boleh melebihi to';
    reportState.loading=false;
    reportState.data=null;
    updateReportStateView();
    renderReportSections();
    return;
  }
  reportState.loading=true;
  reportState.error='';
  updateReportStateView();
  renderReportSections();
  try{
    var qp=[];
    if(reportState.from)qp.push('from='+encodeURIComponent(reportState.from));
    if(reportState.to)qp.push('to='+encodeURIComponent(reportState.to));
    var path='/api/erp-wisata/report'+(qp.length?('?'+qp.join('&')):'');
    var data=await apf(path,{method:'GET',headers:{'authorization':'Bearer workspace-token'}});
    reportState.data=data||null;
  }catch(e){
    reportState.data=null;
    var errorMessage=e&&e.message?String(e.message):'Gagal memuat laporan';
    if(errorMessage.indexOf('HTTP 403')>=0){
      reportState.error='Akses laporan ditolak: Anda tidak memiliki permission wisata.laporan.';
    }else{
      reportState.error=errorMessage;
    }
  }finally{
    reportState.loading=false;
    updateReportStateView();
    renderReportSections();
  }
}
function initReportView(){
  if(!reportState.from)reportState.from=dateKeyFromOffset(-7);
  if(!reportState.to)reportState.to=dateKeyFromOffset(0);
  var fromInput=byId('report-from');
  var toInput=byId('report-to');
  if(fromInput)fromInput.value=reportState.from;
  if(toInput)toInput.value=reportState.to;
  if(!reportState.bound){
    var loadBtn=byId('report-load');
    var resetBtn=byId('report-reset');
    if(loadBtn)loadBtn.onclick=function(){loadReportData()};
    if(resetBtn)resetBtn.onclick=function(){
      reportState.from=dateKeyFromOffset(-7);
      reportState.to=dateKeyFromOffset(0);
      if(fromInput)fromInput.value=reportState.from;
      if(toInput)toInput.value=reportState.to;
      loadReportData();
    };
    reportState.bound=true;
  }
  if(!reportState.data&&!reportState.loading&&!reportState.error){
    loadReportData();
    return;
  }
  updateReportStateView();
  renderReportSections();
}
function openRecent(entity){toast('Membuka '+(LABELS[entity]||entity),'success');gt('list',entity)}
function setWidgetPref(id,patch){
  var cur=widgetCfg[id]||{};
  widgetCfg[id]=Object.assign({},cur,patch||{});
  localStorage.setItem('satset-widget-config',JSON.stringify(widgetCfg));
  renderWidgets();
}
function pinFavorite(entity){
  var map={reservasi:'aktivitas-terbaru',laporan:'ringkasan-entitas'};
  var target=map[entity]||entity;
  setWidgetPref(target,{pinned:true,hidden:false});
  toast('Widget '+(LABELS[entity]||entity)+' dipin ke atas','success');
}
function favWidget(id){setWidgetPref(id,{favorite:true});toast('Widget ditandai favorit','success')}
function resizeWidget(id){
  var seq=['sm','md','lg','xl'];
  var cur=(widgetCfg[id]&&widgetCfg[id].width)||'md';
  var idx=seq.indexOf(cur);
  setWidgetPref(id,{width:seq[(idx+1)%seq.length]});
}
function toggleWidgetHide(id){
  var hidden=!!(widgetCfg[id]&&widgetCfg[id].hidden);
  setWidgetPref(id,{hidden:!hidden});
}
function takeInsightAction(action){
  if(action==='billing')return gt('list','pembayaran');
  if(action==='maintenance')return gt('list','kendaraan');
  if(action==='reservation')return gt('list','reservasi');
  gt('dashboard');
}
function openCafePos(){gt('list','cafe')}
function openCafeSalesHistory(){gt('list','cafe')}
function openCafeKitchenDisplay(){gt('dashboard');toast('Kitchen Display ditampilkan di widget Cafe Dashboard','success')}
async function openOutboundBooking(){
  var nama=(window.prompt('Nama booking outbound','Outbound Grup Pagi')||'').trim();
  if(!nama)return;
  try{await apf(eBasePath('reservasi'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nama,status:'Draft'})});toast('Booking outbound dibuat','success');gt('list','reservasi')}catch(e){toast('Gagal membuat booking outbound: '+e.message,'error')}
}
function openOutboundCheckIn(){openTicketScanner()}
function markOutboundAttendanceQuick(){
  ensureOutboundSeed();
  var code=(window.prompt('Nomor peserta atau booking','')||'').trim();
  if(!code)return;
  var updated=false;
  outboundRecords=outboundRecords.map(function(record){
    record.peserta=(record.peserta||[]).map(function(item){if(item.nomorPeserta===code||item.bookingNo===code||item.nama===code){updated=true;return Object.assign({},item,{statusHadir:'Hadir'})}return item});
    return record;
  });
  if(!updated){toast('Peserta outbound tidak ditemukan','error');return}
  saveOutboundRecords();
  pushNotif('success','Absensi','Peserta outbound ditandai hadir');
  toast('Absensi outbound diperbarui','success');
  ldDash();
}
function openOutboundSchedule(){gt('list','outbound');toast('Jadwal outbound tersedia di detail outbound','success')}
function openOutboundEquipment(){gt('list','outbound');toast('Peralatan outbound tersedia di detail outbound','success')}
function openOutboundInstructor(){gt('list','outbound');toast('Instruktur outbound tersedia di detail outbound','success')}
function openOutboundReport(){var csv='id,nama,status,pendapatan\n'+(outboundRecords||[]).map(function(row){return '"'+row.id+'","'+String(row.name||'').replace(/"/g,'""')+'","'+row.status+'","'+row.pendapatan+'"'}).join('\n');var a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='laporan-outbound.csv';a.click();toast('Laporan outbound diekspor','success')}
function printLatestCafeReceipt(){
  if(!cafeOrders.length){toast('Belum ada transaksi cafe','error');return}
  var last=cafeOrders[0];
  var lines=['Struk '+last.orderNo,'Kasir: '+last.kasir,'Status: '+last.status].concat((last.items||[]).map(function(item){return item.namaMenu+' x'+item.qty+' = '+fmtIdr(item.total)})).concat(['Total: '+fmtIdr(last.total),'Bayar: '+fmtIdr(last.pembayaran.dibayar),'Kembalian: '+fmtIdr(last.pembayaran.kembalian)]);
  window.alert(lines.join('\n'));
}
function openCafeShift(){
  if(activeCafeShift()){toast('Shift kasir sudah aktif','error');return}
  var namaKasir=(window.prompt('Nama kasir','Kasir Utama')||'').trim();
  if(!namaKasir)return;
  var modalAwal=Number(window.prompt('Modal awal','250000')||0);
  var shift=createCafeShiftPayload(namaKasir,modalAwal);
  cafeShifts.unshift(shift);
  saveCafeShifts();
  pushNotif('success','Shift Dibuka','Shift kasir '+namaKasir+' telah dibuka');
  toast('Shift kasir dibuka','success');
  ldDash();
}
function closeCafeShift(){
  var shift=activeCafeShift();
  if(!shift){toast('Belum ada shift aktif','error');return}
  var rows=cafeOrders.filter(function(order){return order.kasir===shift.namaKasir&&String(order.dibuatPada||'').slice(0,10)===cafeTodayKey()});
  shift.totalPenjualan=rows.reduce(function(acc,row){return acc+Number(row.total||0)},0);
  shift.totalTunai=rows.filter(function(row){return row.pembayaran.metode==='Tunai'}).reduce(function(acc,row){return acc+Number(row.total||0)},0);
  shift.totalNonTunai=shift.totalPenjualan-shift.totalTunai;
  shift.selisihKas=shift.totalTunai-shift.modalAwal;
  shift.ringkasanShift='Order: '+rows.length+', Penjualan: '+fmtIdr(shift.totalPenjualan);
  shift.jamTutup=new Date().toISOString();
  shift.aktif=false;
  saveCafeShifts();
  pushNotif('info','Shift Ditutup','Shift '+shift.namaKasir+' telah ditutup');
  toast('Shift kasir ditutup','success');
  ldDash();
}
async function quickCafeOrder(){
  var shift=activeCafeShift();
  if(!shift){openCafeShift();shift=activeCafeShift();if(!shift)return}
  var menuCode=(window.prompt('Kode menu ('+(cafeMenus||[]).map(function(menu){return menu.kodeMenu}).join('/')+')','MKN-001')||'').trim();
  var menu=(cafeMenus||[]).find(function(item){return item.kodeMenu===menuCode||item.namaMenu.toLowerCase()===menuCode.toLowerCase()});
  if(!menu){toast('Menu tidak ditemukan','error');return}
  var qty=Math.max(1,Number(window.prompt('Jumlah item','1')||1));
  var payment=(window.prompt('Metode pembayaran ('+(CAFE_PAYMENT||[]).join('/')+')','Tunai')||'Tunai').trim();
  if((CAFE_PAYMENT||[]).indexOf(payment)<0)payment='Tunai';
  var bookingNo=(window.prompt('Nomor booking (opsional)','')||'').trim();
  var ticketNo=(window.prompt('Nomor tiket (opsional)','')||'').trim();
  var catatan=(window.prompt('Catatan pesanan','')||'').trim();
  var totals=calcCafeTotals(menu,qty);
  var order={
    id:genCafeOrderNo(),
    name:'Pesanan '+menu.namaMenu,
    status:'Dibayar',
    orderNo:genCafeOrderNo(),
    kasir:shift.namaKasir,
    meja:'-',
    items:[{id:menu.id+'-'+Date.now(),menuId:menu.id,kodeMenu:menu.kodeMenu,namaMenu:menu.namaMenu,qty:qty,harga:menu.harga,pajakPercent:menu.pajakPercent,serviceChargePercent:menu.serviceChargePercent,diskonPercent:menu.diskonPercent,catatan:catatan,subtotal:totals.subtotal,diskon:totals.diskon,pajak:totals.pajak,serviceCharge:totals.serviceCharge,total:totals.total}],
    pembayaran:{metode:payment,dibayar:totals.total,pembulatan:totals.pembulatan,kembalian:0},
    kitchen:{nomorAntrian:genCafeQueueNo(),status:'Menunggu',estimasiMenit:Math.max(5,qty*4),prioritas:(bookingNo||ticketNo)?'Tinggi':'Normal',riwayatStatus:[{status:'Menunggu',at:new Date().toISOString()}]},
    subtotal:totals.subtotal,diskon:totals.diskon,pajak:totals.pajak,serviceCharge:totals.serviceCharge,pembulatan:totals.pembulatan,total:totals.total,catatan:catatan,dibuatPada:new Date().toISOString(),diperbaruiPada:new Date().toISOString()
  };
  if(bookingNo){
    try{var bp=await apf(eBasePath('reservasi'));var booking=(bp.data||[]).find(function(row){return row.bookingNo===bookingNo||row.id===bookingNo||row.name===bookingNo});if(booking){order.booking={bookingNo:booking.bookingNo||bookingNo,namaPemesan:booking.name||'-',jumlahOrang:Number(booking.jumlahOrang||1),paket:booking.paketWisata||'-',jadwal:(booking.tanggal||'')+' '+(booking.jam||''),catatan:booking.catatan||''};}}catch(_e){}
  }
  if(ticketNo){
    try{var tp=await apf(eBasePath('ticketing'));var ticket=(tp.data||[]).find(function(row){return row.ticketNo===ticketNo||row.id===ticketNo});if(ticket){order.tiket={ticketNo:ticket.ticketNo||ticketNo,namaPengunjung:ticket.name||'-',jenisTiket:ticket.tariffType||'-',jumlahOrang:1,promo:'',voucher:'',diskon:Number(ticket.discount||0)};}}catch(_e){}
  }
  if(bookingNo||ticketNo){
    outboundRecords.forEach(function(record){(record.peserta||[]).forEach(function(item){if((bookingNo&&item.bookingNo===bookingNo)||(ticketNo&&item.ticketNo===ticketNo)){order.catatan=((order.catatan||'')+' '+item.promoCafe+' '+item.voucherMakan).trim();if(order.tiket){order.tiket.promo=item.promoCafe;order.tiket.voucher=item.voucherMakan;}}})});
  }
  cafeOrders.unshift(order);
  cafeOrders=cafeOrders.slice(0,800);
  saveCafeOrders();
  buildCafeJournalEntry(order);
  pushTimeline('Pesanan cafe dibuat ('+order.orderNo+')','CF');
  pushNotif('success','Order Baru','Pesanan cafe '+order.orderNo+' berhasil dibuat');
  toast('Pesanan cafe tersimpan','success');
  if(ent==='cafe')ldList('cafe');
  ldDash();
}
function bookingNoFromRow(row,fallbackName){
  if(row&&row.bookingNo)return String(row.bookingNo);
  if(row&&row.id&&String(row.id).indexOf('BK-')===0)return String(row.id);
  if(fallbackName&&String(fallbackName).indexOf('BK-')===0)return String(fallbackName);
  return genBookingNo();
}
async function createTicketFromBookingIfNeeded(booking){
  var ticketPayload=await apf(eBasePath('ticketing'));
  var rows=ticketPayload.data||[];
  var existed=rows.find(function(r){return String(r.bookingNo||'')===String(booking.bookingNo)});
  if(existed)return existed;
  var no=genTicketNo();
  var totals=calcTicketTotals('Dewasa',Math.max(1,Number(booking.jumlahOrang||1)),0);
  var created=await apf(eBasePath('ticketing'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    name:'Tiket Booking '+booking.bookingNo,
    status:'Belum Digunakan',
    ticketNo:no,
    bookingNo:booking.bookingNo,
    qrCode:'SATSET:QR:'+no,
    barcode:'SATSET:BAR:'+no,
    tariffType:'Dewasa',
    channel:'Offline',
    paymentMethod:'Tunai',
    amount:totals.amount,
    discount:totals.discount,
    tax:totals.tax,
    total:totals.total,
    issuedAt:new Date().toISOString(),
    expiredAt:new Date(Date.now()+86400000).toISOString()
  })});
  pushTimeline('Tiket dibuat otomatis ('+booking.bookingNo+')','TK');
  pushNotif('success','Tiket dibuat','Tiket untuk booking '+booking.bookingNo+' berhasil dibuat');
  return created;
}
async function voidTicketByBookingNo(bookingNo){
  var ticketPayload=await apf(eBasePath('ticketing'));
  var rows=ticketPayload.data||[];
  var rel=rows.filter(function(r){return String(r.bookingNo||'')===String(bookingNo)&&r.status!=='Void'});
  for(var i=0;i<rel.length;i++){
    await apf(eItemPath('ticketing',rel[i].id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Void'})});
  }
  if(rel.length){
    pushTimeline('Tiket di-void otomatis ('+bookingNo+')','VD');
    pushNotif('warning','Tiket Void','Booking dibatalkan, '+rel.length+' tiket di-void');
  }
}
async function quickTicketSale(){
  var tariff=window.prompt('Jenis tarif tiket (Dewasa/Anak/Rombongan/VIP/Event/Musiman)','Dewasa');
  if(!tariff)return;
  var qty=Number(window.prompt('Jumlah tiket','1')||1);
  var discount=Number(window.prompt('Diskon (%)','0')||0);
  var payment=window.prompt('Metode pembayaran (Tunai/Kartu/Transfer/QRIS/EWallet)','Tunai')||'Tunai';
  if((TICKET_PAYMENT||[]).indexOf(payment)<0)payment='Tunai';
  var t=calcTicketTotals(tariff,qty,discount);
  var no=genTicketNo();
  try{
    await apf(eBasePath('ticketing'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      name:'Tiket '+tariff+' '+no,
      status:'Belum Digunakan',
      ticketNo:no,
      qrCode:'SATSET:QR:'+no,
      barcode:'SATSET:BAR:'+no,
      tariffType:tariff,
      channel:'Offline',
      paymentMethod:payment,
      amount:t.amount,
      discount:t.discount,
      tax:t.tax,
      total:t.total,
      issuedAt:new Date().toISOString(),
      expiredAt:new Date(Date.now()+86400000).toISOString()
    })});
    pushTimeline('Penjualan tiket '+no,'TJ');
    pushNotif('success','Tiket Terjual','Tiket '+no+' berhasil terjual');
    recordFinanceTransaction({jenis:'Pemasukan',sumber:'Ticketing',kategori:'Tiket',metodePembayaran:payment,nominal:t.total,referensi:no,akunKredit:'Pendapatan Tiket'});
    toast('Tiket terjual: '+no+' ('+fmtIdr(t.total)+')','success');
    if(ent==='ticketing')ldList('ticketing');
    ldDash();
  }catch(e){toast('Gagal jual tiket: '+e.message,'error')}
}
async function openTicketScanner(){
  var code=(window.prompt('Scan QR/Barcode/Kode Tiket','')||'').trim();
  if(!code)return;
  var gate=(window.prompt('Gate masuk','Gerbang Utama')||'Gerbang Utama').trim();
  var petugas=(window.prompt('Nama petugas scan','Petugas 1')||'Petugas 1').trim();
  var nowIso=new Date().toISOString();
  try{
    var payload=await apf(eBasePath('ticketing'));
    var rows=payload.data||[];
    var hit=rows.find(function(r){return r.ticketNo===code||r.qrCode===code||r.barcode===code||r.id===code});
    if(!hit){markTicketScan(code,'invalid',gate,petugas,'Tiket tidak ditemukan');pushNotif('error','Scan Ditolak','Tiket tidak ditemukan');toast('Tiket tidak ditemukan','error');return}
    if(hit.status==='Sudah Digunakan'){markTicketScan(hit.ticketNo,'used',gate,petugas,'Tiket sudah digunakan');pushNotif('warning','Scan Ditolak','Tiket sudah digunakan');toast('Tiket sudah digunakan','error');return}
    if(hit.status==='Kadaluarsa'){markTicketScan(hit.ticketNo,'invalid',gate,petugas,'Tiket kadaluarsa');pushNotif('warning','Scan Ditolak','Tiket kadaluarsa');toast('Tiket kadaluarsa','error');return}
    if(hit.status==='Refund'){markTicketScan(hit.ticketNo,'invalid',gate,petugas,'Tiket refund');pushNotif('warning','Scan Ditolak','Tiket refund');toast('Tiket refund','error');return}
    if(hit.status==='Void'){markTicketScan(hit.ticketNo,'invalid',gate,petugas,'Tiket void');pushNotif('warning','Scan Ditolak','Tiket void');toast('Tiket void','error');return}
    if(hit.expiredAt&&String(hit.expiredAt)<nowIso){markTicketScan(hit.ticketNo,'invalid',gate,petugas,'Tiket kadaluarsa');pushNotif('warning','Scan Ditolak','Tiket sudah lewat masa berlaku');toast('Tiket kadaluarsa','error');return}
    await apf(eItemPath('ticketing',hit.id),{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'Sudah Digunakan'})});
    markTicketScan(hit.ticketNo,'valid',gate,petugas,'Scan berhasil');
    if(hit.bookingNo)finishCheckInQueue(hit.bookingNo);
    syncOutboundAttendanceFromTicket(hit,gate,petugas);
    pushTimeline('Scan masuk '+hit.ticketNo+' di '+gate,'SC');
    pushNotif('success','Scan Berhasil','Tiket '+hit.ticketNo+' valid di '+gate);
    toast('Scan valid: '+hit.ticketNo,'success');
    if(ent==='ticketing')ldList('ticketing');
    ldDash();
  }catch(e){toast('Gagal scan tiket: '+e.message,'error')}
}
function exportTicketReport(type){
  var rows=(allR||[]).filter(function(r){
    if(type==='penjualan')return true;
    if(type==='penggunaan')return r.status==='Sudah Digunakan';
    if(type==='refund')return r.status==='Refund';
    if(type==='void')return r.status==='Void';
    return true;
  });
  var head=['id','name','status','ticketNo','tariffType','paymentMethod','total','issuedAt'];
  var csv=[head.join(',')].concat(rows.map(function(r){return head.map(function(k){return '"'+String(r[k]||'').replace(/"/g,'""')+'"'}).join(',')})).join('\n');
  var a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='laporan-tiket-'+type+'.csv';a.click();
}
function greeting(){var h=new Date().getHours();if(h<11)return 'Selamat Pagi';if(h<15)return 'Selamat Siang';if(h<19)return 'Selamat Sore';return 'Selamat Malam'}
function setNotifCat(cat){notifCat=cat;document.querySelectorAll('#notif-cats .n-chip').forEach(function(el){el.classList.toggle('on',el.dataset.cat===cat)});renderNotif()}
function markNotif(id){NOTIFS=NOTIFS.map(function(n){return n.id===id?Object.assign({},n,{unread:false}):n});renderNotif()}
function markAllNotif(){NOTIFS=NOTIFS.map(function(n){return Object.assign({},n,{unread:false})});renderNotif();toast('Semua notifikasi ditandai terbaca','success')}
function renderNotif(){
  var q=(document.getElementById('notif-search').value||'').toLowerCase();
  var list=document.getElementById('notif-list');list.innerHTML='';
  var rows=NOTIFS.filter(function(n){return(notifCat==='all'||n.cat===notifCat)&&((n.title+' '+n.desc).toLowerCase().includes(q))});
  var catLabel={success:'Berhasil',warning:'Peringatan',info:'Informasi',error:'Insiden',support:'Dukungan'};
  var catClass={success:'b-active',warning:'b-pending',info:'b-draft',error:'b-dibatalkan',support:'b-draft'};
  rows.forEach(function(n){
    var row=document.createElement('div');row.className='notify-row'+(n.unread?' unread':'');
    row.innerHTML='<div class="pop-ic">'+n.cat.slice(0,1).toUpperCase()+'</div><div><div class="notify-k"><span class="badge '+(catClass[n.cat]||'b-draft')+'">'+(catLabel[n.cat]||n.cat)+'</span></div><div class="pop-t">'+n.title+'</div><div class="pop-d">'+n.desc+' • '+relTime(n.at)+'</div></div>';
    if(n.unread){var b=document.createElement('button');b.className='notify-read';b.textContent='Tandai Dibaca';b.onclick=function(){markNotif(n.id)};row.appendChild(b)}
    list.appendChild(row);
  });
  document.getElementById('notif-unread').textContent=String(NOTIFS.filter(function(n){return n.unread}).length);
}
function renderTimeline(){
  var tl=document.getElementById('tl-feed');tl.innerHTML='';
  TIMELINE.forEach(function(ev){
    var row=document.createElement('div');row.className='tl-row';
    row.innerHTML='<div class="tl-time2">'+ev.h+'</div><div class="tl-dot tl-dot-soft">'+ev.ic+'</div><div class="tl-body"><div class="tl-txt">'+ev.t+'</div><div class="tl-time">'+relTime(ev.at)+'</div></div>';
    tl.appendChild(row);
  });
}
function toggleWidgetCustomizer(){customizing=!customizing;document.body.classList.toggle('customizing',customizing);toast(customizing?'Mode atur widget aktif: seret atau klik kanan judul kartu untuk sembunyikan':'Mode atur widget nonaktif','success')}
function showAllWidgets(){Object.keys(widgetCfg).forEach(function(k){widgetCfg[k]=Object.assign({},widgetCfg[k],{hidden:false})});localStorage.setItem('satset-widget-config',JSON.stringify(widgetCfg));renderWidgets();toast('Semua widget ditampilkan','success')}
function applyWidgetConfig(){
  document.querySelectorAll('#v-dash .card[data-widget]').forEach(function(card){
    var key=card.getAttribute('data-widget');
    var cfg=widgetCfg[key]||{};
    card.style.display=cfg.hidden?'none':'';
    card.setAttribute('draggable','true');
    if(card.dataset.bound!=='1'){
      card.addEventListener('dragstart',function(){card.classList.add('ghost');card.classList.add('dragging');card.dataset.drag='1'});
      card.addEventListener('dragend',function(){card.classList.remove('ghost');card.classList.remove('dragging');delete card.dataset.drag;saveWidgetOrder()});
      card.addEventListener('dragover',function(e){e.preventDefault();var drag=document.querySelector('#v-dash .card.dragging');if(!drag||drag===card)return;card.parentElement.insertBefore(drag,card)});
      card.dataset.bound='1';
    }
    var hd=card.querySelector('.card-hd');
    if(hd&&!hd.querySelector('.wm-grp')){
      var grp=document.createElement('div');grp.className='wm-grp';
      var pin=document.createElement('button');pin.className='btn btn-g btn-sm';pin.textContent='Pin';pin.onclick=function(ev){ev.stopPropagation();setWidgetPref(key,{pinned:true,hidden:false})};
      var fav=document.createElement('button');fav.className='btn btn-g btn-sm';fav.textContent='Favorit';fav.onclick=function(ev){ev.stopPropagation();favWidget(key)};
      var size=document.createElement('button');size.className='btn btn-g btn-sm';size.textContent='Ukuran';size.onclick=function(ev){ev.stopPropagation();resizeWidget(key)};
      var hb=document.createElement('button');hb.className='btn btn-g btn-sm hide-widget';hb.textContent='Sembunyikan';hb.onclick=function(ev){ev.stopPropagation();toggleWidgetHide(key)};
      grp.append(pin,fav,size,hb);
      hd.appendChild(grp);
    }
  });
}
function saveWidgetOrder(){
  document.querySelectorAll('#v-dash .card[data-widget]').forEach(function(card,idx){var key=card.getAttribute('data-widget');widgetCfg[key]=Object.assign({},widgetCfg[key],{order:idx})});
  localStorage.setItem('satset-widget-config',JSON.stringify(widgetCfg));
  renderWidgets();
}
function restoreWidgetOrder(){
  document.querySelectorAll('#v-dash .card[data-widget]').forEach(function(card){var key=card.getAttribute('data-widget');var cfg=widgetCfg[key];if(cfg&&typeof cfg.order==='number'){var p=card.parentElement,ref=p.children[cfg.order];if(ref&&ref!==card)p.insertBefore(card,ref)}});
}
function skDash(){['bar-rev','bar-res','bar-ent','bar-cash','bar-occupancy','bar-ticket','bar-operasional','bar-outbound-participant','bar-outbound-revenue','bar-enterprise-showcase'].forEach(function(id){var x=document.getElementById(id);if(x)x.innerHTML='<rect x="20" y="24" width="520" height="120" rx="12" fill="currentColor" opacity=".08" />'})}

function renderSystemHealth(c){
  var rows=[
    ['Server','Normal','CPU stabil'],
    ['Database',c.reservasi>120?'Perhatian':'Normal','Latency 32ms'],
    ['Cache','Normal','Hit ratio 91%'],
    ['Storage','Normal','Pemakaian 64%'],
    ['Memory',c.hotel>80?'Perhatian':'Normal','RAM 72%'],
    ['API','Normal','Rata-rata 141ms'],
    ['Queue',c.pembayaran>60?'Perhatian':'Normal','Antrean '+Math.max(2,Math.round((c.pembayaran||1)*0.2))]
  ];
  var target=byId('status-wid');
  if(!target)return;
  target.innerHTML=rows.map(function(r){
    var cls=r[1]==='Normal'?'b-active':(r[1]==='Perhatian'?'b-pending':'b-dibatalkan');
    return '<div><div class="wid-row"><span>'+r[0]+'</span><span class="badge '+cls+'">'+r[1]+'</span></div><div class="health-meta">'+r[2]+'</div></div>';
  }).join('');
}
function renderCommandCenter(c){
  var me=byId('cc-me'),ap=byId('cc-approval'),tk=byId('cc-task'),nt=byId('cc-notif'),tg=byId('cc-target');
  if(me)me.textContent=String(Math.max(2,Math.round((c.reservasi||1)*0.18)));
  if(ap)ap.textContent=String(Math.max(1,Math.round((c.pembayaran||1)*0.12)));
  if(tk)tk.textContent=String(Math.max(3,Math.round((c.destinasi||1)*0.22)));
  if(nt)nt.textContent=String(NOTIFS.filter(function(n){return n.unread}).length);
  if(tg)tg.textContent='Capai SLA reservasi 98%';
}
function renderKpiMeta(){
  var stamp=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  ['ticket','booking','ticket-revenue','cafe','outbound','cash','bank','profit'].forEach(function(k){var el=byId('kpi-updated-'+k);if(el)el.textContent='Pembaruan: '+stamp});
}
function renderPrimaryKpi(counts,ticketRows){
  var today=new Date().toISOString().slice(0,10);
  var finance=summarizeFinanceTransactions();
  var cafe=summarizeCafeOrders();
  var outbound=summarizeOutboundRecords();
  var todayTickets=ticketRows.filter(function(row){return String(row.issuedAt||'').slice(0,10)===today});
  var ticketRevenue=todayTickets.reduce(function(acc,row){return acc+Number(row.total||0)},0);
  if(byId('kv-ticket-today'))byId('kv-ticket-today').textContent=String(todayTickets.length||0);
  if(byId('kv-booking-today'))byId('kv-booking-today').textContent=String(counts.reservasi||0);
  if(byId('kv-revenue-ticket'))byId('kv-revenue-ticket').textContent=fmtIdr(ticketRevenue);
  if(byId('kv-revenue-cafe'))byId('kv-revenue-cafe').textContent=fmtIdr(cafe.pendapatanCafeHariIni||0);
  if(byId('kv-revenue-outbound'))byId('kv-revenue-outbound').textContent=fmtIdr(outbound.pendapatanOutbound||0);
  if(byId('kv-cash-balance'))byId('kv-cash-balance').textContent=fmtIdr(finance.saldoKas||0);
  if(byId('kv-bank-balance'))byId('kv-bank-balance').textContent=fmtIdr(finance.saldoBank||0);
  if(byId('kv-profit-today'))byId('kv-profit-today').textContent=fmtIdr(finance.labaOperasionalHariIni||0);
}
function renderTicketSummary(rows){
  var root=byId('ticket-summary');
  if(!root)return;
  var today=new Date().toISOString().slice(0,10);
  var sum=rows.reduce(function(acc,row){
    if(String(row.issuedAt||'').slice(0,10)===today)acc.hariIni+=1;
    if(row.status==='Sudah Digunakan')acc.digunakan+=1;
    if(row.status==='Belum Digunakan')acc.belum+=1;
    acc.pendapatan+=Number(row.total||0);
    return acc;
  },{hariIni:0,pendapatan:0,digunakan:0,belum:0});
  root.innerHTML=[
    ['Tiket Hari Ini',sum.hariIni],
    ['Pendapatan Tiket',fmtIdr(sum.pendapatan)],
    ['Tiket Digunakan',sum.digunakan],
    ['Tiket Belum Digunakan',sum.belum]
  ].map(function(x){return '<div class="sum-card"><div class="sum-name">'+x[0]+'</div><div class="sum-val">'+x[1]+'</div></div>'}).join('');
}
function drawTicketChart(rows){
  var sv=byId('bar-ticket');
  if(!sv)return;
  var states=['Belum Digunakan','Sudah Digunakan','Kadaluarsa','Void','Refund'];
  var counts=states.map(function(s){return rows.filter(function(r){return r.status===s}).length});
  var max=Math.max.apply(null,counts.concat([1]));
  sv.innerHTML='';
  states.forEach(function(s,idx){
    var x=36+idx*100;
    var h=Math.max(4,Math.round((counts[idx]/max)*100));
    var y=145-h;
    var r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x',String(x));r.setAttribute('y',String(y));r.setAttribute('width','64');r.setAttribute('height',String(h));r.setAttribute('rx','10');r.setAttribute('fill',idx===1?'var(--success)':(idx===0?'var(--brand)':'var(--warn)'));r.setAttribute('opacity','0.86');sv.appendChild(r);
    var t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',String(x+32));t.setAttribute('y',String(y-8));t.setAttribute('text-anchor','middle');t.setAttribute('font-size','11');t.setAttribute('fill','currentColor');t.textContent=String(counts[idx]);sv.appendChild(t);
    var l=document.createElementNS('http://www.w3.org/2000/svg','text');l.setAttribute('x',String(x+32));l.setAttribute('y','165');l.setAttribute('text-anchor','middle');l.setAttribute('font-size','10');l.setAttribute('fill','currentColor');l.setAttribute('opacity','0.65');l.textContent=s.substring(0,8);sv.appendChild(l);
  });
}
function renderOperationalSummary(counts,ticketRows){
  var root=byId('operasional-summary');
  if(!root)return;
  var sold=ticketRows.length;
  var used=ticketRows.filter(function(r){return r.status==='Sudah Digunakan'}).length;
  var income=ticketRows.reduce(function(acc,row){return acc+Number(row.total||0)},0);
  var items=[
    ['Booking',counts.reservasi||0],
    ['Tiket Terjual',sold],
    ['Tiket Digunakan',used],
    ['Pendapatan',fmtIdr(income)],
    ['Cafe',counts.cafe||0],
    ['Outbound',counts.outbound||0]
  ];
  root.innerHTML=items.map(function(x){return '<div class="sum-card"><div class="sum-name">'+x[0]+'</div><div class="sum-val">'+x[1]+'</div></div>'}).join('');
}
function drawOperationalChart(counts,ticketRows){
  var sv=byId('bar-operasional');
  if(!sv)return;
  var sold=ticketRows.length;
  var visitors=ticketRows.filter(function(r){return r.status==='Sudah Digunakan'}).length;
  var income=ticketRows.reduce(function(acc,row){return acc+Number(row.total||0)},0);
  var booking=counts.reservasi||0;
  var data=[['Penjualan Tiket',sold],['Booking',booking],['Pengunjung',visitors],['Pendapatan',Math.round(income/100000)]];
  var mx=Math.max.apply(null,data.map(function(x){return x[1]}).concat([1]));
  sv.innerHTML='';
  data.forEach(function(row,idx){
    var x=52+idx*120;
    var h=Math.max(4,Math.round((row[1]/mx)*100));
    var y=145-h;
    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',String(x));rect.setAttribute('y',String(y));rect.setAttribute('width','72');rect.setAttribute('height',String(h));rect.setAttribute('rx','10');
    rect.setAttribute('fill',idx%2===0?'var(--brand)':'var(--info)');rect.setAttribute('opacity','0.88');
    sv.appendChild(rect);
    var value=document.createElementNS('http://www.w3.org/2000/svg','text');
    value.setAttribute('x',String(x+36));value.setAttribute('y',String(y-8));value.setAttribute('text-anchor','middle');value.setAttribute('font-size','11');value.setAttribute('fill','currentColor');value.textContent=String(row[1]);
    sv.appendChild(value);
    var label=document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x',String(x+36));label.setAttribute('y','165');label.setAttribute('text-anchor','middle');label.setAttribute('font-size','10');label.setAttribute('fill','currentColor');label.setAttribute('opacity','0.65');label.textContent=row[0].substring(0,10);
    sv.appendChild(label);
  });
}
function renderCheckInQueueSummary(){
  var root=byId('checkin-queue-summary');
  if(!root)return;
  var waiting=checkInQueue.filter(function(x){return x.status==='Menunggu'}).length;
  var called=checkInQueue.filter(function(x){return x.status==='Dipanggil'}).length;
  var done=checkInQueue.filter(function(x){return x.status==='Selesai'}).length;
  root.innerHTML=[
    ['Menunggu',waiting],
    ['Dipanggil',called],
    ['Selesai',done]
  ].map(function(x){return '<div class="sum-card"><div class="sum-name">'+x[0]+'</div><div class="sum-val">'+x[1]+'</div></div>'}).join('');
}
function renderGateMonitoringSummary(){
  var root=byId('gate-monitoring-summary');
  if(!root)return;
  var total=ticketScanHistory.length;
  var valid=ticketScanHistory.filter(function(x){return x.result==='valid'}).length;
  var fail=ticketScanHistory.filter(function(x){return x.result!=='valid'}).length;
  var voidCount=ticketScanHistory.filter(function(x){return x.reason==='Tiket void'}).length;
  var refundCount=ticketScanHistory.filter(function(x){return x.reason==='Tiket refund'}).length;
  root.innerHTML=[
    ['Jumlah Scan',total],
    ['Scan Berhasil',valid],
    ['Scan Gagal',fail],
    ['Tiket Void',voidCount],
    ['Tiket Refund',refundCount]
  ].map(function(x){return '<div class="sum-card"><div class="sum-name">'+x[0]+'</div><div class="sum-val">'+x[1]+'</div></div>'}).join('');
}
function renderEnterpriseSummary(counts,ticketRows){
  var root=byId('enterprise-summary');
  if(!root)return;
  var finance=summarizeFinanceTransactions();
  var cafe=summarizeCafeOrders();
  var outbound=summarizeOutboundRecords();
  var today=new Date().toISOString().slice(0,10);
  var pendapatanTiket=ticketRows.filter(function(row){return String(row.issuedAt||'').slice(0,10)===today}).reduce(function(acc,row){return acc+Number(row.total||0)},0);
  var cards=[
    ['Ticket Hari Ini',ticketRows.filter(function(row){return String(row.issuedAt||'').slice(0,10)===today}).length||0],
    ['Booking Hari Ini',counts.reservasi||7],
    ['Pendapatan Tiket',fmtIdr(pendapatanTiket)],
    ['Pendapatan Cafe',fmtIdr(cafe.pendapatanCafeHariIni||325000)],
    ['Pendapatan Outbound',fmtIdr(outbound.pendapatanOutbound||275000)],
    ['Saldo Kas',fmtIdr(finance.saldoKas||8250000)],
    ['Saldo Bank',fmtIdr(finance.saldoBank||43000000)],
    ['Laba Hari Ini',fmtIdr(finance.labaOperasionalHariIni||750000)]
  ];
  root.innerHTML=cards.map(function(card){return '<div class="sum-card"><div class="sum-name">'+card[0]+'</div><div class="sum-val">'+card[1]+'</div></div>'}).join('');
}
function drawEnterpriseShowcaseChart(counts,ticketRows){
  var sv=byId('bar-enterprise-showcase');
  if(!sv)return;
  var cafe=summarizeCafeOrders();
  var outbound=summarizeOutboundRecords();
  var usedVisitor=ticketRows.filter(function(row){return row.status==='Sudah Digunakan'}).length;
  var ticketIncome=ticketRows.reduce(function(acc,row){return acc+Number(row.total||0)},0);
  var data=[
    ['Pendapatan',Math.max(1,Math.round(ticketIncome/100000))],
    ['Pengunjung',usedVisitor||0],
    ['Booking',counts.reservasi||7],
    ['Cafe',cafe.totalOrderHariIni||6],
    ['Outbound',outbound.sesiHariIni||4]
  ];
  var max=Math.max.apply(null,data.map(function(item){return item[1]}).concat([1]));
  sv.innerHTML='';
  data.forEach(function(item,idx){
    var x=48+idx*92;
    var h=Math.max(6,Math.round((item[1]/max)*100));
    var y=145-h;
    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',String(x));rect.setAttribute('y',String(y));rect.setAttribute('width','60');rect.setAttribute('height',String(h));rect.setAttribute('rx','10');
    rect.setAttribute('fill',idx%2===0?'var(--brand)':'var(--info)');rect.setAttribute('opacity','0.9');sv.appendChild(rect);
    var txt=document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x',String(x+30));txt.setAttribute('y',String(y-8));txt.setAttribute('text-anchor','middle');txt.setAttribute('font-size','11');txt.setAttribute('fill','currentColor');txt.textContent=String(item[1]);sv.appendChild(txt);
    var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('x',String(x+30));lbl.setAttribute('y','165');lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','10');lbl.setAttribute('fill','currentColor');lbl.setAttribute('opacity','0.65');lbl.textContent=item[0];sv.appendChild(lbl);
  });
}
function drawModuleMiniChart(en,data){
  var sv=byId('module-mini-chart');
  if(!sv)return;
  var safe=(data||[]).slice(0,6);
  var max=Math.max.apply(null,safe.map(function(item){return Number(item.value||0)}).concat([1]));
  sv.innerHTML='';
  safe.forEach(function(item,idx){
    var x=44+idx*86;
    var h=Math.max(6,Math.round((Number(item.value||0)/max)*94));
    var y=124-h;
    var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x',String(x));
    rect.setAttribute('y',String(y));
    rect.setAttribute('width','54');
    rect.setAttribute('height',String(h));
    rect.setAttribute('rx','9');
    rect.setAttribute('fill',idx%2===0?'var(--brand)':'var(--info)');
    rect.setAttribute('opacity','0.9');
    sv.appendChild(rect);
    var val=document.createElementNS('http://www.w3.org/2000/svg','text');
    val.setAttribute('x',String(x+27));
    val.setAttribute('y',String(y-8));
    val.setAttribute('text-anchor','middle');
    val.setAttribute('font-size','10');
    val.setAttribute('fill','currentColor');
    val.textContent=String(item.valueLabel||item.value||0);
    sv.appendChild(val);
    var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');
    lbl.setAttribute('x',String(x+27));
    lbl.setAttribute('y','146');
    lbl.setAttribute('text-anchor','middle');
    lbl.setAttribute('font-size','9');
    lbl.setAttribute('fill','currentColor');
    lbl.setAttribute('opacity','0.68');
    lbl.textContent=String(item.label||'').substring(0,9);
    sv.appendChild(lbl);
  });
}
function renderModuleInlineActions(en){
  var root=byId('module-inline-actions');
  if(!root)return;
  var actions=[];
  if(en==='ticketing')actions=[['Dashboard Ticket','gt(\'dashboard\')'],['Quick Sale','quickTicketSale()'],['Scan Ticket','openTicketScanner()'],['Daftar Tiket','gt(\'list\',\'ticketing\')'],['Pendapatan','exportTicketReport(\'penjualan\')']];
  else if(en==='reservasi')actions=[['Calendar','gt(\'list\',\'reservasi\')'],['Occupancy','gt(\'dashboard\')'],['Waiting List','byId(\'sst\').value=\'Menunggu\';flt()'],['Booking Baru','gt(\'form\',\'reservasi\')'],['Konfirmasi','gt(\'list\',\'reservasi\')']];
  else if(en==='cafe')actions=[['Kategori','gt(\'list\',\'cafe\')'],['Menu','gt(\'list\',\'cafe\')'],['Cart','quickCafeOrder()'],['Split Bill','quickCafeOrder()'],['Kitchen','openCafeKitchenDisplay()'],['Payment','quickCafeOrder()'],['Shift','openCafeShift()']];
  else if(en==='outbound')actions=[['Jadwal','openOutboundSchedule()'],['Peserta','gt(\'list\',\'outbound\')'],['Absensi','markOutboundAttendanceQuick()'],['Instruktur','openOutboundInstructor()'],['Peralatan','openOutboundEquipment()']];
  else if(en==='finance')actions=[['Kas','openFinanceCashIn()'],['Bank','openFinanceTransfer()'],['Mutasi','gt(\'list\',\'finance\')'],['Cash Flow','gt(\'dashboard\')'],['Pendapatan','openFinanceReport()'],['Pengeluaran','openFinanceCashOut()']];
  else if(en==='accounting')actions=[['Journal','openAccountingJournalInput()'],['Ledger','openAccountingLedger()'],['Trial Balance','openAccountingTrialBalance()'],['Neraca','openAccountingBalanceSheet()'],['Laba Rugi','openAccountingIncomeStatement()']];
  else actions=[['Tambah Data','gt(\'form\',ent)'],['Refresh','ldList(ent)']];
  root.innerHTML=actions.map(function(item){return '<button class="btn btn-o btn-sm" onclick="'+item[1]+'">'+item[0]+'</button>'}).join('');
}
function renderModuleShowcase(en){
  var root=byId('module-showcase');
  var board=byId('module-workspace');
  var title=byId('module-panel-title');
  var badge=byId('module-panel-badge');
  if(!root||!board)return;
  var rows=[];
  var cards=[];
  var chartData=[];
  var panelTitle='Workspace Modul';
  var panelBadge='Live';
  if(en==='ticketing'){
    var sold=(allR||[]).length||0;
    var used=(allR||[]).filter(function(row){return row.status==='Sudah Digunakan'}).length||0;
    var revenue=(allR||[]).reduce(function(acc,row){return acc+Number(row.total||0)},0);
    panelTitle='Ticketing Workspace';
    panelBadge='Operasional';
    rows=[['Dashboard Ticket',used+' scan valid'],['Quick Sale','Siap dipakai'],['Scan Ticket','Validasi realtime'],['Daftar Tiket',sold],['Ringkasan Pendapatan',fmtIdr(revenue)]];
    cards=[
      {title:'Dashboard Ticket',desc:'Pantau status scan dan utilisasi tiket.',badge:'Live',cls:'b-active',a1:'Buka Dashboard',on1:'gt(\'dashboard\')',a2:'Ringkasan',on2:'exportTicketReport(\'penjualan\')',p:86},
      {title:'Quick Sale',desc:'Penjualan cepat untuk kasir loket.',badge:'Kasir',cls:'b-pending',a1:'Jual Tiket',on1:'quickTicketSale()',a2:'Daftar Tiket',on2:'gt(\'list\',\'ticketing\')',p:78},
      {title:'Scan Ticket',desc:'Validasi QR/barcode tiket masuk.',badge:'Gate',cls:'b-active',a1:'Mulai Scan',on1:'openTicketScanner()',a2:'Laporan Penggunaan',on2:'exportTicketReport(\'penggunaan\')',p:88},
      {title:'Ringkasan Pendapatan',desc:'Akses cepat laporan penjualan tiket.',badge:'Finance',cls:'b-draft',a1:'Laporan Penjualan',on1:'exportTicketReport(\'penjualan\')',a2:'Laporan Refund',on2:'exportTicketReport(\'refund\')',p:72}
    ];
    chartData=[{label:'Sale',value:sold,valueLabel:sold},{label:'Used',value:used,valueLabel:used},{label:'Void',value:(allR||[]).filter(function(row){return row.status==='Void'}).length,valueLabel:(allR||[]).filter(function(row){return row.status==='Void'}).length},{label:'Refund',value:(allR||[]).filter(function(row){return row.status==='Refund'}).length,valueLabel:(allR||[]).filter(function(row){return row.status==='Refund'}).length},{label:'Rev',value:Math.max(1,Math.round(revenue/100000)),valueLabel:Math.round(revenue/100000)+'k'}];
  }else if(en==='reservasi'){
    var total=(allR||[]).length||0;
    var waiting=(allR||[]).filter(function(row){return /menunggu|draft/i.test(String(row.status||''))}).length||0;
    var confirm=(allR||[]).filter(function(row){return /dikonfirmasi/i.test(String(row.status||''))}).length||0;
    var occupancy=Math.min(100,Math.max(20,total*8));
    panelTitle='Booking Workspace';
    panelBadge='Front Office';
    rows=[['Calendar',outboundTodayKey()],['Occupancy',occupancy+'%'],['Booking Baru','Akses cepat'],['Waiting List',waiting],['Konfirmasi',confirm]];
    cards=[
      {title:'Calendar',desc:'Lihat jadwal booking harian dan mingguan.',badge:'View',cls:'b-active',a1:'Buka Kalender',on1:'gt(\'list\',\'reservasi\')',a2:'Refresh',on2:'ldList(\'reservasi\')',p:82},
      {title:'Booking Baru',desc:'Input reservasi baru dari front desk.',badge:'Action',cls:'b-pending',a1:'Buat Booking',on1:'gt(\'form\',\'reservasi\')',a2:'Daftar Booking',on2:'gt(\'list\',\'reservasi\')',p:75},
      {title:'Waiting List',desc:'Pantau antrean booking menunggu konfirmasi.',badge:String(waiting),cls:'b-menunggu',a1:'Filter Waiting',on1:'byId(\'sst\').value=\'Menunggu\';flt()',a2:'Konfirmasi',on2:'gt(\'list\',\'reservasi\')',p:Math.min(100,30+waiting*8)},
      {title:'Konfirmasi',desc:'Proses approval booking ke status dikonfirmasi.',badge:String(confirm),cls:'b-active',a1:'Lihat Konfirmasi',on1:'gt(\'list\',\'reservasi\')',a2:'Occupancy',on2:'gt(\'dashboard\')',p:Math.min(100,40+confirm*7)}
    ];
    chartData=[{label:'Booking',value:total,valueLabel:total},{label:'Waiting',value:waiting,valueLabel:waiting},{label:'Confirm',value:confirm,valueLabel:confirm},{label:'Occ',value:occupancy,valueLabel:occupancy+'%'}];
  }else if(en==='cafe'){
    var cafe=summarizeCafeOrders();
    panelTitle='Cafe POS Workspace';
    panelBadge='POS';
    rows=[['Kategori',(cafeMenus||[]).length],['Menu',cafe.menuTerlaris||'-'],['Keranjang',cafe.totalOrderHariIni||0],['Split Bill','Ready'],['Pembayaran',fmtIdr(cafe.pendapatanCafeHariIni||0)],['Kitchen Status',cafe.orderDiproses+' diproses']];
    cards=[
      {title:'Kategori & Menu',desc:'Kelola kategori dan menu POS cafe.',badge:'Catalog',cls:'b-active',a1:'Buka POS',on1:'openCafePos()',a2:'Riwayat Menu',on2:'gt(\'list\',\'cafe\')',p:80},
      {title:'Keranjang & Split Bill',desc:'Input order, split bill, dan update item.',badge:'Kasir',cls:'b-pending',a1:'Quick Order',on1:'quickCafeOrder()',a2:'Cetak Struk',on2:'printLatestCafeReceipt()',p:76},
      {title:'Pembayaran',desc:'Proses pembayaran tunai dan non-tunai.',badge:'Payment',cls:'b-active',a1:'Bayar Cepat',on1:'quickCafeOrder()',a2:'Shift Kasir',on2:'openCafeShift()',p:84},
      {title:'Kitchen Status',desc:'Pantau antrian kitchen secara realtime.',badge:String(cafe.orderDiproses||0),cls:'b-menunggu',a1:'Kitchen Display',on1:'openCafeKitchenDisplay()',a2:'Tutup Shift',on2:'closeCafeShift()',p:Math.min(100,35+(cafe.orderDiproses||0)*10)}
    ];
    chartData=[{label:'Order',value:cafe.totalOrderHariIni||0,valueLabel:cafe.totalOrderHariIni||0},{label:'Diproses',value:cafe.orderDiproses||0,valueLabel:cafe.orderDiproses||0},{label:'Selesai',value:cafe.orderSelesai||0,valueLabel:cafe.orderSelesai||0},{label:'Rev',value:Math.max(1,Math.round((cafe.pendapatanCafeHariIni||0)/100000)),valueLabel:Math.round((cafe.pendapatanCafeHariIni||0)/100000)+'k'}];
  }else if(en==='outbound'){
    var outbound=summarizeOutboundRecords();
    panelTitle='Outbound Workspace';
    panelBadge='Field Ops';
    rows=[['Jadwal',outbound.sesiHariIni||0],['Peserta',outbound.pesertaHariIni||0],['Absensi',outbound.tingkatKehadiran+'%'],['Instruktur',outbound.instrukturBertugas||0],['Peralatan',outbound.peralatanDipakai||0]];
    cards=[
      {title:'Jadwal',desc:'Monitoring jadwal sesi outbound aktif.',badge:'Schedule',cls:'b-active',a1:'Buka Jadwal',on1:'openOutboundSchedule()',a2:'Booking Outbound',on2:'openOutboundBooking()',p:81},
      {title:'Peserta & Absensi',desc:'Kelola peserta dan check in lapangan.',badge:'Attendance',cls:'b-pending',a1:'Absensi Cepat',on1:'markOutboundAttendanceQuick()',a2:'Scan Ticket',on2:'openOutboundCheckIn()',p:Math.min(100,35+(outbound.tingkatKehadiran||0))},
      {title:'Instruktur',desc:'Distribusi instruktur per sesi outbound.',badge:String(outbound.instrukturBertugas||0),cls:'b-active',a1:'Lihat Instruktur',on1:'openOutboundInstructor()',a2:'Laporan',on2:'openOutboundReport()',p:72},
      {title:'Peralatan',desc:'Kontrol pemakaian dan kesiapan peralatan.',badge:String(outbound.peralatanDipakai||0),cls:'b-menunggu',a1:'Lihat Peralatan',on1:'openOutboundEquipment()',a2:'Refresh Data',on2:'ldList(\'outbound\')',p:70}
    ];
    chartData=[{label:'Jadwal',value:outbound.sesiHariIni||0,valueLabel:outbound.sesiHariIni||0},{label:'Peserta',value:outbound.pesertaHariIni||0,valueLabel:outbound.pesertaHariIni||0},{label:'Hadir',value:outbound.tingkatKehadiran||0,valueLabel:(outbound.tingkatKehadiran||0)+'%'},{label:'Peralatan',value:outbound.peralatanDipakai||0,valueLabel:outbound.peralatanDipakai||0}];
  }else if(en==='finance'){
    var finance=summarizeFinanceTransactions();
    panelTitle='Finance Workspace';
    panelBadge='Finance';
    rows=[['Kas',fmtIdr(finance.saldoKas||0)],['Bank',fmtIdr(finance.saldoBank||0)],['Mutasi',(financeTransactions||[]).length],['Cash Flow',fmtIdr(finance.cashFlow||0)],['Pendapatan',fmtIdr(finance.pendapatanHariIni||0)],['Pengeluaran',fmtIdr(finance.pengeluaranHariIni||0)]];
    cards=[
      {title:'Kas',desc:'Operasional kas masuk dan kas keluar.',badge:'Cash',cls:'b-active',a1:'Kas Masuk',on1:'openFinanceCashIn()',a2:'Kas Keluar',on2:'openFinanceCashOut()',p:84},
      {title:'Bank',desc:'Transfer dan rekonsiliasi rekening bank.',badge:'Bank',cls:'b-pending',a1:'Transfer',on1:'openFinanceTransfer()',a2:'Rekonsiliasi',on2:'openFinanceReconcile()',p:80},
      {title:'Mutasi & Cash Flow',desc:'Pantau mutasi harian dan aliran kas.',badge:'Flow',cls:'b-active',a1:'Lihat Finance',on1:'gt(\'list\',\'finance\')',a2:'Laporan',on2:'openFinanceReport()',p:76},
      {title:'Pendapatan vs Pengeluaran',desc:'Kontrol laba operasional harian.',badge:'P/L',cls:'b-draft',a1:'Ringkasan',on1:'gt(\'dashboard\')',a2:'Accounting',on2:'gt(\'list\',\'accounting\')',p:Math.min(100,40+Math.round(Math.max(0,finance.labaOperasionalHariIni||0)/100000))}
    ];
    chartData=[{label:'Kas',value:Math.max(1,Math.round((finance.saldoKas||0)/1000000)),valueLabel:Math.round((finance.saldoKas||0)/1000000)+'jt'},{label:'Bank',value:Math.max(1,Math.round((finance.saldoBank||0)/1000000)),valueLabel:Math.round((finance.saldoBank||0)/1000000)+'jt'},{label:'In',value:Math.max(1,Math.round((finance.pendapatanHariIni||0)/100000)),valueLabel:Math.round((finance.pendapatanHariIni||0)/100000)+'k'},{label:'Out',value:Math.max(1,Math.round((finance.pengeluaranHariIni||0)/100000)),valueLabel:Math.round((finance.pengeluaranHariIni||0)/100000)+'k'},{label:'Flow',value:Math.max(1,Math.round((finance.cashFlow||0)/100000)),valueLabel:Math.round((finance.cashFlow||0)/100000)+'k'}];
  }else if(en==='accounting'){
    var accounting=summarizeAccountingJournals();
    panelTitle='Accounting Workspace';
    panelBadge='Akuntansi';
    rows=[['Jurnal',accounting.jumlahJurnal||0],['Buku Besar','Ready'],['Trial Balance',accounting.trialBalance?'Seimbang':'Cek ulang'],['Neraca',accounting.neraca?'Seimbang':'Cek ulang'],['Laba Rugi',fmtIdr(accounting.labaBersih||0)]];
    cards=[
      {title:'Jurnal',desc:'Input dan posting jurnal harian.',badge:'Journal',cls:'b-active',a1:'Input Jurnal',on1:'openAccountingJournalInput()',a2:'Posting Terakhir',on2:'postLatestAccountingJournal()',p:83},
      {title:'Buku Besar',desc:'Telusuri mutasi akun per kode COA.',badge:'Ledger',cls:'b-pending',a1:'Buka Buku Besar',on1:'openAccountingLedger()',a2:'Tutup Buku',on2:'closeAccountingBook()',p:79},
      {title:'Trial Balance & Neraca',desc:'Validasi keseimbangan debit kredit.',badge:accounting.trialBalance?'Seimbang':'Review',cls:accounting.trialBalance?'b-active':'b-menunggu',a1:'Trial Balance',on1:'openAccountingTrialBalance()',a2:'Neraca',on2:'openAccountingBalanceSheet()',p:accounting.trialBalance?92:63},
      {title:'Laba Rugi',desc:'Analisa performa pendapatan dan beban.',badge:'P/L',cls:'b-draft',a1:'Laba Rugi',on1:'openAccountingIncomeStatement()',a2:'Dashboard',on2:'gt(\'dashboard\')',p:74}
    ];
    chartData=[{label:'Jurnal',value:accounting.jumlahJurnal||0,valueLabel:accounting.jumlahJurnal||0},{label:'Kas',value:Math.max(1,Math.round((accounting.saldoKas||0)/1000000)),valueLabel:Math.round((accounting.saldoKas||0)/1000000)+'jt'},{label:'Bank',value:Math.max(1,Math.round((accounting.saldoBank||0)/1000000)),valueLabel:Math.round((accounting.saldoBank||0)/1000000)+'jt'},{label:'PL',value:Math.max(1,Math.round((accounting.labaBersih||0)/100000)),valueLabel:Math.round((accounting.labaBersih||0)/100000)+'k'}];
  }else{
    panelTitle='Workspace Modul';
    panelBadge='Data';
    rows=[['Statistik',Math.max(1,(allR||[]).length)],['Data Grid','Tersedia'],['Aksi','Siap'],['Integrasi','Aktif']];
    cards=[{title:'Data Modul',desc:'Kelola data modul pada tabel utama.',badge:'Ready',cls:'b-active',a1:'Tambah Data',on1:'gt(\'form\',ent)',a2:'Refresh',on2:'ldList(ent)',p:70}];
    chartData=[{label:'Rows',value:Math.max(1,(allR||[]).length),valueLabel:Math.max(1,(allR||[]).length)}];
  }
  if(title)title.textContent=panelTitle;
  if(badge)badge.textContent=panelBadge;
  renderModuleInlineActions(en);
  root.innerHTML=rows.map(function(item){return '<div class="sum-card"><div class="sum-name">'+item[0]+'</div><div class="sum-val">'+item[1]+'</div></div>'}).join('');
  board.innerHTML=cards.map(function(card){
    return '<article class="module-card"><div class="module-head"><div><div class="module-title">'+card.title+'</div><div class="module-desc">'+card.desc+'</div></div><span class="badge '+card.cls+'">'+card.badge+'</span></div><div class="module-actions"><button class="btn btn-o btn-sm" onclick="'+card.on1+'">'+card.a1+'</button><button class="btn btn-g btn-sm" onclick="'+card.on2+'">'+card.a2+'</button></div><div class="module-progress"><span style="width:'+Math.max(10,Math.min(100,Number(card.p||0)))+'%"></span></div></article>';
  }).join('');
  drawModuleMiniChart(en,chartData);
}
function summarizeCafeOrders(){
  var today=cafeTodayKey();
  var rows=cafeOrders.filter(function(order){return String(order.dibuatPada||'').slice(0,10)===today});
  var menuMap={};
  var hourMap={};
  var revenue=0,processed=0,finished=0;
  rows.forEach(function(order){
    revenue+=Number(order.total||0);
    if(order.kitchen&&order.kitchen.status==='Diproses')processed+=1;
    if(order.kitchen&&order.kitchen.status==='Selesai')finished+=1;
    var hour=String(order.dibuatPada||'').slice(11,13)||'00';
    hourMap[hour]=(hourMap[hour]||0)+1;
    (order.items||[]).forEach(function(item){menuMap[item.namaMenu]=(menuMap[item.namaMenu]||0)+Number(item.qty||0)});
  });
  var menuKeys=Object.keys(menuMap).sort(function(a,b){return menuMap[b]-menuMap[a]});
  var hourKeys=Object.keys(hourMap).sort(function(a,b){return hourMap[b]-hourMap[a]});
  var shift=activeCafeShift();
  return {
    pendapatanCafeHariIni:revenue,
    totalOrderHariIni:rows.length,
    menuTerlaris:menuKeys[0]||'-',
    produkTerlaris:menuKeys[0]||'-',
    jamRamai:(hourKeys[0]||'00')+':00',
    orderDiproses:processed,
    orderSelesai:finished,
    nilaiRataRataTransaksi:rows.length?revenue/rows.length:0,
    kasAktif:shift?(Number(shift.modalAwal||0)+Number(shift.totalTunai||0)):0
  };
}
function renderCafeMetric(id,label,value){
  var root=byId(id);
  if(!root)return;
  root.innerHTML='<div class="sum-card"><div class="sum-name">'+label+'</div><div class="sum-val">'+value+'</div></div>';
}
function renderCafeDashboardWidgets(){
  var summary=summarizeCafeOrders();
  renderCafeMetric('cafe-pendapatan-summary','Pendapatan Cafe Hari Ini',fmtIdr(summary.pendapatanCafeHariIni));
  renderCafeMetric('cafe-total-order-summary','Total Order Hari Ini',summary.totalOrderHariIni);
  renderCafeMetric('cafe-menu-terlaris-summary','Menu Terlaris',summary.menuTerlaris);
  renderCafeMetric('cafe-produk-terlaris-summary','Produk Terlaris',summary.produkTerlaris);
  renderCafeMetric('cafe-jam-ramai-summary','Jam Ramai',summary.jamRamai);
  renderCafeMetric('cafe-order-diproses-summary','Order Diproses',summary.orderDiproses);
  renderCafeMetric('cafe-order-selesai-summary','Order Selesai',summary.orderSelesai);
  renderCafeMetric('cafe-rata-transaksi-summary','Nilai Rata-rata Transaksi',fmtIdr(summary.nilaiRataRataTransaksi));
  renderCafeMetric('cafe-kas-aktif-summary','Kas Aktif',fmtIdr(summary.kasAktif));
}
function summarizeOutboundRecords(){
  ensureOutboundSeed();
  var rows=(outboundRecords||[]).filter(function(record){return record.jadwal&&record.jadwal.tanggal===outboundTodayKey()});
  var peserta=0,pendapatan=0,kuotaTerpakai=0,kuotaTersisa=0,instruktur=0,peralatan=0,hadir=0;
  rows.forEach(function(record){peserta+=((record.peserta||[]).length);pendapatan+=Number(record.pendapatan||0);kuotaTerpakai+=Number(record.jadwal.bookingTerhubung||0);kuotaTersisa+=Number(record.jadwal.sisaKuota||0);instruktur+=((record.instruktur||[]).length);peralatan+=((record.peralatan||[]).reduce(function(acc,item){return acc+Number(item.dipakai||0)},0));hadir+=((record.peserta||[]).filter(function(item){return item.statusHadir==='Hadir'}).length)});
  return {pesertaHariIni:peserta,sesiHariIni:rows.length,pendapatanOutbound:pendapatan,kuotaTerpakai:kuotaTerpakai,kuotaTersisa:kuotaTersisa,instrukturBertugas:instruktur,peralatanDipakai:peralatan,tingkatKehadiran:peserta?Math.round((hadir/peserta)*100):0};
}
function renderOutboundMetric(id,label,value){var root=byId(id);if(!root)return;root.innerHTML='<div class="sum-card"><div class="sum-name">'+label+'</div><div class="sum-val">'+value+'</div></div>'}
function renderOutboundDashboardWidgets(){
  var summary=summarizeOutboundRecords();
  renderOutboundMetric('outbound-peserta-summary','Peserta Hari Ini',summary.pesertaHariIni);
  renderOutboundMetric('outbound-sesi-summary','Sesi Hari Ini',summary.sesiHariIni);
  renderOutboundMetric('outbound-pendapatan-summary','Pendapatan Outbound',fmtIdr(summary.pendapatanOutbound));
  renderOutboundMetric('outbound-kuota-terpakai-summary','Kuota Terpakai',summary.kuotaTerpakai);
  renderOutboundMetric('outbound-kuota-tersisa-summary','Kuota Tersisa',summary.kuotaTersisa);
  renderOutboundMetric('outbound-instruktur-summary','Instruktur Bertugas',summary.instrukturBertugas);
  renderOutboundMetric('outbound-peralatan-summary','Peralatan Dipakai',summary.peralatanDipakai);
  renderOutboundMetric('outbound-kehadiran-summary','Tingkat Kehadiran',summary.tingkatKehadiran+'%');
}
function renderFinanceDashboardWidgets(){
  var summary=summarizeFinanceTransactions();
  renderFinanceMetric('finance-saldo-kas-summary','Saldo Kas',fmtIdr(summary.saldoKas));
  renderFinanceMetric('finance-saldo-bank-summary','Saldo Bank',fmtIdr(summary.saldoBank));
  renderFinanceMetric('finance-pendapatan-summary','Pendapatan Hari Ini',fmtIdr(summary.pendapatanHariIni));
  renderFinanceMetric('finance-pengeluaran-summary','Pengeluaran Hari Ini',fmtIdr(summary.pengeluaranHariIni));
  renderFinanceMetric('finance-laba-summary','Laba Operasional Hari Ini',fmtIdr(summary.labaOperasionalHariIni));
  renderFinanceMetric('finance-cash-flow-summary','Cash Flow',fmtIdr(summary.cashFlow));
  var root=byId('finance-per-modul-summary');
  if(root)root.innerHTML=summary.pendapatanPerModul.map(function(item){return '<div class="sum-card"><div class="sum-name">'+item.modul+'</div><div class="sum-val">'+fmtIdr(item.nominal)+'</div></div>'}).join('');
}
function drawOutboundParticipantChart(){
  var sv=byId('bar-outbound-participant');if(!sv)return;var summary=summarizeOutboundRecords();var data=[['Peserta',summary.pesertaHariIni],['Sesi',summary.sesiHariIni],['Hadir %',summary.tingkatKehadiran]];var max=Math.max.apply(null,data.map(function(x){return x[1]}).concat([1]));sv.innerHTML='';data.forEach(function(row,idx){var x=60+idx*130;var h=Math.max(6,Math.round((row[1]/max)*100));var y=145-h;var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',String(x));rect.setAttribute('y',String(y));rect.setAttribute('width','80');rect.setAttribute('height',String(h));rect.setAttribute('rx','10');rect.setAttribute('fill',idx===2?'var(--success)':'var(--brand)');rect.setAttribute('opacity','0.88');sv.appendChild(rect);var txt=document.createElementNS('http://www.w3.org/2000/svg','text');txt.setAttribute('x',String(x+40));txt.setAttribute('y',String(y-8));txt.setAttribute('text-anchor','middle');txt.setAttribute('font-size','11');txt.setAttribute('fill','currentColor');txt.textContent=String(row[1]);sv.appendChild(txt);var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',String(x+40));lbl.setAttribute('y','165');lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','10');lbl.setAttribute('fill','currentColor');lbl.setAttribute('opacity','0.65');lbl.textContent=row[0];sv.appendChild(lbl);});}
function drawOutboundRevenueChart(){
  var sv=byId('bar-outbound-revenue');if(!sv)return;var rows=(outboundRecords||[]).slice(0,6);var max=Math.max.apply(null,rows.map(function(row){return Number(row.pendapatan||0)}).concat([1]));sv.innerHTML='';rows.forEach(function(row,idx){var x=40+idx*82;var h=Math.max(6,Math.round((Number(row.pendapatan||0)/max)*100));var y=145-h;var rect=document.createElementNS('http://www.w3.org/2000/svg','rect');rect.setAttribute('x',String(x));rect.setAttribute('y',String(y));rect.setAttribute('width','56');rect.setAttribute('height',String(h));rect.setAttribute('rx','8');rect.setAttribute('fill','var(--info)');rect.setAttribute('opacity','0.88');sv.appendChild(rect);var val=document.createElementNS('http://www.w3.org/2000/svg','text');val.setAttribute('x',String(x+28));val.setAttribute('y',String(y-8));val.setAttribute('text-anchor','middle');val.setAttribute('font-size','10');val.setAttribute('fill','currentColor');val.textContent=String(Math.round(Number(row.pendapatan||0)/1000))+'k';sv.appendChild(val);var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',String(x+28));lbl.setAttribute('y','165');lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','9');lbl.setAttribute('fill','currentColor');lbl.setAttribute('opacity','0.65');lbl.textContent=String(row.name||'').substring(0,8);sv.appendChild(lbl);});}
function setupLazyDashboardCharts(counts){
  var drawMap={
    'bar-enterprise-showcase':function(){drawEnterpriseShowcaseChart(counts,window.__ticketRowsCache||[])},
    'bar-ent':function(){drawEntityChart(counts)},
    'bar-rev':function(){drawRevenueChart(counts)},
    'bar-res':function(){drawReservasiChart(counts)},
    'bar-cash':function(){drawCashFlowChart(counts)},
    'bar-occupancy':function(){drawOccupancyChart(counts)},
    'bar-operasional':function(){drawOperationalChart(counts,window.__ticketRowsCache||[])},
    'bar-outbound-participant':function(){drawOutboundParticipantChart()},
    'bar-outbound-revenue':function(){drawOutboundRevenueChart()},
    'bar-finance-cash':function(){drawFinanceCharts()},
    'bar-finance-income':function(){drawFinanceCharts()},
    'bar-finance-expense':function(){drawFinanceCharts()}
  };
  if(!('IntersectionObserver' in window)){
    idle(function(){requestAnimationFrame(function(){Object.keys(drawMap).forEach(function(k){drawMap[k]()})})});
    return;
  }
  var seen={};
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting)return;
      var id=entry.target.id;
      if(seen[id])return;
      seen[id]=true;
      requestAnimationFrame(function(){drawMap[id]()});
      obs.unobserve(entry.target);
    });
  },{rootMargin:'120px'});
  Object.keys(drawMap).forEach(function(id){var el=byId(id);if(el)obs.observe(el)});
}

async function ldDash(){
  renderWidgets();
  dashboardActions.setLoading(true);
  dashboardActions.setOffline(false);
  dashboardActions.setNoData(false);
  dashboardActions.setSlowNetwork(false);
  skDash();
  var counts={};
  var started=Date.now();
  try{
    await Promise.all(ENT.map(async function(e){
      try{
        var d=await apf(eBasePath(e));
        var rows=normalizeEntityRows(e,d);
        counts[e]=getEntityTotal(d,rows);
      }catch(_){counts[e]=0}
    }));
  }catch(_err){
    dashboardActions.setOffline(true);
  }
  counts.cafe=cafeOrders.length;
  counts.accounting=accountingJournals.length;
  counts.finance=financeTransactions.length;
  counts.outbound=outboundRecords.length;
  if(Date.now()-started>1200)dashboardActions.setSlowNetwork(true);
  dashboardActions.setLoading(false);
  dashboardActions.touch();
  window.__dashboardCounts=counts;
  document.getElementById('greet-sub').textContent=greeting()+', Administrator';
  if((counts.destinasi||0)+(counts.reservasi||0)+(counts.hotel||0)+(counts.guide||0)===0){dashboardActions.setNoData(true)}
  renderKpiMeta();
  renderTodaySummary(counts);
  renderSmartInsight(counts);
  renderTimeline();
  renderSystemHealth(counts);
  renderCommandCenter(counts);
  drawRecent(counts);
  try{var td=await apf(eBasePath('ticketing'));var ticketRows=td.data||[];window.__ticketRowsCache=ticketRows;renderPrimaryKpi(counts,ticketRows);renderEnterpriseSummary(counts,ticketRows);drawEnterpriseShowcaseChart(counts,ticketRows);renderTicketSummary(ticketRows);drawTicketChart(ticketRows);renderOperationalSummary(counts,ticketRows);renderCheckInQueueSummary();renderGateMonitoringSummary();renderCafeDashboardWidgets();renderOutboundDashboardWidgets();renderFinanceDashboardWidgets();renderAccountingDashboardWidgets();drawFinanceCharts();renderTodaySummary(counts)}catch(_e){window.__ticketRowsCache=[];renderPrimaryKpi(counts,[]);renderEnterpriseSummary(counts,[]);drawEnterpriseShowcaseChart(counts,[]);renderTicketSummary([]);drawTicketChart([]);renderOperationalSummary(counts,[]);renderCheckInQueueSummary();renderGateMonitoringSummary();renderCafeDashboardWidgets();renderOutboundDashboardWidgets();renderFinanceDashboardWidgets();renderAccountingDashboardWidgets();drawFinanceCharts();renderTodaySummary(counts)}
  setupLazyDashboardCharts(counts);
  renderMobileDashboard();
}

function renderTodaySummary(c){
  var box=document.getElementById('today-summary');
  var ticketRows=window.__ticketRowsCache||[];
  var cafe=summarizeCafeOrders();
  var outbound=summarizeOutboundRecords();
  var totalPendapatan=ticketRows.reduce(function(acc,row){return acc+Number(row.total||0)},0)+Number(cafe.pendapatanCafeHariIni||0)+Number(outbound.pendapatanOutbound||0);
  var items=[
    ['Total Pengunjung',ticketRows.filter(function(row){return row.status==='Sudah Digunakan'}).length],
    ['Total Tiket',ticketRows.length],
    ['Total Booking',c.reservasi||0],
    ['Total Penjualan Cafe',cafe.totalOrderHariIni||0],
    ['Total Pendapatan',fmtIdr(totalPendapatan)]
  ];
  box.innerHTML=items.map(function(x){return '<div class="sum-card"><div class="sum-name">'+x[0]+'</div><div class="sum-val">'+x[1]+'</div></div>'}).join('');
}

function renderSmartInsight(c){
  var revRise=Math.max(3,Math.round(((c.pembayaran||1)+(c.reservasi||1))*1.2));
  var rsvDrop=Math.max(2,Math.round(((c.reservasi||1)%9)+2));
  var unpaid=Math.max(1,Math.round((c.pembayaran||1)*0.35));
  var maintenance=Math.max(1,Math.round((c.kendaraan||1)*0.2));
  var rows=[
    {severity:'low',category:'pendapatan',title:'Pendapatan meningkat',description:'Kenaikan '+revRise+'% pada pemasukan harian',action:'billing',priority:1,source:'erp-analytics',timestamp:Date.now()-1000*60*9,cta:'Tindak Lanjut'},
    {severity:'high',category:'reservasi',title:'Reservasi menurun',description:'Penurunan '+rsvDrop+'% dibanding periode sebelumnya',action:'reservation',priority:2,source:'erp-analytics',timestamp:Date.now()-1000*60*13,cta:'Lihat Penyebab'},
    {severity:'medium',category:'keuangan',title:'Tagihan tertunda',description:unpaid+' tagihan belum dibayar pelanggan',action:'billing',priority:3,source:'billing-engine',timestamp:Date.now()-1000*60*20,cta:'Tagih Sekarang'},
    {severity:'medium',category:'operasional',title:'Perawatan kendaraan',description:maintenance+' kendaraan membutuhkan penjadwalan maintenance',action:'maintenance',priority:4,source:'fleet-monitor',timestamp:Date.now()-1000*60*27,cta:'Jadwalkan'}
  ];
  var root=document.getElementById('smart-insight');
  root.innerHTML=rows.sort(function(a,b){return a.priority-b.priority}).map(function(r){
    var cName=r.severity==='low'?'ins-pos':(r.severity==='high'?'ins-neg':'ins-mid');
    return '<div class="ins-item"><span><strong>'+r.title+'</strong><br/><span class="tl-time">'+r.description+' - '+relTime(r.timestamp)+'</span></span><span class="ins-act"><button class="btn btn-g btn-sm" onclick="takeInsightAction(&quot;'+r.action+'&quot;)">'+r.cta+'</button><span class="'+cName+'">●</span></span></div>';
  }).join('');
}

function drawEntityChart(c){
  var sv=document.getElementById('bar-ent'),ent2=ENT.map(function(e){return[e,c[e]||0]}),mx=Math.max.apply(null,ent2.map(function(x){return x[1]}).concat([1])),cols=['var(--info)','var(--success)','var(--brand)','var(--accent-indigo)','var(--danger)','var(--text-2)','var(--warn)','var(--info)','var(--success)','var(--brand)'],bw=Math.floor(506/ent2.length)-6;
  sv.innerHTML='';
  ent2.forEach(function(pair,i){
    var e=pair[0],v=pair[1],bh=Math.max(Math.round((v/mx)*120),v>0?4:2),x=30+i*(bw+6),y=180-40-bh,lbl=(LABELS[e]||e).substring(0,7),g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.style.cursor='pointer';
    g.addEventListener('click',function(){gt('list',e)});
    var rc=document.createElementNS('http://www.w3.org/2000/svg','rect');rc.setAttribute('x',x);rc.setAttribute('y',y);rc.setAttribute('width',bw);rc.setAttribute('height',bh);rc.setAttribute('rx','4');rc.setAttribute('fill',cols[i%cols.length]);rc.setAttribute('opacity','0.88');
    var tv=document.createElementNS('http://www.w3.org/2000/svg','text');tv.setAttribute('x',x+bw/2);tv.setAttribute('y',y-4);tv.setAttribute('text-anchor','middle');tv.setAttribute('font-size','11');tv.setAttribute('fill','currentColor');tv.textContent=v>0?v:'';
    var tl=document.createElementNS('http://www.w3.org/2000/svg','text');tl.setAttribute('x',x+bw/2);tl.setAttribute('y',172);tl.setAttribute('text-anchor','middle');tl.setAttribute('font-size','10');tl.setAttribute('fill','currentColor');tl.setAttribute('opacity','0.55');tl.textContent=lbl;
    g.appendChild(rc);g.appendChild(tv);g.appendChild(tl);sv.appendChild(g);
  });
}

function drawRevenueChart(c){
  var sv=document.getElementById('bar-rev');
  var base=(c.reservasi||10)+(c.pembayaran||5);
  var months=['Jan','Feb','Mar','Apr','Mei','Jun','Jul'];
  var data=months.map(function(_,i){return Math.max(2,Math.round(base*(0.6+(i*0.08))))});
  var mx=Math.max.apply(null,data.concat([1]));
  var pts=[];
  sv.innerHTML='';
  for(var i=0;i<data.length;i++){
    var x=40+i*76;var y=145-Math.round((data[i]/mx)*100);pts.push(x+','+y);
    var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',x);lbl.setAttribute('y','165');lbl.setAttribute('text-anchor','middle');lbl.setAttribute('font-size','10');lbl.setAttribute('opacity','0.55');lbl.setAttribute('fill','currentColor');lbl.textContent=months[i];sv.appendChild(lbl);
  }
  var grid=document.createElementNS('http://www.w3.org/2000/svg','line');grid.setAttribute('x1','30');grid.setAttribute('y1','145');grid.setAttribute('x2','530');grid.setAttribute('y2','145');grid.setAttribute('stroke','currentColor');grid.setAttribute('opacity','0.14');
  var poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');poly.setAttribute('points',pts.join(' '));poly.setAttribute('fill','none');poly.setAttribute('stroke','var(--brand)');poly.setAttribute('stroke-width','3');
  sv.appendChild(grid);sv.appendChild(poly);
  pts.forEach(function(p){var xy=p.split(',');var c1=document.createElementNS('http://www.w3.org/2000/svg','circle');c1.setAttribute('cx',xy[0]);c1.setAttribute('cy',xy[1]);c1.setAttribute('r','4');c1.setAttribute('fill','var(--brand)');sv.appendChild(c1)});
}

function drawReservasiChart(c){
  var sv=document.getElementById('bar-res');
  var total=Math.max(c.reservasi||1,1),paid=Math.round(total*0.65),pending=Math.round(total*0.25),cancel=Math.max(0,total-paid-pending);
  var data=[['Lunas',paid,'var(--success)'],['Menunggu',pending,'var(--warn)'],['Batal',cancel,'var(--danger)']];
  sv.innerHTML='';
  var x=36;
  data.forEach(function(row){
    var w=Math.max(6,Math.round((row[1]/total)*440));
    var bg=document.createElementNS('http://www.w3.org/2000/svg','rect');bg.setAttribute('x',x);bg.setAttribute('y','40');bg.setAttribute('width',w);bg.setAttribute('height','20');bg.setAttribute('rx','6');bg.setAttribute('fill',row[2]);bg.setAttribute('opacity','0.88');sv.appendChild(bg);
    var lbl=document.createElementNS('http://www.w3.org/2000/svg','text');lbl.setAttribute('x',x);lbl.setAttribute('y','34');lbl.setAttribute('font-size','11');lbl.setAttribute('fill','currentColor');lbl.textContent=row[0]+' ('+row[1]+')';sv.appendChild(lbl);
    x+=w+8;
  });
}

function drawCashFlowChart(c){
  var sv=document.getElementById('bar-cash');
  var income=(c.pembayaran||1)+(c.reservasi||1);var expense=Math.max(1,Math.round(income*0.58));
  var vals=[['Pemasukan',income,'var(--success)'],['Pengeluaran',expense,'var(--danger)']];
  var max=Math.max(income,expense,1);
  sv.innerHTML='';
  vals.forEach(function(row,idx){
    var h=Math.round((row[1]/max)*100),x=120+idx*220,y=145-h;
    var r=document.createElementNS('http://www.w3.org/2000/svg','rect');r.setAttribute('x',x);r.setAttribute('y',y);r.setAttribute('width','96');r.setAttribute('height',h);r.setAttribute('rx','12');r.setAttribute('fill',row[2]);r.setAttribute('opacity','0.85');sv.appendChild(r);
    var t=document.createElementNS('http://www.w3.org/2000/svg','text');t.setAttribute('x',x+48);t.setAttribute('y',y-8);t.setAttribute('text-anchor','middle');t.setAttribute('font-size','12');t.setAttribute('fill','currentColor');t.textContent=row[0]+': '+row[1];sv.appendChild(t);
  });
}

function drawOccupancyChart(c){
  var sv=document.getElementById('bar-occupancy');
  var occ=Math.min(100,Math.max(15,Math.round(((c.hotel||1)+(c.reservasi||1))*3.4)));
  var inv=Math.min(100,Math.max(10,Math.round(((c.pembayaran||1)+(c.kas||1))*4.1)));
  sv.innerHTML='';
  var base=document.createElementNS('http://www.w3.org/2000/svg','rect');base.setAttribute('x','40');base.setAttribute('y','64');base.setAttribute('width','480');base.setAttribute('height','18');base.setAttribute('rx','9');base.setAttribute('fill','var(--surface-3)');sv.appendChild(base);
  var f1=document.createElementNS('http://www.w3.org/2000/svg','rect');f1.setAttribute('x','40');f1.setAttribute('y','64');f1.setAttribute('width',String((occ/100)*480));f1.setAttribute('height','18');f1.setAttribute('rx','9');f1.setAttribute('fill','var(--info)');sv.appendChild(f1);
  var l1=document.createElementNS('http://www.w3.org/2000/svg','text');l1.setAttribute('x','40');l1.setAttribute('y','54');l1.setAttribute('fill','currentColor');l1.setAttribute('font-size','11');l1.textContent='Okupansi '+occ+'%';sv.appendChild(l1);
  var base2=document.createElementNS('http://www.w3.org/2000/svg','rect');base2.setAttribute('x','40');base2.setAttribute('y','112');base2.setAttribute('width','480');base2.setAttribute('height','18');base2.setAttribute('rx','9');base2.setAttribute('fill','var(--surface-3)');sv.appendChild(base2);
  var f2=document.createElementNS('http://www.w3.org/2000/svg','rect');f2.setAttribute('x','40');f2.setAttribute('y','112');f2.setAttribute('width',String((inv/100)*480));f2.setAttribute('height','18');f2.setAttribute('rx','9');f2.setAttribute('fill','var(--brand)');sv.appendChild(f2);
  var l2=document.createElementNS('http://www.w3.org/2000/svg','text');l2.setAttribute('x','40');l2.setAttribute('y','102');l2.setAttribute('fill','currentColor');l2.setAttribute('font-size','11');l2.textContent='Tagihan '+inv+'%';sv.appendChild(l2);
}

function drawRecent(c){
  var b=document.getElementById('rBody');
  b.innerHTML='';
  ENT.forEach(function(e){
    var tr=document.createElement('tr'),t1=document.createElement('td'),bg=document.createElement('span');
    bg.className='badge b-aktif';bg.textContent=LABELS[e]||e;t1.appendChild(bg);
    var t2=document.createElement('td'),sb2=document.createElement('span');sb2.className='badge b-aktif';sb2.textContent='Aktif';t2.appendChild(sb2);
    var t3=document.createElement('td');t3.className='sb';t3.textContent=c[e]||0;
    var t4=document.createElement('td'),btn=document.createElement('button');btn.className='btn btn-g btn-sm';btn.textContent='Lihat →';var en=e;btn.addEventListener('click',function(){gt('list',en)});t4.appendChild(btn);
    tr.append(t1,t2,t3,t4);b.appendChild(tr);
  });
}

async function ldList(en){
  sel.clear();upBk();byId('chkA').checked=false;byId('sinp').value='';byId('sst').value='';
  var bd=byId('tbody');bd.innerHTML='';
  bd.innerHTML='<tr class="ld-row"><td colspan="5"><div class="sk sk-lg"></div><div class="sk mt-10"></div></td></tr>';
  pg=1;
  if(en==='cafe'){
    allR=cafeOrders.slice();
    fltR=allR.slice();
    sortStack=[{k:'name',asc:true}];
    flt();
    rndr();
    renderModuleShowcase(en);
    applyColVisibility();
    toast('Data Cafe dimuat ('+allR.length+')','success');
    return;
  }
  if(en==='outbound'){
    ensureOutboundSeed();
    allR=outboundRecords.slice();
    fltR=allR.slice();
    sortStack=[{k:'name',asc:true}];
    flt();
    rndr();
    renderModuleShowcase(en);
    applyColVisibility();
    toast('Data Outbound dimuat ('+allR.length+')','success');
    return;
  }
  if(en==='finance'){
    allR=financeTransactions.slice();
    fltR=allR.slice();
    sortStack=[{k:'name',asc:true}];
    flt();
    rndr();
    renderModuleShowcase(en);
    applyColVisibility();
    toast('Data Keuangan dimuat ('+allR.length+')','success');
    return;
  }
  if(en==='accounting'){
    allR=accountingJournals.slice();
    fltR=allR.slice();
    sortStack=[{k:'name',asc:true}];
    flt();
    rndr();
    renderModuleShowcase(en);
    applyColVisibility();
    toast('Data Accounting dimuat ('+allR.length+')','success');
    return;
  }
  try{
    var d=await apf(eBasePath(en));
    allR=normalizeEntityRows(en,d);
    fltR=allR.slice();
    var ds=eSortDefault(en);
    sortStack=[{k:String(ds.field||'name'),asc:String(ds.direction||'asc')!=='desc'}];
    flt();
    rndr();
    renderModuleShowcase(en);
    applyColVisibility();
    toast('Data '+(LABELS[en]||en)+' dimuat ('+allR.length+')','success');
  }catch(e){allR=[];fltR=[];flt();rndr();renderModuleShowcase(en);applyColVisibility();toast('Gagal memuat data dari API, menampilkan mode lokal','warn')}
}

function rld(){ldList(ent)}
function flt(){
  var q=byId('sinp').value.toLowerCase(),st=byId('sst').value,st2=byId('sf-status').value;
  var targetStatus=st2||st;
  var sFields=eSearchable(ent);
  fltR=allR.filter(function(r){
    var matchQ=!q||sFields.some(function(f){return String(r[f]||'').toLowerCase().includes(q)});
    return matchQ&&(!targetStatus||(r.status||'')===targetStatus)
  });
  if(sortStack.length){
    fltR.sort(function(a,b){
      for(var i=0;i<sortStack.length;i++){
        var stx=sortStack[i],va=(a[stx.k]||'').toString().toLowerCase(),vb=(b[stx.k]||'').toString().toLowerCase();
        var cmp=va.localeCompare(vb);if(cmp!==0)return stx.asc?cmp:-cmp;
      }
      return 0;
    });
  }
  pg=1;renderFilterChips();rndr();
}
var throttledFilter=throttle(flt,120);
function sBy(k,ev){
  if(eSortable(ent).indexOf(k)===-1)return;
  var shift=!!(ev&&ev.shiftKey);
  if(!shift)sortStack=[];
  var ex=sortStack.find(function(s){return s.k===k});
  if(ex)ex.asc=!ex.asc;else sortStack.push({k:k,asc:true});
  document.getElementById('si-name').textContent='';document.getElementById('si-status').textContent='';
  sortStack.forEach(function(s){var node=document.getElementById('si-'+s.k);if(node)node.textContent=s.asc?' ↑':' ↓';});
  fltR.sort(function(a,b){
    for(var i=0;i<sortStack.length;i++){
      var st=sortStack[i],va=(a[st.k]||'').toString().toLowerCase(),vb=(b[st.k]||'').toString().toLowerCase();
      var cmp=va.localeCompare(vb);if(cmp!==0)return st.asc?cmp:-cmp;
    }
    return 0;
  });
  rndr();
}
function toggleAdvFilter(){document.getElementById('fadv').classList.toggle('on')}
function advSort(v){if(!v)return;var p=v.split('-');sk=p[0];sa=p[1]!=='desc';sBy(sk)}
function resetAdvFilter(){document.getElementById('sf-status').value='';document.getElementById('sf-sort').value='';document.getElementById('sinp').value='';document.getElementById('sst').value='';flt()}
function renderFilterChips(){
  var chips=[];var q=byId('sinp').value;var st=byId('sst').value||byId('sf-status').value;var sf=byId('sf-sort').value;
  if(q)chips.push('Cari: '+q);if(st)chips.push('Status: '+st);if(sf)chips.push('Urut: '+sf);
  var box=byId('fchips');box.classList.toggle('on',chips.length>0);box.innerHTML=chips.map(function(c){return '<span class="fchip">'+c+'</span>'}).join('');
}
function getRenderContext(){
  if(!vrt.enabled||fltR.length<50){return{rows:fltR.slice((pg-1)*PS,pg*PS),top:0,bottom:0,virtual:false};}
  var wrap=document.querySelector('.tbl-w');
  if(!wrap)return{rows:fltR.slice(0,PS),top:0,bottom:0,virtual:false};
  wrap.style.maxHeight='520px';wrap.style.overflowY='auto';
  var start=Math.max(0,Math.floor(wrap.scrollTop/vrt.rowH)-4);
  var end=Math.min(fltR.length,start+vrt.viewport+8);
  return{rows:fltR.slice(start,end),top:start*vrt.rowH,bottom:Math.max(0,(fltR.length-end)*vrt.rowH),virtual:true};
}

function rndr(){
  var bd=byId('tbody');bd.innerHTML='';
  var ctx=getRenderContext();
  var sl=ctx.rows;
  if(ctx.virtual&&ctx.top>0){var trTop=document.createElement('tr');var tdTop=document.createElement('td');tdTop.colSpan=5;tdTop.style.height=ctx.top+'px';tdTop.style.border='none';trTop.appendChild(tdTop);bd.appendChild(trTop)}
  if(!sl.length){
    var et=document.createElement('tr');et.className='ld-row';
    var etd=document.createElement('td');etd.colSpan=5;
    etd.innerHTML='<div class="empty-ill">🧭</div><div class="empty-title">Data Belum Tersedia</div><div class="empty-desc">Belum ada data untuk filter saat ini.</div><div class="empty-actions"><button class="btn btn-p btn-sm js-empty-add">Tambah Data</button><button class="btn btn-o btn-sm js-empty-reset">Reset Filter</button></div>';
    et.appendChild(etd);bd.appendChild(et);
    var bAdd=etd.querySelector('.js-empty-add');if(bAdd)bAdd.onclick=function(){gt('form',ent)};
    var bReset=etd.querySelector('.js-empty-reset');if(bReset)bReset.onclick=function(){resetAdvFilter()};
  }
  else{
    sl.forEach(function(r){
      var tr=document.createElement('tr');if(sel.has(r.id))tr.classList.add('sel');tr.tabIndex=0;
      var ct=document.createElement('td'),ck=document.createElement('input');ck.type='checkbox';ck.checked=sel.has(r.id);ck.addEventListener('change',function(){tRow(r.id,ck.checked)});ct.appendChild(ck);
      ct.classList.add('pin');
      var it=document.createElement('td');it.className='mu xs c-id pin';it.textContent=r.id.substring(0,8)+'…';it.setAttribute('data-label','ID');
      var nt=document.createElement('td');nt.className='sb c-name';nt.setAttribute('data-label','Nama');
      var av=document.createElement('span');av.className='avt';av.textContent=(r.name||'?').substring(0,1).toUpperCase();
      nt.appendChild(av);
      var qk=byId('sinp')?byId('sinp').value:'';
      var span=document.createElement('span');span.innerHTML=hiText(r.name||'',qk);nt.appendChild(span);
      if(inlineEditing){nt.setAttribute('contenteditable','true');nt.setAttribute('role','textbox');nt.setAttribute('aria-label','Edit langsung nama');nt.addEventListener('blur',function(){var raw=(nt.textContent||'').trim();if(!raw)return;var clean=raw.replace(/^[A-Z]{1,2}\s*/,'').trim();r.name=clean||r.name;});}
      var st2=document.createElement('td');st2.className='c-status';st2.setAttribute('data-label','Status');var stv=(r.status||'aktif').toLowerCase().replace(/\s/g,''),bg=document.createElement('span');bg.className='badge b-'+stv;bg.textContent=r.status||'aktif';st2.appendChild(bg);
      var at=document.createElement('td');at.className='row-actions';
      var mb=document.createElement('button');mb.className='btn btn-o btn-sm';mb.textContent='⋯';
      var m=document.createElement('div');m.className='rmenu';
      var b1=document.createElement('button');b1.className='rmi';b1.textContent='Lihat';b1.onclick=function(){openDrawer(r.id)};
      var b2=document.createElement('button');b2.className='rmi';b2.textContent='Ubah';b2.onclick=function(){opEd(r.id)};
      var b3=document.createElement('button');b3.className='rmi';b3.textContent='Hapus';b3.onclick=function(){opDel(r.id)};
      if(!supportsEntityUpdate(ent)){b2.disabled=true;b2.title='Update endpoint belum tersedia';}
      if(!supportsEntityDelete(ent)){b3.disabled=true;b3.title='Delete endpoint belum tersedia';}
      m.append(b1,b2,b3);
      mb.onclick=function(ev){ev.stopPropagation();document.querySelectorAll('.rmenu').forEach(function(x){if(x!==m)x.classList.remove('on')});m.classList.toggle('on')};
      tr.addEventListener('keydown',function(e){
        if(e.key==='Enter'){openDrawer(r.id)}
        if(e.key==='ArrowDown'){e.preventDefault();var nx=tr.nextElementSibling;if(nx)nx.focus()}
        if(e.key==='ArrowUp'){e.preventDefault();var pv=tr.previousElementSibling;if(pv)pv.focus()}
      });
      at.append(mb,m);tr.append(ct,it,nt,st2,at);bd.appendChild(tr);
    });
  }
  if(ctx.virtual&&ctx.bottom>0){var trBottom=document.createElement('tr');var tdBottom=document.createElement('td');tdBottom.colSpan=5;tdBottom.style.height=ctx.bottom+'px';tdBottom.style.border='none';trBottom.appendChild(tdBottom);bd.appendChild(trBottom)}
  applyColVisibility();
  if(ctx.virtual){byId('pgp').innerHTML='';byId('pgi').textContent=fltR.length+' data (virtual)'}else rndrPg();
}

function rndrPg(){
  var tot=fltR.length,pgs=Math.ceil(tot/PS),s=(pg-1)*PS+1,e2=Math.min(pg*PS,tot);
  byId('pgi').textContent=tot>0?(s+'–'+e2+' dari '+tot):'0 data';
  var c=byId('pgp');c.innerHTML='';
  function pb(lbl,p2,dis,on){var b=document.createElement('button');b.className='pgb'+(on?' on':'');b.textContent=lbl;b.disabled=dis;b.addEventListener('click',function(){pg=p2;rndr()});c.appendChild(b)}
  pb('‹',pg-1,pg<=1,false);
  for(var i=1;i<=pgs;i++){if(i===1||i===pgs||Math.abs(i-pg)<=1)pb(i,i,false,i===pg);else if(Math.abs(i-pg)===2){var sp=document.createElement('button');sp.className='pgb';sp.textContent='…';sp.style.pointerEvents='none';c.appendChild(sp)}}
  pb('›',pg+1,pg>=pgs,false);
}

function tRow(id,ck){if(ck)sel.add(id);else sel.delete(id);upBk();document.querySelectorAll('#tbody tr').forEach(function(tr){var c=tr.querySelector('input[type=checkbox]');if(c)tr.classList.toggle('sel',c.checked)})}
function tAll(ck){var sl=fltR.slice((pg-1)*PS,pg*PS);sl.forEach(function(r){if(ck)sel.add(r.id);else sel.delete(r.id)});rndr();byId('chkA').checked=ck;upBk()}
function upBk(){var b=byId('bk');b.classList.toggle('on',sel.size>0);byId('bk-c').textContent=sel.size+' dipilih'}
function clrSel(){sel.clear();byId('chkA').checked=false;rndr();upBk()}
async function bulkDel(){if(!sel.size||!confirm('Hapus '+sel.size+' item?'))return;var ids=Array.from(sel);if(!supportsEntityDelete(ent)){toast('Delete tidak tersedia untuk modul ini','error');return}if(ent==='cafe'){cafeOrders=cafeOrders.filter(function(row){return ids.indexOf(row.id)<0});saveCafeOrders();recAudit('delete',{count:ids.length,bulk:true,entity:'cafe'});toast(ids.length+' item dihapus','success');sel.clear();ldList(ent);ldDash();return}if(ent==='outbound'){outboundRecords=outboundRecords.filter(function(row){return ids.indexOf(row.id)<0});saveOutboundRecords();recAudit('delete',{count:ids.length,bulk:true,entity:'outbound'});toast(ids.length+' data outbound dihapus','success');sel.clear();ldList(ent);ldDash();return}if(ent==='finance'){financeTransactions=financeTransactions.filter(function(row){return ids.indexOf(row.id)<0});saveFinanceTransactions();recAudit('delete',{count:ids.length,bulk:true,entity:'finance'});toast(ids.length+' transaksi dihapus','success');sel.clear();ldList(ent);ldDash();return}if(ent==='accounting'){accountingJournals=accountingJournals.filter(function(row){return ids.indexOf(row.id)<0});saveAccountingJournals();recAudit('delete',{count:ids.length,bulk:true,entity:'accounting'});toast(ids.length+' jurnal dihapus','success');sel.clear();ldList(ent);ldDash();return}for(var i=0;i<ids.length;i++){try{await apf(eItemPath(ent,ids[i]),{method:'DELETE',noCache:true})}catch(_){}}recAudit('delete',{count:ids.length,bulk:true});toast(ids.length+' item dihapus','success');sel.clear();ldList(ent)}
function expCSV(){var rows=[['ID','Nama','Status']].concat(fltR.map(function(r){return[r.id,r.name,r.status]}));var csv=rows.map(function(r){return r.map(function(c){return'"'+String(c||'').replace(/"/g,'""')+'"'}).join(',')}).join('\\r\\n');var a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download=ent+'-ekspor.csv';a.click();recAudit('export',{format:'csv',count:fltR.length});toast('Ekspor CSV berhasil','success')}
function expXLS(){
  var rows=[['ID','Nama','Status']].concat(fltR.map(function(r){return[r.id,r.name,r.status]}));
  var table='<table><tr>'+rows[0].map(function(h){return'<th>'+h+'</th>'}).join('')+'</tr>';
  for(var i=1;i<rows.length;i++){table+='<tr>'+rows[i].map(function(c){return'<td>'+String(c||'')+'</td>'}).join('')+'</tr>'}
  table+='</table>';
  var blob=new Blob(['<html><body>'+table+'</body></html>'],{type:'application/vnd.ms-excel'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=ent+'-ekspor.xls';a.click();URL.revokeObjectURL(a.href);recAudit('export',{format:'excel',count:fltR.length});toast('Ekspor Excel berhasil','success');
}

function saveFilter(){
  var payload={q:byId('sinp').value,st:byId('sst').value,sfStatus:byId('sf-status').value,sfSort:byId('sf-sort').value};
  localStorage.setItem('satset-filter-'+ent,JSON.stringify(payload));toast('Filter disimpan','success');
}
function loadFilter(){
  try{var raw=localStorage.getItem('satset-filter-'+ent);if(!raw){toast('Tidak ada filter tersimpan','error');return}var f=JSON.parse(raw);byId('sinp').value=f.q||'';byId('sst').value=f.st||'';byId('sf-status').value=f.sfStatus||'';byId('sf-sort').value=f.sfSort||'';flt();if(f.sfSort)advSort(f.sfSort);toast('Filter diterapkan','success')}catch(_){toast('Filter tidak valid','error')}
}

function toggleColumn(k,checked){visCols[k]=checked;applyColVisibility()}
function applyColVisibility(){['id','name','status'].forEach(function(k){var show=visCols[k]!==false;document.querySelectorAll('[data-col="'+k+'"], .c-'+k).forEach(function(el){el.style.display=show?'':'none'})})}
function reorderCols(){
  var tb=document.getElementById('tbody');
  colOrder=colOrder==='default'?'status-first':'default';
  document.querySelectorAll('#grid-main thead tr').forEach(function(tr){
    var cells=Array.from(tr.children);
    var idCell=tr.querySelector('.h-id'),nameCell=tr.querySelector('.h-name'),statusCell=tr.querySelector('.h-status');
    if(!idCell||!nameCell||!statusCell)return;
    if(colOrder==='status-first'){tr.insertBefore(statusCell,nameCell)}else{tr.insertBefore(nameCell,statusCell)}
  });
  Array.from(tb.querySelectorAll('tr')).forEach(function(tr){
    var idc=tr.querySelector('.c-id'),namec=tr.querySelector('.c-name'),stc=tr.querySelector('.c-status');
    if(!namec||!stc)return;
    if(colOrder==='status-first')tr.insertBefore(stc,namec);else tr.insertBefore(namec,stc);
  });
  toast('Urutan kolom diperbarui','success');
}

function openDrawer(id){
  var it=allR.find(function(r){return r.id===id});if(!it)return;
  document.getElementById('dr-title').textContent=LABELS[ent]||ent;
  document.getElementById('dr-sub').textContent='Detail baris';
  document.getElementById('dr-id').textContent=it.id||'-';
  document.getElementById('dr-name').textContent=it.name||'-';
  document.getElementById('dr-status').textContent=it.status||'-';
  document.getElementById('detail-drawer').classList.add('on');
  if(supportsEntityDetail(ent)){
    apf(eItemPath(ent,id),{method:'GET',cacheTtlMs:0}).then(function(payload){
      var detail=normalizeEntityRows(ent,[payload])[0]||it;
      document.getElementById('dr-id').textContent=detail.id||'-';
      document.getElementById('dr-name').textContent=detail.name||detail.poNumber||'-';
      document.getElementById('dr-status').textContent=detail.status||'-';
    }).catch(function(_e){});
  }
}
function closeDrawer(){document.getElementById('detail-drawer').classList.remove('on')}

function draftKey(){return 'satset-admin-draft-'+ent+'-'+(eId||'new')}
function setAutoState(txt,clz){var a=document.getElementById('auto-state');a.textContent=txt;a.className='auto'+(clz?' '+clz:'')}
function saveDraftDebounced(){clearTimeout(autoTimer);setAutoState('Menyimpan...','saving');isDirty=true;autoTimer=setTimeout(function(){var payload={name:document.getElementById('fn').value,status:document.getElementById('fst').value,ket:document.getElementById('fket').value};localStorage.setItem(draftKey(),JSON.stringify(payload));setAutoState('Berhasil','ok')},500)}
function loadDraft(){try{var raw=localStorage.getItem(draftKey());if(!raw){setAutoState('Simpan Otomatis aktif','');return}var d=JSON.parse(raw);if(d&&eId===null){document.getElementById('fn').value=d.name||'';document.getElementById('fst').value=d.status||(ent==='reservasi'?'Draft':(ent==='cafe'?'Draft':(ent==='outbound'?'Dijadwalkan':(ent==='finance'?'Pemasukan':(ent==='accounting'?'General Journal':'aktif')))));document.getElementById('fket').value=d.ket||''}setAutoState('Draf dipulihkan','ok')}catch(_){setAutoState('Simpan Otomatis aktif','')}}
function clearDraft(){localStorage.removeItem(draftKey())}

function sfForm(en,isEd){
  document.getElementById('fne').textContent='';document.getElementById('fn').classList.remove('err');document.getElementById('savedmsg').classList.add('hidden');
  document.getElementById('valsum').classList.remove('on');
  syncFormStatusOptions(en);
  var hk=['destinasi','paket-wisata','guide','kendaraan','hotel'].indexOf(en)!==-1;
  document.getElementById('fkg').classList.toggle('hidden',!hk);
  document.getElementById('stp-main').classList.add('on');
  document.getElementById('stp-extra').classList.toggle('on',hk);
  document.getElementById('stp-review').classList.toggle('on',!hk);
  if(!isEd){activeEditRow=null;document.getElementById('fn').value='';document.getElementById('fst').value=en==='reservasi'?'Draft':(en==='cafe'?'Draft':(en==='outbound'?'Dijadwalkan':(en==='finance'?'Pemasukan':(en==='accounting'?'General Journal':'aktif'))));document.getElementById('fket').value=''}
  setAutoState('Simpan Otomatis aktif','');
  isDirty=false;
  loadDraft();
  ['fn','fst','fket'].forEach(function(id){var el=document.getElementById(id);if(el){el.oninput=saveDraftDebounced;el.onchange=saveDraftDebounced}});
  setTimeout(function(){document.getElementById('fn').focus()},80);
}

function opEd(id){
  if(!supportsEntityUpdate(ent)){toast('Update tidak tersedia untuk modul ini','error');return}
  var it=allR.find(function(r){return r.id===id});if(!it)return;
  activeEditRow=it;
  eId=id;gt('form',ent);
  setTimeout(function(){document.getElementById('fn').value=it.name||'';document.getElementById('fst').value=it.status||(ent==='reservasi'?'Draft':(ent==='cafe'?'Draft':(ent==='outbound'?'Dijadwalkan':(ent==='finance'?'Pemasukan':(ent==='accounting'?'General Journal':'aktif')))));setAutoState('Edit data aktif','')},60);
}

async function subForm(){
  var nm=document.getElementById('fn').value.trim(),st=document.getElementById('fst').value;
  if(!nm){document.getElementById('fn').classList.add('err');document.getElementById('fne').textContent='Nama wajib diisi';document.getElementById('valsum').classList.add('on');return}
  document.getElementById('fn').classList.remove('err');document.getElementById('fne').textContent='';
  document.getElementById('valsum').classList.remove('on');
  var btn=document.getElementById('bsave');btn.disabled=true;btn.classList.add('load');document.getElementById('slbl').textContent='Menyimpan…';setAutoState('Memproses...','saving');
  var ov=document.getElementById('f-overlay');ov.classList.add('on');
  var p=0;var prog=document.getElementById('f-prog');prog.style.width='0%';
  var int=setInterval(function(){p=Math.min(90,p+10);prog.style.width=p+'%'},90);
  try{
    if(eId&&!supportsEntityUpdate(ent)){throw new Error('Update tidak tersedia untuk modul '+(LABELS[ent]||ent));}
    var payload=eId?await buildUpdatePayload(ent,nm,st,activeEditRow):await buildCreatePayload(ent,nm,st);
    if(ent==='accounting'){
      if(eId&&activeEditRow){
        activeEditRow.name=nm;
        activeEditRow.type=st;
        activeEditRow.updatedAt=new Date().toISOString();
        accountingJournals=accountingJournals.map(function(row){return row.id===eId?activeEditRow:row});
        saveAccountingJournals();
        recAudit('update',{id:eId,entity:'accounting'});
        toast('Jurnal accounting diperbarui','success');
      }else{
        var ref=window.prompt('Referensi jurnal','MANUAL-'+Date.now())||('MANUAL-'+Date.now());
        var nominal=Number(window.prompt('Nominal jurnal','100000')||0);
        if(nominal<=0)throw new Error('Nominal jurnal tidak valid');
        var journal={id:genAccountingJournalNo(),journalNo:genAccountingJournalNo(),type:st,source:'Manual',reference:ref,description:nm,lines:[{accountCode:'1001',accountName:'Kas Utama',debit:nominal,credit:0,memo:nm},{accountCode:'7001',accountName:'Pendapatan Lainnya',debit:0,credit:nominal,memo:nm}],posted:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
        accountingJournals.unshift(journal);
        saveAccountingJournals();
        recAudit('create',{name:nm,entity:'accounting'});
        toast('Jurnal accounting ditambahkan','success');
      }
      activeEditRow=null;
      clearDraft();document.getElementById('savedmsg').classList.remove('hidden');setAutoState('Berhasil','ok');isDirty=false;prog.style.width='100%';setTimeout(function(){eId=null;gt('list',ent)},700);
      ldDash();
      return;
    }
    if(ent==='finance'){
      if(eId&&activeEditRow){
        activeEditRow.name=nm;
        activeEditRow.status=st;
        activeEditRow.jenis=st;
        activeEditRow.diperbaruiPada=new Date().toISOString();
        financeTransactions=financeTransactions.map(function(row){return row.id===eId?activeEditRow:row});
        saveFinanceTransactions();
        recAudit('update',{id:eId,entity:'finance'});
        toast('Transaksi keuangan diperbarui','success');
      }else{
        var nominal=Number(window.prompt('Nominal transaksi','100000')||0);
        var metode=(window.prompt('Metode pembayaran ('+(FINANCE_PAYMENT||[]).join('/')+')','Cash')||'Cash').trim();
        var saved=recordFinanceTransaction({jenis:st,sumber:'Manual',kategori:st==='Pengeluaran'?'Operasional':'Lainnya',metodePembayaran:metode,nominal:nominal,referensi:genFinanceNo(),akunKredit:st==='Pengeluaran'?'Kas':'Pendapatan Lainnya'});
        if(!saved){throw new Error('Transaksi keuangan gagal disimpan')}
        recAudit('create',{name:nm,entity:'finance'});
        toast('Transaksi keuangan ditambahkan','success');
      }
      activeEditRow=null;
      clearDraft();document.getElementById('savedmsg').classList.remove('hidden');setAutoState('Berhasil','ok');isDirty=false;prog.style.width='100%';setTimeout(function(){eId=null;gt('list',ent)},700);
      ldDash();
      return;
    }
    if(ent==='outbound'){
      ensureOutboundSeed();
      if(eId&&activeEditRow){
        activeEditRow.name=nm;
        activeEditRow.status=st;
        activeEditRow.sesi.status=st;
        activeEditRow.diperbaruiPada=new Date().toISOString();
        outboundRecords=outboundRecords.map(function(row){return row.id===eId?activeEditRow:row});
        saveOutboundRecords();
        createOutboundJournalEntry(activeEditRow);
        recAudit('update',{id:eId,entity:'outbound'});
        toast('Data outbound berhasil diperbarui','success');
      }else{
        var obId=genOutboundNo('OB');
        var paket=(outboundPackages||[])[0]||{id:'ob-default',namaPaket:nm,harga:85000,maksimalPeserta:30};
        var draft={id:obId,name:nm,status:st,paket:paket,jadwal:{id:obId+'-SCH',paketId:paket.id,tanggal:outboundTodayKey(),jamMulai:'08:00',jamSelesai:'11:00',slot:'Pagi',kuota:Number(paket.maksimalPeserta||30),sisaKuota:Number(paket.maksimalPeserta||30),bookingTerhubung:0,status:'Terbuka'},sesi:{id:obId+'-SES',scheduleId:obId+'-SCH',namaSesi:nm+' Pagi',status:st,instructorIds:(outboundInstructors||[]).slice(0,2).map(function(item){return item.id}),equipmentIds:(outboundEquipment||[]).slice(0,2).map(function(item){return item.id})},peserta:[],instruktur:(outboundInstructors||[]).slice(0,2),peralatan:(outboundEquipment||[]).slice(0,2),pembayaran:{metode:'Cash',nominal:0},voucher:null,pendapatan:0,jurnalReferensi:'JRN-'+obId,dibuatPada:new Date().toISOString(),diperbaruiPada:new Date().toISOString()};
        outboundRecords.unshift(draft);
        saveOutboundRecords();
        createOutboundJournalEntry(draft);
        recAudit('create',{name:nm,entity:'outbound'});
        toast('Data outbound ditambahkan','success');
      }
      activeEditRow=null;
      clearDraft();document.getElementById('savedmsg').classList.remove('hidden');setAutoState('Berhasil','ok');isDirty=false;prog.style.width='100%';setTimeout(function(){eId=null;gt('list',ent)},700);
      ldDash();
      return;
    }
    if(ent==='cafe'){
      if(eId&&activeEditRow){
        activeEditRow.name=nm;
        activeEditRow.status=st;
        activeEditRow.diperbaruiPada=new Date().toISOString();
        cafeOrders=cafeOrders.map(function(row){return row.id===eId?activeEditRow:row});
        saveCafeOrders();
        recAudit('update',{id:eId,entity:'cafe'});
        toast('Pesanan cafe berhasil diperbarui','success');
      }else{
        var orderNo=genCafeOrderNo();
        var draft={id:orderNo,name:nm,status:st,orderNo:orderNo,kasir:(activeCafeShift()&&activeCafeShift().namaKasir)||'Kasir',meja:'-',items:[],pembayaran:{metode:'Tunai',dibayar:0,pembulatan:0,kembalian:0},kitchen:{nomorAntrian:genCafeQueueNo(),status:'Menunggu',estimasiMenit:5,prioritas:'Normal',riwayatStatus:[{status:'Menunggu',at:new Date().toISOString()}]},subtotal:0,diskon:0,pajak:0,serviceCharge:0,pembulatan:0,total:0,catatan:'',dibuatPada:new Date().toISOString(),diperbaruiPada:new Date().toISOString()};
        cafeOrders.unshift(draft);
        saveCafeOrders();
        recAudit('create',{name:nm,entity:'cafe'});
        toast('Draft pesanan cafe ditambahkan','success');
      }
      activeEditRow=null;
      clearDraft();document.getElementById('savedmsg').classList.remove('hidden');setAutoState('Berhasil','ok');isDirty=false;prog.style.width='100%';setTimeout(function(){eId=null;gt('list',ent)},700);
      ldDash();
      return;
    }
    if(ent==='ticketing'){
      var no=genTicketNo();
      var totals=calcTicketTotals('Dewasa',1,0);
      payload=Object.assign({},payload,{ticketNo:no,qrCode:'SATSET:QR:'+no,barcode:'SATSET:BAR:'+no,tariffType:'Dewasa',channel:'Offline',paymentMethod:'Tunai',amount:totals.amount,discount:totals.discount,tax:totals.tax,total:totals.total,issuedAt:new Date().toISOString(),expiredAt:new Date(Date.now()+86400000).toISOString()});
    }
    var body=JSON.stringify(payload),hdrs={'Content-Type':'application/json'};
    var result=null;
    if(eId){result=await apf(eItemPath(ent,eId),{method:'PUT',headers:hdrs,body:body});recAudit('update',{id:eId});toast('Data berhasil diperbarui','success')}
    else{result=await apf(eBasePath(ent),{method:'POST',headers:hdrs,body:body});recAudit('create',{name:nm});toast('Data berhasil ditambahkan','success')}

    if(ent==='reservasi'){
      var bookingId=(result&&result.id)||eId||nm||genBookingNo();
      var bookingNo=bookingNoFromRow((result&&typeof result==='object')?result:null,bookingId);
      var prevStatus=(activeEditRow&&activeEditRow.status)||'';
      var bookingData={
        id:bookingId,
        bookingNo:bookingNo,
        name:nm,
        status:st,
        jumlahOrang:1,
      };

      if(!eId){
        pushTimeline('Booking dibuat ('+bookingNo+')','BK');
        pushNotif('info','Booking Baru','Booking '+bookingNo+' berhasil dibuat');
      }
      if(st==='Dibayar'&&prevStatus!=='Dibayar'){
        pushTimeline('Pembayaran booking diterima ('+bookingNo+')','BY');
        pushNotif('success','Pembayaran Berhasil','Booking '+bookingNo+' sudah dibayar');
        recordFinanceTransaction({jenis:'Pemasukan',sumber:'Booking',kategori:'Lainnya',metodePembayaran:'Cash',nominal:Number(bookingData.total||0)||50000,referensi:bookingNo,akunKredit:'Pendapatan Booking'});
      }
      if(st==='Dikonfirmasi'&&prevStatus!=='Dikonfirmasi'){
        await createTicketFromBookingIfNeeded(bookingData);
        ensureCheckInQueue(bookingNo,nm);
        ensureOutboundParticipantFromBooking(bookingData);
      }
      if(st==='Dibatalkan'&&prevStatus!=='Dibatalkan'){
        await voidTicketByBookingNo(bookingNo);
      }
      activeEditRow=null;
    }
    if(ent==='ticketing'){
      var prevTicketStatus=(activeEditRow&&activeEditRow.status)||'';
      if(st==='Refund'&&prevTicketStatus!=='Refund'){
        pushTimeline('Tiket refund diproses','RF');
        pushNotif('warning','Refund','Tiket dipindahkan ke status refund');
      }
      if(st==='Void'&&prevTicketStatus!=='Void'){
        pushTimeline('Tiket void diproses','VD');
        pushNotif('warning','Tiket Void','Tiket dipindahkan ke status void');
      }
      activeEditRow=null;
    }

    clearDraft();document.getElementById('savedmsg').classList.remove('hidden');setAutoState('Berhasil','ok');isDirty=false;prog.style.width='100%';setTimeout(function(){eId=null;gt('list',ent)},700);
  }catch(e){toast('Gagal: '+e.message,'error');setAutoState('Gagal','saving')}
  finally{clearInterval(int);setTimeout(function(){ov.classList.remove('on')},220);btn.classList.remove('load');btn.disabled=false;document.getElementById('slbl').textContent=eId?'Perbarui':'Simpan'}
}

function opDel(id){dId=id;document.getElementById('dmod').classList.add('on')}
function cMod(){dId=null;document.getElementById('dmod').classList.remove('on')}
async function cfDel(){if(!dId)return;try{if(!supportsEntityDelete(ent)){toast('Delete tidak tersedia untuk modul ini','error');cMod();return}if(ent==='cafe'){cafeOrders=cafeOrders.filter(function(row){return row.id!==dId});saveCafeOrders();recAudit('delete',{id:dId,bulk:false,entity:'cafe'});toast('Pesanan cafe berhasil dihapus','success');cMod();ldList(ent);ldDash();return}if(ent==='outbound'){outboundRecords=outboundRecords.filter(function(row){return row.id!==dId});saveOutboundRecords();recAudit('delete',{id:dId,bulk:false,entity:'outbound'});toast('Data outbound berhasil dihapus','success');cMod();ldList(ent);ldDash();return}if(ent==='finance'){financeTransactions=financeTransactions.filter(function(row){return row.id!==dId});saveFinanceTransactions();recAudit('delete',{id:dId,bulk:false,entity:'finance'});toast('Transaksi keuangan berhasil dihapus','success');cMod();ldList(ent);ldDash();return}if(ent==='accounting'){accountingJournals=accountingJournals.filter(function(row){return row.id!==dId});saveAccountingJournals();recAudit('delete',{id:dId,bulk:false,entity:'accounting'});toast('Jurnal accounting berhasil dihapus','success');cMod();ldList(ent);ldDash();return}await apf(eItemPath(ent,dId),{method:'DELETE',noCache:true});recAudit('delete',{id:dId,bulk:false});toast('Data berhasil dihapus','success');cMod();ldList(ent)}catch(e){toast('Gagal: '+e.message,'error');cMod()}}

document.getElementById('dmod').addEventListener('click',function(e){if(e.target===this)cMod()});
document.getElementById('cmd-pal').addEventListener('click',function(e){if(e.target===this)closeCmd()});
document.querySelectorAll('.sb-item').forEach(function(el){el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}})});
document.addEventListener('click',function(){closeMenus()});
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCmd();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='r'&&document.getElementById('v-dash').classList.contains('on')){e.preventDefault();ldDash();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&document.getElementById('v-form').classList.contains('on')){e.preventDefault();subForm();return}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'&&document.getElementById('v-list').classList.contains('on')){e.preventDefault();var i=document.getElementById('sinp');i.focus();i.select();return}
  if(e.key==='/'&&document.getElementById('cmd-pal').classList.contains('on')===false){e.preventDefault();openCmd();return}
  if(document.getElementById('cmd-pal').classList.contains('on')){
    if(e.key==='ArrowDown'){e.preventDefault();moveCmd(1);return}
    if(e.key==='ArrowUp'){e.preventDefault();moveCmd(-1);return}
    if(e.key==='Enter'){e.preventDefault();if(cmdIdx>=0&&cmdItems[cmdIdx]){cmdItems[cmdIdx].a();closeCmd();}else{var first=document.querySelector('#cmd-list .cp-item');if(first)first.click();}return}
  }
  if(e.key==='Escape'){closeMenus();closeDrawer();closeCmd();cMod()}
});

var sinpEl=byId('sinp');
if(sinpEl)sinpEl.oninput=debounce(function(){throttledFilter()},90);

if('IntersectionObserver' in window){
  var dashboardObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting)entry.target.classList.add('on')})},{threshold:.15});
  document.querySelectorAll('.card').forEach(function(card){dashboardObserver.observe(card)});
}
if('ResizeObserver' in window){
  var gridEl=byId('dash-widget-grid');
  if(gridEl){
    var gridResizeObserver=new ResizeObserver(debounce(function(){renderWidgets()},100));
    gridResizeObserver.observe(gridEl);
  }
}
var tableWrap=document.querySelector('.tbl-w');
if(tableWrap)tableWrap.addEventListener('scroll',throttle(function(){if(fltR.length>=50)rndr()},80));

window.addEventListener('beforeunload',function(e){
  if(document.getElementById('v-form').classList.contains('on')&&isDirty){e.preventDefault();e.returnValue='';}
});
window.addEventListener('satset:error',function(ev){
  var dt=ev&&ev.detail&&ev.detail.error?ev.detail.error:null;
  if(dt&&dt.message){toast('Gagal: '+dt.message,'error')}
});
renderNotif();
renderWidgets();
applyWidgetConfig();
restoreWidgetOrder();
syncSidebarTooltips();
ensureKpiCompare();
ldDash();
</script>
</body>
</html>`;
