import { createAbortRegistry } from "../hooks/useAbortRegistry.js";
import { createDataLayerErrorHandler, normalizeDataLayerError } from "../services/errorHandler.js";
import { createRequestCache } from "../state/requestCache.js";
import type { DataLayerConfig, DataLayerError, DataRequestInit } from "../types/dataLayer.js";

type RepositoryOptions = {
  onLoadingChange?: (pending: number) => void;
  onError?: (error: DataLayerError) => void;
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export function createHttpRepository(config: DataLayerConfig, options: RepositoryOptions = {}) {
  const cache = createRequestCache<unknown>();
  const abortRegistry = createAbortRegistry();
  const emitError = createDataLayerErrorHandler(options.onError);
  const inflight = new Map<string, Promise<unknown>>();
  let pending = 0;

  function setLoading(next: number): void {
    pending = Math.max(0, next);
    if (options.onLoadingChange) {
      options.onLoadingChange(pending);
    }
  }

  async function request<T>(path: string, init?: DataRequestInit): Promise<T | null> {
    const method = (init?.method ?? "GET").toUpperCase();
    const timeoutMs = init?.timeoutMs ?? config.defaultTimeoutMs;
    const retries = init?.retries ?? config.defaultRetries;
    const retryDelayMs = init?.retryDelayMs ?? config.defaultRetryDelayMs;
    const cacheTtlMs = init?.cacheTtlMs ?? config.defaultCacheTtlMs;
    const cacheKey = `${method}:${path}:${init?.body ? String(init.body) : ""}`;
    const useCache = method === "GET" && !init?.noCache;

    if (useCache) {
      const hit = cache.get(cacheKey);
      if (hit !== null) {
        return hit as T;
      }
      const inflightHit = inflight.get(cacheKey);
      if (inflightHit) {
        return (await inflightHit) as T;
      }
    }

    const execute = async (): Promise<T | null> => {
      let attempt = 0;
      while (attempt <= retries) {
        const controller = new AbortController();
        abortRegistry.track(controller);
        const timer = setTimeout(() => controller.abort("timeout"), timeoutMs);
        setLoading(pending + 1);

        try {
          const response = await fetch(`${config.apiBaseUrl}${path}`, {
            ...init,
            signal: controller.signal,
          });

          if (!response.ok && response.status !== 204) {
            const httpError = normalizeDataLayerError(new Error(`HTTP ${response.status}`), path, response.status);
            throw httpError;
          }

          if (response.status === 204) {
            return null;
          }

          const payload = (await response.json()) as T;
          if (useCache) {
            cache.set(cacheKey, payload, cacheTtlMs);
          }
          return payload;
        } catch (rawError) {
          const normalized = normalizeDataLayerError(rawError, path);
          const isTimeout = normalized.name === "AbortError";
          if (isTimeout) {
            normalized.code = "TIMEOUT";
          }

          const shouldRetry = attempt < retries && (
            normalized.code === "TIMEOUT" ||
            normalized.code === "NETWORK_ERROR" ||
            (typeof normalized.status === "number" && normalized.status >= 500)
          );

          if (!shouldRetry) {
            emitError(normalized);
            throw normalized;
          }

          await sleep(retryDelayMs * (attempt + 1));
          attempt += 1;
        } finally {
          clearTimeout(timer);
          abortRegistry.release(controller);
          setLoading(pending - 1);
        }
      }

      return null;
    };

    const pendingPromise = execute();
    if (useCache) {
      inflight.set(cacheKey, pendingPromise as Promise<unknown>);
    }

    try {
      return await pendingPromise;
    } finally {
      if (useCache) {
        inflight.delete(cacheKey);
      }
    }
  }

  function clearCache(prefix?: string): void {
    cache.clear(prefix);
  }

  function abortAll(reason = "disposed"): void {
    abortRegistry.abortAll(reason);
  }

  return {
    request,
    clearCache,
    abortAll,
  };
}
