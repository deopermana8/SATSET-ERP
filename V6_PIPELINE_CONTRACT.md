# V6 Pipeline Contract

## Status

This document is a specification-only contract for the SATSET AI Factory V6 pipeline. It is normative. The key words MUST, MUST NOT, SHOULD, and MAY are to be interpreted as described in RFC 2119.

## 1. Input

A pipeline run MUST accept a well-defined input bundle that includes:

- run identifier
- pipeline identifier
- target artifact or work item
- declared engine manifest set
- dependency graph
- execution policy
- validation policy
- release policy

The runtime MUST reject a pipeline run whose input bundle is incomplete, malformed, or inconsistent with the declared contract.

## 2. Output

A pipeline run MUST produce a deterministic output record that includes:

- run identifier
- final status
- produced artifacts
- validation results
- release status
- failure summary, if any
- lifecycle event history

The output MUST be emitted only after the pipeline has reached a terminal state.

## 3. Pipeline Stages

The pipeline MUST be composed of the following stages, in order:

1. Compile
2. Test
3. Repair
4. Validation
5. Release

The runtime MUST treat these stages as a single governed pipeline and MUST NOT permit bypassing a required stage unless explicitly allowed by policy and documented by contract.

## 4. Compile

The Compile stage MUST prepare the target for execution and produce compile artifacts that are required by downstream stages.

Compile requirements:

- The Compile stage MUST validate that the input is structurally complete.
- The Compile stage MUST emit compile artifacts that are traceable to the run identifier.
- Compile failure MUST prevent progression to the next stage.
- Compile MUST be deterministic for the same input bundle.

## 5. Test

The Test stage MUST execute validation-oriented checks against the compiled output.

Test requirements:

- Test MUST run only after successful Compile.
- Test MUST produce test results that are stored as structured evidence.
- Test failure MUST be treated as a pipeline failure unless the Repair stage is explicitly authorized to resolve the issue.
- Test results MUST be available to the Validation stage.

## 6. Repair

The Repair stage MUST be invoked only when a prior stage has produced a recoverable defect.

Repair requirements:

- Repair MUST be deterministic and bounded.
- Repair MUST NOT modify the contract definition unless the contract explicitly allows repair-time adaptation.
- Repair MUST produce evidence of the repair action and its result.
- Repair failure MUST prevent progression to the next stage.

## 7. Validation

The Validation stage MUST verify that the outputs of prior stages satisfy the declared contract.

Validation requirements:

- Validation MUST occur after Compile, Test, and Repair, as applicable.
- Validation MUST verify input contract satisfaction, output contract satisfaction, artifact integrity, and dependency correctness.
- Validation failure MUST cause the pipeline to stop and MUST be recorded as a terminal failure unless rollback is explicitly required by policy.

## 8. Release

The Release stage MUST publish or finalize the validated output only when all prior stages have succeeded.

Release requirements:

- Release MUST be gated by successful Validation.
- Release MUST be atomic with respect to the pipeline outcome.
- Release MUST produce a release record and release artifact metadata.
- Release failure MUST be treated as a pipeline failure and MUST be visible to downstream consumers.

## 9. Retry Policy

Retry behavior MUST be explicit, bounded, and deterministic.

Retry requirements:

- Retry MUST be limited by a maximum attempt count.
- Retry MUST apply only to retryable failures.
- Retry MUST NOT be used for manifest, contract, or dependency validation failures.
- Retry intervals SHOULD follow a deterministic backoff policy.
- Retry state MUST be recorded in the pipeline history.

## 10. Artifact Flow

Artifacts MUST flow through the pipeline in a governed manner.

Artifact flow requirements:

- Each stage MUST consume and/or produce artifacts that are declared in the stage contract.
- Artifact identity MUST be preserved across stages.
- Artifacts MUST be immutable once published.
- Artifact provenance MUST be recorded for every stage transition.
- The pipeline MUST preserve artifact lineage for auditability and recovery.

## 11. Failure Policy

The pipeline MUST fail in a deterministic and observable manner.

Failure policy requirements:

- Any unrecoverable stage failure MUST stop the pipeline.
- Failure reasons MUST be classified as validation, dependency, execution, timeout, rollback, or release failure.
- The runtime MUST emit a terminal failure event.
- The pipeline MUST not silently continue after an unrecoverable failure.

## 12. Ordering

The pipeline MUST enforce ordering across stages and dependencies.

Ordering requirements:

- Stages MUST execute in the declared sequence unless a policy explicitly permits a controlled deviation.
- Dependent work MUST NOT start until prerequisite work has reached a successful terminal state.
- Ordering MUST be deterministic for the same input and dependency graph.

## 13. Scheduler Contract

The pipeline runtime MUST use a scheduler that enforces the declared ordering and dependency contract.

Scheduler requirements:

- The scheduler MUST schedule work only when dependencies are satisfied.
- The scheduler MUST preserve deterministic ordering when multiple items are eligible.
- The scheduler MUST honor declared priorities and stage sequencing.
- The scheduler MUST prevent execution of a stage that is blocked by unresolved dependencies.

## 14. Parallel Execution Rules

Parallel execution MAY be allowed when the dependency graph permits it.

Parallel rules:

- Parallel execution MUST be safe with respect to declared dependencies.
- Parallel execution MUST NOT violate artifact immutability or output publication rules.
- Parallel execution MUST be bounded by policy.
- The runtime MUST preserve deterministic results for equivalent dependency graphs.

## 15. Cancellation

A pipeline run MAY be cancelled by policy or operator action.

Cancellation requirements:

- Cancellation MUST transition the pipeline to a terminal cancelled state.
- Cancellation MUST preserve a reason code and audit trail.
- Cancellation MUST prevent further stage execution.
- Cancellation MUST be observable through lifecycle events and logs.

## 16. Rollback

Rollback MUST be available for recoverable failures that produce partial side effects.

Rollback requirements:

- Rollback MUST be idempotent.
- Rollback MUST be applied only to rollback-capable effects.
- Rollback MUST be recorded as either successful, failed, or skipped.
- Rollback failure MUST remain visible to downstream consumers and the pipeline record.

## 17. Lifecycle

The pipeline MUST follow a governed lifecycle.

Required lifecycle states:

- CREATED
- QUEUED
- RUNNING
- STAGE_SUCCEEDED
- STAGE_FAILED
- RETRYING
- ROLLBACK_PENDING
- ROLLED_BACK
- CANCELLED
- SUCCEEDED
- FAILED
- TIMED_OUT

The runtime MUST maintain lifecycle transitions in order and MUST record each transition as an event.

## 18. Normative Summary

The V6 pipeline MUST be deterministic, contract-driven, observable, recoverable, and governed by explicit stage ordering. Any implementation that violates this contract is non-compliant with the V6 specification.
