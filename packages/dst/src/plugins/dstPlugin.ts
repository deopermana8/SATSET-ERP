import type { Generator } from "../generators/generator.js";

export interface DstPlugin {
  id: string;
  name: string;
  version: string;
  generators: Generator[];
}
