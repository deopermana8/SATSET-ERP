export function throttle<T extends (...args: never[]) => void>(fn: T, waitMs: number): T {
  let ready = true;
  return ((...args: Parameters<T>) => {
    if (!ready) {
      return;
    }
    ready = false;
    fn(...args);
    setTimeout(() => {
      ready = true;
    }, waitMs);
  }) as T;
}
