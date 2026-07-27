# V6 Implementation Plan - Executable Development Roadmap

**Document Type:** Implementation Planning (Architecture Level)  
**Date Created:** 2026-07-27  
**Version:** V6.0 Implementation Phase Document  
**Status:** READY FOR PHASE 0 AUTHORIZATION  
**Duration:** 10 weeks (Phases 0-10)  
**Team Size:** 2-3 senior engineers  

---

## EXECUTIVE SUMMARY

This implementation plan transforms the V6 Master Blueprint into executable development phases. Each phase is designed for safe, incremental delivery with clear rollback strategies and risk mitigation.

**Key Principles:**
- **No Parallel Work:** Phases strictly sequential (each depends on prior)
- **Reversible Changes:** Every phase can rollback to prior state
- **Safe by Default:** Testing before proceeding to next phase
- **Zero Downtime:** Backward compatibility maintained throughout
- **Clear Success Criteria:** Validation required before phase completion

**Commitment:**
- NO modifications to working production logic during V5 runtime
- NO refactoring outside phase scope
- NO breaking changes to public APIs
- All V5 functionality preserved and tested at each phase

---

# PHASE 0: PROJECT FREEZE & BASELINE

## Objective

Establish frozen V5 baseline, capture current performance metrics, create rollback anchor point.

## Why this phase exists

- Lock V5 as reference state before ANY V6 changes
- Establish performance baseline to measure improvements
- Create regression testing foundation
- Document pre-V6 architecture for comparison
- Ensure clean git history for eventual rollback if needed

## Expected output

1. **V5_FROZEN_SNAPSHOT.md**
   - Git commit hash of V5 baseline
   - Doctor.ts line count, engine count, execution time
   - FactoryRuntime.ts configuration
   - Repository structure snapshot
   - All test results (passing/failing)

2. **V5_PERFORMANCE_BASELINE.json**
   - Average Doctor.run() duration
   - Average compile time
   - Average test time
   - Average repair iterations
   - Memory usage profile
   - Artifact count and size

3. **V5_REGRESSION_TESTS.md**
   - List of 50+ regression tests
   - Each test verifies specific V5 behavior
   - Expected outputs for each test
   - Success criteria for regression detection

4. **ROLLBACK_INSTRUCTIONS.md**
   - How to return to V5 frozen state
   - Git commands to restore baseline
   - How to verify successful rollback
   - Contact procedures if rollback needed

## Files that WILL change

- None (Phase 0 is observation only)
- Only document creation and test catalog

## Files that MUST NOT change

- src/doctor/Doctor.ts
- src/doctor/FactoryRuntime.ts
- src/doctor/DoctorOrchestrator.ts
- src/runtime/ (all)
- src/ai/engines/ (all)
- package.json
- tsconfig.json
- All application code

## Estimated Risk

**LOW** - Phase 0 makes no code changes, only observations and documentation

## Rollback strategy

**N/A** - No changes to rollback. If Phase 0 itself fails:
- Delete created documentation files
- No git commits to reverse
- Return to prior git state if any test files modified

## Validation checklist

- [ ] All existing tests pass on V5 baseline
- [ ] Doctor.run() completes successfully
- [ ] Performance metrics captured and recorded
- [ ] Regression test suite created and baseline recorded
- [ ] Git commit hash documented
- [ ] Rollback instructions verified (test one rollback)
- [ ] Team acknowledges freeze notification

## Required tests

1. **Baseline Integration Test**
   - Run full Doctor.run()
   - Verify all engines execute
   - Capture execution time
   - Record memory usage
   - Verify output artifacts

2. **Performance Baseline Tests**
   - Repeat Doctor.run() 5 times
   - Calculate average
   - Record variance
   - Store in V5_PERFORMANCE_BASELINE.json

3. **Regression Test Creation**
   - For each major engine, create test
   - Capture expected output
   - Store in regression suite
   - Verify tests pass on current baseline

4. **Rollback Verification Test**
   - Manually rollback from Phase 1 (once started)
   - Verify Doctor.run() works after rollback
   - Confirm performance metrics match baseline
   - Document any deviations

## Completion criteria

- [x] V5 frozen at git commit XXXXXXX
- [x] Performance baseline: Doctor.run() takes X seconds
- [x] Compile time: X seconds
- [x] Test time: X seconds
- [x] All existing tests passing (establish pass count)
- [x] Regression test suite documented with baseline
- [x] Rollback instructions tested and verified
- [x] Documentation complete and approved

## Expected commit message

```
Phase 0: Project freeze - V5 baseline snapshot

- Capture V5 performance baseline
- Document V5 architecture snapshot
- Create regression test suite with baseline
- Establish rollback procedures
- Lock V5 state before V6 development begins

Regression baseline: X tests passing
Performance baseline: Doctor.run() = Xs
Compile baseline: Xs
Test baseline: Xs

This commit establishes the V5 frozen state.
All subsequent Phase 1+ changes are reversible to this point.
```

---

# PHASE 1: REPOSITORY CLEANUP

## Objective

Remove tracked artifacts, organize dead code, establish clean repository baseline for V6 work.

## Why this phase exists

- Repository contains 30+ build output files tracked in git
- 4 backup folders committed unnecessarily
- .gitignore patterns incomplete
- Bloated repo (40% larger than necessary)
- Makes Phase 2+ difficult to review (noise in diff)

## Expected output

1. **Updated .gitignore**
   - Comprehensive patterns for all build artifacts
   - Clear section organization (build, backup, temp, generated)
   - Validation that new build runs don't create tracked files

2. **Removed from git history**
   - All backup folders deleted
   - All 30+ .txt build output files removed
   - package.json.backup-before-json-fix deleted
   - Temp generated files cleaned

3. **Repository structure optimized**
   - scripts/ folder created and organized
   - PowerShell utilities moved from root
   - Generated outputs redirected to .gitignored locations
   - Total repository size reduced 70%+

4. **CLEANUP_VERIFICATION.md**
   - Before/after repository size
   - Before/after .gitignore patterns
   - Verification that no tracked artifacts remain
   - List of all files removed

## Files that WILL change

**Modified:**
- .gitignore (add 20+ new patterns)

**Deleted from git:**
- backup-admin-generator-20260723-192030/
- backup-generator-20260723-191841/
- backup-generator-fix-20260723-193944/
- pos-wisata_BACKUP/
- accounting-build-output.txt
- buildlog.txt (and buildlog.txtnotepad)
- errors.txt
- eslint-error.txt
- full-typecheck.txt
- inventory-build-error.txt
- inventory-error-baru.txt
- mobile-after-install.txt
- mobile-build-output.txt
- mobile-final-build-output.txt
- shared-build-output.txt
- souvenir-build-output.txt
- souvenir2-build-output.txt
- souvenir3-build-output.txt
- souvenir4-build-output.txt
- imports.txt
- placeholder-files.txt
- pnpm-store-list.txt
- scanner.txt
- package.json.backup-before-json-fix
- satset.v2.ps1 (move to scripts/)
- and other temp scripts

**Created:**
- scripts/ folder
- scripts/satset.ps1
- scripts/install.ps1
- scripts/other utilities

## Files that MUST NOT change

- src/ (all source code)
- apps/ (all app code)
- package.json (content, only cleanup backup)
- tsconfig.json
- Any functional source files

## Estimated Risk

**LOW** - Repository-only changes, no runtime impact

## Rollback strategy

**Git-based reversal:**

If cleanup causes issues:
1. `git reset --hard HEAD~1` (undo cleanup commit)
2. Repository returns to pre-Phase-1 state
3. Build artifacts reappear (expected)
4. Investigate what went wrong
5. Either proceed with different cleanup approach or skip Phase 1

**If some file removal was wrong:**
1. `git checkout HEAD~1 -- <filename>` to restore specific file
2. Commit correction

**Automated rollback:**
```
# Restore to pre-Phase-1 state
git revert <phase-1-commit-hash>
# Or reset to prior state
git reset --hard <pre-phase-1-hash>
```

## Validation checklist

- [ ] All build output files removed from git
- [ ] All backup folders removed from git
- [ ] .gitignore updated with comprehensive patterns
- [ ] No .bak files tracked in git
- [ ] No *.backup-* files tracked
- [ ] No *-build-output.txt files tracked
- [ ] No backup-*/ folders tracked
- [ ] Repository size reduced to < 50% of original
- [ ] New build outputs not tracked after cleanup
- [ ] scripts/ folder exists and organized
- [ ] src/ code unchanged (verify with git diff)
- [ ] All source tests still pass

## Required tests

1. **Repository size test**
   - Measure repo size before: X MB
   - Verify repo size after: < 50% of before
   - Record size in CLEANUP_VERIFICATION.md

2. **Git ignore pattern test**
   - Run full build
   - Capture all generated files
   - Verify NONE appear in `git status`
   - Verify `git add .` doesn't capture build artifacts

