import { IDENTITY_INTEGRATION_MODULES } from "../core/IdentityRegistry.js";
import { TemplatePlugin } from "../sdk/TemplatePlugin.js";

export default class IdentityGeneratorPlugin extends TemplatePlugin {
  constructor() {
    super({
      manifest: {
        capabilities: [
          "identity",
          "authentication",
          "authorization",
          "session",
          "rbac",
          "audit",
          "security",
          "mfa"
        ],
        dependencies: [],
        description: "Identity foundation generator for auth, RBAC, session, security, audit, and MFA.",
        name: "IdentityGeneratorPlugin",
        priority: 1000,
        targets: ["module", "entity", "dashboard", "report", "mobile", "scanner"],
        version: "1.0.0"
      },
      requiredBlueprintPaths: ["module", "entities", "permissions"],
      tasks: [
        {
          template: "identity/features.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/config/identity.features.ts",
          model: {
            identityModules: IDENTITY_INTEGRATION_MODULES
          }
        },
        {
          template: "identity/prisma.prisma.tpl",
          output: "modules/{{names.module.kebab}}/identity/prisma/identity.prisma"
        },
        {
          template: "identity/migration.sql.tpl",
          output: "modules/{{names.module.kebab}}/identity/prisma/migrations/0001_identity_init.sql"
        },
        {
          template: "identity/seeder.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/seed/identity.seed.ts"
        },
        {
          template: "identity/entity.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/domain/UserIdentity.ts",
          model: {
            aggregateName: "UserIdentity"
          }
        },
        {
          template: "identity/entity.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/domain/Role.ts",
          model: {
            aggregateName: "Role"
          }
        },
        {
          template: "identity/entity.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/domain/Permission.ts",
          model: {
            aggregateName: "Permission"
          }
        },
        {
          template: "identity/repository.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/repository/IdentityRepository.ts"
        },
        {
          template: "identity/service.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/service/IdentityService.ts"
        },
        {
          template: "identity/validation.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/validation/identity.validation.ts"
        },
        {
          template: "identity/api.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/api/identity.api.ts"
        },
        {
          template: "identity/hook.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/hooks/useIdentity.ts"
        },
        {
          template: "identity/component.tsx.tpl",
          output: "modules/{{names.module.kebab}}/identity/components/IdentityPanel.tsx"
        },
        {
          template: "identity/page.tsx.tpl",
          output: "modules/{{names.module.kebab}}/identity/pages/IdentityPage.tsx"
        },
        {
          template: "identity/test.ts.tpl",
          output: "modules/{{names.module.kebab}}/identity/tests/identity.test.ts"
        },
        {
          template: "identity/documentation.md.tpl",
          output: "modules/{{names.module.kebab}}/identity/README.md"
        },
        {
          template: "identity/generator-identity.md.tpl",
          output: "docs/generator/identity.md",
          model: {
            identityModules: IDENTITY_INTEGRATION_MODULES
          }
        }
      ]
    });
  }
}
