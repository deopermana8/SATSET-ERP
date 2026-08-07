export const {{names.entity.camel}}FormSchema = [
{{#each blueprint.fields}}  {
    name: "{{this.name}}",
    label: "{{this.label}}",
    input: "{{this.input}}",
    required: {{this.required}},
    searchable: {{this.searchable}}
  },
{{/each}}] as const;