3. **Source code integrity test**
   - Run `git diff HEAD~1 src/` 
   - Verify ONLY deleted files are shown (backup-admin-generator-*, etc.)
   - Verify NO source code content changed

4. **Build success test**
   - Full `pnpm install` and `pnpm build`
   - Verify no errors introduced by cleanup
   - All apps build successfully

## Completion criteria

- [x] Repository size: X MB → Y MB (70%+ reduction)
- [x] All build outputs removed from git
- [x] All backup folders removed from git
- [x] .gitignore comprehensive and verified
- [x] `git status` shows only legitimate tracked changes (none)
- [x] New build doesn't create tracked files
- [x] Source code verified unchanged
- [x] scripts/ organized
- [x] All tests passing

## Expected commit message

```
Phase 1: Repository cleanup - Remove tracked artifacts

- Remove 4 backup folders (dead code from previous attempts)
- Remove 30+ .txt build output files
- Remove package.json.backup-before-json-fix
- Update .gitignore with comprehensive patterns:
  * Build outputs: *-build-output.txt, *-error*.txt, *typecheck*.txt
  * Backup variants: *.backup-*, backup-*/, node_modules_corrupt_*/
  * Temp scripts: tmp_*.ps1, satset.v*.ps1, *.cmd
  * Generated JSON: tmp-*.json, .satset-*.json, .progress-*.json
  * Corrupt/recovery: *_corrupt*, *_recovery*
- Create scripts/ folder and organize PowerShell utilities
- Verify no build artifacts tracked after cleanup

Repository size reduced from X MB to Y MB (70% reduction)
All source code unchanged
All tests passing
Verified .gitignore prevents future artifact tracking

This is Phase 1 of V6 migration - purely repository hygiene.
No runtime behavior changes.
```

---

# PHASE 2: ENGINE REGISTRY CONSOLIDATION

## Objective

Unify fragmented engine registry implementations into single authoritative registry.

## Why this phase exists

- V5 has 5+ registry instances created at startup (duplication)
- doctor/EngineRegistry (simple Map) and runtime/EngineRegistry (complex) conflict
- No single source of truth for engine lookups
- Wastes memory and creates potential sync issues
- Enables future phases (3+ depend on single registry)

## Expected output

1. **Unified EngineRegistry**
   - Single authoritative implementation
   - Located: src/runtime/EngineRegistry.ts (enhanced)
   - Supports both manifest-aware and simple engines
   - Thread-safe lookup (if future parallel work)

2. **Registry Integration Points**
   - Doctor creates ONE registry instance
   - Doctor passes to PipelineResolver
   - Doctor passes to FactoryRuntime
   - FactoryRuntime uses injected, doesn't create new
   - All engines registered once at startup

3. **REGISTRY_CONSOLIDATION.md**
   - Before: 5+ instances, 2 implementations
   - After: 1 instance, 1 implementation
   - Registry lookup API documented
   - Manifest structure documented
   - Health tracking API (new)

## Files that WILL change

**Modified (no logic changes, only registry usage):**
- src/doctor/Doctor.ts
  - Create ONE registry instance
  - Pass to PipelineResolver and FactoryRuntime
  - NO changes to pipeline execution logic

- src/doctor/FactoryRuntime.ts
  - Accept injected registry (constructor param)
  - Use injected registry instead of creating new
  - NO changes to engine execution

- src/runtime/EngineRegistry.ts
  - Enhanced to support both implementations
  - Preserve all existing methods
  - Add getByName() method for simple lookup

- src/runtime/PipelineResolver.ts
  - Accept injected registry (constructor param)
  - Use injected registry
  - NO changes to topological sort logic

- src/runtime/ExecutionScheduler.ts
  - Accept injected registry (constructor param, if needed)
  - NO changes to execution logic

**Kept as deprecated (backward compatibility):**
- src/doctor/EngineRegistry.ts
  - Mark as @deprecated
  - Add comment: "Use src/runtime/EngineRegistry instead"
  - Keep in codebase, don't import

## Files that MUST NOT change

- All engine implementations (no engine code modified)
- Doctor.constructor() engine instantiation logic
- FactoryRuntime.run() execution flow
- PipelineResolver.resolve() topological sort algorithm
- ExecutionScheduler execution loop
- Any business logic

## Estimated Risk

**MEDIUM** - Registry is core, affects all engines, but changes are scoped to initialization

### Risk factors:
- HIGH: Registry is used by all engines (break it = break all)
- MEDIUM: Tests must verify all engines still findable
- MEDIUM: FactoryRuntime injection pattern must work correctly
- LOW: No logic changes, only restructuring initialization

### Risk mitigation:
- Extensive testing of registry operations
- Verify all 68 engines registered and findable
- Run full Doctor.run() after changes
- Compare output with Phase 0 baseline

## Rollback strategy

**If registry consolidation fails:**

1. **Immediate rollback (< 1 hour after commit):**
   ```
   git revert <phase-2-commit-hash>
   # Or reset to Phase 1 state
   git reset --hard <phase-1-hash>
   ```

2. **If partial rollback needed:**
   - Revert only Doctor.ts changes
   - Revert only FactoryRuntime.ts changes
   - Use granular git commands

3. **Recovery steps:**
   - Run full test suite
   - Verify Doctor.run() works
   - Compare performance with baseline
   - If metrics match, recovery successful

4. **Prevention of future rollback:**
   - Document exactly what went wrong
   - Fix issue in Phase 2 re-attempt
   - More thorough testing before Phase 2 v2

## Validation checklist

- [ ] doctor/EngineRegistry.ts marked deprecated, not imported
- [ ] Single registry instance created in Doctor
- [ ] Registry passed to PipelineResolver
- [ ] Registry passed to FactoryRuntime
- [ ] FactoryRuntime uses injected registry (no `new EngineRegistry()`)
- [ ] All 68 engines registered in registry
- [ ] All 68 engines findable via registry.get(name)
- [ ] getManifest() works for all engines
- [ ] Health tracking initialized for all engines
- [ ] ExecutionScheduler has access to registry (if needed)
- [ ] No registry created in multiple places (verify with grep)
- [ ] Doctor.run() completes successfully
- [ ] All regression tests pass
- [ ] Performance metrics within 5% of Phase 0 baseline

## Required tests

1. **Registry instantiation test**
   - Verify ONE registry instance at startup
   - Verify registry is passed, not created in sub-components
   - Count registry instances: must be 1

2. **Engine registration test**
   - All 68 engines registered
   - All accessible via registry.get()
   - All have manifests (or defaults)
   - No duplicate registrations

3. **Manifest retrieval test**
   - registry.getManifest() works for all engines
   - Default manifest provided for engines without explicit manifest
   - Manifest has required fields (id, name, dependencies)

4. **Injection pattern test**
   - PipelineResolver receives registry in constructor
   - FactoryRuntime receives registry in constructor
   - ExecutionScheduler can access registry if needed
   - No component creates `new EngineRegistry()`

5. **Full integration test**
   - Doctor.run() executes all stages
   - Compare output with Phase 0 baseline
   - Verify performance (should be identical)
   - Verify repair loop still works

## Completion criteria

- [x] Single registry instance (verified via grep + logging)
- [x] doctor/EngineRegistry deprecated and unused
- [x] All 68 engines registered and findable
- [x] No `new EngineRegistry()` in component constructors
- [x] PipelineResolver and FactoryRuntime injected
- [x] Doctor.run() works identically to Phase 0
- [x] Performance metrics: within 5% of baseline
- [x] All existing tests passing
- [x] No regression vs Phase 0

## Expected commit message

```
Phase 2: Engine registry consolidation - Unified singleton registry

- Create unified EngineRegistry as single authoritative implementation
- Remove duplicate registry instantiation (5+ → 1 instance)
- Refactor Doctor to create ONE registry
- Inject registry into PipelineResolver (no new creation)
- Inject registry into FactoryRuntime (no new creation)
- Update ExecutionScheduler to use injected registry
- Mark doctor/EngineRegistry.ts as deprecated
- All engine lookups now go through single registry
- No changes to engine implementations or business logic

Registry instances before: 5+ (PipelineResolver default, FactoryRuntime, etc.)
Registry instances after: 1 (created once in Doctor)

All 68 engines still registered and functional
Performance metrics: identical to Phase 0 baseline
All tests passing

This enables Phase 3: PipelineResolver centralization
```

---

# PHASE 3: PIPELINE RESOLVER CENTRALIZATION

## Objective

Centralize dependency resolution into single PipelineResolver instance with single resolve() call.

## Why this phase exists

- V5 calls PipelineResolver.resolve() twice (Doctor + FactoryRuntime)
- Each call is O(n²) topological sort on 68 engines
- Duplicate work, no benefit
- ExecutionScheduler also does orderEngines() (3rd sort!)
- Phase 3 eliminates redundant sorts

## Expected output

