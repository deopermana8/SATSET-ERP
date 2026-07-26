import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { IAnalyzer } from "./IAnalyzer.js";
import { AnalyzerManager } from "./AnalyzerManager.js";

export class AnalyzerEngine implements IEngine {
  public readonly name = "AnalyzerEngine";
  private readonly manager: AnalyzerManager;

  constructor(manager?: AnalyzerManager) {
    this.manager = manager ?? new AnalyzerManager();
  }

  register(analyzer: IAnalyzer): void {
    this.manager.register(analyzer);
  }

  async run(context: Context): Promise<void> {
    this.manager.analyzeAll(context);
  }
}
