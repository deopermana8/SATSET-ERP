import type { Context } from "../core/Context.js";
import type { IAnalyzer } from "./IAnalyzer.js";

export class AnalyzerManager {
  private readonly analyzers: IAnalyzer[] = [];

  register(analyzer: IAnalyzer): void {
    this.analyzers.push(analyzer);
  }

  getAnalyzers(): IAnalyzer[] {
    return [...this.analyzers];
  }

  analyzeAll(context: Context): void {
    for (const analyzer of this.analyzers) {
      analyzer.analyze(context);
    }
  }
}
