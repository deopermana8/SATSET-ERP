export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs = 180,
): (...args: TArgs) => void {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => fn(...args), waitMs);
  };
}
