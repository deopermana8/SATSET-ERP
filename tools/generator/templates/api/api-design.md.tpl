# {{blueprint.module}} API Design

{{#each blueprint.api}}- {{this.method}} {{this.path}} permission={{this.permission}}
{{/each}}

## Permissions

{{#each blueprint.permissions}}- {{this.key}}: {{this.description}}
{{/each}}
