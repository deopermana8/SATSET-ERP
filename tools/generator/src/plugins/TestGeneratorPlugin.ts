import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class TestGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "test"],
      dependencies: ["DocumentationGenerator"],
      description: "Generate unit, snapshot, and regression tests for CRUD entity module.",
      name: "TestGenerator",
      priority: 840,
      tasks: [
        {
          template: "crud-universal/test-unit.ts.tpl",
          output: paths.unitTest
        },
        {
          template: "crud-universal/test-snapshot.ts.tpl",
          output: paths.snapshotTest
        },
        {
          template: "crud-universal/test-regression.ts.tpl",
          output: paths.regressionTest
        }
      ]
    }));
  }
}
