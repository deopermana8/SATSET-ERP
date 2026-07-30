import type { ParsedRequirement } from "./RequirementParser.js";

export interface PlannedModule {
  order: number;
  name: string;
  source: string;
}

export interface ExecutionPlan {
  modules: PlannedModule[];
}

const PHASE_ORDER: Record<string, number> = {
  auth: 1,
  user: 1,
  database: 2,
  dashboard: 3,
  category: 4,
  product: 4,
  inventory: 4,
  cart: 4,
  order: 4,
  payment: 4,
  report: 5,
  notification: 6,
};

function phaseOf(module: string): number {
  return PHASE_ORDER[module] ?? 4;
}

export function planModules(requirement: ParsedRequirement): ExecutionPlan {
  const seen = new Set<string>();
  const all: string[] = [];

  // Always include auth if not present
  if (!requirement.modules.includes("auth")) all.push("auth");

  // Always include a database layer
  if (!requirement.modules.includes("database")) all.push("database");

  all.push(...requirement.modules);

  // Always include dashboard and report
  if (!all.includes("dashboard")) all.push("dashboard");
  if (!all.includes("report")) all.push("report");

  const unique = all.filter((m) => {
    if (seen.has(m)) return false;
    seen.add(m);
    return true;
  });

  unique.sort((a, b) => phaseOf(a) - phaseOf(b));

  const modules: PlannedModule[] = unique.map((name, idx) => ({
    order: idx + 1,
    name,
    source: requirement.modules.includes(name) ? "requirement" : "default",
  }));

  return { modules };
}
