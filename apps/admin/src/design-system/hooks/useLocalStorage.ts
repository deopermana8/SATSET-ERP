type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function resolveStorage(): StorageLike | null {
  const root = globalThis as { localStorage?: StorageLike };
  return root.localStorage ?? null;
}

export function readLocalStorage<T>(key: string, fallback: T): T {
  const storage = resolveStorage();
  if (!storage) {
    return fallback;
  }
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T): void {
  const storage = resolveStorage();
  if (!storage) {
    return;
  }
  storage.setItem(key, JSON.stringify(value));
}
