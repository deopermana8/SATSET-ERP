CREATE TABLE IF NOT EXISTS {{names.entity.snake}} (
  id TEXT PRIMARY KEY,
{{#each blueprint.fields}}  {{this.name}} TEXT{{#if this.required}} NOT NULL{{/if}},
{{/each}}  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
