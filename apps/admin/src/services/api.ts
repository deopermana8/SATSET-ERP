export async function apiFetch<T>(apiUrl: string, path: string, init?: RequestInit): Promise<T | null> {
  const response = await fetch(`${apiUrl}${path}`, init);
  if (!response.ok && response.status !== 204) {
    throw new Error(`HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return (await response.json()) as T;
}
