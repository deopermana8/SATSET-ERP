export type ThemeState = {
  mode: "light" | "dark";
};

export const defaultThemeState: ThemeState = {
  mode: "dark",
};

export const themeState = {
  defaultState: defaultThemeState,
  actions: {
    setMode(state: ThemeState, mode: ThemeState["mode"]): ThemeState {
      return { ...state, mode };
    },
    toggle(state: ThemeState): ThemeState {
      return { ...state, mode: state.mode === "dark" ? "light" : "dark" };
    },
  },
  selectors: {
    mode(state: ThemeState): ThemeState["mode"] {
      return state.mode;
    },
    isDark(state: ThemeState): boolean {
      return state.mode === "dark";
    },
  },
  helper: {
    normalize(mode: string): ThemeState["mode"] {
      return mode === "light" ? "light" : "dark";
    },
  },
};
