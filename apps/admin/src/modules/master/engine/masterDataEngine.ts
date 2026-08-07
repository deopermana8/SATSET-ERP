import { createAuditStore } from "./audit.js";
import { applyBulkDelete, buildBulkActionSummary, toggleSelection, toggleSelectAll } from "./bulk.js";
import { applyFilterConditions } from "./filter.js";
import { buildInitialFormValues, normalizeFormValues } from "./form.js";
import { buildImportErrorReport, buildImportTemplate, exportRecords, previewImport } from "./importExport.js";
import { buildPaginationWindow } from "./pagination.js";
import { assertAccess, canAccess, type PermissionContext } from "./permissions.js";
import { createEntityRegistry } from "./registry.js";
import { createMasterRequestEngine } from "./requests.js";
import { createAsyncSearcher, highlightKeyword } from "./search.js";
import { createVirtualWindow, paginateRows, queryRows, reorderColumns, setColumnSize, setColumnVisibility, sortRows } from "./table.js";
import { buildDynamicToolbar } from "./toolbar.js";
import type { DataRequestInit } from "../../../types/dataLayer.js";
import type { MasterAuditAction, MasterEntityConfig, MasterTableQuery } from "./types.js";
import { validateRecord } from "./validation.js";

type RequestFn = <T>(path: string, init?: DataRequestInit) => Promise<T | null>;

export type MasterDataEngineOptions = {
  entities: MasterEntityConfig[];
  request: RequestFn;
  auditMaxEntries?: number;
};

export function createMasterDataEngine(options: MasterDataEngineOptions) {
  const registry = createEntityRegistry(options.entities);
  const audit = createAuditStore(options.auditMaxEntries ?? 1000);
  const requests = createMasterRequestEngine(options.request);

  const search = createAsyncSearcher(async (query, signal) => {
    const entities = registry.list();
    const payload = entities
      .filter((entity) => {
        const source = `${entity.name} ${entity.key} ${entity.route}`.toLowerCase();
        return source.includes(query);
      })
      .map((entity) => ({
        key: entity.key,
        name: entity.name,
        route: entity.route,
      }));

    if (signal.aborted) {
      throw new Error("search-abort");
    }

    return payload;
  });

  const createRuntime = <TRecord extends Record<string, unknown>>(entityKey: string) => {
    const entity = registry.get<TRecord>(entityKey);
    const fieldRules = Object.fromEntries(entity.fields.map((field) => [String(field.name), field.validation ?? []]));

    const runQuery = (rows: TRecord[], query: MasterTableQuery) => queryRows(rows, query, entity.searchableFields.map(String));

    const validate = (record: Partial<TRecord>, existingRows: TRecord[]) => validateRecord(entity.key, record, fieldRules, existingRows);

    const list = async (query?: MasterTableQuery) => {
      const raw = (await requests.request<TRecord[]>(entity.endpoint)) ?? [];
      if (!query) {
        return paginateRows(raw, 1, raw.length || 1);
      }
      return runQuery(raw, query);
    };

    const saveAudit = (action: MasterAuditAction, actor: string, payload: Record<string, unknown>) => {
      return audit.record({
        entity: entity.key,
        action,
        actor,
        payload,
      });
    };

    return {
      entity,
      list,
      runQuery,
      validate,
      buildInitialValues: () => buildInitialFormValues(entity.fields),
      normalizeValues: (values: Record<string, unknown>) => normalizeFormValues(values, entity.fields),
      applyFilters: (rows: TRecord[], conditions = []) => applyFilterConditions(rows, conditions),
      sortRows: (rows: TRecord[], sortBy?: string, direction: "asc" | "desc" = "asc") => sortRows(rows, sortBy, direction),
      paginateRows: (rows: TRecord[], page: number, pageSize: number) => paginateRows(rows, page, pageSize),
      setColumnVisibility: (visibility: Record<string, boolean>) => setColumnVisibility(entity.tableColumns, visibility),
      reorderColumns: (orderKeys: string[]) => reorderColumns(entity.tableColumns, orderKeys),
      setColumnSize: (key: string, width: number) => setColumnSize(entity.tableColumns, key, width),
      createVirtualWindow,
      buildPaginationWindow,
      buildToolbar: (context: PermissionContext) => buildDynamicToolbar(entity, context),
      buildImportTemplate: () => buildImportTemplate(entity),
      previewImport: (csvText: string, existingRows: TRecord[]) => previewImport(entity, csvText, existingRows),
      buildImportErrorReport,
      exportRows: (rows: TRecord[], format: "csv" | "excel") => exportRecords(entity.key, rows, format),
      canAccess: (action: Parameters<typeof canAccess>[1], context: PermissionContext) => canAccess(entity, action, context),
      assertAccess: (action: Parameters<typeof assertAccess>[1], context: PermissionContext) => assertAccess(entity, action, context),
      saveAudit,
      toggleSelection,
      toggleSelectAll,
      applyBulkDelete,
      buildBulkActionSummary,
    };
  };

  return {
    registry,
    requests,
    search,
    highlightKeyword,
    audit,
    createRuntime,
  };
}
