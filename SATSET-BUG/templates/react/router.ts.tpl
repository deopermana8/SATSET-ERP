export const routes = [
{{#each modules}}
  { path: "/{{this.name}}", name: "{{this.name}}" },
{{/each}}
] as const;
