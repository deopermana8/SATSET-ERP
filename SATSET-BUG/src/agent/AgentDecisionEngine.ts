export interface DecisionInput {
  status: "failed" | "completed" | "blocked";
  attempts: number;
  error?: string;
}

export interface DecisionOutput {
  action: "retry" | "escalate" | "continue";
  reason: string;
}

export class AgentDecisionEngine {
  decide(input: DecisionInput, context: { goal: string }): DecisionOutput {
    if (input.status === "failed" && input.attempts < 3) {
      return { action: "retry", reason: "retrying after a failed execution" };
    }

    if (input.status === "blocked") {
      return { action: "escalate", reason: `blocking the goal ${context.goal}` };
    }

    return { action: "continue", reason: `continuing the goal ${context.goal}` };
  }
}
