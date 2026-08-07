export type EventPayload = Record<string, unknown>;

type EventHandler = (payload: EventPayload) => void;

export type EventBus = {
  emit: (eventName: string, payload?: EventPayload) => void;
  on: (eventName: string, handler: EventHandler) => () => void;
  clear: () => void;
};

export function createEventBus(): EventBus {
  const listeners = new Map<string, Set<EventHandler>>();

  return {
    emit(eventName, payload = {}) {
      const handlers = listeners.get(eventName);
      if (!handlers) {
        return;
      }
      handlers.forEach((handler) => handler(payload));
    },
    on(eventName, handler) {
      const bucket = listeners.get(eventName) ?? new Set<EventHandler>();
      bucket.add(handler);
      listeners.set(eventName, bucket);
      return () => {
        bucket.delete(handler);
        if (bucket.size === 0) {
          listeners.delete(eventName);
        }
      };
    },
    clear() {
      listeners.clear();
    },
  };
}
