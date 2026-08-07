{
  "name": "{{names.module.kebab}}",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "tsc -b",
    "dev": "node ./scripts/start.mjs dev",
    "start": "node ./scripts/start.mjs start",
    "test": "npm run build",
    "migrate": "npm run migrate --workspace @satset/{{names.module.kebab}}-api",
    "seed": "npm run seed --workspace @satset/{{names.module.kebab}}-api"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "typescript": "^5.6.2"
  }
}