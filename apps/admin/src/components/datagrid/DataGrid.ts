import { DataGridBody } from "./DataGridBody.js";
import { DataGridContextMenu } from "./DataGridContextMenu.js";
import { DataGridExport } from "./DataGridExport.js";
import { DataGridFilters } from "./DataGridFilters.js";
import { DataGridHeader } from "./DataGridHeader.js";
import { DataGridPagination } from "./DataGridPagination.js";
import { DataGridSelection } from "./DataGridSelection.js";
import { DataGridToolbar } from "./DataGridToolbar.js";

export function DataGrid(): string {
  return `<section id="v-list" role="region" aria-label="Data Grid">${DataGridToolbar()}${DataGridFilters()}${DataGridSelection()}${DataGridHeader()}${DataGridBody()}${DataGridPagination()}${DataGridExport()}${DataGridContextMenu()}</section>`;
}
