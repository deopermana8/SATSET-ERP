export type LayoutStoreState = {
  sidebarCollapsed: boolean;
  compactDensity: boolean;
};

export const defaultLayoutStoreState: LayoutStoreState = {
  sidebarCollapsed: false,
  compactDensity: false,
};

export const layoutStoreModule = {
  state: { ...defaultLayoutStoreState },
  setSidebarCollapsed(sidebarCollapsed: boolean): LayoutStoreState {
    this.state = { ...this.state, sidebarCollapsed };
    return this.state;
  },
  setCompactDensity(compactDensity: boolean): LayoutStoreState {
    this.state = { ...this.state, compactDensity };
    return this.state;
  },
};
