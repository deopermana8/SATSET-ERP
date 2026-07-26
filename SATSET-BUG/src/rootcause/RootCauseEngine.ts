import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";
import { Severity } from "../core/Severity.js";
import RootCauseGraph from "./RootCauseGraph.js";
import type { RootCause } from "./RootCause.js";
import { RootCauseImpl } from "./RootCause.js";
import { RootCauseRegistry } from "./RootCauseRegistry.js";
import * as crypto from "crypto";
import type { IEngine } from "../core/IEngine.js";

function jaccard(a: Set<string>, b: Set<string>): number {
  const arrA = Array.from(a);
  const arrB = Array.from(b);
  let interCount = 0;
  const bs = new Set(arrB);
  for (const v of arrA) if (bs.has(v)) interCount++;
  const unionCount = new Set<string>([...arrA, ...arrB]).size;
  if (unionCount === 0) return 0;
  return interCount / unionCount;
}

function tokenize(text: string | undefined): Set<string> {
  if (!text) return new Set();
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function severityToScore(s: Issue["severity"]): number {
  switch (s) {
    case Severity.Critical:
      return 100;
    case Severity.Error:
      return 80;
    case Severity.Warning:
      return 50;
    default:
      return 20;
  }
}

export class RootCauseEngine implements IEngine {
  public readonly name = "RootCauseEngine";
  private readonly registry: RootCauseRegistry;

  constructor(registry?: RootCauseRegistry) {
    this.registry = registry ?? new RootCauseRegistry();
  }

  async run(context: Context): Promise<void> {
    const issues = context.getIssues();

    // deduplicate by id; if duplicate id with different message, keep first
    const seen = new Map<string, Issue>();
    for (const issue of issues) {
      if (!seen.has(issue.id)) seen.set(issue.id, issue);
    }
    const unique = Array.from(seen.values());

    const graph = new RootCauseGraph();
    for (const issue of unique) graph.addIssue(issue);

    // connect issues by heuristics: same file, same category, or message similarity
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const a = unique[i];
        const b = unique[j];
        let weight = 0;
        if (a.file && b.file && a.file === b.file) weight += 5;
        if (a.category && b.category && a.category === b.category) weight += 3;
        const ta = tokenize(a.title ?? a.message ?? "");
        const tb = tokenize(b.title ?? b.message ?? "");
        const sim = jaccard(ta, tb);
        if (sim > 0.25) weight += Math.round(sim * 5);
        if (weight > 0) graph.connect(a.id, b.id, weight);
      }
    }

    const components = graph.connectedComponents();

    const rootCauses: RootCause[] = [];
    for (const comp of components) {
      const compIssues = graph.getIssuesForComponent(comp);
      if (compIssues.length === 0) continue;

      // build title as most common category or top issue title
      const categoryCount = new Map<string, number>();
      for (const is of compIssues) {
        categoryCount.set(is.category, (categoryCount.get(is.category) ?? 0) + 1);
      }
      const mostCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? compIssues[0].category;

      // compute confidence as average severity score scaled by size
      const scores = compIssues.map((is) => severityToScore(is.severity));
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const sizeBoost = Math.min(20, (compIssues.length - 1) * 5);
      const confidence = Math.round(Math.min(100, avg + sizeBoost));

      // primary id: hash of first issue ids
      const id = crypto.createHash("sha1").update(comp.map((x) => x).join(",")).digest("hex");

      const title = `${mostCategory} (${compIssues.length} issues)`;

      const causes = compIssues.map((i) => i.title ?? i.message ?? i.id);
      const repairSteps = this.collectRepairSteps(compIssues, title);

      const rc = new RootCauseImpl({ id, title, confidence, description: `Grouped ${compIssues.length} related issues`, causes, evidence: compIssues as Issue[], repairSteps, priority: confidence });
      rootCauses.push(rc);
    }

    // If registry has detectors, allow them to produce additional root causes
    for (const detector of this.registry.getDetectors()) {
      try {
        const extra = detector(issues);
        if (extra && extra.length) rootCauses.push(...extra);
      } catch {
        // ignore detector errors
      }
    }

    // select main root cause: highest confidence
    rootCauses.sort((a, b) => b.confidence - a.confidence);
    context.rootCauses = rootCauses;
  }

  private collectRepairSteps(compIssues: Issue[], title: string): string[] {
    const steps = compIssues.flatMap((issue) => issue.fixes?.flatMap((fix) => fix.steps) ?? []);
    const uniqueSteps = Array.from(new Set(steps.map((step) => step.trim()).filter(Boolean)));

    if (uniqueSteps.length > 0) {
      return uniqueSteps;
    }

    return [`Review grouped issues and identify repair actions for ${title}.`];
  }
}

export default RootCauseEngine;
