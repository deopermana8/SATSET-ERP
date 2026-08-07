export interface UseReservasiState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useReservasi(): UseReservasiState {
  return {
    loading: false,
    rows: []
  };
}
