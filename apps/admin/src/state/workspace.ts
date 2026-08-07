import type { WorkspaceOption } from "../types/workspace.js";

export type WorkspaceState = {
  activeWorkspaceId: string;
  options: WorkspaceOption[];
};

export const defaultWorkspaceState: WorkspaceState = {
  activeWorkspaceId: "erp-wisata",
  options: [{ id: "erp-wisata", label: "ERP Wisata" }],
};

export const workspaceState = {
  defaultState: defaultWorkspaceState,
  actions: {
    setActiveWorkspace(state: WorkspaceState, activeWorkspaceId: string): WorkspaceState {
      return { ...state, activeWorkspaceId };
    },
    setOptions(state: WorkspaceState, options: WorkspaceOption[]): WorkspaceState {
      return { ...state, options };
    },
  },
  selectors: {
    activeWorkspace(state: WorkspaceState): WorkspaceOption | undefined {
      return state.options.find((option) => option.id === state.activeWorkspaceId);
    },
  },
  helper: {
    isValidWorkspace(state: WorkspaceState, workspaceId: string): boolean {
      return state.options.some((option) => option.id === workspaceId);
    },
  },
};
