export type MasterEntityKey =
  | "destinasi"
  | "hotel"
  | "guide"
  | "kendaraan"
  | "paket-wisata"
  | "customer"
  | "vendor"
  | "supplier";

export type MasterRecord = {
  id: string;
  name: string;
  status: string;
  [key: string]: unknown;
};

export type MasterListResult<T extends MasterRecord> = {
  items: T[];
  total: number;
};

export type MasterColumn<T extends MasterRecord = MasterRecord> = {
  key: keyof T | string;
  label: string;
  searchable?: boolean;
  filterable?: boolean;
  visible?: boolean;
  sticky?: boolean;
};

export type MasterField = {
  name: string;
  label: string;
  input: "text" | "textarea" | "select" | "number" | "date" | "boolean" | "multiselect";
  required?: boolean;
  readonly?: boolean;
  section?: string;
  options?: Array<{ label: string; value: string }>;
};

export type MasterFilter = {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "status" | "category" | "multiselect" | "boolean";
  field: string;
  options?: Array<{ label: string; value: string }>;
};

export type MasterAction = {
  key: string;
  label: string;
  shortcut?: string;
};

export type MasterModuleConfig = {
  key: MasterEntityKey;
  label: string;
  description: string;
  icon: string;
  apiEntity: string;
  searchTerms: string[];
  columns: MasterColumn[];
  fields: MasterField[];
  filters: MasterFilter[];
  actions: MasterAction[];
  quickCreate: string;
  note: string;
};

export type MasterTableState = {
  entity: MasterEntityKey;
  page: number;
  pageSize: number;
  search: string;
  selectedIds: string[];
  visibleColumns: Record<string, boolean>;
  sortStack: Array<{ key: string; direction: "asc" | "desc" }>;
};

export type MasterFilterState = Record<string, string | number | boolean | string[]>;

export type MasterFormState = {
  editingId: string | null;
  dirty: boolean;
  autosaveEnabled: boolean;
  draft: Record<string, unknown>;
  undoStack: Array<Record<string, unknown>>;
  redoStack: Array<Record<string, unknown>>;
};

export type CrudRepository<T extends MasterRecord> = {
  list(): Promise<MasterListResult<T>>;
  findById(id: string): Promise<T | null>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
};

export type CrudService<T extends MasterRecord> = {
  list(): Promise<MasterListResult<T>>;
  create(payload: Partial<T>): Promise<T>;
  update(id: string, payload: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
};

export type CrudController<T extends MasterRecord> = {
  load(): Promise<MasterListResult<T>>;
  save(payload: Partial<T>, id?: string): Promise<T>;
  remove(id: string): Promise<void>;
};
