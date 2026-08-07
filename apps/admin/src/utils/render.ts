export function mountHtml(target: { innerHTML?: string }, html: string): void {
  target.innerHTML = html;
}

export function batchDomWrites(tasks: Array<() => void>): void {
  const root = globalThis as { requestAnimationFrame?: (cb: () => void) => number };
  if (root.requestAnimationFrame) {
    root.requestAnimationFrame(() => {
      tasks.forEach((task) => task());
    });
    return;
  }
  tasks.forEach((task) => task());
}

export function requestIdleRender(task: () => void): void {
  const root = globalThis as { requestIdleCallback?: (cb: () => void) => number };
  if (root.requestIdleCallback) {
    root.requestIdleCallback(() => task());
    return;
  }
  setTimeout(task, 0);
}

export function createVirtualSlice(total: number, start: number, size: number): { start: number; end: number } {
  const safeStart = Math.max(0, start);
  const safeEnd = Math.max(safeStart, Math.min(total, safeStart + size));
  return { start: safeStart, end: safeEnd };
}

export function withIntersectionObserver(
  target: unknown,
  callback: (entry: unknown) => void,
): (() => void) | null {
  const root = globalThis as {
    IntersectionObserver?: new (cb: (entries: unknown[]) => void) => { observe: (value: unknown) => void; disconnect: () => void };
  };
  if (!root.IntersectionObserver) {
    return null;
  }
  const observer = new root.IntersectionObserver((entries) => {
    const first = entries[0];
    if (first) {
      callback(first);
    }
  });
  observer.observe(target);
  return () => observer.disconnect();
}

export function withResizeObserver(target: unknown, callback: () => void): (() => void) | null {
  const root = globalThis as {
    ResizeObserver?: new (cb: () => void) => { observe: (value: unknown) => void; disconnect: () => void };
  };
  if (!root.ResizeObserver) {
    return null;
  }
  const observer = new root.ResizeObserver(callback);
  observer.observe(target);
  return () => observer.disconnect();
}

export function withMutationObserver(target: unknown, callback: () => void): (() => void) | null {
  const root = globalThis as {
    MutationObserver?: new (cb: () => void) => { observe: (value: unknown, options: { childList?: boolean; subtree?: boolean }) => void; disconnect: () => void };
  };
  if (!root.MutationObserver) {
    return null;
  }
  const observer = new root.MutationObserver(callback);
  observer.observe(target, { childList: true, subtree: true });
  return () => observer.disconnect();
}
