type Listener = (...args: unknown[]) => void;

export class PluginEventBus {
  private readonly listeners: Map<string, Listener[]> = new Map();
  private readonly onceListeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): void {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
  }

  off(event: string, listener: Listener): void {
    const list = this.listeners.get(event);
    if (list) {
      this.listeners.set(event, list.filter((l) => l !== listener));
    }
    const onceList = this.onceListeners.get(event);
    if (onceList) {
      this.onceListeners.set(event, onceList.filter((l) => l !== listener));
    }
  }

  once(event: string, listener: Listener): void {
    const list = this.onceListeners.get(event) ?? [];
    list.push(listener);
    this.onceListeners.set(event, list);
  }

  emit(event: string, ...args: unknown[]): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(...args);
    }
    const onceList = this.onceListeners.get(event) ?? [];
    this.onceListeners.delete(event);
    for (const listener of onceList) {
      listener(...args);
    }
  }
}
