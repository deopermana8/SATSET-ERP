export const {{names.entity.camel}}Workflow = [
{{#each blueprint.workflow}}  {
    name: "{{this.name}}",
    steps: [
{{#each this.steps}}      {
        name: "{{this.name}}",
        actor: "{{this.actor}}",
        next: [{{#each this.next}}"{{this}}", {{/each}}]
      },
{{/each}}    ]
  },
{{/each}}] as const;
