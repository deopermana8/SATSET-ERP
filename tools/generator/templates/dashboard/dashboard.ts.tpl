export const {{names.module.camel}}DashboardDefinition = {
  module: "{{blueprint.module}}",
  widgets: [
{{#each blueprint.dashboard.widgets}}    {
      name: "{{this.name}}",
      type: "{{this.type}}",
      metric: "{{this.metric}}"
    },
{{/each}}  ]
} as const;
