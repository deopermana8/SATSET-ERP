# Release Checklist

Date: 2026-07-29

## Compile
- [x] `pnpm exec tsc --noEmit` passed.

## Test
- [x] `pnpm test` passed.

## Coverage
- [x] Coverage artifacts generated (`pnpm run coverage`).
- [ ] Coverage thresholds unmet (totals below hard gate in current report).

## Benchmark
- [x] Benchmark artifacts generated (`pnpm run benchmark`, `performance-phase6.json`).

## Security
- [x] Static review completed and findings recorded in `SECURITY_REVIEW.md`.

## Documentation
- [x] `CHANGELOG.md` updated.
- [x] `RELEASE_NOTES.md` updated.
- [x] `README.md` for SATSET-BUG created and synchronized.
- [x] Architecture and runtime contract docs synchronized.

## Known Issues
- `eslint` executable unavailable in current repository runtime.
- `prettier` executable unavailable in current repository runtime.
- Coverage summary does not instrument the six RC-critical modules requested for per-module coverage table.
- Security findings remain open by RC policy (no direct fix in this phase).

## Rollback Plan
- Keep release at prior RC (`v6.0.0-rc1`) if `v6.0.0-rc2` validation blockers remain open.
- Revert documentation-only RC hardening artifacts if release scope must be narrowed.
- Execute post-RC security remediation in isolated patch wave with full regression rerun.