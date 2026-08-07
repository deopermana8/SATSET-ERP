import type { MasterAction, MasterModuleConfig } from "../crud/types.js";

export function buildMasterToolbar(module: MasterModuleConfig): MasterAction[] {
  return module.actions;
}

export function buildMasterQuickCreate(module: MasterModuleConfig): string {
  return module.quickCreate;
}
