import { GeneratorPlugin } from "../sdk/contracts.js";

export interface ArchitectureIssue {
  level: "error" | "warning";
  message: string;
}

export interface ArchitectureReport {
  issues: ArchitectureIssue[];
  ok: boolean;
}

export interface IArchitectureValidator {
  validate(plugins: readonly GeneratorPlugin[]): ArchitectureReport;
}

export class ArchitectureValidator implements IArchitectureValidator {
  private readonly layers: Record<string, number> = {
    architect: 1,
    blueprint: 1,
    module: 2,
    entity: 2,
    database: 10,
    api: 11,
    dashboard: 12,
    ui: 13,
    workflow: 14,
    report: 15,
    mobile: 16,
    scanner: 16,
    "business-rule": 17,
    analysis: 18,
    refactor: 19,
    repair: 20,
    doctor: 20,
    "domain-pack": 3
  };

  validate(plugins: readonly GeneratorPlugin[]): ArchitectureReport {
    const issues: ArchitectureIssue[] = [];
    const pluginMap = new Map(plugins.map((plugin) => [plugin.manifest.name, plugin]));

    for (const plugin of plugins) {
      const ownLayer = this.resolveLayer(plugin.manifest.capabilities);
      for (const dependencyName of plugin.dependencies()) {
        const dependency = pluginMap.get(dependencyName);
        if (!dependency) {
          continue;
        }

        const dependencyLayer = this.resolveLayer(dependency.manifest.capabilities);
        if (dependencyLayer > ownLayer) {
          issues.push({ level: "error", message: `${plugin.manifest.name} depends on higher layer ${dependency.manifest.name}` });
        }
      }
    }

    return {
      issues,
      ok: issues.every((issue) => issue.level !== "error")
    };
  }

  private resolveLayer(capabilities: readonly string[]): number {
    let minLayer = 99;
    for (const capability of capabilities) {
      const value = this.layers[capability];
      if (typeof value === "number" && value < minLayer) {
        minLayer = value;
      }
    }

    return minLayer === 99 ? 50 : minLayer;
  }
}
