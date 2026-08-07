import { ApiBlueprint, MenuBlueprint, NormalizedBlueprint, WorkflowBlueprint } from "../sdk/contracts.js";
import { NameFormatter } from "../utils/Naming.js";

export interface IBlueprintFactory {
  create(seed: Partial<NormalizedBlueprint>): NormalizedBlueprint;
}

export class BlueprintFactory implements IBlueprintFactory {
  private readonly formatter = new NameFormatter();

  create(seed: Partial<NormalizedBlueprint>): NormalizedBlueprint {
    const moduleName = seed.module ?? "Factory";
    const moduleNames = this.formatter.format(moduleName);
    const entityName = seed.entity ?? seed.entities?.[0]?.name ?? "Record";
    const entityNames = this.formatter.format(entityName);
    const menu = seed.menu ?? this.createMenu(moduleNames.title, moduleNames.kebab);
    const workflow = seed.workflow ?? this.createWorkflow(entityNames.title);
    const api = seed.api ?? this.createApi(moduleNames.kebab, seed.permissions?.[0]?.key ?? `${moduleNames.kebab}.read`);

    return {
      api,
      dashboard: seed.dashboard ?? { widgets: [{ metric: "count(id)", name: `${entityNames.camel}Count`, type: "metric" }] },
      description: seed.description ?? `${moduleNames.title} business application`,
      entities: seed.entities ?? [{ name: entityNames.pascal, label: entityNames.title }],
      entity: entityNames.pascal,
      fields: seed.fields ?? [
        { filterable: true, input: "text", label: "ID", name: "id", required: true, searchable: true, type: "String", unique: true },
        { filterable: true, input: "text", label: "Name", name: "name", required: true, searchable: true, type: "String", unique: false }
      ],
      menu,
      metadata: seed.metadata ?? {},
      mobile: seed.mobile ?? { offline: true, screen: `${moduleNames.pascal}Home` },
      module: moduleNames.pascal,
      permissions: seed.permissions ?? [
        { description: `Read ${moduleNames.title}`, key: `${moduleNames.kebab}.read` },
        { description: `Write ${moduleNames.title}`, key: `${moduleNames.kebab}.write` }
      ],
      relations: seed.relations ?? [],
      reports: seed.reports ?? [{ metrics: ["count(id)"], name: `${moduleNames.kebab}-summary`, title: `${moduleNames.title} Summary` }],
      scanner: seed.scanner ?? { provider: `${moduleNames.kebab}-scanner`, schedule: "0 */6 * * *" },
      seed: seed.seed ?? [{ fields: { id: "seed-1", name: `${moduleNames.title} Seed` }, name: `${moduleNames.pascal}Seed` }],
      sidebar: seed.sidebar ?? { items: menu, title: moduleNames.title },
      validation: seed.validation ?? [
        { field: "name", message: "Name is required", rule: "required" }
      ],
      workflow
    };
  }

  private createMenu(label: string, slug: string): MenuBlueprint[] {
    return [{ icon: "layer-group", label, path: `/${slug}` }];
  }

  private createWorkflow(entityLabel: string): WorkflowBlueprint[] {
    return [{
      name: `${entityLabel}Workflow`,
      steps: [
        { actor: "requester", name: "Submit", next: ["Review"] },
        { actor: "reviewer", name: "Review", next: ["Approve", "Reject"] },
        { actor: "approver", name: "Approve", next: ["Audit"] },
        { actor: "auditor", name: "Audit", next: [] }
      ]
    }];
  }

  private createApi(slug: string, permission: string): ApiBlueprint[] {
    return [
      { method: "GET", name: "list", path: `/api/${slug}`, permission },
      { method: "POST", name: "create", path: `/api/${slug}`, permission },
      { method: "PATCH", name: "update", path: `/api/${slug}/:id`, permission },
      { method: "DELETE", name: "delete", path: `/api/${slug}/:id`, permission }
    ];
  }
}
