export const {{names.entity.camel}}RepositoryDefinition = {
  module: "{{blueprint.module}}",
  entity: "{{blueprint.entity}}",
  storage: "{{names.module.kebab}}.{{names.entity.kebab}}",
  selectors: [
{{#each blueprint.fields}}    "{{this.name}}",
{{/each}}  ],
  relations: [
{{#each blueprint.relations}}    {
      name: "{{this.name}}",
      target: "{{this.target}}",
      kind: "{{this.kind}}"
    },
{{/each}}  ]
} as const;
