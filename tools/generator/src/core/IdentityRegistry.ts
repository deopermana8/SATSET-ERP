import { CommandTarget } from "../sdk/contracts.js";

export interface IdentityDependencyNode {
  dependencies: readonly string[];
  name: string;
}

export interface IdentityUsage {
  dependencies: readonly string[];
  enabled: boolean;
  module: string;
  pluginName: string;
}

export interface IIdentityRegistry {
  dependencyGraph(moduleNames?: readonly string[]): IdentityDependencyNode[];
  registerIdentity(moduleNameOrNames: string | readonly string[]): void;
  useIdentity(moduleName: string, target: Exclude<CommandTarget, "plugin" | "blueprint">): boolean;
}

export const IDENTITY_PLUGIN_NAME = "IdentityGeneratorPlugin";

export const IDENTITY_INTEGRATION_MODULES: readonly string[] = [
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
  "customer"
];

const IDENTITY_ENFORCED_TARGETS = new Set<Exclude<CommandTarget, "plugin" | "blueprint">>([
  "module",
  "entity",
  "dashboard",
  "report",
  "mobile",
  "scanner"
]);

export class IdentityRegistry implements IIdentityRegistry {
  private readonly modules = new Set<string>();

  constructor(initialModules: readonly string[] = IDENTITY_INTEGRATION_MODULES) {
    this.registerIdentity(initialModules);
  }

  registerIdentity(moduleNameOrNames: string | readonly string[]): void {
    const moduleNames = Array.isArray(moduleNameOrNames) ? moduleNameOrNames : [moduleNameOrNames];
    for (const moduleName of moduleNames) {
      const normalized = this.normalize(moduleName);
      if (normalized.length > 0) {
        this.modules.add(normalized);
      }
    }
  }

  useIdentity(moduleName: string, target: Exclude<CommandTarget, "plugin" | "blueprint">): boolean {
    const normalized = this.normalize(moduleName);
    if (normalized.length > 0) {
      this.modules.add(normalized);
    }

    return IDENTITY_ENFORCED_TARGETS.has(target);
  }

  dependencyGraph(moduleNames: readonly string[] = []): IdentityDependencyNode[] {
    const merged = new Set<string>(this.modules);
    for (const moduleName of moduleNames) {
      const normalized = this.normalize(moduleName);
      if (normalized.length > 0) {
        merged.add(normalized);
      }
    }

    const nodes: IdentityDependencyNode[] = [{
      dependencies: [],
      name: "identity"
    }];

    for (const name of Array.from(merged).sort((left, right) => left.localeCompare(right))) {
      nodes.push({
        dependencies: ["identity"],
        name
      });
    }

    return nodes;
  }

  private normalize(moduleName: string): string {
    return moduleName.trim().toLowerCase().replace(/\s+/g, " ");
  }
}

const globalIdentityRegistry = new IdentityRegistry();

export function registerIdentity(moduleNameOrNames: string | readonly string[] = IDENTITY_INTEGRATION_MODULES): IdentityRegistry {
  globalIdentityRegistry.registerIdentity(moduleNameOrNames);
  return globalIdentityRegistry;
}

export function useIdentity(moduleName: string, target: Exclude<CommandTarget, "plugin" | "blueprint">): IdentityUsage {
  const normalizedModule = moduleName.trim().toLowerCase();
  const enabled = globalIdentityRegistry.useIdentity(normalizedModule, target);
  return {
    dependencies: enabled ? [IDENTITY_PLUGIN_NAME] : [],
    enabled,
    module: normalizedModule,
    pluginName: IDENTITY_PLUGIN_NAME
  };
}

export function getIdentityDependencyGraph(moduleNames: readonly string[] = []): IdentityDependencyNode[] {
  return globalIdentityRegistry.dependencyGraph(moduleNames);
}