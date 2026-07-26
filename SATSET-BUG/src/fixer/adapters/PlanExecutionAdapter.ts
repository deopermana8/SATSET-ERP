import type { FixPlan } from "../FixPlan.js";
import type { ExecutionAdapter } from "../ExecutionEngine.js";

export class PlanExecutionAdapter implements ExecutionAdapter {
  public async backup(plan: FixPlan): Promise<string | undefined> {
    return `backup:${plan.id}`;
  }

  public async apply(plan: FixPlan): Promise<boolean | void> {
    return plan.id.length > 0;
  }

  public async verify(plan: FixPlan): Promise<boolean | void> {
    return plan.id.length > 0;
  }

  public async rollback(plan: FixPlan): Promise<boolean | void> {
    return plan.id.length > 0;
  }
}
