export interface IdentitySeedRole {
  code: string;
  name: string;
  permissions: readonly string[];
}

export interface IdentitySeedPermission {
  code: string;
  description: string;
  parent?: string;
}

export const IDENTITY_PERMISSIONS: readonly IdentitySeedPermission[] = [
  { code: "identity.read", description: "Read identity data" },
  { code: "identity.write", description: "Manage identity data" },
  { code: "identity.session", description: "Manage session data" },
  { code: "identity.audit", description: "Read audit logs" },
  { code: "identity.mfa", description: "Manage MFA settings" }
];

export const IDENTITY_ROLES: readonly IdentitySeedRole[] = [
  {
    code: "super-admin",
    name: "Super Admin",
    permissions: ["identity.read", "identity.write", "identity.session", "identity.audit", "identity.mfa"]
  },
  {
    code: "security-admin",
    name: "Security Admin",
    permissions: ["identity.read", "identity.session", "identity.audit", "identity.mfa"]
  },
  {
    code: "auditor",
    name: "Auditor",
    permissions: ["identity.read", "identity.audit"]
  }
];

export async function seedIdentityData(): Promise<void> {
  // Integrate with Prisma seed pipeline in host generator output.
  void IDENTITY_PERMISSIONS;
  void IDENTITY_ROLES;
}