1. **Centralized Resolution Strategy**
   - resolve() called ONCE in Doctor.constructor
   - Result stored and passed to FactoryRuntime
   - ExecutionScheduler uses result, doesn't re-sort
   - Eliminates 2-3 redundant O(n²) operations

2. **RESOLVER_CENTRALIZATION.md**
   - Before: resolve() called at 2-3 places
   - After: resolve() called exactly once
   - Performance improvement measured
   - Dependency declaration status documented

3. **Manifest validation**
   - All 68 engines must declare dependencies (or defaults)
   - Circular dependency detection working
   - Dependency strings validated against registry

## Files that WILL change

**Modified (resolution flow restructured):**
- src/doctor/Doctor.ts
  - Call resolve() once in constructor
  - Store result in this.pipeline
  - Pass result to FactoryRuntime

- src/doctor/FactoryRuntime.ts
  - Accept resolved pipeline in constructor
  - Use provided pipeline instead of re-resolving
  - Remove `this.pipelineResolver.resolve()` call
  - Pass result to ExecutionScheduler

- src/runtime/ExecutionScheduler.ts
  - Accept resolved pipeline in constructor
  - Use provided engines directly
  - Remove `this.orderEngines()` call
  - All engines already sorted

- src/runtime/PipelineResolver.ts
  - NO changes to resolve() algorithm
  - Called once from Doctor, passed through system
  - Dependency validation enhanced

**New validation:**
- All engines declare dependencies (explicit or default)
- Circular dependency check passes
- Dependency strings map to real engines
- Document in RESOLVER_CENTRALIZATION.md

## Files that MUST NOT change

- Engine implementations (no engine code modified)
- resolve() algorithm (topological sort logic unchanged)
- Manifest structure (reuse existing structure)
- Any business logic

## Estimated Risk

**MEDIUM** - Dependency resolution is core, but only changing where it's called, not how

### Risk factors:
- HIGH: If engines have undeclared dependencies, order could be wrong
- MEDIUM: Passing pipeline through layers introduces coupling
- MEDIUM: Validation must ensure all dependencies declared
- LOW: resolve() algorithm unchanged

### Risk mitigation:
- Comprehensive manifest validation
- All engines must declare dependencies (or use defaults)
- Compare resolved order with Phase 0
- Full integration test

## Rollback strategy

**If Phase 3 breaks dependency resolution:**

1. **Immediate rollback:**
   ```
   git revert <phase-3-commit-hash>
   ```

2. **If specific engines causing issues:**
   - Identify engine with undeclared/wrong dependency
   - Rollback Phase 3
   - Document missing dependency
   - Retry Phase 3 with corrected manifests

3. **Recovery verification:**
   - Run Doctor.run()
   - Check execution order matches Phase 0
   - Verify all engines still execute
   - Performance should improve (fewer sorts)

## Validation checklist

- [ ] resolve() called exactly once (in Doctor constructor)
- [ ] Result passed to FactoryRuntime constructor
- [ ] FactoryRuntime doesn't create new resolver
- [ ] ExecutionScheduler doesn't call orderEngines()
- [ ] All 68 engines have dependency declaration (explicit or default)
- [ ] Circular dependency check passes
- [ ] Dependency strings validate against registry
- [ ] Resolved pipeline order same as Phase 0
- [ ] Doctor.run() completes successfully
- [ ] All regression tests pass
- [ ] Performance: fewer sorts = faster startup (measure)

## Required tests

1. **Resolution count test**
   - Verify resolve() called exactly once
   - Grep for all resolve() calls: must find only one
   - Verify ExecutionScheduler doesn't call orderEngines()

2. **Pipeline order test**
   - Capture resolved pipeline order in Phase 0
   - Compare with resolved pipeline order in Phase 3
   - Orders must be identical (same O(n²) sort)

3. **Dependency validation test**
   - All 68 engines have manifests
   - No missing dependency declarations
   - Circular dependency check passes
   - All dependency IDs map to real engines

4. **Performance test**
   - Measure startup time reduction
   - Log number of topological sorts: should be 1 (not 2-3)
   - Doctor.run() should be faster than Phase 2

5. **Full integration test**
   - Doctor.run() executes all engines
   - Compare output with Phase 0 baseline
   - Verify repair loop still works

## Completion criteria

- [x] resolve() called exactly once (in Doctor)
- [x] Result passed through layers (no re-resolution)
- [x] No duplicate orderEngines() calls
- [x] All engines declare dependencies
- [x] Circular dependency detection works
- [x] Resolved order identical to Phase 0
- [x] Doctor.run() works identically to Phase 0
- [x] Startup time reduced (fewer sorts)
- [x] All tests passing

## Expected commit message

```
Phase 3: Pipeline resolver centralization - Single dependency resolution

- Remove duplicate PipelineResolver.resolve() calls (was 2-3, now 1)
- Resolve dependencies once in Doctor.constructor
- Pass resolved pipeline to FactoryRuntime (injected)
- FactoryRuntime passes to ExecutionScheduler
- ExecutionScheduler uses pre-resolved pipeline (no re-sort)
- Ensure all 68 engines declare dependencies (explicit or default)
- Validate dependency declarations at startup

Topological sorts before: 2-3 per Doctor.run() (O(n²) each)
Topological sorts after: 1 per Doctor.run() (O(n²) once)
Startup performance: X% faster (fewer sorts)

All engines still execute in correct dependency order
Output identical to Phase 0
All tests passing

This enables Phase 4: Deterministic ExecutionScheduler
```

---

# PHASE 4: EXECUTION SCHEDULER ENHANCEMENT

## Objective

Introduce deterministic scheduler with timeout handling, retry strategy, and future-proof parallel execution capability.

## Why this phase exists

- V5 ExecutionScheduler exists but execution is manual loop in FactoryRuntime
- No timeout handling (hung engines block pipeline)
- No retry strategy (failures immediately propagate)
- No deterministic behavior (engine groups not used)
- Must build scheduling foundation before consolidating pipelines

## Expected output

1. **Deterministic ExecutionScheduler**
   - Accepts resolved engines and executes sequentially
   - Timeout enforcement per engine (manifest timeout)
   - Retry strategy (configurable: fail/skip/retry)
   - Circuit breaker for cascading failures
   - Event emission for observability

2. **SCHEDULER_ENHANCEMENT.md**
   - Scheduling algorithm documented
   - Timeout behavior specified
   - Retry policy documented
   - Event system documented
   - Future parallel execution capability documented

3. **Scheduler Configuration**
   - Per-engine timeout (from manifest)
   - Global default timeout
   - Retry policy (max attempts, backoff)
   - Circuit breaker threshold
   - Event emitters for monitoring

## Files that WILL change

**Modified (scheduling logic enhanced):**
- src/runtime/ExecutionScheduler.ts
  - Replace manual execution loop with scheduler
  - Implement timeout enforcement
  - Implement retry logic
  - Emit lifecycle events
  - NO changes to engine invocation (still serial)

- src/doctor/FactoryRuntime.ts
  - Use ExecutionScheduler.run() instead of manual loop
  - Pass engines and context to scheduler
  - Handle scheduler events (optional)
  - Capture scheduler metrics

- src/runtime/RuntimeMetricsEngine.ts
  - Capture per-engine execution time
  - Track timeouts and retries
  - Record event emission

**New:** 
- Scheduler configuration interface
- Timeout handler strategy
- Retry handler strategy
- Event types enumeration

## Files that MUST NOT change

- Engine implementations (no changes)
- Pipeline resolution logic (Phase 3, complete)
- Doctor.constructor() instantiation
- Any business logic

## Estimated Risk

**MEDIUM** - Scheduler is execution core, but behavioral changes are additive only

### Risk factors:
- HIGH: Timeout handling could interrupt valid operations
- HIGH: Retry logic must not cause infinite loops
- MEDIUM: Events must not impact performance
- MEDIUM: Circuit breaker thresholds must be tuned
- LOW: Serial execution unchanged (parallelization future phase)

### Risk mitigation:
- Conservative timeout defaults (very high)
- Retry strategy defaults to fail-fast
- Circuit breaker requires explicit tuning
- Full regression testing

## Rollback strategy

**If scheduling changes cause issues:**

1. **Immediate rollback:**
   ```
   git revert <phase-4-commit-hash>
   ```

2. **If specific timeout/retry causing issues:**
   - Adjust configuration
   - Retry Phase 4 with different settings
   - Don't modify scheduler algorithm, only config

3. **Recovery verification:**
   - Doctor.run() executes all engines
   - No hung engines
   - Compare metrics with Phase 0 baseline

## Validation checklist

- [ ] ExecutionScheduler.run() used (not manual loop)
- [ ] Timeout enforcement working (test with mock timeout)
- [ ] Retry strategy working (test with mock failure)
- [ ] Circuit breaker working (test with multiple failures)
- [ ] Events emitted correctly
- [ ] All engines execute (no premature termination)
- [ ] No infinite retry loops
- [ ] Performance identical to Phase 3 (same serial execution)
- [ ] All regression tests pass
- [ ] Timeout doesn't interrupt valid operations

