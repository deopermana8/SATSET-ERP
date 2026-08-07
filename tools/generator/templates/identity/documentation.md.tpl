# Identity Module for {{blueprint.module}}

IdentityGenerator builds a complete foundation for authentication, authorization, RBAC, session, audit, and MFA.

## Generated Scope

- User, Role, Permission, RBAC
- Authentication and Authorization
- Session and Device Tracking
- Password Policy and Security Helpers
- Audit Trail and Entity Logging
- MFA (OTP, authenticator, backup/recovery codes)

## Outputs

- Prisma, migration, seeder
- Entity, repository, service, validation
- API, hook, component, page
- Tests and documentation

## Integration Contract

Use `useIdentity()` from generated hook and avoid manual login/password/session middleware construction in feature modules.
