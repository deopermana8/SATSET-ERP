import type { PluginPermission } from "./PluginPermission.js";

export class PluginSandbox {
  constructor(private readonly permissions: PluginPermission[] = []) {}

  public canAccess(permission: PluginPermission): boolean {
    return this.permissions.includes(permission);
  }

  public assert(permission: PluginPermission): void {
    if (!this.canAccess(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }
}
