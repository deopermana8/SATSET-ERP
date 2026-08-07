export interface IdentityState {
  authenticated: boolean;
  loading: boolean;
  permissions: readonly string[];
}

export function useIdentity(): IdentityState {
  return {
    authenticated: false,
    loading: false,
    permissions: []
  };
}
