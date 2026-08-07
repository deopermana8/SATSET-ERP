export type MasterEntityKeyGeneric = string;

export type MasterPermissionAction = "view" | "create" | "edit" | "delete" | "export" | "import" | "approval";

export type MasterAuditAction = "create" | "update" | "delete" | "restore" | "export" | "import";

export type MasterFieldInputType =
  | "text"
  | "textarea"
  | "number"
  | "currency"
  | "date"
  | "datetime"
  | "select"
  | "multiselect"
  | "switch"
  | "checkbox"
  | "radio"
  | "email"
  | "phone"
  | "password"
  | "upload"
  | "autocomplete"
  | "relation";

export type MasterFilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "between"
  | "greaterThan"
  | "lessThan"
  | "empty"
  | "notEmpty"
  | "dateRange"
  | "multiSelect";

export type ValidationRuleType = "required" | "min" | "max" | "regex" | "email" | "phone" | "duplicate" | "unique" | "custom";

export type ValidationContext<TRecord extends Record<string, unknown>> = {
  entity: MasterEntityKeyGeneric;
  fieldName: string;
  record: Partial<TRecord>;
  existingRows: TRecord[];
};

export type MasterValidationRule<TRecord extends Record<string, unknown> = Record<string, unknown>> = {
  type: ValidationRuleType;
  message?: string;
  value?: number | RegExp | string;
  validator?: (value: unknown, context: ValidationContext<TRecord>) => boolean;
};

export type MasterFieldOption = {
  label: string;
  value: string;
};

export type MasterFieldConfig<TRecord extends Record<string, unknown> = Record<string, unknown>> = {
  name: Extract<keyof TRecord, string> | string;
  label: string;
  input: MasterFieldInputType;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;
  options?: MasterFieldOption[];
  relationEntity?: string;
  validation?: MasterValidationRule<TRecord>[];
};

export type MasterTableColumnConfig<TRecord extends Record<string, unknown> = Record<string, unknown>> = {
  key: Extract<keyof TRecord, string> | string;
  label: string;
  sortable?: boolean;
  searchable?: boolean;
  sticky?: boolean;
  visible?: boolean;
  resizable?: boolean;
  width?: number;
};

export type MasterFilterConfig<TRecord extends Record<string, unknown> = Record<string, unknown>> = {
  key: string;
  label: string;
  field: Extract<keyof TRecord, string> | string;
  operators: MasterFilterOperator[];
  options?: MasterFieldOption[];
};

export type MasterPermissionConfig = Partial<Record<MasterPermissionAction, string>>;

export type MasterEntityConfig<TRecord extends Record<string, unknown> = Record<string, unknown>> = {
  key: MasterEntityKeyGeneric;
  name: string;
  icon: string;
  route: string;
  endpoint: string;
  defaultSort?: { field: Extract<keyof TRecord, string> | string; direction: "asc" | "desc" };
  defaultSearch?: string;
  defaultPageSize?: number;
  fields: MasterFieldConfig<TRecord>[];
  tableColumns: MasterTableColumnConfig<TRecord>[];
  validation: MasterValidationRule<TRecord>[];
  searchableFields: Array<Extract<keyof TRecord, string> | string>;
  sortableFields: Array<Extract<keyof TRecord, string> | string>;
  filters: MasterFilterConfig<TRecord>[];
  permissions: MasterPermissionConfig;
};

export type MasterFilterCondition = {
  field: string;
  operator: MasterFilterOperator;
  value?: unknown;
};

export type MasterTableQuery = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  filterConditions?: MasterFilterCondition[];
};

export type MasterPageResult<TRecord extends Record<string, unknown>> = {
  items: TRecord[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MasterBulkActionType = "delete" | "export" | "import" | "approval";

export type MasterBulkActionRequest = {
  action: MasterBulkActionType;
  selectedIds: string[];
};

export type MasterAuditEntry = {
  id: string;
  entity: string;
  action: MasterAuditAction;
  actor: string;
  timestamp: number;
  payload: Record<string, unknown>;
};

export type MasterImportPreviewRow<TRecord extends Record<string, unknown>> = {
  rowNumber: number;
  raw: Record<string, string>;
  parsed: Partial<TRecord>;
  errors: string[];
};

export type MasterImportPreviewResult<TRecord extends Record<string, unknown>> = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: MasterImportPreviewRow<TRecord>[];
};
