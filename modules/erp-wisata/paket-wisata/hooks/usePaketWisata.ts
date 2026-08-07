export interface UsePaketWisataState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function usePaketWisata(): UsePaketWisataState {
  return {
    loading: false,
    rows: []
  };
}
