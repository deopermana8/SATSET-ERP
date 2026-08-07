export type DomLike = { innerHTML?: string };

const queryCache = new Map<string, unknown>();

export function byId<T extends DomLike = DomLike>(id: string): T {
  const doc = (globalThis as { document?: { getElementById: (value: string) => unknown } }).document;
  const node = doc?.getElementById(id) as T | null | undefined;
  if (!node) {
    throw new Error(`DOM node not found: ${id}`);
  }
  return node;
}

export function qs<T = unknown>(selector: string): T | null {
  const doc = (globalThis as { document?: { querySelector: (value: string) => unknown } }).document;
  return (doc?.querySelector(selector) as T | undefined) ?? null;
}

export function qsCached<T = unknown>(selector: string): T | null {
  if (queryCache.has(selector)) {
    return (queryCache.get(selector) as T | undefined) ?? null;
  }
  const found = qs<T>(selector);
  if (found) {
    queryCache.set(selector, found);
  }
  return found;
}

export function clearDomCache(): void {
  queryCache.clear();
}

export function createFocusTrap(
  root: { querySelectorAll?: (selector: string) => Array<{ focus?: () => void } | null> },
): { focusFirst: () => void } {
  return {
    focusFirst() {
      const nodes = root.querySelectorAll?.('[tabindex],button,a,input,select,textarea') ?? [];
      for (const node of nodes) {
        if (node?.focus) {
          node.focus();
          return;
        }
      }
    },
  };
}
