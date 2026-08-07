import { CommandTarget, GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";
import { registerIdentity, useIdentity } from "./IdentityRegistry.js";

export interface IComposer {
  compose(target: Exclude<CommandTarget, "plugin" | "blueprint">, blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): string[];
}

export class Composer implements IComposer {
  compose(target: Exclude<CommandTarget, "plugin" | "blueprint">, blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): string[] {
    registerIdentity(blueprint.module);
    const requestedTargets = this.expandTargets(target);
    const selected = plugins
      .filter((plugin) => requestedTargets.some((requestedTarget) => plugin.manifest.targets.includes(requestedTarget)))
      .sort((left, right) => right.manifest.priority - left.manifest.priority)
      .map((plugin) => plugin.manifest.name);

    const identity = useIdentity(blueprint.module, target);
    if (identity.enabled) {
      selected.unshift(identity.pluginName);
    }

    return Array.from(new Set(selected));
  }

  private expandTargets(target: Exclude<CommandTarget, "plugin" | "blueprint">): Exclude<CommandTarget, "plugin" | "blueprint">[] {
    if (target === "workspace") {
      return ["workspace"];
    }

    if (target === "module") {
      return ["module", "entity", "dashboard", "report", "mobile", "scanner"];
    }

    if (target === "entity") {
      return ["entity", "module"];
    }

    return [target, "module"];
  }
}