## Required tests

1. **Scheduler invocation test**
   - Verify ExecutionScheduler.run() called
   - Verify all engines still execute
   - Verify execution order preserved

2. **Timeout handling test**
   - Mock engine with timeout
   - Verify timeout triggers at manifest timeout
   - Verify configured strategy executed (fail/skip/retry)
   - Verify no other engines blocked

3. **Retry logic test**
   - Mock engine with transient failure
   - Verify retries up to max attempts
   - Verify backoff applied
   - Verify final failure after max attempts

4. **Circuit breaker test**
   - Multiple consecutive failures
   - Verify circuit breaker triggers
   - Verify subsequent engines skip or fail fast
   - Verify threshold configurable

5. **Event emission test**
   - Engine start event emitted
   - Engine success event emitted
   - Engine timeout event emitted
   - Engine retry event emitted

6. **Performance test**
   - Execution time identical to Phase 3
   - No overhead from timeout/retry/events
   - Serial execution unchanged

## Completion criteria

- [x] Scheduler manages execution (not manual loop)
- [x] Timeout enforcement working
- [x] Retry strategy working
- [x] Circuit breaker available
- [x] Events emitted
- [x] All engines execute
- [x] No premature termination
- [x] Performance identical to Phase 3
- [x] All tests passing

## Expected commit message

```
Phase 4: Execution scheduler enhancement - Deterministic scheduling

- Introduce deterministic ExecutionScheduler for engine execution
- Replace manual FactoryRuntime loop with ExecutionScheduler.run()
- Implement timeout enforcement per engine (from manifest)
- Implement retry strategy with configurable policy
- Implement circuit breaker for cascading failure prevention
- Emit lifecycle events: start, success, timeout, retry, failure
- Configure default timeouts, retry attempts, backoff

Execution behavior:
- Serial execution preserved (no parallelization yet)
- Timeout: per-engine from manifest (very high default)
- Retry: configurable max attempts and backoff
- Circuit breaker: optional, threshold-based
- Events: emitted but not required to be consumed

All engines still execute in order
Performance identical to Phase 3
All tests passing

This creates foundation for Phase 5-6 pipeline consolidations
and future Phase 10 parallelization
```

---

# PHASE 5: COMPILE PIPELINE - SINGLE EXECUTION

## Objective

Ensure CompileEngine executes exactly once per Doctor.run() with smart caching and dependency awareness.

## Why this phase exists

- V5: CompileEngine runs 2-4 times (redundant compilation)
  - RepairCoordinator loop
  - RepairLoopEngine loop
  - DoctorOrchestrator
  - CompileEvaluator (benchmark)
- Compilation is slowest operation (30-40% of total time)
- Must consolidate before full repair pipeline consolidation

## Expected output

1. **CompileManager (Centralized)**
   - Manages all compilation through single orchestrator
   - Caching with source hash
   - Invalidation strategy
   - Reuse across repair iterations

2. **COMPILE_PIPELINE.md**
   - Execution flow: where compile happens exactly once
   - Cache invalidation: when cache must be cleared
   - Repair loop integration: how repairs invalidate cache
   - Performance improvement: X% time saved

3. **Compile Caching Strategy**
   - Source file hash computed once
   - Compile result cached by hash
   - Cache invalidated if patches change code
   - Subsequent compile uses cache (instant)

## Files that WILL change

**Modified (compile execution consolidated):**
- src/engines/build/CompileEngine.ts (NEW location/structure)
  - Modified to use CompileManager
  - NO changes to compilation algorithm
  - Calls manager instead of direct compilation

- src/engines/build/CompileManager.ts (NEW)
  - Centralized compile orchestration
  - Caching logic
  - Invalidation strategy
  - Source hash computation

- src/doctor/RepairCoordinator.ts
  - Use CompileManager instead of embedded CompileEngine
  - Remove `private readonly compileEngine`
  - Refactor runCompile() to use manager

- src/ai/engines/RepairLoopEngine.ts
  - Use CompileManager (not create new CompileEngine)
  - Cache reuse across iterations

- src/doctor/DoctorOrchestrator.ts
  - Use CompileManager (not instantiate CompileEngine directly)

- src/benchmark/CompileEvaluator.ts
  - Use CompileManager
  - Read from cache (no recompilation)

**Cache storage:**
- src/cache/CompileCache.ts (NEW)
  - In-memory cache: {sourceHash → CompileResult}
  - TTL: never (valid until source changes)
  - Invalidation on source change

## Files that MUST NOT change

- Compilation algorithm (pnpm tsc command)
- src/runtime/ExecutionScheduler
- src/doctor/Doctor construction
- Any other engine logic

## Estimated Risk

**MEDIUM** - Compile is critical, but changes are localized to compilation flow

### Risk factors:
- HIGH: If cache doesn't invalidate properly, stale results used
- HIGH: If repair doesn't invalidate cache, stale compile after fix
- MEDIUM: Source hash must be consistent
- MEDIUM: Cache reuse across repairs must work correctly
- LOW: Compilation algorithm unchanged

### Risk mitigation:
- Comprehensive cache invalidation testing
- Compare compile output before/after caching
- Repair tests with cache invalidation
- Performance testing

## Rollback strategy

**If compile caching causes issues:**

1. **Immediate rollback:**
   ```
   git revert <phase-5-commit-hash>
   ```

2. **If cache invalidation issue:**
   - Check if source hash computation correct
   - Verify cache cleared on repair
   - Retry with more aggressive invalidation

3. **Recovery:**
   - Disable caching (always compile fresh)
   - Incrementally enable caching

## Validation checklist

- [ ] CompileManager created and used
- [ ] CompileEngine calls manager (not direct)
- [ ] Cache working (cache hits detected)
- [ ] Cache invalidation working (on source change)
- [ ] Repair invalidates cache (on patch application)
- [ ] CompileEvaluator reads cache (no recompile)
- [ ] Compile runs exactly 1-2 times per Doctor.run()
- [ ] Compile results identical to Phase 0 (cache + fresh)
- [ ] Performance improved (30-40% reduction in compile time)
- [ ] All tests passing

## Required tests

1. **Cache functionality test**
   - First compile: cache miss, actual compile
   - Second compile: cache hit, instant return
   - Verify results identical
   - Measure time improvement

2. **Cache invalidation test**
   - Source changes
   - Cache invalidated
   - Next compile: cache miss, actual compile
   - Previous source restored
   - Cache hit again (new hash, but still works)

3. **Repair cache invalidation test**
   - Initial compile
   - Repair generates patches
   - Patches applied (source changes)
   - Cache invalidated
   - Compile after repair: fresh compile
   - Cache verified cleared

4. **Multi-iteration repair test**
   - Iteration 1: compile (cache miss)
   - Iteration 1: repair (cache invalidated)
   - Iteration 2: compile (cache miss if patches changed code)
   - Iteration 2: repair (cache invalidated)
   - Iteration 3: similar pattern
   - Verify compile runs only when needed

5. **Benchmark integration test**
   - CompileEvaluator reads cache
   - No recompilation in benchmark
   - Performance correct

6. **Performance test**
   - Measure compile time before/after
   - Calculate time saved
   - Verify 30-40% reduction (compile runs 50% fewer times)

## Completion criteria

- [x] CompileManager created and used
- [x] Single compile per non-repair flow
- [x] Cache working correctly
- [x] Cache invalidation on source change
- [x] Repair loop invalidates cache
- [x] CompileEvaluator uses cache (no recompile)
- [x] Compile count reduced: was 2-4, now 1-2
- [x] Compile time reduced: 30-40% overall improvement
- [x] Output identical to Phase 0
- [x] All tests passing

## Expected commit message

```
Phase 5: Compile pipeline - Single execution with caching

- Create CompileManager for centralized compilation orchestration
- Implement compile caching with source hash
- Consolidate CompileEngine calls through manager
- Update RepairCoordinator to use manager (no embedded engine)
- Update RepairLoopEngine to use manager and cache reuse
- Update DoctorOrchestrator to use manager
- Update CompileEvaluator to read cache (no recompile)
- Implement cache invalidation on source change
- Repair loop invalidates cache on patch application

Compile executions before: 2-4 per Doctor.run()
Compile executions after: 1-2 per Doctor.run()
Compile time improvement: 30-40% reduction
Cache hits: ~50% (after first compile)

Cache invalidation strategy:
- Automatic on source file change
- Explicit on repair patch application
- TTL: none (valid until source changes)

All compilation results verified identical to Phase 0
Performance significantly improved
All tests passing

This enables Phase 6: Repair pipeline consolidation
```

---

# PHASE 6: REPAIR PIPELINE CONSOLIDATION

## Objective

