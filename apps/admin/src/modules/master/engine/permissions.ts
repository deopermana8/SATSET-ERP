import type { MasterEntityConfig, MasterPermissionAction } from "./types.js";

export type PermissionContext = {
  userPermissions: string[];
};

export function canAccess<TRecord extends Record<string, unknown>>(entity: MasterEntityConfig<TRecord>, action: MasterPermissionAction, context: PermissionContext): boolean {
  const permissionCode = entity.permissions[action];
  if (!permissionCode) {
    return true;
  }
  return context.userPermissions.includes(permissionCode);
}

export function assertAccess<TRecord extends Record<string, unknown>>(entity: MasterEntityConfig<TRecord>, action: MasterPermissionAction, context: PermissionContext): void {
  if (!canAccess(entity, action, context)) {
    throw new Error(`Akses ditolak untuk aksi ${action} pada ${entity.name}`);
  }
}
