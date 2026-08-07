export const {{names.module.camel}}Menu = [
{{#each blueprint.menu}}  {
    label: "{{this.label}}",
    path: "{{this.path}}",
    icon: "{{this.icon}}"
  },
{{/each}}] as const;
