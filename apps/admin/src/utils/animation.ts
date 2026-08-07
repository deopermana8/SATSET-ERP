export function onNextFrame(fn: () => void): void {
  const root = globalThis as { requestAnimationFrame?: (cb: () => void) => number };
  if (root.requestAnimationFrame) {
    root.requestAnimationFrame(fn);
    return;
  }
  setTimeout(fn, 0);
}

export function onIdle(fn: () => void): void {
  const root = globalThis as { requestIdleCallback?: (cb: () => void) => number };
  if (root.requestIdleCallback) {
    root.requestIdleCallback(fn);
    return;
  }
  setTimeout(fn, 0);
}
