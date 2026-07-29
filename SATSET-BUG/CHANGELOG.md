# Changelog

## v6.0.0-rc2 - 2026-07-29

### Changed
- Completed release candidate hardening validation gates for typecheck and full test suite.
- Generated RC evidence artifacts for coverage, benchmark, memory profile, and stress simulation.
- Added explicit RC operational contracts for context, repair loop, and verification.

### Added
- Added SECURITY_REVIEW.md with evidence-based findings only (no runtime behavior changes).
- Added RELEASE_CHECKLIST.md and RC_VALIDATION_REPORT.md for go/no-go decision support.

### Notes
- No new feature was introduced in this RC hardening phase.
- No public API change was introduced in this RC hardening phase.

## v6.0.0-rc1 - 2026-07-27

### Fixed
- Fixed RepairLoopEngine orchestration so it no longer depends on verification state being present before the repair loop decides to stop.
- Fixed RepairLifecycle status handling so incomplete execution caused by max-step limits is reported as PARTIALLY_RESOLVED instead of RESOLVED.

### Added
- Added regression tests covering the repair-loop orchestration issue and the max-steps incomplete execution case.
- Added an end-to-end regression test covering the doctor pipeline through reporting.

### Fixed
- Removed the remaining dual source of truth for repair loop state so `context.repairLoop` is the canonical runtime source.
