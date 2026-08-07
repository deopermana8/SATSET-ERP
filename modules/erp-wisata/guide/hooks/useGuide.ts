export interface UseGuideState {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function useGuide(): UseGuideState {
  return {
    loading: false,
    rows: []
  };
}
