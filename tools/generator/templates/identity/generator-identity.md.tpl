# SATSET Identity Generator

## Architecture

IdentityGenerator is a core plugin (`IdentityGeneratorPlugin`) with the highest priority in the generator pipeline.
All module-level generators must resolve IdentityGenerator before generating domain-specific auth concerns.

## Folder Structure

- `modules/<module>/identity/config`
- `modules/<module>/identity/prisma`
- `modules/<module>/identity/domain`
- `modules/<module>/identity/repository`
- `modules/<module>/identity/service`
- `modules/<module>/identity/validation`
- `modules/<module>/identity/api`
- `modules/<module>/identity/hooks`
- `modules/<module>/identity/components`
- `modules/<module>/identity/pages`
- `modules/<module>/identity/tests`

## Lifecycle Login

1. Credential validation (email/username/phone).
2. Password policy and history checks.
3. Optional OTP/MFA challenge.
4. Role-permission resolution.
5. Session token issue + audit log append.

## Lifecycle Session

1. Create session with device fingerprint.
2. Validate session and refresh token.
3. Track concurrent sessions.
4. Revoke single session or logout-all-devices.
5. Session cleaner expires stale sessions.

## Lifecycle Permission

1. Resolve role assignments.
2. Build permission tree.
3. Evaluate guard/middleware policy.
4. Emit permission change audit.

## Lifecycle Password

1. Enforce strength and policy.
2. Verify password hash.
3. Track password history.
4. Apply expiration policy.
5. Handle forgot/reset/change flows.

## Extension Point

- Add custom provider for SSO and magic link.
- Add custom secret manager or encryption backend.
- Add custom session store adapter.
- Add custom permission repository implementation.

## Cara Dipakai Generator Lain

- Call `registerIdentity("<module>")` for explicit integration registration.
- Call `useIdentity("<module>", "module")` in generator composition.
- Reuse identity API/hook/service instead of building manual login/password/session logic.

## Dependency Graph

```mermaid
graph TD
  Identity[Identity]
{{#each identityModules}}  Identity --> {{this}}
{{/each}}
```

## Integrated Modules

{{#each identityModules}}- {{this}}
{{/each}}
