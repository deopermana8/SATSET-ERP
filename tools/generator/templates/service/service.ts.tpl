export const {{names.entity.camel}}ServiceDefinition = {
  module: "{{blueprint.module}}",
  entity: "{{blueprint.entity}}",
  permissions: [
{{#each blueprint.permissions}}    "{{this.key}}",
{{/each}}  ],
  lifecycle: ["validate", "persist", "emit"]
} as const;
