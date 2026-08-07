# {{blueprint.module}} Database Design

## Entity

{{blueprint.entity}}

## Fields

{{#each blueprint.fields}}- {{this.name}}: {{this.type}} required={{this.required}} unique={{this.unique}}
{{/each}}

## Relations

{{#each blueprint.relations}}- {{this.name}} -> {{this.target}} ({{this.kind}})
{{/each}}

## Validation

{{#each blueprint.validation}}- {{this.field}}: {{this.rule}} => {{this.message}}
{{/each}}

## Seed

{{#each blueprint.seed}}- {{this.name}}
{{/each}}
