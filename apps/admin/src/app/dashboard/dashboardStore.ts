import type { DashboardStoreState } from "./dashboardTypes.js";

export type DashboardStoreListener = (state: DashboardStoreState) => void;

export const defaultDashboardStoreState: DashboardStoreState = {
  widgets: [],
  insights: [],
  activities: [],
  health: [],
  commandCenter: {
    pekerjaanSaya: 0,
    approval: 0,
    tugasHariIni: 0,
    notifikasiPenting: 0,
    targetHariIni: "Belum ditentukan",
  },
  loading: true,
  offline: false,
  slowNetwork: false,
  noData: false,
  retryCount: 0,
  lastUpdated: 0,
};

export type DashboardStore = {
  getState: () => DashboardStoreState;
  setState: (patch: Partial<DashboardStoreState>) => DashboardStoreState;
  reset: () => DashboardStoreState;
  subscribe: (listener: DashboardStoreListener) => () => void;
};

export function createDashboardStore(initialState?: Partial<DashboardStoreState>): DashboardStore {
  let state: DashboardStoreState = {
    ...defaultDashboardStoreState,
    ...initialState,
  };
  const listeners = new Set<DashboardStoreListener>();

  const notify = (): void => {
    listeners.forEach((listener) => listener(state));
  };

  return {
    getState: () => state,
    setState: (patch) => {
      state = { ...state, ...patch };
      notify();
      return state;
    },
    reset: () => {
      state = { ...defaultDashboardStoreState };
      notify();
      return state;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
