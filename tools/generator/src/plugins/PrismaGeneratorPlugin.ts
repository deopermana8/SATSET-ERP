import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class PrismaGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "prisma"],
      dependencies: ["PrismaPlugin", "MigrationGenerator"],
      description: "Generate prisma schema for CRUD entity module.",
      name: "PrismaGenerator",
      priority: 970,
      tasks: [{
        template: "crud-universal/prisma.prisma.tpl",
        output: paths.prismaSchema
      }]
    }));
  }
}
