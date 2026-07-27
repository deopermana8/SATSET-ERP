# V6 Runtime Invariants

## Document Status

- Status: Normative
- Scope: SATSET AI Factory V6
- Authority: This document is the constitutional law of SATSET AI Factory V6.
- Rule: No implementation, migration, or extension MAY violate this document.

## 1 Runtime Invariants

### 1.1 Exactly one Runtime Entry
The system MUST have exactly one authoritative runtime entry for a given execution request.

### 1.2 Runtime MUST NOT instantiate another Runtime
A runtime MUST NOT create or invoke another runtime instance as part of normal execution.

### 1.3 Runtime MUST NOT recursively execute itself
A runtime MUST NOT recursively call itself or re-enter its own execution path.

### 1.4 Runtime lifecycle MUST be deterministic
The runtime lifecycle MUST follow a deterministic sequence of initialization, execution, observation, and termination.

### 1.5 Runtime responsibilities
The runtime MUST own execution context, lifecycle transitions, and error propagation.

### 1.6 Runtime forbidden behavior
The runtime MUST NOT perform hidden orchestration outside its declared lifecycle.

---

## 2 Engine Invariants

### 2.1 Each Engine has exactly one responsibility
Each engine MUST encapsulate exactly one primary responsibility.

### 2.2 An Engine MUST NOT execute another Engine directly
An engine MUST NOT invoke another engine as a direct execution dependency.

### 2.3 Engines communicate only through Runtime Contracts and ArtifactBus
Engine-to-engine communication MUST occur only through defined runtime contracts or artifact propagation channels.

### 2.4 Engines MUST be stateless
Engines SHOULD be stateless with respect to execution state and MUST rely on the runtime context for execution-specific state.

### 2.5 Engine forbidden behavior
An engine MUST NOT perform cross-cutting orchestration, scheduling, or release decisions.

---

## 3 Registry Invariants

### 3.1 Exactly one EngineRegistry
The system MUST have exactly one authoritative engine registry.

### 3.2 Registry MUST be immutable after bootstrap
Once bootstrap is complete, the registry MUST NOT change its core registration set without an explicit migration or reconfiguration event.

### 3.3 Duplicate registration is forbidden
Duplicate engine registration MUST be rejected.

### 3.4 Registry forbidden behavior
The registry MUST NOT maintain competing or conflicting registration views.

---

## 4 Pipeline Resolver Invariants

### 4.1 Exactly one dependency resolver
The system MUST have exactly one authoritative dependency resolver.

### 4.2 Resolver MUST NOT execute Engines
The resolver MUST NOT run engines or trigger execution work.

### 4.3 Resolver MUST NOT mutate Artifacts
The resolver MUST NOT write, overwrite, or modify artifacts.

### 4.4 Resolver MUST produce deterministic ordering
The resolver MUST produce deterministic ordering for the same dependency graph and context.

### 4.5 Resolver forbidden behavior
The resolver MUST NOT make runtime-side effects or execute compilation, repair, or release logic.

---

## 5 Scheduler Invariants

### 5.1 Exactly one Scheduler
The system MUST have exactly one authoritative scheduler.

### 5.2 Scheduler MUST only schedule
The scheduler MUST only evaluate readiness and dispatch order.

### 5.3 Scheduler MUST NOT compile
The scheduler MUST NOT perform compilation work.

### 5.4 Scheduler MUST NOT repair
The scheduler MUST NOT perform repair work.

### 5.5 Scheduler MUST NOT test
The scheduler MUST NOT perform test work.

### 5.6 Scheduler MUST support timeout contracts
The scheduler MUST support timeout and retry policy enforcement where required by the contract.

### 5.7 Scheduler forbidden behavior
The scheduler MUST NOT mutate project files, artifacts, or runtime state outside of its scheduling responsibilities.

---

## 6 ArtifactBus Invariants

### 6.1 Artifacts are immutable
Artifacts MUST be treated as immutable once published.

### 6.2 Artifacts are versioned
Every artifact MUST have a version identifier or comparable version metadata.

