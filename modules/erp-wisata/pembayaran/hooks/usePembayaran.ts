export interface UsePembayaranState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function usePembayaran(): UsePembayaranState {
  return {
    loading: false,
    rows: []
  };
}
