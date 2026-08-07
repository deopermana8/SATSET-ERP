export interface UseJurnalState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useJurnal(): UseJurnalState {
  return {
    loading: false,
    rows: []
  };
}
