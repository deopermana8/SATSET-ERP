export const {{names.entity.camel}}TableColumns = [
{{#each blueprint.fields}}  {
    key: "{{this.name}}",
    label: "{{this.label}}",
    filterable: {{this.filterable}},
    searchable: {{this.searchable}}
  },
{{/each}}] as const;
