# V6 Artifact Specification

## Status

This document is a specification-only artifact contract for the SATSET AI Factory V6 runtime. It is normative. The key words MUST, MUST NOT, SHOULD, and MAY are to be interpreted as described in RFC 2119.

## 1. Artifact ID

Every artifact MUST have a unique artifact identifier. The artifact identifier MUST be stable within the scope of a run and MUST be unique across the runtime namespace.

The artifact identifier MUST be represented in a machine-readable form and MUST be associated with the artifact metadata record.

## 2. Version

Every artifact MUST have a version. The version MUST be explicit and MUST be monotonic for updates to the same logical artifact.

The runtime MUST preserve the relationship between artifact identity and artifact version. A new version MUST NOT overwrite an existing version unless the overwrite is explicitly permitted by policy.

## 3. Hash

Every artifact MUST have a content hash. The hash MUST be computed over the artifact payload and MUST be recorded in the artifact metadata.

The runtime MUST validate the hash before the artifact is considered complete. A hash mismatch MUST be treated as an integrity failure.

## 4. Publisher

Every artifact MUST declare a publisher identity. The publisher MUST be the component or actor responsible for creating or releasing the artifact.

The runtime MUST record the publisher identity in metadata. A publisher MUST NOT publish an artifact without declaring its identity.

## 5. Consumer

Every artifact MUST declare one or more consumer identities or consumer roles. The consumer declaration MUST identify who is authorized to read or depend on the artifact.

The runtime MUST preserve consumer metadata for validation, tracing, and access control.

## 6. Ownership

Every artifact MUST have an ownership record. Ownership MUST identify the accountable authority for the artifact lifecycle, including creation, update, retention, and deletion.

Ownership MUST be explicit and MUST remain associated with the artifact metadata throughout its lifecycle.

## 7. Retention

Every artifact MUST have a retention policy. The retention policy MUST define how long the artifact MUST be preserved after creation, publication, or completion.

The runtime MUST enforce the retention policy. An artifact MUST NOT be removed before the retention period expires unless an explicit deletion policy or governance rule permits removal.

## 8. Garbage Collection

Garbage collection MUST be governed by retention, ownership, and dependency state.

The runtime MUST NOT delete an artifact that is still referenced by a valid dependency graph or active workflow. An artifact that is eligible for garbage collection MUST be removed only after its retention period has expired and all ownership and dependency constraints have been satisfied.

## 9. Deduplication

The runtime SHOULD deduplicate artifacts when the artifact identity, version, and hash are equivalent.

Deduplication MUST NOT remove distinct artifacts that differ by identity, version, hash, ownership, or consumer contract. The runtime MUST preserve the canonical record for each unique artifact identity.

## 10. Validation

Every artifact MUST be validated before it is accepted as complete. Validation MUST include structural validation, hash validation, ownership validation, and compatibility validation where applicable.

An artifact MUST NOT be considered valid if any required validation step fails. Validation failures MUST be recorded as structured errors.

## 11. Storage

Artifacts MUST be stored in a deterministic, traceable storage location. The storage location MUST be derived from artifact identity, version, and run context where applicable.

The runtime MUST preserve the association between the artifact metadata record and the stored payload. Storage MUST be recoverable and MUST support integrity verification.

## 12. Transport

Artifacts MUST be transported using a contract-defined mechanism that preserves metadata, identity, and integrity.

Transport MUST preserve the artifact hash, version, ownership data, and consumer declaration. Transport failures MUST be recorded and MUST NOT be silently ignored.

## 13. Streaming

If streaming is used, the artifact stream MUST preserve the same identity, version, hash, and metadata semantics as a non-streaming transfer.

The runtime MUST ensure that streaming transport does not alter artifact content or lose metadata. Streaming MUST support integrity verification at completion.

## 14. Caching

Artifacts MAY be cached for performance. Cached artifacts MUST remain traceable to the same identity, version, and hash as the authoritative artifact.

A cache entry MUST NOT be treated as authoritative unless it is validated against the declared metadata and hash. Stale or invalid cache entries MUST be invalidated.

## 15. Compatibility

Artifacts MUST declare compatibility requirements where applicable. Compatibility MUST include version compatibility, format compatibility, and consumer compatibility.

The runtime MUST reject incompatible artifact consumption unless the compatibility contract explicitly permits the usage.

## 16. Security

Artifacts MUST be handled according to a defined security contract. The runtime MUST preserve confidentiality, integrity, and provenance expectations for artifact data and metadata.

The runtime MUST prevent unauthorized modification, unauthorized publication, and unauthorized access. Security violations MUST be recorded and MUST be treated as contract failures.

## 17. Normative Summary

The V6 artifact model MUST be identifiable, versioned, integrity-validated, owned, retained, and governable. Any implementation that violates this specification is non-compliant with the V6 contract.
