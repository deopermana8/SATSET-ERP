import type { DataRequestInit } from "../../../types/dataLayer.js";

type RequestFn = <T>(path: string, init?: DataRequestInit) => Promise<T | null>;

type RequestCacheEntry = {
  expiresAt: number;
  value: unknown;
};

export function createMasterRequestEngine(requestFn: RequestFn, defaultTtlMs = 15_000) {
  const cache = new Map<string, RequestCacheEntry>();
  const inflight = new Map<string, Promise<unknown>>();
  const controllers = new Set<AbortController>();

  const buildKey = (path: string, init?: DataRequestInit): string => {
    const method = (init?.method ?? "GET").toUpperCase();
    return `${method}:${path}:${init?.body ? String(init.body) : ""}`;
  };

  async function request<T>(path: string, init?: DataRequestInit, cacheTtlMs = defaultTtlMs): Promise<T | null> {
    const key = buildKey(path, init);
    const now = Date.now();

    if ((init?.method ?? "GET").toUpperCase() === "GET") {
      const cached = cache.get(key);
      if (cached && cached.expiresAt > now) {
        return cached.value as T;
      }
      const active = inflight.get(key);
      if (active) {
        return (await active) as T;
      }
    }

    const controller = new AbortController();
    controllers.add(controller);
    const mergedInit: DataRequestInit = {
      ...init,
      signal: init?.signal ?? controller.signal,
    };

    const action = requestFn<T>(path, mergedInit);
    inflight.set(key, action as Promise<unknown>);

    try {
      const payload = await action;
      if ((init?.method ?? "GET").toUpperCase() === "GET" && payload !== null) {
        cache.set(key, { value: payload, expiresAt: now + Math.max(500, cacheTtlMs) });
      }
      return payload;
    } finally {
      inflight.delete(key);
      controllers.delete(controller);
    }
  }

  function clearCache(prefix?: string): void {
    if (!prefix) {
      cache.clear();
      return;
    }
    for (const key of cache.keys()) {
      if (key.includes(prefix)) {
        cache.delete(key);
      }
    }
  }

  function abortAll(reason = "master-request-abort"): void {
    controllers.forEach((controller) => controller.abort(reason));
    controllers.clear();
  }

  return {
    request,
    clearCache,
    abortAll,
  };
}