Merge 4 separate repair engines (RepairEngine, RepairCoordinator, RepairLoopEngine, AutoRepairEngine) into single unified RepairPipeline.

## Why this phase exists

- V5 has 4 engines doing overlapping repair work
- Execution order unclear
- State management fragmented across engines
- Difficult to understand full repair flow
- Must consolidate before validation and release pipelines

## Expected output

1. **Unified RepairPipeline**
   - Single entry point: RepairPipeline.run()
   - Consolidates: planning, execution, verification, iteration
   - Clear phases: Analyze → Plan → Execute → Verify → Loop
   - Uses CompileManager + TestManager (from Phase 5/future)

2. **REPAIR_PIPELINE.md**
   - Architecture of unified pipeline
   - Phases and their responsibilities
   - State management strategy
   - Iteration logic and loop control
   - Error handling and recovery

3. **Backward compatibility layer**
   - Old engines kept as deprecated wrappers
   - Route to RepairPipeline internally
   - Emit deprecation warnings
   - All existing tests pass

## Files that WILL change

**Created:**
- src/pipeline/RepairPipeline.ts
  - Consolidates 4 repair engines
  - Implements IEngine interface
  - Manages repair state and iterations

**Modified (to use new pipeline):**
- src/doctor/Doctor.ts
  - Use RepairPipeline instead of individual engines
  - Update engine list in constructor

- src/runtime/ExecutionScheduler.ts
  - RepairPipeline treated as single engine
  - No changes to scheduler logic

**Deprecated (kept for compatibility):**
- src/ai/engines/RepairEngine.ts (marked @deprecated)
- src/doctor/RepairCoordinator.ts (marked @deprecated)
- src/ai/engines/RepairLoopEngine.ts (marked @deprecated)
- src/autofix/AutoRepairEngine.ts (marked @deprecated)

Each wraps to RepairPipeline internally, emits deprecation warning

## Files that MUST NOT change

- Compilation logic (Phase 5, complete)
- ExecutionScheduler execution
- Any business logic outside repair

## Estimated Risk

**HIGH** - Repair is critical functionality, consolidation is major change

### Risk factors:
- HIGH: Repair must succeed for many pipelines
- HIGH: 4 engines consolidated = complex consolidation
- HIGH: Any bug breaks error recovery
- MEDIUM: Testing must cover all repair scenarios
- MEDIUM: Iteration logic must be correct

### Risk mitigation:
- Comprehensive repair testing with broken code
- Compare output with Phase 0 (same repair results)
- Extensive iteration testing (1-3 attempts)
- Clear state management

## Rollback strategy

**If RepairPipeline consolidation breaks repair:**

1. **Immediate rollback:**
   ```
   git revert <phase-6-commit-hash>
   ```

2. **Incremental rollback:**
   - If specific phase (Analyze/Plan/Execute/Verify) broken
   - Revert just that phase
   - Keep other improvements

3. **Recovery:**
   - Switch back to 4-engine approach
   - Identify what broke in consolidation
   - Retry Phase 6 with fix

4. **Verification:**
   - Run repair tests
   - Verify repair succeeds
   - Compare with Phase 0 baseline

## Validation checklist

- [ ] RepairPipeline.run() implemented
- [ ] Analyze phase working (error classification)
- [ ] Plan phase working (patch generation)
- [ ] Execute phase working (patch application)
- [ ] Verify phase working (compile + test)
- [ ] Loop working (retries up to max attempts)
- [ ] State management correct (iterations tracked)
- [ ] Error handling correct (clear error messages)
- [ ] Old engines deprecated (but still working via wrapper)
- [ ] All repair tests passing
- [ ] Repair output identical to Phase 0
- [ ] Iteration count matching Phase 0

## Required tests

1. **Single iteration test**
   - Code with compile error
   - RepairPipeline.run() once
   - Verify: Analyze → Plan → Execute → Verify successful
   - Verify: compile passes, test passes
   - Verify: repair succeeds in 1 iteration

2. **Multi-iteration test**
   - Code with compile error
   - RepairPipeline.run()
   - Iteration 1: fails verification (different error)
   - Iteration 2: different patch generated
   - Iteration 3: succeeds
   - Verify: max 3 iterations attempted

3. **State management test**
   - Verify iteration count tracked
   - Verify patches preserved across iterations
   - Verify compile cache handled correctly
   - Verify test results tracked

4. **Error handling test**
   - Max iterations exceeded
   - Repair failed error generated
   - Error details captured
   - Pipeline continues (or fails gracefully)

5. **Backward compatibility test**
   - Old engine names still work (via wrapper)
   - Deprecation warnings emitted
   - Output identical to Phase 0

6. **Full integration test**
   - Doctor.run() with repairs needed
   - Full pipeline executes
   - Repair completes successfully
   - Compare output with Phase 0

## Completion criteria

- [x] RepairPipeline created and integrated
- [x] All 4 repair engines consolidated
- [x] Repair phases: Analyze → Plan → Execute → Verify
- [x] Iteration logic: up to 3 attempts
- [x] State management: single source of truth
- [x] Repair output identical to Phase 0
- [x] All repair tests passing
- [x] Old engines deprecated (backward compatible)
- [x] No regressions vs Phase 0

## Expected commit message

```
Phase 6: Repair pipeline consolidation - Unified repair orchestration

- Create RepairPipeline consolidating:
  * RepairEngine (planning)
  * RepairCoordinator (coordination)
  * RepairLoopEngine (looping)
  * AutoRepairEngine (automation)
  
- Implement unified phases:
  * Analyze: classify errors from compile result
  * Plan: generate patch plans
  * Execute: generate and apply patches
  * Verify: compile (cache) and test
  * Loop: retry up to 3 times if needed

- Update Doctor to use RepairPipeline (not individual engines)
- Mark old repair engines as @deprecated
- Route deprecated engines to RepairPipeline via wrapper
- Emit deprecation warnings for old engines

Repair logic consolidated:
- Before: 4 separate engines, unclear order
- After: 1 unified pipeline, clear phases
- Iteration logic: identical to Phase 0 (1-3 attempts)

Repair output identical to Phase 0
All repair tests passing
Backward compatibility maintained
No regressions

This enables Phase 7: Validation pipeline
```

---

# PHASE 7: VALIDATION PIPELINE - COMPREHENSIVE CHECKS

## Objective

Create three-stage validation (pre/mid/post) to catch issues early and ensure pipeline integrity.

## Why this phase exists

- V5 validation scattered across engines
- No pre-execution validation (bad configs not caught until runtime)
- No mid-pipeline validation (issues hidden until end)
- No post-execution validation (final artifacts not verified)
- Must establish validation foundation before release pipeline

## Expected output

1. **Pre-Execution Validation**
   - PipelineValidator: manifests valid, dependencies exist, no cycles
   - Called at start of Doctor.run()
   - Catches configuration errors immediately

2. **Mid-Pipeline Validation**
   - ArtifactValidator: generated code syntax correct
   - CrossStageValidator: outputs meet inputs
   - QualityValidator: quality gates met
   - Called between repair and release stages

3. **Post-Execution Validation**
   - FinalValidator: all artifacts present
   - Artifact deduplication: no collisions
   - State consistency: final context valid
   - Called before history save

4. **VALIDATION_PIPELINE.md**
   - Validation stages documented
   - Checks at each stage
   - Error handling strategy
   - Early failure vs warning policy

## Files that WILL change

**Created:**
- src/runtime/PipelineValidator.ts (NEW)
  - Pre-execution validation
  - Manifest validation
  - Dependency validation
  - Cycle detection

- src/engines/validation/ArtifactValidator.ts (NEW)
  - Syntax validation of generated code
  - Required files check
  - Structure validation

- src/engines/validation/CrossStageValidator.ts (NEW)
  - Output-to-input validation
  - Consistency checks
  - Data flow validation

- src/runtime/FinalValidator.ts (NEW)
  - Post-execution validation
  - Artifact completeness
  - Deduplication check
  - State consistency

**Modified (to call validators):**
- src/doctor/Doctor.ts
  - Call PipelineValidator before executing
  - Call validators at appropriate stages

- src/runtime/ExecutionScheduler.ts
  - May need to trigger mid-pipeline validators
  - Or Doctor orchestrates (simpler)

## Files that MUST NOT change

- Repair pipeline (Phase 6, complete)
- Compile pipeline (Phase 5, complete)
- Engine implementations

## Estimated Risk

**LOW-MEDIUM** - Validation is mostly additive, but must be correctly positioned

### Risk factors:
- MEDIUM: Pre-validation must not reject valid configurations
- MEDIUM: Mid-validation must not halt valid repairs
- MEDIUM: Post-validation must not fail on valid outputs
- LOW: Validation can warn without blocking

### Risk mitigation:
- Validation doesn't block by default (warnings)
- Explicit flags to enable blocking validation
- Tests verify validation works but doesn't reject valid pipelines

## Rollback strategy

**If validation prevents valid pipelines:**

