export const {{names.module.camel}}Permissions = [
{{#each blueprint.permissions}}  {
    key: "{{this.key}}",
    description: "{{this.description}}"
  },
{{/each}}] as const;

// RBAC seed compatible: { code, name, module, description }
export const PERMISSION_DEFINITIONS = [
{{#each blueprint.permissions}}  {
    code: "{{this.key}}",
    name: "{{this.key}}",
    module: "{{names.module.kebab}}",
    description: "{{this.description}}"
  },
{{/each}}];
