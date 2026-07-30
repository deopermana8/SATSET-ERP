import type { IPlugin } from "./IPlugin.js";

export interface LifecycleResult {
  success: boolean;
  message?: string;
}

export class PluginLifecycle {
  private readonly initialized = new Set<string>();
  private readonly started = new Set<string>();

  initialize(plugin: IPlugin): LifecycleResult {
    try {
      if (this.initialized.has(plugin.id)) {
        return { success: true, message: "already initialized" };
      }
      this.initialized.add(plugin.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  start(plugin: IPlugin): LifecycleResult {
    try {
      if (!this.initialized.has(plugin.id)) {
        this.initialized.add(plugin.id);
      }
      if (this.started.has(plugin.id)) {
        return { success: true, message: "already started" };
      }
      plugin.register();
      this.started.add(plugin.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  stop(plugin: IPlugin): LifecycleResult {
    try {
      this.started.delete(plugin.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  dispose(plugin: IPlugin): LifecycleResult {
    try {
      this.started.delete(plugin.id);
      this.initialized.delete(plugin.id);
      return { success: true };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : String(err) };
    }
  }
}
