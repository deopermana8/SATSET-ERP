# SATSET ERP Admin Frontend Architecture

## Scope

This document defines the Sprint 9 enterprise frontend architecture refactor for the admin app. The goal is modular, reusable, scalable, and testable frontend code without backend or API contract changes.

## Folder Structure

```text
apps/admin/src/
  app/
    app.ts            # HTML renderer (single server response template)
    bootstrap.ts      # HTTP server bootstrap and environment binding
    router.ts         # Frontend route contracts and route helpers
    state.ts          # App-level state composition
  components/
    dashboard/        # KPI cards, summary panels, activity blocks
    datagrid/         # Grid shell, row rendering, filters, pagination wiring
    forms/            # Entity forms, validation UI, action groups
    layout/           # Topbar, sidebar, shell regions
    widgets/          # Reusable widgets (toasts, badges, mini-charts)
  services/
    api.ts            # Fetch wrappers and request orchestration
    export.ts         # CSV/XLS export utilities
    notification.ts   # Toast service facade
    storage.ts        # localStorage persistence adapter
    theme.ts          # Light/dark theme service
  state/
    dashboard.ts      # Dashboard-focused state
    table.ts          # Data grid state
    form.ts           # Form and validation state
    notification.ts   # Notification queue state
    theme.ts          # Theme preference state
  styles/
    dashboard.ts      # Dashboard style fragments
    datagrid.ts       # Grid style fragments
    forms.ts          # Form style fragments
    layout.ts         # Layout style fragments
  types/
    dashboard.ts      # Dashboard domain types
    table.ts          # Data grid types
    form.ts           # Form value and validation types
    notification.ts   # Notification payload types
  utils/
    animation.ts      # Animation scheduling helpers
    debounce.ts       # Debounce helper
    dom.ts            # DOM access helpers
    keyboard.ts       # Keyboard shortcut helpers
    render.ts         # Render/mount helper
    throttle.ts       # Throttle helper
```

## Bootstrap And Rendering Flow

1. `index.ts` only starts the app by calling `bootstrapAdminServer()`.
2. `app/bootstrap.ts` reads `ADMIN_PORT` and `API_URL`, starts Node HTTP server.
3. Server responds with `renderAdminHtml(apiUrl)` from `app/app.ts`.
4. Client script in rendered HTML initializes modules, binds events, and hydrates UI state.

## Component Hierarchy

1. Layout components define shell and regions.
2. Feature components (`dashboard`, `datagrid`, `forms`) render inside layout regions.
3. Widget components augment features with reusable UI blocks.
4. Design system tokens/components remain shared foundation for style and behavior consistency.

## State Flow

1. User event triggers component handler.
2. Handler updates feature state module in `state/*`.
3. Derived view model is computed from state.
4. Render utility updates DOM with minimal targeted changes.
5. Persistence service stores required state slices (theme, preferences, recent filters).

## Service Layer Contracts

1. `services/api.ts`: Request execution and response normalization.
2. `services/export.ts`: Stateless data export (CSV/XLS).
3. `services/notification.ts`: UI notification trigger abstraction.
4. `services/storage.ts`: Browser persistence abstraction.
5. `services/theme.ts`: Theme read/write and root class toggling.

All services are side-effect boundaries. Components and state modules consume services through explicit function calls to keep logic testable.

## Coding Conventions

1. Keep `index.ts` bootstrap-only and minimal.
2. Prefer pure functions in `state/*`, `types/*`, and `utils/*`.
3. Keep side effects in `services/*` and app bootstrap.
4. Use domain-specific files instead of generic large utility files.
5. Keep each module focused on one responsibility.
6. Avoid direct cross-feature imports when shared abstractions can live in `types` or `utils`.

## Testability Strategy

1. Unit test state reducers/helpers independently from DOM.
2. Unit test utility modules (`debounce`, `throttle`, `keyboard`) as pure behavior.
3. Mock service modules when validating component behavior.
4. Run integration checks through build/lint gates and render smoke tests.

## Scalability Guide For Future ERP Modules

When adding a new module (for example inventory, accounting, HR):

1. Add domain types in `types/<module>.ts`.
2. Add state in `state/<module>.ts` with clear selectors.
3. Add API/persistence integrations in `services/*`.
4. Add feature UI under `components/<module>/`.
5. Add style fragments in `styles/<module>.ts`.
6. Wire feature initialization in `app/app.ts` through isolated bootstrap functions.

This keeps growth horizontal (by module) instead of vertical monolith expansion.