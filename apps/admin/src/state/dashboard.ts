import type { DashboardCounts } from "../types/dashboard.js";

export type DashboardState = {
  counts: DashboardCounts;
  loaded: boolean;
};

export const defaultDashboardState: DashboardState = {
  counts: {
    destinasi: 0,
    reservasi: 0,
    hotel: 0,
    guide: 0,
    kendaraan: 0,
    pembayaran: 0,
    kas: 0,
    jurnal: 0,
  },
  loaded: false,
};

export const dashboardState = {
  defaultState: defaultDashboardState,
  actions: {
    setCounts(state: DashboardState, counts: DashboardCounts): DashboardState {
      return { ...state, counts, loaded: true };
    },
    markLoaded(state: DashboardState): DashboardState {
      return { ...state, loaded: true };
    },
  },
  selectors: {
    counts(state: DashboardState): DashboardCounts {
      return state.counts;
    },
    isLoaded(state: DashboardState): boolean {
      return state.loaded;
    },
  },
  helper: {
    clone(state: DashboardState): DashboardState {
      return {
        counts: { ...state.counts },
        loaded: state.loaded,
      };
    },
  },
};
