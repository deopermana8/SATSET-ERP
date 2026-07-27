# V6 Runtime Contracts - TASK-001

## Analysis

This task freezes the V6 runtime contract layer without changing implementation behavior. The scope is limited to specification only and MUST remain aligned with [V6_ARCHITECTURE_SPECIFICATION.md](V6_ARCHITECTURE_SPECIFICATION.md).

The current objective is to define the normative runtime contracts for:
- Runtime
- Engine
- Registry
- Scheduler
- ArtifactBus
- Lifecycle

No source code changes, no refactoring, no execution changes, and no implementation changes are permitted in this task.

## Plan

1. Freeze the runtime contract vocabulary and responsibilities.
2. Define contract-level invariants for runtime execution, engine behavior, registry discovery, scheduling, artifact propagation, and lifecycle transitions.
3. Document the contracts in a normative form suitable for future implementation work.
4. Keep the scope to specification only and avoid implementation details that would alter runtime behavior.

## Contract

### 1. Runtime Contract

#### Purpose
The runtime contract defines the authoritative execution environment for V6 work items.

#### Responsibilities
- Provide a single execution context for a request.
- Own lifecycle boundaries for startup, execution, and shutdown.
- Emit observable state transitions for the caller and supporting services.

#### Required behavior
- A runtime MUST create a stable execution context before processing work.
- A runtime MUST assign a unique execution identifier to each request.
- A runtime MUST propagate failures as structured errors with context.
- A runtime MUST publish lifecycle events for start, progress, completion, and failure.

#### Forbidden behavior
- A runtime MUST NOT rely on hidden global state for correctness.
- A runtime MUST NOT execute work without a defined context.
- A runtime MUST NOT bypass the engine, registry, scheduler, and artifact contracts.

#### Contract shape
```text
RuntimeRequest
- requestId: string
- scope: string
- context: RuntimeContext
- inputs: object

RuntimeResult
- requestId: string
- status: "queued" | "running" | "completed" | "failed" | "recovered"
- artifacts: ArtifactReference[]
- errors: ErrorRecord[]
```

#### Normative rule
A runtime SHOULD be the only orchestration entry point for a given request.

---

### 2. Engine Contract

#### Purpose
The engine contract defines the minimal interface for any executable unit in V6.

#### Responsibilities
- Execute one well-defined unit of work.
- Report success or failure with structured evidence.
- Participate in lifecycle and artifact propagation.

#### Required behavior
- An engine MUST implement a deterministic run method.
- An engine MUST accept a runtime context and produce a result or structured failure.
- An engine SHOULD expose a manifest describing capabilities, dependencies, and constraints.
- An engine MUST report its own state transitions.

#### Forbidden behavior
- An engine MUST NOT mutate state outside its declared scope.
- An engine MUST NOT assume implicit access to other engines.
- An engine MUST NOT silently swallow critical failures.

#### Contract shape
```text
EngineContract
- name: string
- version: string
- category: string
- dependencies: string[]
- capabilities: string[]
- run(context): Promise<EngineOutcome>
```

#### Normative rule
An engine MUST be composable and MUST NOT depend on hidden runtime side effects.

---

### 3. Registry Contract

#### Purpose
The registry contract defines how engines and capabilities are registered, discovered, and validated.

#### Responsibilities
- Maintain the canonical inventory of available engines.
- Resolve engines by identifier or capability.
- Validate registry integrity and dependency consistency.

#### Required behavior
- A registry MUST support registration and lookup operations.
- A registry MUST reject duplicate primary identifiers.
- A registry MUST surface validation errors for missing or inconsistent dependencies.
- A registry SHOULD expose discoverable metadata for each engine.

#### Forbidden behavior
- A registry MUST NOT allow ambiguous engine identity.
- A registry MUST NOT return an engine that has failed validation.
- A registry MUST NOT maintain multiple incompatible definitions for the same engine identity.

#### Contract shape
```text
RegistryEntry
- id: string
- name: string
- version: string
- capabilities: string[]
- dependencies: string[]
- status: "active" | "disabled" | "invalid"
```