1. **Immediate adjustment:**
   - Disable specific validation check
   - Or switch to warning mode instead of blocking
   - Retry Phase 7

2. **If validation logic wrong:**
   - Fix validation, retry
   - OR revert Phase 7

3. **Recovery:**
   - Doctor.run() with validation disabled
   - Verify pipeline works without validation
   - Re-enable validation with correct logic

## Validation checklist

- [ ] PipelineValidator pre-execution
- [ ] All engines have valid manifests
- [ ] All dependencies declared
- [ ] No circular dependencies
- [ ] Pre-validation passes
- [ ] ArtifactValidator mid-pipeline
- [ ] Generated code syntax valid
- [ ] Required files exist
- [ ] CrossStageValidator mid-pipeline
- [ ] Output meets input requirements
- [ ] Consistency checks pass
- [ ] QualityValidator gates checked
- [ ] FinalValidator post-execution
- [ ] All artifacts present
- [ ] No duplicate artifacts
- [ ] State consistent
- [ ] All validation tests passing

## Required tests

1. **Pre-validation test**
   - Valid configuration: passes
   - Missing manifest: fails
   - Circular dependency: detected and fails
   - Invalid timeout: detected and fails

2. **Mid-validation test**
   - Generated code valid: passes
   - Syntax error in generated: detected and fails
   - Missing required file: detected and fails
   - Output-to-input mismatch: detected and fails

3. **Post-validation test**
   - All artifacts present: passes
   - Missing artifact: detected and fails
   - Duplicate artifact: detected and fails
   - State inconsistent: detected and fails

4. **Full integration test**
   - Valid pipeline: all validations pass
   - All three validation stages execute
   - Doctor.run() succeeds

## Completion criteria

- [x] Pre-validation implemented and working
- [x] Mid-validation implemented and working
- [x] Post-validation implemented and working
- [x] Valid pipelines pass all validation
- [x] Invalid configurations detected early
- [x] Clear error messages for validation failures
- [x] All validation tests passing

## Expected commit message

```
Phase 7: Validation pipeline - Three-stage comprehensive checks

- Create PipelineValidator for pre-execution validation
  * Verify all engines have valid manifests
  * Check all dependencies exist in registry
  * Detect circular dependencies
  * Validate timeout values
  
- Create ArtifactValidator for mid-pipeline validation
  * Verify generated code syntax
  * Check required files exist
  * Validate file structure
  
- Create CrossStageValidator for mid-pipeline validation
  * Verify outputs meet inputs
  * Check consistency between artifacts
  * Validate data flow
  
- Create FinalValidator for post-execution validation
  * Verify all expected artifacts exist
  * Check no duplicate artifacts
  * Validate final state consistency
  
- Integrate validators into Doctor.run()
  * Pre-validation: before execution
  * Mid-validation: between repair and release
  * Post-validation: before history save

Validation stages:
- Pre: catch configuration errors early
- Mid: detect issues before release
- Post: verify final pipeline output

All validations passing for valid pipelines
Invalid configs detected and reported clearly
All tests passing

This enables Phase 8: Release pipeline
```

---

# PHASE 8: RELEASE PIPELINE - UNIFIED RELEASE PATH

## Objective

Consolidate 7+ release engines into single unified ReleasePipeline with clear artifact flow.

## Why this phase exists

- V5 has 7+ release engines scattered across layers
- Execution order unclear
- State management fragmented
- Difficult to understand release flow
- Must consolidate after validation pipeline working

## Expected output

1. **Unified ReleasePipeline**
   - Single entry point: ReleasePipeline.run()
   - Consolidates: prepare, version, build, publish, verify
   - Clear phases
   - Artifact integrity checks

2. **RELEASE_PIPELINE.md**
   - Architecture documented
   - Phases and responsibilities
   - Artifact flow
   - Signing strategy (future)
   - Packaging strategy (future)

3. **Backward compatibility**
   - Old release engines deprecated
   - Route to ReleasePipeline
   - All existing tests pass

## Files that WILL change

**Created:**
- src/pipeline/ReleasePipeline.ts (NEW)
  - Consolidates 7+ release engines
  - Manages release flow

**Modified (to use pipeline):**
- src/doctor/Doctor.ts
  - Use ReleasePipeline instead of individual engines

**Deprecated:**
- All individual release engines (7+)
  - Marked @deprecated
  - Route to ReleasePipeline

## Files that MUST NOT change

- Validation logic (Phase 7)
- Repair logic (Phase 6)
- Compile logic (Phase 5)

## Estimated Risk

**MEDIUM** - Release is important but less critical than repair

### Risk factors:
- MEDIUM: Release must succeed and not lose artifacts
- MEDIUM: Version management must be correct
- MEDIUM: Publishing must not create duplicates
- LOW: Artifact flow mostly sequential

### Risk mitigation:
- Artifact integrity validation
- Version management testing
- Publishing verification

## Rollback strategy

**If release consolidation breaks:**

1. **Revert Phase 8:**
   ```
   git revert <phase-8-commit-hash>
   ```

2. **Recovery:**
   - Individual release engines still work (via wrapper)
   - Identify what broke
   - Retry Phase 8

## Validation checklist

- [ ] ReleasePipeline.run() implemented
- [ ] Prepare phase working
- [ ] Version phase working
- [ ] Build phase working
- [ ] Publish phase working
- [ ] Verify phase working
- [ ] Artifact integrity maintained
- [ ] Old engines deprecated (wrapper working)
- [ ] All release tests passing
- [ ] Output identical to Phase 0

## Required tests

1. **Pipeline execution test**
   - ReleasePipeline.run()
   - All phases execute
   - Artifacts created correctly

2. **Artifact integrity test**
   - Compare published artifacts with input
   - Verify no corruption
   - Verify structure correct

3. **Version management test**
   - Version determined correctly
   - Version files updated
   - Changelog generated

4. **Publishing test**
   - Artifacts published
   - No duplicates created
   - Verification passes

## Completion criteria

- [x] ReleasePipeline created and integrated
- [x] All 7+ release engines consolidated
- [x] Release flow: Prepare → Version → Build → Publish → Verify
- [x] Artifact integrity maintained
- [x] Release output identical to Phase 0
- [x] All tests passing
- [x] Old engines deprecated

## Expected commit message

```
Phase 8: Release pipeline - Unified release orchestration

- Create ReleasePipeline consolidating:
  * ReleaseEngine, ReleaseBuilderEngine
  * VersionManagerEngine, DeploymentPreparationEngine
  * PackagePublisherEngine, ReleaseIntelligenceEngine
  * PackageEngine, DeploymentPreparationEngine
  
- Implement release phases:
  * Prepare: verify artifacts, stage files
  * Version: determine new version, update files
  * Build: create release packages
  * Publish: publish to repos, update docs
  * Verify: verify published artifacts

- Update Doctor to use ReleasePipeline
- Mark old release engines as @deprecated
- Route via wrapper for backward compatibility

Release flow unified:
- Before: 7+ separate engines, unclear order
- After: 1 pipeline, clear phases

Release output identical to Phase 0
All tests passing
Backward compatibility maintained

This enables Phase 9: Performance optimization
```

---

# PHASE 9: PERFORMANCE OPTIMIZATION - CACHING & LAZY LOADING

## Objective

Implement caching layers (JSON, file, artifact) and lazy loading to reduce startup time and improve overall performance.

## Why this phase exists

- V5 does full project scan at startup (slow on large repos)
- JSON parsing happens multiple times (same files parsed 3-5 times)
- All 68 engines instantiated even if not needed
- Performance optimization can be done independent of consolidation
- Improves user experience significantly

## Expected output

1. **JSON Caching Layer**
   - Cache parsed JSON by path
   - Invalidation on file change
   - ~10-15% startup improvement

2. **File Caching Layer**
   - Cache file contents by path + hash
   - Invalidation on file change
   - Reduced disk I/O

3. **Lazy Engine Loading**
   - Engines instantiated on-demand (future work)
   - Documented strategy for Phase 10+

4. **PERFORMANCE_OPTIMIZATION.md**
   - Caching strategies
   - Performance metrics (before/after)
   - Lazy loading roadmap

## Files that WILL change

**Created:**
- src/cache/FileCache.ts (NEW)
  - File content caching
  - Hash-based invalidation

- src/cache/JsonCache.ts (NEW)
  - JSON parsing cache
  - Reuse parsed objects

- src/cache/MetadataCache.ts (NEW)
  - Project metadata cache
  - Reuse across scanners

**Modified (to use caches):**
- src/ai/engines/ScannerEngine.ts
  - Use FileCache for project scanning

- Various scanners
  - Use JsonCache for package.json parsing
  - Use MetadataCache for shared data

## Files that MUST NOT change

- Release pipeline (Phase 8)
- Validation pipeline (Phase 7)
- Repair pipeline (Phase 6)
- Compile pipeline (Phase 5)

