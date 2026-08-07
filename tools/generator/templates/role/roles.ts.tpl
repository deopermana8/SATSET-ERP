export const {{names.module.camel}}Roles = {
  admin: [
{{#each blueprint.permissions}}    "{{this.key}}",
{{/each}}  ],
  manager: [
{{#each blueprint.permissions}}    "{{this.key}}",
{{/each}}  ],
  viewer: [
{{#each blueprint.permissions}}    "{{this.key}}",
{{/each}}  ]
} as const;
