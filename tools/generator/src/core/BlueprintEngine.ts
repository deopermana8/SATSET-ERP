import { EntityBlueprintItem, GenerateCommand, ModuleBlueprint, NormalizedBlueprint } from "../sdk/contracts.js";
import { FileSystem } from "../utils/FileSystem.js";
import { NameFormatter } from "../utils/Naming.js";
import { getYaml, path } from "../utils/Node.js";
import { BlueprintLoader } from "./BlueprintLoader.js";

export interface IBlueprintEngine {
  load(command: GenerateCommand, generatorRoot: string): NormalizedBlueprint;
  scaffold(generatorRoot: string, name: string, blueprintType: "module" | "entity" | "dashboard" | "report" | "mobile" | "scanner"): string;
}

export class BlueprintEngine implements IBlueprintEngine {
  private readonly loader = new BlueprintLoader();
  private readonly fileSystem = new FileSystem();
  private readonly formatter = new NameFormatter();

  load(command: GenerateCommand, generatorRoot: string): NormalizedBlueprint {
    const defaultType = command.target === "blueprint" || command.target === "plugin" || command.target === "workspace" ? "module" : command.target;
    const filePath = command.blueprintPath
      ? path.resolve(command.blueprintPath)
      : path.join(generatorRoot, "blueprints", `${defaultType}.yaml`);
    const blueprint = this.loader.load(filePath);
    return this.materialize(blueprint, command.name, defaultType);
  }

  scaffold(generatorRoot: string, name: string, blueprintType: "module" | "entity" | "dashboard" | "report" | "mobile" | "scanner"): string {
    const sourcePath = path.join(generatorRoot, "blueprints", `${blueprintType}.yaml`);
    const blueprint = this.loader.load(sourcePath);
    const materialized = this.materialize(blueprint, name, blueprintType);
    const targetPath = path.join(generatorRoot, "blueprints", `${this.formatter.format(name).kebab}.yaml`);
    const yaml = getYaml();
    this.fileSystem.writeText(targetPath, yaml.stringify(materialized));
    return targetPath;
  }

  private materialize(blueprint: ModuleBlueprint, name: string, blueprintType: string): NormalizedBlueprint {
    const moduleName = this.formatter.format(name).pascal;
    const entityItems = this.normalizeEntities(blueprint, blueprintType, moduleName);
    const primaryEntity = entityItems[0]?.name ?? "Record";
    const menu = blueprint.menu.map((item) => ({
      ...item,
      label: item.label.replace(/Finance/g, moduleName),
      path: item.path.replace(/finance/g, this.formatter.format(moduleName).kebab)
    }));
    return {
      api: blueprint.api ?? [
        { method: "GET", name: "list", path: `/api/${this.formatter.format(moduleName).kebab}`, permission: `${this.formatter.format(moduleName).kebab}.read` }
      ],
      module: moduleName,
      entity: primaryEntity,
      description: blueprint.description,
      entities: entityItems,
      fields: blueprint.fields,
      relations: blueprint.relations,
      permissions: blueprint.permissions,
      dashboard: blueprint.dashboard,
      reports: blueprint.reports,
      menu,
      sidebar: blueprint.sidebar ?? {
        title: moduleName,
        items: menu
      },
      mobile: blueprint.mobile,
      scanner: blueprint.scanner,
      seed: blueprint.seed ?? [],
      validation: blueprint.validation ?? [],
      workflow: blueprint.workflow ?? [],
      metadata: {
        ...blueprint.metadata,
        blueprintType
      }
    };
  }

  private normalizeEntities(blueprint: ModuleBlueprint, blueprintType: string, moduleName: string): EntityBlueprintItem[] {
    if (Array.isArray(blueprint.entities) && blueprint.entities.length > 0) {
      return blueprint.entities.map((entity) => ({
        ...entity,
        name: this.formatter.format(entity.name).pascal
      }));
    }

    if (Array.isArray(blueprint.entity)) {
      return blueprint.entity.map((entityName) => ({
        name: this.formatter.format(entityName).pascal,
        label: this.formatter.format(entityName).title
      }));
    }

    const entityName = blueprintType === "entity" ? moduleName : this.formatter.format(blueprint.entity).pascal;
    return [{
      name: entityName,
      label: this.formatter.format(entityName).title
    }];
  }
}
