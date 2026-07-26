import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { DecisionEngine } from "./DecisionEngine.js";
import { StrategyEngine } from "./StrategyEngine.js";
import { ConflictResolver } from "./ConflictResolver.js";
import { TradeoffEngine } from "./TradeoffEngine.js";

export interface ReasoningSnapshot {
  decision: string;
  strategy: string;
  conflicts: string[];
  tradeoffs: Array<{ name: string; score: number }>;
}

export class ReasoningEngineV2 implements IEngine {
  public readonly name = "ReasoningEngineV2";

  async run(context: Context): Promise<void> {
    const decisionEngine = new DecisionEngine();
    const strategyEngine = new StrategyEngine();
    const conflictResolver = new ConflictResolver();
    const tradeoffEngine = new TradeoffEngine();

    const decision = decisionEngine.record(context, "default-strategy", "Prefer the existing runtime path", 0.82);
    const strategies = strategyEngine.compare([
      { id: "a", name: "extend-runtime", score: 0.92 },
      { id: "b", name: "replace-runtime", score: 0.2 },
    ]);
    const conflicts = conflictResolver.resolve(["compatibility", "stability"]);
    const tradeoffs = tradeoffEngine.score([
      { name: "compatibility", cost: 1, benefit: 3 },
      { name: "speed", cost: 2, benefit: 4 },
    ]).map((item) => ({ name: item.name, score: item.score }));

    const snapshot: ReasoningSnapshot = {
      decision: decision.choice,
      strategy: strategies[0]?.name ?? "extend-runtime",
      conflicts,
      tradeoffs,
    };

    const knowledgePath = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgePath, { recursive: true });
    await fs.writeFile(path.join(knowledgePath, "reasoning.json"), JSON.stringify(snapshot, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      reasoning: snapshot,
    } as typeof context.metadata & { reasoning?: ReasoningSnapshot };
  }
}
