export type IdentityFeatureCategory =
  | "auth"
  | "password"
  | "security"
  | "permission"
  | "user"
  | "session"
  | "audit"
  | "mfa";

export interface IdentityFeatureDefinition {
  category: IdentityFeatureCategory;
  items: readonly string[];
}

export const IDENTITY_FEATURES: readonly IdentityFeatureDefinition[] = [
  {
    category: "auth",
    items: [
      "login",
      "logout",
      "register",
      "forgot-password",
      "reset-password",
      "change-password",
      "refresh-token",
      "remember-me",
      "jwt",
      "cookie",
      "session",
      "email-login",
      "username-login",
      "phone-login",
      "otp",
      "magic-link",
      "sso-extension"
    ]
  },
  {
    category: "password",
    items: [
      "password-hash",
      "password-verify",
      "password-policy",
      "password-strength",
      "password-history",
      "password-expired",
      "password-validator",
      "password-generator"
    ]
  },
  {
    category: "security",
    items: [
      "csrf",
      "xss-protection",
      "sql-injection-guard",
      "secure-cookie",
      "http-only",
      "same-site",
      "helmet",
      "cors",
      "encryption-helper",
      "secret-manager",
      "uuid-generator",
      "token-generator",
      "random-generator",
      "rate-limiter"
    ]
  },
  {
    category: "permission",
    items: [
      "permission-entity",
      "role-entity",
      "permission-seeder",
      "role-seeder",
      "permission-tree",
      "permission-middleware",
      "permission-guard",
      "permission-service",
      "permission-repository",
      "permission-api",
      "permission-ui",
      "permission-hook"
    ]
  },
  {
    category: "user",
    items: [
      "entity",
      "prisma",
      "migration",
      "seeder",
      "repository",
      "service",
      "validation",
      "api",
      "crud",
      "form",
      "page",
      "search",
      "filter",
      "pagination",
      "soft-delete",
      "audit"
    ]
  },
  {
    category: "session",
    items: [
      "session-store",
      "session-validator",
      "session-cleaner",
      "concurrent-session",
      "logout-all-device",
      "device-tracking",
      "session-expired"
    ]
  },
  {
    category: "audit",
    items: [
      "login-history",
      "logout-history",
      "failed-login",
      "permission-change",
      "password-change",
      "crud-activity",
      "request-log",
      "entity-log"
    ]
  },
  {
    category: "mfa",
    items: [
      "otp",
      "authenticator",
      "backup-code",
      "recovery-code",
      "email-verification",
      "phone-verification"
    ]
  }
];

export const IDENTITY_ENFORCED_MODULES: readonly string[] = [
  "dashboard",
  "erp",
  "crm",
  "pos",
  "finance",
  "hr",
  "inventory",
  "warehouse",
  "purchasing",
  "reservation",
  "ticket",
  "visitor",
  "destination",
  "reporting",
  "analytics",
  "notification",
  "workflow",
  "master data",
  "cafe",
  "restaurant",
  "souvenir",
  "membership",
  "loyalty",
  "employee",
  "supplier",
  "vendor",
  "customer",
];

export function registerIdentity(moduleName: string): string {
  return moduleName.trim().toLowerCase();
}

export function useIdentity(moduleName: string): { enabled: boolean; module: string } {
  const normalized = moduleName.trim().toLowerCase();
  return {
    enabled: true,
    module: normalized
  };
}
