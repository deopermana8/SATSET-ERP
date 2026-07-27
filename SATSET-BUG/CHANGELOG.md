# Changelog

## v6.0.0-rc1 - 2026-07-27

### Fixed
- Fixed RepairLoopEngine orchestration so it no longer depends on verification state being present before the repair loop decides to stop.
- Fixed RepairLifecycle status handling so incomplete execution caused by max-step limits is reported as PARTIALLY_RESOLVED instead of RESOLVED.

### Added
- Added regression tests covering the repair-loop orchestration issue and the max-steps incomplete execution case.