## Estimated Risk

**LOW** - Caching is purely optimization, doesn't change behavior

### Risk factors:
- LOW: Caching layers are passive (read-only enhancement)
- LOW: Invalidation is conservative (recompute if any doubt)
- LOW: No behavior changes, only performance

### Risk mitigation:
- Compare caching behavior with Phase 0 (must be identical)
- Measure performance improvements
- Test cache invalidation

## Rollback strategy

**If caching causes issues:**

1. **Disable caching:**
   - Don't use cache (always fresh compute)
   - OR revert Phase 9

2. **If specific cache problematic:**
   - Disable just that cache
   - Keep others

## Validation checklist

- [ ] FileCache working
- [ ] JsonCache working
- [ ] MetadataCache working
- [ ] Cache invalidation working
- [ ] Startup time improved by 10-15%
- [ ] Results identical to Phase 0 (no behavior change)
- [ ] All tests passing

## Required tests

1. **Cache functionality test**
   - First access: cache miss, compute value
   - Second access: cache hit, return cached
   - Results identical

2. **Cache invalidation test**
   - File changed on disk
   - Cache invalidated
   - Next access: cache miss, recompute

3. **Performance test**
   - Startup time before: X seconds
   - Startup time after: Y seconds (< X)
   - Improvement: (X-Y)/X * 100%

4. **Behavior test**
   - Compare output with/without caching
   - Must be identical

## Completion criteria

- [x] Caching layers implemented
- [x] Cache invalidation working
- [x] Startup performance improved 10-15%
- [x] Output identical to Phase 0
- [x] All tests passing

## Expected commit message

```
Phase 9: Performance optimization - Caching layers

- Implement FileCache for file content caching
  * Cache by path + hash
  * Invalidate on file change
  * Reduce disk I/O
  
- Implement JsonCache for JSON parsing cache
  * Cache parsed JSON by path
  * Invalidate on file change
  * Reuse across components
  
- Implement MetadataCache for project metadata
  * Cache shared metadata
  * Reuse across scanners
  * Single parse per startup
  
- Integrate caches into Scanner engines
  * Use FileCache for project scanning
  * Use JsonCache for package.json parsing
  * Use MetadataCache for shared data

Performance improvements:
- Startup time: 10-15% reduction
- JSON parsing: 50%+ reduction (reuse)
- Disk I/O: 30%+ reduction (caching)

Output behavior identical to Phase 0
All tests passing

This enables Phase 10: Production readiness
```

---

# PHASE 10: PRODUCTION READINESS - FINAL VALIDATION & RC

## Objective

Comprehensive testing, performance verification, regression detection, and release candidate preparation.

## Why this phase exists

- Phases 1-9 complete V6 architecture transformation
- Phase 10 validates everything works together
- Stress tests and benchmarking
- Regression testing against Phase 0
- Release candidate preparation

## Expected output

1. **Performance Benchmark Report**
   - Doctor.run() time: Phase 0 vs Phase 10
   - Compile time reduction
   - Test time reduction
   - Startup time reduction
   - Memory usage comparison

2. **Stress Test Report**
   - Large project testing
   - High-iteration repair testing
   - Parallel execution testing (if enabled)
   - Concurrent Doctor.run() calls

3. **Regression Test Report**
   - 50+ regression tests from Phase 0
   - All passing on Phase 10
   - No behavior changes
   - Output comparison

4. **Documentation**
   - V6 architecture guide
   - Migration guide (V5 → V6)
   - API documentation
   - Configuration guide

5. **RELEASE_CANDIDATE_v6.0.md**
   - All phases complete
   - All tests passing
   - All benchmarks met
   - Ready for production release

## Files that WILL change

**Created:**
- PERFORMANCE_BENCHMARK_REPORT.md
- STRESS_TEST_REPORT.md
- REGRESSION_TEST_REPORT.md
- V6_MIGRATION_GUIDE.md
- V6_ARCHITECTURE_GUIDE.md

**Updated:**
- Documentation files
- README.md (updated for V6)

## Files that MUST NOT change

- Any source code (Phases 1-9 complete)
- Any runtime behavior

## Estimated Risk

**LOW** - Phase 10 is validation only, no code changes

## Rollback strategy

**N/A** - Phase 10 makes no code changes, only validates and documents

## Validation checklist

- [ ] All 50+ regression tests passing
- [ ] Doctor.run() completes successfully
- [ ] Compilation time reduced 50%+
- [ ] Test time reduced 40%+
- [ ] Startup time reduced 15%+
- [ ] Memory usage reduced 30%+
- [ ] No behavior changes (output identical)
- [ ] Stress tests passing
- [ ] Parallel execution (if enabled) working
- [ ] Large project handling verified
- [ ] Documentation complete
- [ ] Team sign-off obtained

## Required tests

1. **Regression test suite**
   - All 50+ regression tests from Phase 0
   - All passing on Phase 10
   - No output differences

2. **Performance benchmark**
   - Compare Phase 0 vs Phase 10
   - Measure: Doctor.run() time, compile time, test time, startup, memory
   - Report results

3. **Stress testing**
   - Large project (10,000+ files)
   - High iteration repairs (10+ attempts)
   - Concurrent executions (if parallelization enabled)

4. **Parallel execution testing** (if enabled)
   - Generation stage parallelization
   - Validation stage parallelization
   - Verify correctness with and without parallelization

5. **Documentation verification**
   - Architecture guide completeness
   - Migration guide accuracy
   - API documentation consistency

## Completion criteria

- [x] All regression tests passing
- [x] Performance benchmarks met (50%+ compile improvement)
- [x] Stress tests successful
- [x] Zero behavior changes
- [x] Documentation complete
- [x] Release candidate ready

## Expected commit message

```
Phase 10: Production readiness - Release candidate v6.0

COMPREHENSIVE VALIDATION:

Regression Testing:
✓ All 50+ regression tests passing
✓ Output identical to Phase 0
✓ No behavior changes

Performance Benchmarking:
✓ Doctor.run(): X seconds → Y seconds (50%+ improvement)
✓ Compile: 30s → 15s (50% reduction)
✓ Tests: 15s → 9s (40% reduction)
✓ Startup: 10s → 8.5s (15% reduction)
✓ Memory: reduced 30%+

Stress Testing:
✓ Large projects: 10,000+ files handled correctly
✓ High-iteration repairs: 10+ attempts successful
✓ Concurrent execution: safe and correct

Architecture Improvements:
✓ Phase 1: Repository cleanup (70% size reduction)
✓ Phase 2: Registry consolidation (5+ → 1 instance)
✓ Phase 3: Resolver centralization (2-3 → 1 sort)
✓ Phase 4: Scheduler enhancement (timeout, retry, events)
✓ Phase 5: Compile pipeline (2-4 → 1-2 executions)
✓ Phase 6: Repair pipeline (4 → 1 unified engine)
✓ Phase 7: Validation pipeline (pre/mid/post validation)
✓ Phase 8: Release pipeline (7+ → 1 unified engine)
✓ Phase 9: Performance optimization (caching layers)
✓ Phase 10: Production readiness (comprehensive validation)

Documentation:
✓ V6 Architecture Guide: complete
✓ Migration Guide (V5→V6): complete
✓ API Documentation: complete
✓ Configuration Guide: complete

RELEASE CANDIDATE v6.0 READY FOR PRODUCTION

This represents transformation of V5 into V6:
- 38 unified engines (from 101)
- 1-layer orchestration (from 3-layer)
- 50-60% faster pipeline
- 70% cleaner repository
- Complete backward compatibility
- Comprehensive validation

All phases complete. Ready for V6.0 release.
```

---

# MASTER CHECKLIST & GOVERNANCE

## MIGRATION CHECKLIST - All Phases

### Phase 0: Project Freeze
- [ ] V5 frozen at commit XXXXXXX
- [ ] Performance baseline captured
- [ ] Regression test suite created
- [ ] Rollback procedures tested

### Phase 1: Repository Cleanup
- [ ] .gitignore updated
- [ ] Dead artifacts removed from git
- [ ] Repository size reduced 70%+
- [ ] Scripts organized
- [ ] `git status` clean

### Phase 2: Registry Consolidation
- [ ] Single EngineRegistry instance
- [ ] Doctor creates one registry
- [ ] All components use injected registry
- [ ] All 68 engines findable
- [ ] doctor/EngineRegistry deprecated

### Phase 3: Resolver Centralization
- [ ] resolve() called once (in Doctor)
- [ ] Result passed through layers
- [ ] No re-resolution in sub-components
- [ ] All engines declare dependencies
- [ ] Resolved order verified

### Phase 4: Scheduler Enhancement
- [ ] ExecutionScheduler.run() used
- [ ] Timeout handling working
- [ ] Retry strategy implemented
- [ ] Circuit breaker available
- [ ] Events emitted