#### Normative rule
The registry MUST be the single authoritative source for engine availability and metadata.

---

### 4. Scheduler Contract

#### Purpose
The scheduler contract defines how work is selected, ordered, and dispatched.

#### Responsibilities
- Determine which work items are ready.
- Preserve dependency ordering.
- Enforce concurrency policy and retry policy.

#### Required behavior
- A scheduler MUST evaluate dependencies before dispatching work.
- A scheduler MUST preserve a deterministic order when dependencies are satisfied.
- A scheduler MUST support retry classification and bounded retry attempts.
- A scheduler MUST report scheduling decisions and failure outcomes.

#### Forbidden behavior
- A scheduler MUST NOT dispatch work with unresolved dependencies.
- A scheduler MUST NOT violate declared concurrency limits.
- A scheduler MUST NOT silently skip work that is still pending.

#### Contract shape
```text
SchedulerDecision
- workId: string
- status: "ready" | "blocked" | "running" | "completed" | "failed"
- dependencies: string[]
- attempt: number
```

#### Normative rule
The scheduler MUST be deterministic for the same dependency graph and policy input.

---

### 5. ArtifactBus Contract

#### Purpose
The artifact bus contract defines how artifacts are published, observed, and consumed across runtime stages.

#### Responsibilities
- Transport artifact events between producers and consumers.
- Preserve artifact identity and provenance.
- Support bounded delivery semantics and observable acknowledgements.

#### Required behavior
- An artifact bus MUST associate artifacts with a stable identifier.
- An artifact bus MUST retain provenance metadata.
- An artifact bus MUST support publish and subscribe semantics.
- An artifact bus SHOULD preserve ordering for dependent consumers.

#### Forbidden behavior
- An artifact bus MUST NOT lose artifacts without recording a failure state.
- An artifact bus MUST NOT publish unvalidated artifacts as complete.
- An artifact bus MUST NOT allow ambiguous ownership of the same artifact.

#### Contract shape
```text
ArtifactReference
- id: string
- type: string
- producer: string
- version: string
- status: "pending" | "published" | "failed"
```

#### Normative rule
Artifact publication MUST be observable and traceable.

---

### 6. Lifecycle Contract

#### Purpose
The lifecycle contract defines the normative state transitions for runtime execution.

#### Responsibilities
- Define the lifecycle states for runtime, engines, scheduler activity, and artifacts.
- Ensure recoverability and auditable state transitions.
- Preserve a clear boundary between startup, execution, and teardown.

#### Required behavior
- A lifecycle MUST define initial, active, terminal, and recovery states.
- A lifecycle MUST allow explicit transition to recovery when a failure is detected.
- A lifecycle MUST preserve evidence for each transition.

#### Forbidden behavior
- A lifecycle MUST NOT permit undefined or implicit transitions.
- A lifecycle MUST NOT mark completion without terminal evidence.
- A lifecycle MUST NOT hide failed transitions.

#### Contract shape
```text
LifecycleState
- current: "initialized" | "running" | "completed" | "failed" | "recovered"
- previous: string | null
- reason: string | null
```

#### Normative rule
A lifecycle transition MUST be explicit, observable, and recoverable.

---

## Validation

Validation for TASK-001 is limited to specification validation.

### Validation checklist
- The document MUST remain aligned with [V6_ARCHITECTURE_SPECIFICATION.md](V6_ARCHITECTURE_SPECIFICATION.md).
- The document MUST avoid implementation changes.
- The document MUST define contracts, responsibilities, allowed behavior, forbidden behavior, and normative rules.
- The document MUST not introduce runtime behavior beyond contract definition.

### Validation result
PASS for specification scope.

## Next Task

TASK-001 is complete. The next task MUST remain single-subsystem and MUST not merge runtime concerns across multiple subsystems. Pending approval, the next task SHOULD focus on one contract boundary only, such as:
- Runtime contract refinement only, or
- Engine contract refinement only.
