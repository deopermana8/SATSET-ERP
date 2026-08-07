import type { MobileNotificationItem, MobileTaskItem } from "../../app/dashboard/mobileDashboardTypes.js";

type MobileTaskListProps = {
  title: string;
  badge: string;
  items: Array<MobileTaskItem | MobileNotificationItem>;
};

export function renderMobileTaskList(props: MobileTaskListProps): string {
  return `<section class="mobile-panel"><div class="mobile-panel-hd"><div><div class="mobile-panel-title">${props.title}</div><div class="mobile-panel-sub">${props.badge}</div></div><span class="mobile-panel-count">${props.items.length}</span></div><div class="mobile-task-list">${props.items.map((item) => { const action = item.action || 'openCmd()'; const badge = 'badge' in item && item.badge ? item.badge : 'time' in item ? item.time : ''; return `<button class="mobile-task" onclick="${action}"><span class="mobile-task-copy"><span class="mobile-task-lbl">${item.title}</span><span class="mobile-task-desc">${item.detail}</span></span><span class="badge mobile-task-badge" data-tone="${item.tone}">${badge}</span></button>`; }).join('')}</div></section>`;
}