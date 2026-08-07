# Destinasi CRUD Module

## Generated Artifacts

- Prisma Schema
- Migration
- Repository
- Service
- Action
- API Route
- Hook
- Validation
- Permission
- Form
- Table
- List/Detail/Create/Edit Pages
- Seeder
- Unit/Snapshot/Regression Tests
- Documentation

## Dependency Graph

```mermaid
graph TD
  CrudGenerator --> PrismaGenerator
  PrismaGenerator --> MigrationGenerator
  MigrationGenerator --> RepositoryGenerator
  RepositoryGenerator --> ServiceGenerator
  ServiceGenerator --> ApiRouteGenerator
  ApiRouteGenerator --> ActionGenerator
  ActionGenerator --> HookGenerator
  HookGenerator --> ValidationGenerator
  ValidationGenerator --> PermissionGenerator
  PermissionGenerator --> FormGenerator
  FormGenerator --> TableGenerator
  TableGenerator --> PageGenerator
  PageGenerator --> SeederGenerator
  SeederGenerator --> TestGenerator
  TestGenerator --> DocumentationGenerator
```
