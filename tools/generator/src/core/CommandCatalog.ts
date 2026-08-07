import { CommandTarget, SatsetCommandName, SatsetPresetTarget } from "../sdk/contracts.js";
import { SATSET_PRESET_TARGETS } from "./PresetCatalog.js";

export interface ICommandCatalog {
  generatorCommands(): readonly SatsetCommandName[];
  generatorTargets(): readonly CommandTarget[];
  presetTargets(): readonly SatsetPresetTarget[];
}

export class CommandCatalog implements ICommandCatalog {
  private readonly commands: readonly SatsetCommandName[] = ["create", "blueprint", "architect", "compose", "generate", "make", "workflow", "doctor", "repair", "build", "deploy", "autofix", "solution"];
  private readonly targets: readonly CommandTarget[] = ["module", "plugin", "blueprint", "entity", "dashboard", "report", "mobile", "scanner", "workspace"];
  private readonly presets: readonly SatsetPresetTarget[] = SATSET_PRESET_TARGETS;

  generatorCommands(): readonly SatsetCommandName[] {
    return this.commands;
  }

  generatorTargets(): readonly CommandTarget[] {
    return this.targets;
  }

  presetTargets(): readonly SatsetPresetTarget[] {
    return this.presets;
  }
}
