# Verification Contract

## Inputs

- Current issue set (`context.getIssues()`).
- Diagnosis (`context.diagnosis`).
- Root causes (`context.rootCauses`).
- Repair plans (`context.repairPlans`).
- Repair lifecycle state (`context.repairLoop`).
- Repair summary (`context.repairSummary`).

## Outputs

- `context.verification` with:
  - `passed`
  - `checks`
  - `reasons`

## Health Coupling

- `VerificationEngine` runs `HealthEngine` after verification to keep health score aligned with verification state.

## Decision Basis

- Verification outcome is computed from context state and summary consistency.
- Verification does not hydrate runtime repair lifecycle from metadata snapshot.