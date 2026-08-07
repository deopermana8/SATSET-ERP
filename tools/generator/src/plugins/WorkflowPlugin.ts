import { TemplatePlugin } from "../sdk/TemplatePlugin.js";
import { NormalizedBlueprint } from "../sdk/contracts.js";

export default class WorkflowPlugin extends TemplatePlugin {
  constructor() {
    super({
      manifest: {
        capabilities: ["workflow", "module"],
        dependencies: ["ActionPlugin"],
        description: "Build reusable workflow definitions from blueprint.",
        name: "WorkflowPlugin",
        priority: 205,
        targets: ["module", "dashboard", "report", "mobile", "scanner", "entity"],
        version: "3.0.0"
      },
      requiredBlueprintPaths: ["workflow"],
      tasks: [
        {
          template: "workflow/workflow.ts.tpl",
          output: "modules/{{names.module.kebab}}/workflow/{{names.entity.pascal}}Workflow.ts"
        }
      ]
    });
  }

  async enrichBlueprint(blueprint: NormalizedBlueprint): Promise<NormalizedBlueprint> {
    if (blueprint.workflow.length > 0) {
      return blueprint;
    }

    return {
      ...blueprint,
      workflow: [{
        name: `${blueprint.entity}Workflow`,
        steps: [
          { actor: "requester", name: "Reservasi", next: ["Pembayaran"] },
          { actor: "cashier", name: "Pembayaran", next: ["QR"] },
          { actor: "system", name: "QR", next: ["Gate", "Audit"] },
          { actor: "gate", name: "Gate", next: ["Laporan"] },
          { actor: "audit", name: "Audit", next: ["Laporan"] },
          { actor: "manager", name: "Laporan", next: [] }
        ]
      }]
    };
  }
}
