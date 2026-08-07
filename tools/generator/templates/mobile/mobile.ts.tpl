export const {{names.module.camel}}MobileScreen = {
  module: "{{blueprint.module}}",
  screen: "{{blueprint.mobile.screen}}",
  offline: {{blueprint.mobile.offline}},
  fields: [
{{#each blueprint.fields}}    {
      name: "{{this.name}}",
      label: "{{this.label}}",
      input: "{{this.input}}"
    },
{{/each}}  ]
} as const;
