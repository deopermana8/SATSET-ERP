export interface CrudArtifactPaths {
  actions: string;
  apiRoute: string;
  createPage: string;
  deleteHandler: string;
  detailPage: string;
  documentation: string;
  editPage: string;
  form: string;
  hook: string;
  listPage: string;
  migration: string;
  permission: string;
  prismaSchema: string;
  regressionTest: string;
  repository: string;
  seeder: string;
  service: string;
  snapshotTest: string;
  table: string;
  unitTest: string;
  validation: string;
}

export interface ICrudPathResolver {
  resolve(): CrudArtifactPaths;
}

export class CrudPathResolver implements ICrudPathResolver {
  resolve(): CrudArtifactPaths {
    const root = "modules/{{names.module.kebab}}/{{names.entity.kebab}}";
    return {
      actions: `${root}/application/{{names.entity.camel}}.actions.ts`,
      apiRoute: `${root}/api/{{names.entity.camel}}.route.ts`,
      createPage: `${root}/pages/{{names.entity.camel}}.create.page.tsx`,
      deleteHandler: `${root}/application/{{names.entity.camel}}.delete.ts`,
      detailPage: `${root}/pages/{{names.entity.camel}}.detail.page.tsx`,
      documentation: `${root}/docs/{{names.entity.camel}}.md`,
      editPage: `${root}/pages/{{names.entity.camel}}.edit.page.tsx`,
      form: `${root}/ui/{{names.entity.camel}}.form.tsx`,
      hook: `${root}/hooks/use{{names.entity.pascal}}.ts`,
      listPage: `${root}/pages/{{names.entity.camel}}.list.page.tsx`,
      migration: `${root}/prisma/migrations/0001_{{names.entity.kebab}}.sql`,
      permission: `${root}/security/{{names.entity.camel}}.permission.ts`,
      prismaSchema: `${root}/prisma/{{names.entity.kebab}}.prisma`,
      regressionTest: `${root}/tests/{{names.entity.camel}}.regression.test.ts`,
      repository: `${root}/domain/{{names.entity.pascal}}Repository.ts`,
      seeder: `${root}/seed/{{names.entity.camel}}.seed.ts`,
      service: `${root}/domain/{{names.entity.pascal}}Service.ts`,
      snapshotTest: `${root}/tests/{{names.entity.camel}}.snapshot.test.ts`,
      table: `${root}/ui/{{names.entity.camel}}.table.tsx`,
      unitTest: `${root}/tests/{{names.entity.camel}}.unit.test.ts`,
      validation: `${root}/validation/{{names.entity.camel}}.validation.ts`
    };
  }
}
