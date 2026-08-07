export const {{names.entity.camel}}ActionCatalog = [
{{#each blueprint.permissions}}  {
    key: "{{this.key}}",
    description: "{{this.description}}",
    module: "{{blueprint.module}}"
  },
{{/each}}] as const;
