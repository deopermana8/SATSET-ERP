export interface UseHotelState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useHotel(): UseHotelState {
  return {
    loading: false,
    rows: []
  };
}
