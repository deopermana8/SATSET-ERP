export type PluginHealthStatus = "loaded" | "initialized" | "running" | "failed";

export interface PluginHealthEntry {
  pluginId: string;
  status: PluginHealthStatus;
  updatedAt: string;
}

export class PluginHealth {
  private readonly entries: Map<string, PluginHealthEntry> = new Map();

  set(pluginId: string, status: PluginHealthStatus): void {
    this.entries.set(pluginId, { pluginId, status, updatedAt: new Date().toISOString() });
  }

  status(pluginId: string): PluginHealthEntry | undefined {
    return this.entries.get(pluginId);
  }

  statusAll(): PluginHealthEntry[] {
    return Array.from(this.entries.values());
  }
}
