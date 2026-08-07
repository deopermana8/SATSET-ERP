import type { DashboardThemeMode } from "../themeEngine.js";

export type ThemeStoreState = {
  mode: DashboardThemeMode;
};

export const defaultThemeStoreState: ThemeStoreState = {
  mode: "dark",
};

export const themeStoreModule = {
  state: { ...defaultThemeStoreState },
  setMode(mode: DashboardThemeMode): ThemeStoreState {
    this.state = { ...this.state, mode };
    return this.state;
  },
};
