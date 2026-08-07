import type { RuntimeItem, RuntimeState } from "./types.js";

export function createRuntimeState<TItem extends RuntimeItem>() {
  let state: RuntimeState<TItem> = {
    items: [],
    total: 0,
    loading: false,
    error: null,
  };

  const listeners = new Set<(next: RuntimeState<TItem>) => void>();

  return {
    getState() {
      return state;
    },
    setState(patch: Partial<RuntimeState<TItem>>) {
      state = { ...state, ...patch };
      listeners.forEach((listener) => listener(state));
      return state;
    },
    subscribe(listener: (next: RuntimeState<TItem>) => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
