type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type HighlightPart = {
  text: string;
  hit: boolean;
};

export type SearchEngineOptions = {
  debounceMs?: number;
  cacheTtlMs?: number;
};

export type AsyncSearcher<T> = {
  run: (query: string) => Promise<T>;
  abort: (reason?: string) => void;
  clearCache: () => void;
};

const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export function createAsyncSearcher<T>(
  fetcher: (query: string, signal: AbortSignal) => Promise<T>,
  options: SearchEngineOptions = {},
): AsyncSearcher<T> {
  const cache = new Map<string, CacheEntry<T>>();
  const inflight = new Map<string, Promise<T>>();
  const debounceMs = Math.max(0, options.debounceMs ?? 150);
  const ttl = Math.max(0, options.cacheTtlMs ?? 30_000);
  let controller: AbortController | null = null;

  const run = async (query: string): Promise<T> => {
    const normalized = query.trim().toLowerCase();
    const now = Date.now();
    const cached = cache.get(normalized);
    if (cached && cached.expiresAt > now) {
      return cached.value;
    }

    const active = inflight.get(normalized);
    if (active) {
      return active;
    }

    if (controller) {
      controller.abort("search-replaced");
    }
    controller = new AbortController();

    const action = (async () => {
      if (debounceMs > 0) {
        await wait(debounceMs);
      }
      const result = await fetcher(normalized, controller!.signal);
      cache.set(normalized, { value: result, expiresAt: Date.now() + ttl });
      return result;
    })();

    inflight.set(normalized, action);
    try {
      return await action;
    } finally {
      inflight.delete(normalized);
    }
  };

  const abort = (reason = "search-abort"): void => {
    if (controller) {
      controller.abort(reason);
      controller = null;
    }
  };

  const clearCache = (): void => {
    cache.clear();
  };

  return { run, abort, clearCache };
}

export function highlightKeyword(text: string, keyword: string): HighlightPart[] {
  const source = text ?? "";
  const token = keyword.trim();
  if (!token) {
    return [{ text: source, hit: false }];
  }

  const sourceLower = source.toLowerCase();
  const tokenLower = token.toLowerCase();
  const parts: HighlightPart[] = [];
  let cursor = 0;

  while (cursor < source.length) {
    const index = sourceLower.indexOf(tokenLower, cursor);
    if (index === -1) {
      parts.push({ text: source.slice(cursor), hit: false });
      break;
    }
    if (index > cursor) {
      parts.push({ text: source.slice(cursor, index), hit: false });
    }
    parts.push({ text: source.slice(index, index + token.length), hit: true });
    cursor = index + token.length;
  }

  return parts;
}
