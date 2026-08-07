{
  "name": "@satset/{{names.module.kebab}}-{{appName}}",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "tsc -b",
    "dev": "node ./dist/index.js",
    "start": "node ./dist/index.js",
    "test": "npm run build"{{#if hasMigrationScript}},
    "migrate": "node ./dist/migrate.js"{{/if}}{{#if hasSeedScript}},
    "seed": "node ./dist/seed.js"{{/if}}
  }
}