import type { Context } from "../core/Context.js";
import type { Issue } from "../core/Issue.js";

export interface IReporter {
  name: string;
  report(context: Context): Issue[];
}
