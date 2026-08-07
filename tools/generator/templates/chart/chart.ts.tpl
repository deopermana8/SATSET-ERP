export const {{names.module.camel}}ChartDefinition = [
{{#each blueprint.dashboard.widgets}}  {
    name: "{{this.name}}",
    type: "{{this.type}}",
    metric: "{{this.metric}}"
  },
{{/each}}] as const;
