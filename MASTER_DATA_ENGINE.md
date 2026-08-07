# MASTER DATA ENGINE

## Architecture

The SATSET ERP admin app now uses a catalog-driven master-data engine under [apps/admin/src/modules/master](apps/admin/src/modules/master).

The engine is split into clear layers:

- `crud/` repository, service, controller, state, and type abstractions
- `table/` filtering, sorting, and pagination helpers
- `filters/` reusable filter state and persistence helpers
- `form/` draft, undo, redo, and dirty-state helpers
- `toolbar/` action toolbar composition
- `actions/` row and bulk action composition
- `bulk/` bulk delete and bulk export helpers
- `export/` CSV, Excel, JSON, and print export orchestration
- `services/` API and cache-facing helpers
- `validators/` shared record validation

## CRUD Flow

1. The admin shell resolves a module from the master catalog.
2. A repository uses the shared API adapter to reach `/erp-wisata/{entity}`.
3. The service and controller expose a consistent CRUD surface.
4. The table and form layers consume the same entity state and cache.

## Repository Layer

Repository access is centralized in [apps/admin/src/modules/master/crud/repository.ts](apps/admin/src/modules/master/crud/repository.ts).

The repository keeps transport logic in one place so list, create, update, and delete follow the same API contract.

## State Flow

State is intentionally shared:

- table state stores paging, search, selection, and sort stack
- form state stores edit target, dirty flag, draft, and undo or redo history
- cache state keeps the latest entity rows in memory for reuse across views

## Validation Flow

Validation is field-driven and uses the module schema from the master catalog.

Required fields are checked by [apps/admin/src/modules/master/validators/masterValidator.ts](apps/admin/src/modules/master/validators/masterValidator.ts) before a save operation proceeds.

## Import Flow

Import support is designed around CSV preview and row validation. The engine exposes the extension points now, while the admin app can map them to module-specific parsers and duplicate detection rules without changing the CRUD contract.

## Export Flow

Export is centralized in [apps/admin/src/modules/master/export/exportEngine.ts](apps/admin/src/modules/master/export/exportEngine.ts).

Supported formats:

- CSV
- Excel
- JSON
- Print

## Module Coverage

The current catalog includes:

- Destinasi
- Hotel
- Guide
- Kendaraan
- Paket Wisata
- Customer
- Vendor
- Supplier

## Notes

The admin shell keeps the existing SATSET visual language and only swaps the data source and CRUD wiring to the reusable engine.