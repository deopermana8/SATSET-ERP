# Repair Loop Contract

## Writers

- `RepairLoopEngine` writes `context.repairLoop`.
- `AutoRepairEngine` writes `context.repairLoop` and `context.metadata.repairExecutionCompleted`.

## Readers

- `VerificationEngine` reads `context.repairLoop` for lifecycle consistency checks.
- `ConsoleReporter` reads `context.repairLoop` for runtime reporting output.
- `ProductionValidator` reads `projectContext.repairLoop` for repair success status.

## Invariants

- `attempt` is a non-negative integer.
- `completed` is boolean.
- `reason` is the lifecycle reason used to derive repair status.
- No runtime decision depends on `context.metadata.repairLoop`.