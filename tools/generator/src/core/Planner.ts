import { EntityPlan, GeneratorPlugin, NormalizedBlueprint } from "../sdk/contracts.js";

export interface IPlanner {
  plan(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): EntityPlan[];
}

export class Planner implements IPlanner {
  plan(blueprint: NormalizedBlueprint, plugins: readonly GeneratorPlugin[]): EntityPlan[] {
    const pluginOrder = plugins.map((plugin) => plugin.manifest.name).join(",");
    return blueprint.entities.map((entity) => ({
      entity,
      normalizedBlueprint: {
        ...blueprint,
        metadata: {
          ...blueprint.metadata,
          plannerOrder: pluginOrder
        }
      }
    }));
  }
}
