export function createRuntimeMemo<TInput, TOutput>(factory: (input: TInput) => TOutput): (input: TInput) => TOutput {
  const cache = new Map<string, TOutput>();
  return (input: TInput) => {
    const key = JSON.stringify(input);
    const hit = cache.get(key);
    if (hit) {
      return hit;
    }
    const next = factory(input);
    cache.set(key, next);
    return next;
  };
}

export function createRuntimeDebounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, waitMs: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: TArgs) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => fn(...args), waitMs);
  };
}
