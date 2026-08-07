import { el } from "../utils/dom.js";

export function TopbarLayout(content: string): string {
  return el("header", { class: "ds-topbar" }, content);
}
