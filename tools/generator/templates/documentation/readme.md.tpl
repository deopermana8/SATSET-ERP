# {{blueprint.module}} Module

{{blueprint.description}}

## Entity

- Name: {{blueprint.entity}}
- Module Path: {{names.module.kebab}}
- Generated At: {{generatedAt}}

## Fields

{{#each blueprint.fields}}- **{{this.label}}** (`{{this.name}}`) type `{{this.type}}`, input `{{this.input}}`, required `{{this.required}}`
{{/each}}

## Relations

{{#each blueprint.relations}}- `{{this.name}}` -> `{{this.target}}` ({{this.kind}})
{{/each}}

## Permissions

{{#each blueprint.permissions}}- `{{this.key}}`: {{this.description}}
{{/each}}
