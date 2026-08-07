export function requestIdleRender(callback: () => void): void {
  const root = globalThis as {
    requestIdleCallback?: (cb: () => void) => number;
    requestAnimationFrame?: (cb: () => void) => number;
  };
  if (root.requestIdleCallback) {
    root.requestIdleCallback(callback);
    return;
  }
  if (root.requestAnimationFrame) {
    root.requestAnimationFrame(callback);
    return;
  }
  setTimeout(callback, 0);
}
