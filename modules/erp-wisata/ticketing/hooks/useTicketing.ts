export interface UseTicketingState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useTicketing(): UseTicketingState {
  return {
    loading: false,
    rows: []
  };
}
