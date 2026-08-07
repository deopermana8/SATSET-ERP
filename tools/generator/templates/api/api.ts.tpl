export const {{names.entity.camel}}ApiDefinition = {
  route: "/api/{{names.module.kebab}}/{{names.entity.pluralKebab}}",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  permissions: [
{{#each blueprint.permissions}}    "{{this.key}}",
{{/each}}  ]
} as const;
