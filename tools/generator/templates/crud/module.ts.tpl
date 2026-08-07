export const {{names.module.camel}}Module = {
  module: "{{blueprint.module}}",
  entity: "{{blueprint.entity}}",
  description: "{{blueprint.description}}",
  fields: [
{{#each blueprint.fields}}    {
      name: "{{this.name}}",
      type: "{{this.type}}",
      required: {{this.required}},
      unique: {{this.unique}},
      label: "{{this.label}}",
      searchable: {{this.searchable}},
      filterable: {{this.filterable}},
      input: "{{this.input}}"
    },
{{/each}}  ],
  relations: [
{{#each blueprint.relations}}    {
      name: "{{this.name}}",
      target: "{{this.target}}",
      kind: "{{this.kind}}"
    },
{{/each}}  ]
} as const;
