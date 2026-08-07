export type UserStoreState = {
  role: "super-admin" | "owner" | "manager" | "kasir-cafe" | "loket" | "booking" | "ticketing" | "finance" | "accounting" | "instruktur" | "maintenance";
  name: string;
};

export const defaultUserStoreState: UserStoreState = {
  role: "super-admin",
  name: "Administrator",
};

export const userStoreModule = {
  state: { ...defaultUserStoreState },
  setRole(role: UserStoreState["role"]): UserStoreState {
    this.state = { ...this.state, role };
    return this.state;
  },
};