### 6.3 Overwrite requires explicit policy
An overwrite or replacement of an artifact MUST require explicit policy and approval.

### 6.4 Duplicate publication MUST be detected
Duplicate artifact publication MUST be detected and reported.

### 6.5 ArtifactBus forbidden behavior
The artifact bus MUST NOT silently overwrite existing artifacts or create ambiguous artifact ownership.

---

## 7 Validation Invariants

### 7.1 Validation never modifies projects
Validation MUST NOT modify source projects, generated files, or runtime state.

### 7.2 Validation executes before Release
Validation MUST execute before Release.

### 7.3 Validation MUST produce deterministic reports
Validation MUST produce deterministic, reproducible reports for the same input and policy.

### 7.4 Validation forbidden behavior
Validation MUST NOT bypass release gating or silently pass invalid results.

---

## 8 Compile Invariants

### 8.1 Compile MUST happen once per stage
Compilation MUST occur once per declared compile stage unless a policy explicitly authorizes an additional compilation.

### 8.2 Compile MUST use cache when valid
Compilation MUST use a cache when the cache is valid and policy permits reuse.

### 8.3 Compile MUST expose diagnostics
Compile MUST produce diagnostics for both success and failure states.

### 8.4 Compile forbidden behavior
Compile MUST NOT duplicate work without explicit justification.

---

## 9 Repair Invariants

### 9.1 Repair MUST have retry limits
Repair MUST enforce retries within an explicit maximum limit.

### 9.2 Repair MUST NOT execute infinitely
Repair MUST NOT run indefinitely.

### 9.3 Repair MUST preserve user code
Repair MUST preserve user-authored code and MUST NOT overwrite it without policy.

### 9.4 Repair MUST emit repair reports
Repair MUST produce a structured repair report for observability and validation.

### 9.5 Repair forbidden behavior
Repair MUST NOT loop without state and timeout control.

---

## 10 Release Invariants

### 10.1 Release requires Validation success
Release MUST NOT proceed unless Validation succeeds.

### 10.2 Release artifacts are immutable
Release artifacts MUST be immutable once published.

### 10.3 Release metadata is reproducible
Release metadata MUST be reproducible and traceable.

### 10.4 Release forbidden behavior
Release MUST NOT publish duplicates or unvalidated artifacts.

---

## 11 Logging Invariants

### 11.1 Every stage logs start/end
Every stage MUST log start and end events.

### 11.2 Every failure has traceability
Every failure MUST be traceable to a stage, request, and timestamp.

### 11.3 Logs MUST contain timestamps
Every log entry MUST include a timestamp.

### 11.4 Logging forbidden behavior
Logging MUST NOT hide the source of an error or omit context.

---

## 12 Performance Invariants

### 12.1 No duplicated pipeline
The system MUST NOT execute duplicate pipelines for the same request when one pipeline is sufficient.

### 12.2 No duplicated compile
The system MUST NOT duplicate compile work unnecessarily.

### 12.3 No duplicated test
The system MUST NOT duplicate test work unnecessarily.

### 12.4 No duplicated release
The system MUST NOT duplicate release work unnecessarily.

### 12.5 Performance forbidden behavior
Performance optimizations MUST NOT bypass correctness, validation, or auditability.

---

## 13 Security Invariants

### 13.1 No silent mutation
The system MUST NOT silently modify project files, system files, or runtime state.

### 13.2 No hidden filesystem writes
The system MUST NOT perform hidden or undocumented filesystem writes.

### 13.3 No execution outside Runtime
No operational action MUST bypass the runtime boundary.

### 13.4 Security forbidden behavior
The system MUST NOT execute untrusted or unauthorized actions without policy and validation.

---

## 14 Compatibility Invariants

### 14.1 Backward compatibility until migration completes
Backward compatibility MUST be preserved until migration is complete.

### 14.2 Legacy adapters are temporary
Legacy adapters MUST be temporary and explicitly bounded.

