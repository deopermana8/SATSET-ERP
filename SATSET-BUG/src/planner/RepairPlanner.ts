import type { RootCause } from "../rootcause/RootCause.js";
import type { RepairStep } from "./RepairStep.js";
import type { RepairPlan } from "./RepairPlan.js";

function estimateRisk(text: string): "low" | "medium" | "high" {
  const lower = text.toLowerCase();
  if (lower.includes("critical") || lower.includes("urgent") || lower.includes("important")) {
    return "high";
  }
  if (lower.includes("fix") || lower.includes("validate") || lower.includes("review")) {
    return "medium";
  }
  return "low";
}

function estimateTime(text: string): number {
  const lower = text.toLowerCase();
  if (lower.includes("refactor") || lower.includes("upgrade") || lower.includes("migrate")) {
    return 180;
  }
  if (lower.includes("fix") || lower.includes("resolve") || lower.includes("update")) {
    return 90;
  }
  return 60;
}

export class RepairPlanner {
  public plan(rootCause: RootCause): RepairPlan {
    const steps = this.buildSteps(rootCause);
    const orderedSteps = this.sortSteps(steps);
    const totalEstimatedTime = orderedSteps.reduce((total, step) => total + step.estimatedTime, 0);

    return {
      id: `repair-plan:${rootCause.id}`,
      rootCauseId: rootCause.id,
      title: `Repair plan for ${rootCause.title}`,
      description: rootCause.description,
      steps: orderedSteps,
      totalEstimatedTime,
      priority: rootCause.priority,
    };
  }

  private buildSteps(rootCause: RootCause): RepairStep[] {
    const steps: RepairStep[] = rootCause.repairSteps.map((text, index) => {
      const metadata = this.parseStepMetadata(text);
      return {
        id: `${rootCause.id}-step-${index + 1}`,
        title: metadata.title,
        description: metadata.description,
        estimatedTime: metadata.estimatedTime,
        automatic: metadata.automatic,
        risk: metadata.risk,
        dependsOn: metadata.dependsOn,
      };
    });

    return steps;
  }

  private parseStepMetadata(text: string): {
    title: string;
    description: string;
    estimatedTime: number;
    automatic: boolean;
    risk: "low" | "medium" | "high";
    dependsOn: string[];
  } {
    const dependsOn: string[] = [];
    let title = text.trim();
    const metadataMatch = text.match(/\[dependsOn:\s*([^\]]+)\]/i);

    if (metadataMatch) {
      title = title.replace(metadataMatch[0], "").trim();
      dependsOn.push(
        ...metadataMatch[1]
          .split(",")
          .map((chunk) => chunk.trim())
          .filter(Boolean)
      );
    }

    return {
      title,
      description: text,
      estimatedTime: estimateTime(title),
      automatic: /auto(mat(ic)?)?/i.test(title),
      risk: estimateRisk(title),
      dependsOn,
    };
  }

  private sortSteps(steps: RepairStep[]): RepairStep[] {
    const output: RepairStep[] = [];
    const remaining = new Map(steps.map((step) => [step.id, step]));
    const dependencyMap = new Map<string, Set<string>>();

    for (const step of steps) {
      dependencyMap.set(step.id, new Set(step.dependsOn.map((d) => this.resolveStepId(d, steps))));
    }

    while (remaining.size > 0) {
      const ready = Array.from(remaining.values()).filter((step) => {
        const deps = dependencyMap.get(step.id);
        if (!deps) return true;
        return Array.from(deps).every((depId) => !remaining.has(depId) || depId === step.id ? true : !remaining.has(depId));
      });

      if (ready.length === 0) {
        output.push(...Array.from(remaining.values()));
        break;
      }

      ready.sort((a, b) => a.risk.localeCompare(b.risk));
      const nextStep = ready[0];
      output.push(nextStep);
      remaining.delete(nextStep.id);
    }

    return output;
  }

  private resolveStepId(dependency: string, steps: RepairStep[]): string {
    const match = steps.find((step) => step.title === dependency || step.id === dependency);
    return match ? match.id : dependency;
  }
}
