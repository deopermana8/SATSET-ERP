# Release Notes

## v6.0.0-rc2

### RC Hardening Scope
- Release candidate hardening only.
- No feature additions.
- No architecture refactor.
- No public API changes.

### Quality Gate
- Typecheck: pass (`pnpm exec tsc --noEmit`).
- Full tests: pass (`pnpm test`).
- Eslint command unavailable in current repository runtime (`pnpm exec eslint .` returned command not found).
- Prettier command unavailable in current repository runtime (`pnpm exec prettier --check .` returned command not found).

### Coverage
- Coverage generated via `pnpm run coverage`.
- Totals: statements 85.76%, branches 76.00%, functions 81.81%, lines 85.76%.
- Target module-level coverage for core RC modules is not instrumented in current c8 summary artifact and is reported as N/A in RC validation.

### Performance and Stress
- Stage timing evidence captured in `performance-phase6.json`.
- Stress simulation (100 projects, 500 issues, repeated repair loops) completed with no crash, no timeout, and no deadlock.

### Security Review
- Findings documented in `SECURITY_REVIEW.md`.
- No security fix was applied in RC hardening phase per process rule.

### Release Decision
- Final recommendation is documented in `RC_VALIDATION_REPORT.md`.

## v6.0.0-rc1

### Fixed Bugs
- RepairLoopEngine no longer depends on verification state to decide whether the repair loop should stop.
- RepairLifecycle now distinguishes complete execution from incomplete execution when repair steps stop because the configured max-step limit is reached.

### Regression Tests
- Added regression coverage for the repair-loop orchestration issue.
- Added regression coverage for the max-steps incomplete execution case.
- Added end-to-end coverage for the doctor pipeline through reporting.
- Verified the following regression tests passed:
  - tests/regression-bug1-repair-loop-no-verification.test.ts
  - tests/regression-bug2-maxsteps-incomplete.test.ts
  - tests/doctor-end-to-end-pipeline.test.ts

### Compatibility
- No breaking public API changes were observed in the reviewed production files.
- The new lifecycle parameter is optional and defaults to the existing behavior.
- Repair loop state now flows from `context.repairLoop` only; metadata no longer carries a duplicate repair-loop snapshot.

### Breaking Changes
- None identified from the verified repository state.

### Known Limitations
- The repository still contains an unrelated timestamp-only modification in tasks.json that should be reviewed before committing.
- A lint script is not defined in package.json, so lint was not executable in this repository state.
