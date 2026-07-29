# Context Contract

## Canonical Runtime State

- `context.repairLoop` is the canonical runtime state for repair loop lifecycle.
- `context.verification` stores final verification result from `VerificationEngine`.
- `context.repairSummary` stores lifecycle summary data used by reporting and validation.

## Metadata Responsibilities

- `context.metadata.repairExecutionCompleted` indicates whether execution finished without hitting step cap.
- `context.metadata` must be updated immutably using merge pattern (`{ ...context.metadata, ...patch }`).
- `context.metadata` must not be used as a duplicate source for `repairLoop` lifecycle state.

## Compatibility Note

- As of RC hardening, repair loop lifecycle state is not mirrored to `context.metadata.repairLoop`.