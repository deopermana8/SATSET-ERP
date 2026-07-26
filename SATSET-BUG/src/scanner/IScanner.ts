import type { Context } from "../core/Context.js";

export interface IScanner {
  name: string;
  scan(context: Context): Promise<void> | void;
}
