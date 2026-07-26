import assert from "node:assert/strict";
import { AgentDecisionEngine } from "../src/agent/AgentDecisionEngine.js";

async function main(): Promise<void> {
  const engine = new AgentDecisionEngine();
  const decision = engine.decide({ status: "failed", attempts: 1, error: "compile issue" }, { goal: "repair" });

  assert.equal(decision.action, "retry");
  assert.equal(decision.reason, "retrying after a failed execution");

  console.log("agent decision test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
