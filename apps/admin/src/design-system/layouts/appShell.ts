import { el } from "../utils/dom.js";

type Slot = {
  sidebar: string;
  topbar: string;
  pageHeader: string;
  pageContent: string;
  footer?: string;
};

export function AppShell(slots: Slot): string {
  const footer = slots.footer ?? "";
  return `${slots.sidebar}${el("div", { class: "ds-app-shell-wrap" }, `${slots.topbar}${el("main", { class: "ds-page" }, `${slots.pageHeader}${slots.pageContent}${footer}`)}`)}`;
}

export function PageHeader(content: string): string {
  return el("header", { class: "ds-page-header" }, content);
}

export function PageContent(content: string): string {
  return el("section", { class: "ds-page-content" }, content);
}

export function WidgetGrid(content: string): string {
  return el("section", { class: "ds-widget-grid" }, content);
}

export function Footer(content: string): string {
  return el("footer", { class: "ds-footer" }, content);
}
