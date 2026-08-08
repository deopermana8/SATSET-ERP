# DST Generator (Sprint 11.1 Foundation)

## Objective
Scaffold the standalone DST engine package as workspace foundation without business module implementation.

## Scope
- TypeScript + ESM package setup.
- CLI/parser/generator/template/type/util source folders.
- Template and schema folders for future expansion.
- No Customer CRUD and no business logic in this sprint.

## Folder Layout
- src/cli
- src/parser
- src/generators
- src/templates
- src/types
- src/utils
- src/index.ts
- templates/
- schemas/

## Scripts
- `npm run build --workspace @satset/blueprint-dst`
- `npm run clean --workspace @satset/blueprint-dst`

## Roadmap
1. Sprint 11.2: Define schema contracts and parser interfaces.
2. Sprint 11.3: Add template resolution pipeline and generator orchestration.
3. Sprint 11.4: Add CLI command surface and config loading.
4. Sprint 11.5: Add module generation features (outside Sprint 11.1).

## Non-Goals
- No CRUD implementation.
- No module generation for Customer.
- No changes to existing apps behavior.
