import type { DashboardActivity, DashboardHealth, DashboardInsight, DashboardStoreState, DashboardWidget } from "./dashboardTypes.js";
import type { DashboardStore } from "./dashboardStore.js";

export const dashboardActions = {
  setWidgets(store: DashboardStore, widgets: DashboardWidget[]): DashboardStoreState {
    return store.setState({ widgets });
  },
  setInsights(store: DashboardStore, insights: DashboardInsight[]): DashboardStoreState {
    return store.setState({ insights });
  },
  setActivities(store: DashboardStore, activities: DashboardActivity[]): DashboardStoreState {
    return store.setState({ activities });
  },
  setHealth(store: DashboardStore, health: DashboardHealth[]): DashboardStoreState {
    return store.setState({ health });
  },
  setLoading(store: DashboardStore, loading: boolean): DashboardStoreState {
    return store.setState({ loading });
  },
  setOffline(store: DashboardStore, offline: boolean): DashboardStoreState {
    return store.setState({ offline });
  },
  setSlowNetwork(store: DashboardStore, slowNetwork: boolean): DashboardStoreState {
    return store.setState({ slowNetwork });
  },
  setNoData(store: DashboardStore, noData: boolean): DashboardStoreState {
    return store.setState({ noData });
  },
  touch(store: DashboardStore): DashboardStoreState {
    return store.setState({ lastUpdated: Date.now() });
  },
  incrementRetry(store: DashboardStore): DashboardStoreState {
    return store.setState({ retryCount: store.getState().retryCount + 1 });
  },
};
