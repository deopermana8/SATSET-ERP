import type { DashboardStoreState, DashboardWidget } from "./dashboardTypes.js";

export const dashboardSelectors = {
  visibleWidgets(state: DashboardStoreState): DashboardWidget[] {
    return state.widgets
      .filter((widget) => widget.visible)
      .sort((a, b) => a.priority - b.priority);
  },
  widgetsBySize(state: DashboardStoreState): Record<string, DashboardWidget[]> {
    return state.widgets.reduce<Record<string, DashboardWidget[]>>((acc, widget) => {
      if (!acc[widget.size]) {
        acc[widget.size] = [];
      }
      acc[widget.size].push(widget);
      return acc;
    }, {});
  },
  hasErrorState(state: DashboardStoreState): boolean {
    return state.offline || state.noData;
  },
  updatedLabel(state: DashboardStoreState): string {
    if (!state.lastUpdated) {
      return "Belum diperbarui";
    }
    return new Date(state.lastUpdated).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};
