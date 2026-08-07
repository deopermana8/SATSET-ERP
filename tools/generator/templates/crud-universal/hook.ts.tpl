export interface Use{{names.entity.pascal}}State {
  loading: boolean;
  rows: readonly Record<string, unknown>[];
}

export function use{{names.entity.pascal}}(): Use{{names.entity.pascal}}State {
  return {
    loading: false,
    rows: []
  };
}
