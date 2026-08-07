# {{blueprint.module}} Report

## Summary

{{blueprint.description}}

## Metrics

{{#each blueprint.reports}}### {{this.title}}

{{#each this.metrics}}- {{this}}
{{/each}}
{{/each}}

## Permissions

{{#each blueprint.permissions}}- `{{this.key}}`: {{this.description}}
{{/each}}
