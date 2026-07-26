import type { IAutoFix } from "./IAutoFix.js";
import type { RepairPlan } from "../planner/RepairPlan.js";
import type { AutoFixResult } from "./AutoFix.js";

export class AutoFixManager {
  private readonly fixes: IAutoFix[] = [];

  register(fix: IAutoFix): void {
    this.fixes.push(fix);
  }

  getFixes(): IAutoFix[] {
    return [...this.fixes];
  }

  async selectAndExecute(plan: RepairPlan): Promise<AutoFixResult[]> {
    const results: AutoFixResult[] = [];

    for (const fix of this.fixes) {
      if (!fix.supports(plan)) continue;
      results.push(await fix.execute(plan));
    }

    return results;
  }
}

export default AutoFixManager;
