import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { CrudPathResolver } from "./crud/CrudPathResolver.js";
import { createCrudGeneratorDefinition } from "./crud/CrudPluginFactory.js";

const paths = new CrudPathResolver().resolve();

export default class PageGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super(createCrudGeneratorDefinition({
      capabilities: ["crud", "page"],
      dependencies: ["SeederGenerator"],
      description: "Generate list/detail/create/edit pages for CRUD entity module.",
      name: "PageGenerator",
      priority: 860,
      tasks: [
        {
          template: "crud-universal/page-list.tsx.tpl",
          output: paths.listPage
        },
        {
          template: "crud-universal/page-detail.tsx.tpl",
          output: paths.detailPage
        },
        {
          template: "crud-universal/page-create.tsx.tpl",
          output: paths.createPage
        },
        {
          template: "crud-universal/page-edit.tsx.tpl",
          output: paths.editPage
        }
      ]
    }));
  }
}
