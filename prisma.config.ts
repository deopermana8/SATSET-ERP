import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'npm run seed:api',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
