model {{names.entity.pascal}} {
{{#each blueprint.fields}}  {{this.name}} {{this.type}} // required={{this.required}} unique={{this.unique}} input={{this.input}}
{{/each}}{{#each blueprint.relations}}  {{this.name}} {{this.target}} // relation={{this.kind}}
{{/each}}}
