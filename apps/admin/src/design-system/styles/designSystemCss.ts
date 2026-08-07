import { satsetTheme } from "../tokens/theme.js";

export function designSystemCss(): string {
  const s = satsetTheme.spacing;
  return `
:root{
  --ds-font-heading:${satsetTheme.typography.fontFamily.heading};
  --ds-font-body:${satsetTheme.typography.fontFamily.body};
  --ds-space-1:${s[1]};
  --ds-space-2:${s[2]};
  --ds-space-3:${s[3]};
  --ds-space-4:${s[4]};
  --ds-space-5:${s[5]};
  --ds-space-6:${s[6]};
  --ds-space-8:${s[8]};
  --ds-space-10:${s[10]};
  --ds-space-12:${s[12]};
  --ds-space-16:${s[16]};
}
.ds-glass{backdrop-filter:blur(10px);box-shadow:var(--ds-shadow-glass)}
.ds-focus:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--ds-color-primary) 35%,transparent)}
.ds-grid{display:grid;gap:var(--ds-space-4)}
.ds-inline{display:inline-flex;align-items:center;gap:var(--ds-space-2)}

/* primitives */
.ds-btn,.ds-icon-btn,.ds-input,.ds-textarea,.ds-select,.ds-switch,.ds-chip,.ds-badge,.ds-avatar,.ds-dropdown,.ds-dialog,.ds-drawer,.ds-modal,.ds-toast,.ds-tabs,.ds-accordion,.ds-stepper,.ds-breadcrumb,.ds-sidebar,.ds-topbar,.ds-command-palette,.ds-search-box,.ds-calendar,.ds-datepicker,.ds-table,.ds-data-table,.ds-pagination,.ds-stat-card,.ds-metric-card,.ds-timeline,.ds-activity-feed,.ds-notification,.ds-skeleton,.ds-spinner,.ds-empty-state,.ds-error-state,.ds-loading-overlay,.ds-card{font-family:var(--ds-font-body)}

.ds-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--ds-space-2);padding:8px 14px;border-radius:var(--ds-radius-md);border:1px solid var(--ds-color-border);background:var(--ds-color-primary);color:#111827;transition:all ${satsetTheme.animation.duration.fast} ${satsetTheme.animation.easing.standard};cursor:pointer}
.ds-btn:hover{background:var(--ds-color-primary-hover);color:#fff}
.ds-btn:focus-visible,.ds-input:focus-visible,.ds-textarea:focus-visible,.ds-select:focus-visible,.ds-toggle:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in oklab,var(--ds-color-primary) 35%,transparent)}
.ds-btn[disabled],.ds-input[disabled],.ds-select[disabled],.ds-textarea[disabled],.ds-toggle[disabled]{opacity:.58;cursor:not-allowed}
.ds-btn.is-loading::after{content:"";width:12px;height:12px;border-radius:999px;border:2px solid rgba(255,255,255,.5);border-top-color:transparent;animation:ds-spin ${satsetTheme.animation.duration.slow} linear infinite}
.ds-btn.is-success{background:var(--ds-color-success);border-color:var(--ds-color-success);color:#fff}
.ds-btn.is-error{background:var(--ds-color-danger);border-color:var(--ds-color-danger);color:#fff}
.ds-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:var(--ds-radius-md);border:1px solid var(--ds-color-border);background:var(--ds-color-surface);color:var(--ds-color-text)}
.ds-card,.ds-stat-card,.ds-metric-card{border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-xl);background:var(--ds-color-card);box-shadow:var(--ds-shadow-sm);padding:var(--ds-space-4)}
.ds-input,.ds-textarea,.ds-select{width:100%;border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-md);background:var(--ds-color-surface);color:var(--ds-color-text);padding:10px 12px}
.ds-input.is-error,.ds-textarea.is-error,.ds-select.is-error{border-color:var(--ds-color-danger)}
.ds-input.is-success,.ds-textarea.is-success,.ds-select.is-success{border-color:var(--ds-color-success)}
.ds-switch{width:44px;height:24px;border-radius:999px;border:1px solid var(--ds-color-border);background:var(--ds-color-surface)}
.ds-toggle{width:44px;height:24px;border-radius:999px;border:1px solid var(--ds-color-border);background:var(--ds-color-surface);position:relative}
.ds-toggle::after{content:"";position:absolute;left:3px;top:3px;width:16px;height:16px;border-radius:50%;background:var(--ds-color-text-muted);transition:all ${satsetTheme.animation.duration.fast} ${satsetTheme.animation.easing.standard}}
.ds-toggle[aria-checked="true"]::after{left:24px;background:var(--ds-color-primary)}
.ds-badge,.ds-chip{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;font-size:11px;background:color-mix(in oklab,var(--ds-color-info) 20%,transparent);color:var(--ds-color-text)}
.ds-alert{padding:10px 12px;border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-md);background:color-mix(in oklab,var(--ds-color-info) 15%,transparent);color:var(--ds-color-text)}
.ds-alert[data-variant="success"]{background:color-mix(in oklab,var(--ds-color-success) 15%,transparent);border-color:color-mix(in oklab,var(--ds-color-success) 45%,var(--ds-color-border));}
.ds-alert[data-variant="error"]{background:color-mix(in oklab,var(--ds-color-danger) 15%,transparent);border-color:color-mix(in oklab,var(--ds-color-danger) 45%,var(--ds-color-border));}
.ds-avatar{width:30px;height:30px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;background:var(--ds-color-primary);color:#111827;font-weight:700}
.ds-tooltip,.ds-popover,.ds-dropdown,.ds-menu,.ds-dialog,.ds-modal,.ds-drawer,.ds-toast,.ds-command-palette{border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-lg);background:var(--ds-color-surface);box-shadow:var(--ds-shadow-lg)}
.ds-skeleton{height:14px;border-radius:10px;background:linear-gradient(90deg,var(--ds-color-surface),var(--ds-color-card),var(--ds-color-surface));background-size:180% 100%;animation:ds-skeleton ${satsetTheme.animation.duration.slow} infinite}
.ds-spinner{width:18px;height:18px;border:2px solid var(--ds-color-border);border-top-color:var(--ds-color-primary);border-radius:999px;animation:ds-spin ${satsetTheme.animation.duration.slow} linear infinite}
.ds-progress{height:8px;border-radius:999px;overflow:hidden;background:var(--ds-color-card);position:relative}
.ds-progress > span{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--ds-color-primary),var(--ds-color-info));transition:width ${satsetTheme.animation.duration.normal} ${satsetTheme.animation.easing.standard}}
.ds-data-grid{display:grid;gap:var(--ds-space-2)}

/* layout engine */
.ds-app-shell-wrap{margin-left:252px;min-height:100vh;display:flex;flex-direction:column}
.ds-page{display:flex;flex-direction:column;gap:var(--ds-space-4);padding:var(--ds-space-6)}
.ds-page-header{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--ds-space-4)}
.ds-page-content{display:flex;flex-direction:column;gap:var(--ds-space-4)}
.ds-widget-grid{display:grid;gap:var(--ds-space-4);grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
.ds-footer{margin-top:auto;padding:var(--ds-space-4);color:var(--ds-color-text-muted);font-size:12px}

/* utilities */
.ds-loading-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:color-mix(in oklab,var(--ds-color-bg) 65%,transparent)}
.ds-empty-state,.ds-error-state{padding:var(--ds-space-6);text-align:center;color:var(--ds-color-text-muted)}
.ds-error-state{color:var(--ds-color-danger)}

@keyframes ds-spin{to{transform:rotate(360deg)}}
@keyframes ds-skeleton{from{background-position:0 0}to{background-position:180% 0}}

@media (max-width:${satsetTheme.breakpoints.tablet}px){
  .ds-app-shell-wrap{margin-left:0}
  .ds-page{padding:var(--ds-space-4)}
}
`;}
