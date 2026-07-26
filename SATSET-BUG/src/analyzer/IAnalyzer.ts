import type { Context } from "../core/Context.js";

export interface IAnalyzer {
  name: string;
  analyze(context: Context): void;
}
