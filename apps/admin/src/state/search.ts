export type SearchState = {
  query: string;
  recentQueries: string[];
  open: boolean;
};

export const defaultSearchState: SearchState = {
  query: "",
  recentQueries: [],
  open: false,
};

export const searchState = {
  defaultState: defaultSearchState,
  actions: {
    setQuery(state: SearchState, query: string): SearchState {
      return { ...state, query };
    },
    setOpen(state: SearchState, open: boolean): SearchState {
      return { ...state, open };
    },
    addRecentQuery(state: SearchState, query: string): SearchState {
      const recentQueries = [query, ...state.recentQueries.filter((item) => item !== query)].slice(0, 8);
      return { ...state, recentQueries };
    },
  },
  selectors: {
    normalizedQuery(state: SearchState): string {
      return state.query.trim().toLowerCase();
    },
  },
  helper: {
    hasQuery(state: SearchState): boolean {
      return state.query.trim().length > 0;
    },
  },
};
