# {{blueprint.module}} UI Design

## Dashboard

{{#each blueprint.dashboard.widgets}}- {{this.name}} ({{this.type}}) metric={{this.metric}}
{{/each}}

## Form Fields

{{#each blueprint.fields}}- {{this.label}} input={{this.input}} searchable={{this.searchable}} filterable={{this.filterable}}
{{/each}}

## Sidebar

{{#each blueprint.sidebar.items}}- {{this.label}} => {{this.path}}
{{/each}}