### 14.3 Deprecated APIs MUST be documented
Deprecated APIs MUST be documented and clearly marked.

### 14.4 Compatibility forbidden behavior
Compatibility layers MUST NOT become permanent hidden bypasses of the V6 contract.

---

## 15 Migration Invariants

### 15.1 Every migration is reversible
Every migration MUST be reversible or rollback-capable.

### 15.2 Every migration has rollback
Every migration MUST have a documented rollback path.

### 15.3 Every migration has validation
Every migration MUST include validation before, during, and after transition.

### 15.4 Migration forbidden behavior
Migration MUST NOT introduce irreversible behavior without validation and rollback readiness.

---

## 16 Forbidden Behaviors

The following architectural behaviors are forbidden:

- Nested Runtime
- Multiple Registries
- Multiple Scheduler
- Recursive Pipeline
- Engine calling Engine
- Compile loops
- Infinite Repair
- Artifact overwrite
- Duplicate Release
- Hidden state
- Global mutable singleton
- Filesystem mutation outside Runtime
- Silent validation pass
- Release without validation
- Execution without lifecycle traceability
- Duplicate publication without detection
- Runtime re-entry

---

## 17 Architecture Acceptance Rules

An implementation is acceptable only if it satisfies all of the following:

1. The implementation MUST preserve the single-runtime execution model.
2. The implementation MUST preserve a single registry and single scheduler model.
3. The implementation MUST preserve deterministic ordering and dependency resolution.
4. The implementation MUST keep engine responsibilities isolated.
5. The implementation MUST preserve validation-before-release behavior.
6. The implementation MUST preserve artifact immutability and versioning.
7. The implementation MUST preserve traceability for failures and lifecycle transitions.
8. The implementation MUST avoid duplicate compile, test, pipeline, or release work.
9. The implementation MUST remain compatible until migration completes.
10. The implementation MUST remain reversible and auditable.

---

## 18 Architecture Review Checklist

The following checklist MUST be used for future pull requests and architecture reviews:

- [ ] Exactly one runtime entry exists.
- [ ] No runtime re-entry or recursion exists.
- [ ] Exactly one registry exists.
- [ ] Exactly one scheduler exists.
- [ ] The resolver does not execute engines.
- [ ] Engines do not call other engines directly.
- [ ] Artifacts are versioned and immutable.
- [ ] Validation occurs before release.
- [ ] Compile occurs once per stage.
- [ ] Repair has retry limits and reporting.
- [ ] Logs contain timestamps and traceability.
- [ ] No duplicate pipeline or release is introduced.
- [ ] Migration remains reversible.
- [ ] Backward compatibility is documented.

---

## 19 Compliance Matrix

| Invariant | Runtime | Registry | Resolver | Scheduler | Engine | ArtifactBus | Validation | Compile | Repair | Release |
|---|---|---|---|---|---|---|---|---|---|---|
| Exactly one runtime entry | Yes |  |  |  |  |  |  |  |  |  |
| Runtime must not instantiate another runtime | Yes |  |  |  |  |  |  |  |  |  |
| Exactly one registry |  | Yes |  |  |  |  |  |  |  |  |
| Exactly one scheduler |  |  |  | Yes |  |  |  |  |  |  |
| Resolver is deterministic |  |  | Yes |  |  |  |  |  |  |  |
| Engines are stateless and isolated |  |  |  |  | Yes |  |  |  |  |  |
| Artifacts are immutable and versioned |  |  |  |  |  | Yes |  |  |  |  |
| Validation precedes release |  |  |  |  |  |  | Yes |  |  | Yes |
| Compile happens once per stage |  |  |  |  |  |  |  | Yes |  |  |
| Repair has retry limits and reporting |  |  |  |  |  |  |  |  | Yes |  |
| Release is reproducible and gated |  |  |  |  |  |  |  |  |  | Yes |

---

## 20 Conclusion

This document is the constitutional law of SATSET AI Factory V6. No implementation may violate these invariants. Any implementation, migration, or extension MUST remain compliant with this document.