### Phase 5: Compile Pipeline
- [ ] CompileManager created
- [ ] Compile caching working
- [ ] Cache invalidation working
- [ ] Compile runs 1-2 times (not 2-4)
- [ ] Performance improved 30-40%

### Phase 6: Repair Pipeline
- [ ] RepairPipeline.run() implemented
- [ ] 4 repair engines consolidated
- [ ] Phases: Analyze → Plan → Execute → Verify → Loop
- [ ] Iteration logic working (max 3)
- [ ] State management unified

### Phase 7: Validation Pipeline
- [ ] Pre-validation working
- [ ] Mid-validation working
- [ ] Post-validation working
- [ ] Valid pipelines pass all validation
- [ ] Invalid configs detected early

### Phase 8: Release Pipeline
- [ ] ReleasePipeline.run() implemented
- [ ] 7+ release engines consolidated
- [ ] Artifact integrity maintained
- [ ] Publishing working correctly

### Phase 9: Performance Optimization
- [ ] FileCache working
- [ ] JsonCache working
- [ ] MetadataCache working
- [ ] Startup improved 10-15%

### Phase 10: Production Readiness
- [ ] All regression tests passing
- [ ] Performance benchmarks met
- [ ] Stress tests successful
- [ ] Documentation complete
- [ ] Release candidate approved

---

## ROLLBACK CHECKLIST - All Phases

### If Phase N fails, execute in order:

1. **Immediate Action**
   ```
   git log --oneline -5  # Identify Phase N commit
   git revert <phase-n-commit>  # Revert Phase N
   git status  # Verify clean
   pnpm install  # Restore dependencies
   pnpm build  # Verify build succeeds
   pnpm test  # Run regression tests
   ```

2. **Verification**
   - [ ] Git history clean (revert commit added)
   - [ ] Build succeeds
   - [ ] All tests passing
   - [ ] Doctor.run() works
   - [ ] Metrics match Phase N-1

3. **Escalation (if revert doesn't fix)**
   - [ ] Full reset to pre-Phase-N
   - [ ] Investigate issue
   - [ ] Document lesson learned
   - [ ] Retry Phase N with fix

### Post-Rollback Recovery

1. **Root cause analysis**
   - What went wrong in Phase N?
   - Why did validation not catch it?

2. **Fix implementation**
   - Address root cause
   - Update tests to catch issue

3. **Phase N retry**
   - Re-implement Phase N with fix
   - More thorough testing
   - Sign-off required before proceeding

---

## RISK MATRIX

| Phase | Risk Level | Primary Risk | Mitigation | Rollback Time |
|-------|-----------|--------------|-----------|--------------|
| 0 | LOW | Metrics capture | Review baselines | N/A |
| 1 | LOW | Artifact removal | Verify dead code | < 5 min |
| 2 | MEDIUM | Registry consistency | Comprehensive testing | 10-15 min |
| 3 | MEDIUM | Dependency ordering | Compare orders | 10-15 min |
| 4 | MEDIUM | Timeout tuning | Conservative defaults | 10-15 min |
| 5 | MEDIUM | Cache invalidation | Extensive testing | 15-20 min |
| 6 | HIGH | Repair consolidation | Broken code testing | 20-30 min |
| 7 | LOW-MEDIUM | Validation blocking | Warning mode default | 10-15 min |
| 8 | MEDIUM | Release flow | Artifact integrity | 15-20 min |
| 9 | LOW | Cache hits | Conservative invalidation | 5-10 min |
| 10 | LOW | Regression detection | Baseline comparison | N/A |

---

## TESTING MATRIX

| Phase | Unit Tests | Integration Tests | Performance Tests | Regression Tests | Manual Tests |
|-------|-----------|------------------|------------------|-----------------|------------|
| 0 | - | ✓ | ✓ | Create | ✓ |
| 1 | - | ✓ | - | - | ✓ |
| 2 | ✓ | ✓ | - | All | ✓ |
| 3 | ✓ | ✓ | ✓ | All | ✓ |
| 4 | ✓ | ✓ | ✓ | All | ✓ |
| 5 | ✓ | ✓ | ✓ | All | ✓ |
| 6 | ✓ | ✓ | ✓ | All | ✓ |
| 7 | ✓ | ✓ | - | All | ✓ |
| 8 | ✓ | ✓ | - | All | ✓ |
| 9 | ✓ | ✓ | ✓ | All | ✓ |
| 10 | - | - | ✓ | All | ✓ |

---

## ARCHITECTURE ACCEPTANCE CHECKLIST

### Functionality Acceptance
- [ ] All 68 engines execute (no dropped engines)
- [ ] Repair works (broken code fixed)
- [ ] Generation works (code generated correctly)
- [ ] Tests pass (test suite runs)
- [ ] Release works (artifacts published)

### Performance Acceptance
- [ ] Doctor.run(): ≥ 50% improvement
- [ ] Compilation: ≥ 30% improvement
- [ ] Testing: ≥ 25% improvement
- [ ] Startup: ≥ 10% improvement
- [ ] Memory: ≥ 20% improvement

### Quality Acceptance
- [ ] All regression tests pass
- [ ] No behavior changes
- [ ] Output identical to Phase 0
- [ ] Code cleaner and more maintainable
- [ ] Documentation complete

### Operational Acceptance
- [ ] Repository 70% smaller
- [ ] Git history cleaner
- [ ] Build faster
- [ ] Deployment easier
- [ ] Support documented

---

## DEFINITION OF DONE

For EACH phase to be considered complete, ALL criteria must be met:

### Code Quality
- [ ] No commented-out code
- [ ] No debug logging left in
- [ ] All linting passes (ESLint)
- [ ] Type checking passes (tsc)
- [ ] No TypeScript errors

### Testing
- [ ] Unit tests written and passing
- [ ] Integration tests passing
- [ ] All regression tests passing
- [ ] 0 known failures
- [ ] Test coverage ≥ 60%

### Documentation
- [ ] Phase deliverables documented
- [ ] Commit message clear and complete
- [ ] Rollback procedures verified
- [ ] Lessons learned captured

### Verification
- [ ] Metrics compared with Phase 0
- [ ] Performance targets met (or exceeded)
- [ ] No regressions detected
- [ ] Output bit-identical to Phase 0 (where expected)
- [ ] Team sign-off obtained

### Readiness
- [ ] All Phase N goals achieved
- [ ] Rollback tested and verified
- [ ] No known issues
- [ ] Phase N+1 can proceed
- [ ] Release coordinator briefed

---

## GOVERNANCE & SIGN-OFF

### Phase Approval Required From:

1. **Lead Architect** (reviews design, approves phase objective)
2. **Tech Lead** (reviews implementation, approves approach)
3. **QA Lead** (reviews testing, approves coverage)
4. **DevOps Lead** (reviews deployment, approves rollback)

### Sign-off Process

```
FOR EACH PHASE:

1. Pre-Phase Review (Lead Architect)
   - Approve phase objective
   - Approve timeline estimate
   - Approve risk assessment

2. Phase Implementation (Tech Team)
   - Complete all tasks
   - Achieve all criteria
   - Document decisions

3. Phase Testing (QA)
   - All tests passing
   - No regressions
   - Performance verified

4. Phase Sign-off (All leads)
   - Objective achieved
   - Criteria met
   - Tests passing
   - Ready for next phase

5. Archive Phase Artifacts
   - Phase report
   - Commit hash
   - Metrics
   - Lessons learned
```

### Escalation Path

If Phase N doesn't meet criteria:

1. **Day 1:** Identify issue, attempt fix
2. **Day 2:** Escalate to Tech Lead, determine rollback vs fix
3. **Day 3:** Execute rollback OR retry with fix
4. **Document:** Root cause, resolution, prevention

---

## SUCCESS METRICS - FINAL ACHIEVEMENT

### Architectural Metrics

| Metric | V5 | V6 Target | V6 Actual | Status |
|--------|-----|----------|----------|--------|
| Engine count | 101 | 38 | | |
| Orchestration layers | 3 | 1 | | |
| Registry instances | 5+ | 1 | | |
| Pipeline sorts | 2-3 | 1 | | |
| Duplicate engines | 21 | 0 | | |

### Performance Metrics

| Metric | V5 | V6 Target | V6 Actual | Status |
|--------|-----|----------|----------|--------|
| Doctor.run() time | 35-40s | 15-20s | | |
| Compile time | 5-10s | 2.5-5s | | |
| Test time | 5-8s | 3-5s | | |
| Startup time | 5-10s | 4-8.5s | | |
| Memory usage | High | 60% lower | | |

### Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Regression tests passing | 100% | | |
| Behavior changes | 0 | | |
| Output identical | 100% | | |
| Repository size reduction | 70%+ | | |
| Code cleanliness | 100% | | |

---

**Document Status:** IMPLEMENTATION PLAN COMPLETE - READY FOR PHASE 0 AUTHORIZATION

**Next Step:** Stakeholder review and Phase 0 approval
