# V6 Runtime Compatibility Matrix

## Purpose

This document provides a specification-only compatibility matrix for the V6 runtime architecture. It classifies each runtime component according to its current role, future role, migration phase, compatibility posture, removal conditions, risks, and dependencies.

This document MUST be used as a reference for future implementation work and MUST NOT be interpreted as an implementation change.

## Classification Legend

- Primary: Core runtime component that SHOULD remain authoritative in V6.
- Compatibility Layer: Component that exists to preserve behavior during migration.
- Deprecated: Component that SHOULD be phased out once the replacement is available.
- Replace Later: Component that is not yet replaced but is expected to be superseded in a later phase.
- Remove Later: Component that is expected to be removed after migration and validation are complete.

## Runtime Component Matrix

| Component | Classification | Current Owner | Future Owner | Migration Phase | Backward Compatibility | Removal Conditions | Risks | Dependencies |
|---|---|---|---|---|---|---|---|---|
| Doctor | Primary | Doctor runtime layer | V6 Runtime Orchestrator | Phase 1 | MUST preserve existing request entry behavior while adopting the V6 runtime contract | Remove only when the single runtime entry path is fully validated and all callers are migrated | Risk of hidden orchestration coupling and duplicate lifecycle handling | Runtime contract, Lifecycle contract, Engine contract |
| FactoryRuntime | Compatibility Layer | Runtime layer | V6 Runtime Orchestrator | Phase 2 | SHOULD remain compatible with current execution semantics during migration | Remove when the unified runtime path fully replaces its execution responsibilities | Risk of duplicated execution flow and inconsistent state reporting | Runtime contract, Scheduler contract, ArtifactBus contract |
| DoctorOrchestrator | Replace Later | Doctor orchestration layer | Unified Pipeline Stage Coordinator | Phase 3 | SHOULD remain available as a compatibility wrapper while the unified pipeline model is introduced | Remove when the unified pipeline can cover the same responsibilities without nested orchestration | Risk of duplicate execution branches and ambiguous ownership | Runtime contract, Engine contract, Lifecycle contract |
| EngineRegistry | Primary | Runtime/Doctor registry responsibilities | Unified Registry | Phase 1 | MUST preserve engine discovery semantics during migration | Remove only after all engine lookups are routed through the unified registry contract | Risk of split registry state and inconsistent engine lookup | Engine contract, Registry contract, Lifecycle contract |
| PipelineResolver | Primary | Runtime pipeline resolution | Unified Pipeline Resolver | Phase 2 | MUST retain dependency ordering semantics for existing pipelines | Remove once dependency resolution is fully represented by the V6 pipeline contract | Risk of unresolved dependency ambiguity and ordering regressions | Engine contract, Registry contract, Scheduler contract |
| ExecutionScheduler | Primary | Runtime scheduling layer | Unified Scheduler | Phase 2 | MUST preserve ordered dispatch semantics for existing execution flows | Remove once all dispatch is governed by the unified scheduler contract | Risk of nondeterministic execution and retry policy divergence | Runtime contract, Scheduler contract, Lifecycle contract |
| ArtifactBus | Primary | Runtime artifact propagation | Unified ArtifactBus | Phase 2 | MUST preserve artifact publication and downstream visibility | Remove once artifact delivery is fully governed by the V6 artifact contract | Risk of dropped events and ambiguous artifact ownership | ArtifactBus contract, Lifecycle contract |
| RepairCoordinator | Compatibility Layer | Doctor repair orchestration | Unified Repair Pipeline | Phase 3 | SHOULD preserve repair behavior while the repair flow is normalized | Remove once repair is handled through the unified repair pipeline | Risk of repair loops duplicating compile or test work | Runtime contract, Engine contract, Lifecycle contract |
| CompileEngine | Compatibility Layer | Doctor/repair compile execution | Unified Compile Stage | Phase 3 | MUST preserve compile semantics during migration | Remove once compile execution is fully routed through the unified compile pipeline | Risk of output drift and duplicate compile runs | Engine contract, ArtifactBus contract, Lifecycle contract |
| Validation | Primary | Validation workflow | Unified Validation Pipeline | Phase 3 | MUST preserve validation behavior and evidence generation | Remove once validation is fully represented by the V6 validation pipeline | Risk of validation bypass and inconsistent evidence | Runtime contract, ArtifactBus contract, Lifecycle contract |
| Release | Primary | Release workflow | Unified Release Pipeline | Phase 4 | MUST preserve release semantics, artifact publication, and evidence capture | Remove only when the unified release pipeline is fully authoritative | Risk of premature release and missing provenance | ArtifactBus contract, Validation contract, Lifecycle contract |

## Component Notes

### Doctor
The Doctor component remains a primary entry point for orchestration and should be preserved as a contract-facing interface during migration. It SHOULD remain responsible for request intake and context initialization until the unified runtime entry path is fully validated.

### FactoryRuntime
FactoryRuntime is classified as a compatibility layer because it currently provides execution flow behavior that may overlap with the V6 runtime contract. It SHOULD remain functional during migration but MUST NOT become the authoritative runtime path once the unified runtime contract is established.

### DoctorOrchestrator
DoctorOrchestrator is classified as Replace Later because it represents nested orchestration that SHOULD eventually be replaced by a unified pipeline model. It MUST remain observable during migration but SHOULD be reduced in scope over time.

### EngineRegistry
EngineRegistry is classified as Primary because registry integrity and engine discoverability are foundational to V6 runtime correctness. It MUST remain a central part of the architecture and should be consolidated rather than duplicated.

### PipelineResolver
PipelineResolver is classified as Primary because dependency-aware resolution is essential to deterministic execution. It MUST continue to serve the unified pipeline model during migration.

### ExecutionScheduler
ExecutionScheduler is classified as Primary because dispatch and ordering are central to runtime behavior. It MUST remain deterministic and policy-aware.

### ArtifactBus
ArtifactBus is classified as Primary because artifact propagation is a cross-cutting concern that must remain observable, traceable, and governed by contract.

### RepairCoordinator
RepairCoordinator is classified as Compatibility Layer because the V6 architecture expects repair behavior to be normalized into a unified repair pipeline. It SHOULD be preserved until that replacement is validated.

### CompileEngine
CompileEngine is classified as Compatibility Layer because compile execution should eventually flow through the unified compile stage rather than through local repair loops.

### Validation
Validation is classified as Primary because validation is a first-class lifecycle stage in V6 and MUST remain authoritative.

### Release
Release is classified as Primary because release is a governed pipeline stage and MUST remain under explicit contract control.

## Migration Guidance

- Migration SHOULD proceed in phases and SHOULD preserve the current behavior of each component until the replacement contract is validated.
- Components classified as Primary MUST remain under contract governance throughout migration.
- Components classified as Compatibility Layer or Replace Later MUST not be removed until replacement behavior is proven.
- Components classified as Remove Later MUST be removed only after traceability, validation, and compatibility checks are complete.

## Validation

This document is validated as a specification-only artifact. It does not modify implementation, runtime behavior, or code paths.

## Stop Condition

The document is complete and no further action is required for this task.
