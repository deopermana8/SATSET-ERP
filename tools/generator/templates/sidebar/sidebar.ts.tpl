export const {{names.module.camel}}Sidebar = {
  section: "{{blueprint.module}}",
  items: [
{{#each blueprint.menu}}    {
      label: "{{this.label}}",
      href: "{{this.path}}",
      icon: "{{this.icon}}"
    },
{{/each}}  ]
} as const;
