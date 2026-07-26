import type { Context } from "./Context.js";

export interface IEngine {
  readonly name: string;
  run(context: Context): Promise<void>;
}
