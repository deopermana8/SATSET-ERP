import { DataGridRow } from "./DataGridRow.js";

export function DataGridBody(): string {
  return `<div class="grid-body">${DataGridRow()}</div>`;
}
