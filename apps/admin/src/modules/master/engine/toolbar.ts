import { canAccess, type PermissionContext } from "./permissions.js";
import type { MasterEntityConfig, MasterPermissionAction } from "./types.js";

export type ToolbarAction = {
  key: MasterPermissionAction;
  label: string;
  enabled: boolean;
};

const DEFAULT_LABELS: Record<MasterPermissionAction, string> = {
  view: "Lihat",
  create: "Tambah",
  edit: "Ubah",
  delete: "Hapus",
  export: "Ekspor",
  import: "Impor",
  approval: "Approval",
};

export function buildDynamicToolbar<TRecord extends Record<string, unknown>>(
  entity: MasterEntityConfig<TRecord>,
  context: PermissionContext,
): ToolbarAction[] {
  const actions: MasterPermissionAction[] = ["view", "create", "edit", "delete", "export", "import", "approval"];
  return actions.map((action) => ({
    key: action,
    label: DEFAULT_LABELS[action],
    enabled: canAccess(entity, action, context),
  }));
}
