import { GeneratorPlugin } from "../sdk/contracts.js";
import { DependencyGraph } from "./DependencyGraph.js";

export interface ConsistencyIssue {
  level: "error" | "warning";
  message: string;
}

export interface ConsistencyReport {
  issues: ConsistencyIssue[];
  ok: boolean;
}

export interface IConsistencyChecker {
  check(plugins: readonly GeneratorPlugin[]): ConsistencyReport;
}

export class ConsistencyChecker implements IConsistencyChecker {
  private readonly dependencyGraph = new DependencyGraph();
  // workspace/bootstrap are intentionally co-provided by the workspace plugin family
  private readonly allowedSharedCapabilities = new Set(["module", "entity", "dashboard", "report", "mobile", "scanner", "crud", "workspace", "bootstrap"]);

  check(plugins: readonly GeneratorPlugin[]): ConsistencyReport {
    const issues: ConsistencyIssue[] = [];
    const pluginNames = new Set<string>();
    const capabilities = new Map<string, string[]>();

    for (const plugin of plugins) {
      if (pluginNames.has(plugin.manifest.name)) {
        issues.push({ level: "error", message: `Duplicate plugin: ${plugin.manifest.name}` });
      }
      pluginNames.add(plugin.manifest.name);

      for (const capability of plugin.manifest.capabilities) {
        const owners = capabilities.get(capability) ?? [];
        owners.push(plugin.manifest.name);
        capabilities.set(capability, owners);
      }

      for (const dependency of plugin.dependencies()) {
        if (!plugins.some((candidate) => candidate.manifest.name === dependency)) {
          issues.push({ level: "error", message: `Missing dependency ${dependency} for ${plugin.manifest.name}` });
        }
      }
    }

    for (const [capability, owners] of capabilities.entries()) {
      if (owners.length > 3 && !this.allowedSharedCapabilities.has(capability)) {
        issues.push({ level: "warning", message: `Capability ${capability} is provided by many plugins: ${owners.join(", ")}` });
      }
    }

    const cycles = this.dependencyGraph.detectCycles(plugins);
    for (const cycle of cycles) {
      issues.push({ level: "error", message: `Circular dependency detected at ${cycle}` });
    }

    return {
      issues,
      ok: issues.every((issue) => issue.level !== "error")
    };
  }
}
