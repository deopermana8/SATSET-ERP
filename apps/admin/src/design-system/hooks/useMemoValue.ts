export function memoizeValue<T>(factory: () => T): () => T {
  let hydrated = false;
  let cache: T;
  return () => {
    if (!hydrated) {
      cache = factory();
      hydrated = true;
    }
    return cache;
  };
}
