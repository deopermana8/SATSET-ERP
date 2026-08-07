export function memoize<TInput, TResult>(factory: (input: TInput) => TResult): (input: TInput) => TResult {
  const cache = new Map<string, TResult>();
  return (input: TInput) => {
    const key = JSON.stringify(input);
    if (cache.has(key)) {
      return cache.get(key) as TResult;
    }
    const value = factory(input);
    cache.set(key, value);
    return value;
  };
}
