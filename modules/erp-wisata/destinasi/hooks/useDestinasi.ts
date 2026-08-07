export interface UseDestinasiState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useDestinasi(): UseDestinasiState {
  return {
    loading: false,
    rows: []
  };
}
