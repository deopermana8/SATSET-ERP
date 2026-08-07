model {{names.entity.pascal}} {
  id        String   @id @default(uuid())
{{#each blueprint.fields}}  {{this.name}} {{this.type}}{{#if this.required}}{{else}}?{{/if}}
{{/each}}  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
