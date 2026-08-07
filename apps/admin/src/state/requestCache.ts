export type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type RequestCache<T> = {
  get: (key: string) => T | null;
  set: (key: string, value: T, ttlMs: number) => void;
  clear: (prefix?: string) => void;
};

export function createRequestCache<T>(): RequestCache<T> {
  const map = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | null {
      const item = map.get(key);
      if (!item) {
        return null;
      }
      if (Date.now() > item.expiresAt) {
        map.delete(key);
        return null;
      }
      return item.value;
    },
    set(key: string, value: T, ttlMs: number): void {
      map.set(key, { value, expiresAt: Date.now() + ttlMs });
    },
    clear(prefix?: string): void {
      if (!prefix) {
        map.clear();
        return;
      }
      for (const key of map.keys()) {
        if (key.startsWith(prefix)) {
          map.delete(key);
        }
      }
    },
  };
}
