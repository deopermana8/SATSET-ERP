import type { UserProfile } from "../types/user.js";

export type UserState = {
  profile: UserProfile;
  permissions: string[];
};

export const defaultUserState: UserState = {
  profile: {
    id: "admin",
    name: "Administrator",
    role: "Super Admin",
    initials: "AD",
  },
  permissions: [],
};

export const userState = {
  defaultState: defaultUserState,
  actions: {
    setProfile(state: UserState, profile: UserProfile): UserState {
      return { ...state, profile };
    },
    setPermissions(state: UserState, permissions: string[]): UserState {
      return { ...state, permissions };
    },
  },
  selectors: {
    displayName(state: UserState): string {
      return state.profile.name;
    },
    isAdmin(state: UserState): boolean {
      return state.profile.role.toLowerCase().includes("admin");
    },
  },
  helper: {
    hasPermission(state: UserState, permission: string): boolean {
      return state.permissions.includes(permission);
    },
  },
};
