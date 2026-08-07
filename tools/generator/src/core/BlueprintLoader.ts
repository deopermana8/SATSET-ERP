import { ModuleBlueprint } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { getYaml } from "../utils/Node.js";

export interface IBlueprintLoader {
  load(filePath: string): ModuleBlueprint;
}

export class BlueprintLoader implements IBlueprintLoader {
  private readonly fileSystem = new FileSystem();
  private readonly cache = new Map<string, ModuleBlueprint>();

  load(filePath: string): ModuleBlueprint {
    const cached = this.cache.get(filePath);
    if (cached) {
      return this.clone(cached);
    }

    const yaml = getYaml();
    const rawContent = this.fileSystem.readText(filePath);
    const blueprint = yaml.parse(rawContent) as ModuleBlueprint;
    this.cache.set(filePath, this.clone(blueprint));
    return this.clone(blueprint);
  }

  private clone(value: ModuleBlueprint): ModuleBlueprint {
    return JSON.parse(JSON.stringify(value)) as ModuleBlueprint;
  }
}
