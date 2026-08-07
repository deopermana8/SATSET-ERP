import type { MasterAction, MasterModuleConfig } from "../crud/types.js";

export function buildMasterActions(module: MasterModuleConfig): MasterAction[] {
  return module.actions;
}

export function hasBulkActions(module: MasterModuleConfig): boolean {
  return module.actions.some((action) => action.key === "delete" || action.key === "export");
}
