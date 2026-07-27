# Release Notes

## v6.0.0-rc1

### Fixed Bugs
- RepairLoopEngine no longer depends on verification state to decide whether the repair loop should stop.
- RepairLifecycle now distinguishes complete execution from incomplete execution when repair steps stop because the configured max-step limit is reached.

### Regression Tests
- Added regression coverage for the repair-loop orchestration issue.
- Added regression coverage for the max-steps incomplete execution case.
- Verified the following regression tests passed:
  - tests/regression-bug1-repair-loop-no-verification.test.ts
  - tests/regression-bug2-maxsteps-incomplete.test.ts

### Compatibility
- No breaking public API changes were observed in the reviewed production files.
- The new lifecycle parameter is optional and defaults to the existing behavior.

### Breaking Changes
- None identified from the verified repository state.

### Known Limitations
- The repository still contains an unrelated timestamp-only modification in tasks.json that should be reviewed before committing.
- A lint script is not defined in package.json, so lint was not executable in this repository state.
