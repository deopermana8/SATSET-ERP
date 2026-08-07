export function matchesMediaQuery(query: string): boolean {
  const root = globalThis as { matchMedia?: (q: string) => { matches: boolean } };
  if (!root.matchMedia) {
    return false;
  }
  return root.matchMedia(query).matches;
}
