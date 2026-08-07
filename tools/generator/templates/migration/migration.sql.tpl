CREATE TABLE {{names.module.kebab}}_{{names.entity.kebab}} (
{{#each blueprint.fields}}  {{this.name}} {{this.type}}{{#if this.required}} NOT NULL{{/if}}{{#if this.unique}} UNIQUE{{/if}}{{#if this.default}} DEFAULT {{this.default}}{{/if}},
{{/each}}  PRIMARY KEY (id)
);
