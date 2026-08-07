export interface UseKendaraanState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useKendaraan(): UseKendaraanState {
  return {
    loading: false,
    rows: []
  };
}
