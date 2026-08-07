export interface UseKasState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useKas(): UseKasState {
  return {
    loading: false,
    rows: []
  };
}
