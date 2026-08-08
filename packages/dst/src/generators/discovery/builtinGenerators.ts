import type { Generator } from "../generator.js";
import { BuiltinPlugin, type DstPlugin } from "../../plugins/index.js";

export function loadBuiltinPlugins(): DstPlugin[] {
  return [BuiltinPlugin];
}

export function loadBuiltinGenerators(): Generator[] {
  return loadBuiltinPlugins().flatMap((plugin) => plugin.generators);
}
