import type { Context } from "../core/Context.js";

export interface IRule {
  id: string;
  name: string;
  category: string;
  match(context: Context): boolean;
  analyze(context: Context): void;
}
