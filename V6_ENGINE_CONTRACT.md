# V6 Engine Contract

## Status

This document is a specification-only contract for engine behavior in the SATSET AI Factory V6 runtime. It is normative. The key words MUST, MUST NOT, SHOULD, and MAY are to be interpreted as described in RFC 2119.

## 1. Engine Lifecycle

An engine MUST follow a deterministic lifecycle from registration through completion, failure, retry, rollback, or cancellation.

The lifecycle MUST include the following phases:

1. Registered
2. Ready
3. Running
4. Succeeded
5. Failed
6. Retrying
7. Rollback Pending
8. Rolled Back
9. Cancelled
10. Timed Out

An engine MUST transition through the lifecycle in a strictly ordered manner. An engine MUST NOT skip from a terminal state back to a non-terminal state except through an explicitly declared retry or rollback path.

## 2. Engine States

Each engine instance MUST be represented by a single state at any given time. The following states are normative:

- NEW: The engine instance has been created but is not yet registered.
- REGISTERED: The engine has been accepted by the runtime registry.
- READY: The engine has passed pre-execution validation and is eligible to run.
- RUNNING: The engine is actively executing.
- SUCCEEDED: The engine completed successfully and produced all required outputs.
- FAILED: The engine completed unsuccessfully and produced no valid success result.
- RETRYING: The engine is waiting to retry after a retryable error.
- ROLLBACK_PENDING: The engine has failed and rollback has been requested.
- ROLLED_BACK: The engine has completed rollback successfully.
- CANCELLED: The engine was cancelled before completion.
- TIMED_OUT: The engine exceeded its allowed execution time.

The runtime MUST record the state transition history for each engine instance.

## 3. Engine Manifest

Every engine MUST declare a manifest that is validated before execution.

The manifest MUST include:

- engine identity
- engine version
- engine type or category
- supported runtime contract version
- declared inputs
- declared outputs
- declared dependencies
- priority
- timeout configuration
- retry configuration
- rollback policy
- artifact requirements
- logging requirements
- validation requirements

The manifest MUST be machine-readable and MUST be versioned. The runtime MUST reject an engine whose manifest is missing required fields or violates the declared schema.

## 4. Engine Dependency Rules

An engine MUST declare all dependencies explicitly in its manifest. Implicit dependencies MUST NOT be assumed.

Dependency rules:

- An engine MUST NOT start until all declared dependencies have reached a successful state.
- Dependency cycles MUST NOT be permitted.
- A dependency MUST resolve to a single engine instance or artifact version.
- An engine MUST NOT consume outputs that are not declared in its manifest.
- A dependency that fails MUST prevent the dependent engine from starting.
- The runtime SHOULD evaluate dependencies before scheduling execution.

## 5. Engine Priority

Each engine MUST declare a priority value. Priority MUST be interpreted as a scheduling hint and MUST NOT override dependency ordering.

Priority rules:

- Higher numeric priority MUST be scheduled earlier when dependencies are satisfied.
- Equal priorities SHOULD be resolved by deterministic ordering.
- Priority MUST be expressed in a stable and comparable form.
- The runtime MUST preserve deterministic scheduling when priorities are equal.

## 6. Engine Timeout

Each engine MUST declare a timeout value.

Timeout rules:

- Timeout MUST be expressed in milliseconds.
- Timeout MUST be greater than zero.
- The runtime MUST enforce the timeout for each executing engine instance.
- If the timeout is reached, the engine MUST transition to TIMED_OUT.
- A timed-out engine MUST be treated as a failed execution unless a retry policy explicitly allows recovery.
- The runtime SHOULD record timeout details in logs, metrics, and artifacts.

## 7. Engine Retry

An engine MAY declare retry behavior. If retry behavior is declared, it MUST be deterministic and bounded.

Retry rules:

- Retry MUST be limited by a maximum attempt count.
- Retry MUST be applied only to retryable failure classes.
- Retry intervals SHOULD follow a deterministic backoff policy.
- The runtime MUST increment attempt counters on every retry.
- If the maximum retry count is exceeded, the engine MUST transition to FAILED.
- Retry MUST NOT be used to mask invalid manifests or invalid dependency declarations.

## 8. Engine Rollback

An engine MAY declare rollback behavior. If rollback is required, the rollback contract MUST be deterministic and idempotent.

Rollback rules:

- A rollback MUST be initiated when the engine or any required downstream dependency fails after partial execution.
- Rollback MUST be performed only for side effects that are declared as rollback-capable.
- Rollback MUST be idempotent and MUST NOT produce conflicting state.
- The runtime MUST record whether rollback succeeded, failed, or was skipped.
- If rollback cannot be completed, the engine MUST remain in a failure state that is visible to the runtime and downstream consumers.

## 9. Engine Outputs

An engine MUST produce outputs that conform to the declared manifest contract.

Output rules:

- Each output MUST have a stable name and declared type.
- Outputs MUST be emitted only after successful execution.
- Outputs MUST be immutable once published.
- An engine MUST NOT publish outputs if validation fails.
- Output publication SHOULD be atomic with respect to the engine completion event.

## 10. Engine Artifacts

An engine MAY produce artifacts as evidence of execution, validation, or recovery.

Artifact rules:

- Artifacts MUST be associated with a specific engine instance and run identifier.
- Artifacts MUST be versioned or otherwise uniquely identifiable.
- Artifact metadata MUST include provenance and content identity.
- The runtime MUST preserve artifact records for auditability and recovery.
- Artifact storage MUST be deterministic and MUST support validation of integrity.

## 11. Engine Logging

An engine MUST emit structured logs that can be correlated with runtime events.

Logging rules:

- Logs MUST include engine identifier, run identifier, timestamp, state, and event type.
- Logs MUST be emitted in a structured format.
- Logs MUST distinguish lifecycle events, validation events, execution events, retry events, rollback events, and completion events.
- The runtime SHOULD preserve logs for post-execution analysis and diagnosis.

## 12. Engine Events

The runtime MUST emit lifecycle and contract events for each engine instance.

Normative events:

- ENGINE_REGISTERED
- ENGINE_READY
- ENGINE_STARTED
- ENGINE_SUCCEEDED
- ENGINE_FAILED
- ENGINE_RETRYING
- ENGINE_ROLLBACK_PENDING
- ENGINE_ROLLED_BACK
- ENGINE_CANCELLED
- ENGINE_TIMED_OUT
- ENGINE_VALIDATED

Each event MUST be emitted in a deterministic order relative to the engine state transition.

## 13. Engine Metrics

The runtime MUST collect metrics for each engine instance and for the engine set as a whole.

Required metrics:

- execution count
- success count
- failure count
- retry count
- timeout count
- rollback count
- execution duration
- queue wait duration

Metrics MUST be recorded in a consistent format and SHOULD be available for runtime observability and post-run analysis.

## 14. Engine Validation

Every engine MUST undergo validation before execution and after completion.

Validation rules:

- Manifest validation MUST occur before scheduling.
- Dependency validation MUST occur before execution.
- Output contract validation MUST occur before publication.
- Artifact validation MUST occur before an artifact is considered complete.
- The runtime MUST reject execution when any required validation fails.
- Validation failures MUST be recorded as structured events and MUST be observable in logs and metrics.

## 15. Normative Summary

An engine contract in V6 MUST be deterministic, lifecycle-aware, recoverable, and observable. The runtime MUST enforce the contract consistently across all engines. An implementation that deviates from this contract MUST be considered non-compliant with the V6 specification.
