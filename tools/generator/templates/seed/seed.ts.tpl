export const {{names.entity.camel}}SeedPlan = {
  module: "{{blueprint.module}}",
  entity: "{{blueprint.entity}}",
  seedFields: [
{{#each blueprint.fields}}    {
      name: "{{this.name}}",
      type: "{{this.type}}",
      defaultValue: "{{this.default}}",
      label: "{{this.label}}"
    },
{{/each}}  ]
} as const;
