import type { PluginPermission } from "./PluginPermission.js";

export interface SandboxFailure {
  pluginId: string;
  phase: "load" | "register" | "run";
  error: string;
}

export class PluginSandbox {
  private readonly failures: SandboxFailure[] = [];

  constructor(private readonly permissions: PluginPermission[] = []) {}

  public canAccess(permission: PluginPermission): boolean {
    return this.permissions.includes(permission);
  }

  public assert(permission: PluginPermission): void {
    if (!this.canAccess(permission)) {
      throw new Error(`Permission denied: ${permission}`);
    }
  }

  public async run(pluginId: string, phase: SandboxFailure["phase"], fn: () => void | Promise<void>): Promise<boolean> {
    try {
      await Promise.resolve(fn());
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.failures.push({ pluginId, phase, error: message });
      console.error(`[PluginSandbox] plugin "${pluginId}" failed during ${phase}: ${message}`);
      return false;
    }
  }

  public getFailures(): readonly SandboxFailure[] {
    return this.failures;
  }
}
