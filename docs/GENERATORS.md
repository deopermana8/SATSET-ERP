# Generators

SATSET supports module, CRUD, entity, relation, validation, form, SQL, migration, seeder, permission, menu, sidebar, route, API, and OpenAPI generators.

## Resource Generator (v2)

The resource generator remains the main entry point for admin resource generation.

Pipeline:
1. Validate and normalize resource name.
2. Generate module files (page/loading/error/constants/types/form/table/hook/service/validation).
3. Generate CRUD files (columns/schema/validation).
4. Generate API route scaffolding for list/create and detail/update/delete.
5. Generate server action scaffolding for create/update/delete.

Generated admin module path:
- apps/admin/app/(dashboard)/<resource>/

Generated API path:
- apps/admin/app/api/<resource>/route.ts
- apps/admin/app/api/<resource>/[id]/route.ts

Generated files are idempotent by default:
- Existing files are skipped unless Force is explicitly used.
- No overwrite happens by default.

Important constraints:
- The generator is scaffold-oriented and safe-by-default.
- It does not modify schema.prisma automatically.
- API and server action files are generated as integration scaffolds and must be connected to domain-specific Prisma model logic before production use.
- Existing files are skipped by default unless Force is explicitly used.
- Generated paths are normalized so the output stays under apps/admin/app/(dashboard)/<entity>/ without unintended nesting.
