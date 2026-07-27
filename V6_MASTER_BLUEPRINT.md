# V6 Master Blueprint - SATSET AI Factory Architecture

**Date:** 2026-07-27  
**Version:** V6 Foundation Design  
**Status:** ARCHITECTURE DESIGN (NO IMPLEMENTATION)  
**Project:** POS WISATA | V5 → V6 Transition  

---

## Executive Summary

This document defines the target V6 architecture for SATSET AI Factory, consolidating findings from three comprehensive analysis reports (V6_FOUNDATION_REVIEW, V6_RUNTIME_ANALYSIS, V6_RUNTIME_VERIFICATION) into a cohesive architectural vision.

**Key Improvement Areas:**
- Eliminate 3-layer orchestration complexity
- Consolidate 21 duplicate engines
- Remove 2-4× compilation redundancy
- Unify fragmented engine registries
- Add robust validation checkpoints
- Reduce repository bloat by 70%+
- Improve pipeline execution clarity

**V6 is NOT a rewrite.** V6 preserves all working functionality while refactoring architectural inefficiencies into a cleaner, faster, more maintainable system.

---

# 1. CURRENT RUNTIME ARCHITECTURE

## 1.1 Overview

The V5 runtime consists of 3 orchestration layers with 101 total engines (68 + 55 + 9 benchmark engines):

```
┌────────────────────────────────────────────────────────────────┐
│ LAYER 1: Doctor (Entry Point)                                  │
│                                                                 │
│  - Instantiates 68 engines in constructor                      │
│  - PipelineResolver.resolve() → topological sort (O(n²))      │
│  - Stores resolved pipeline in this.pipeline                   │
│  - Calls pluginEngine.loadPlugins()                            │
│  - Creates FactoryRuntime instance                             │
│  - Conditionally runs Benchmark phase                          │
│  - Calls historyEngine.save()                                  │
└────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────┐
│ LAYER 2: FactoryRuntime (Runtime Wrapper)                      │
│                                                                 │
│  - Creates NEW EngineRegistry() instance                       │
│  - Creates NEW PipelineResolver() instance                     │
│  - Calls resolver.resolve() AGAIN (O(n²)) — 2nd sort         │
│  - Creates ExecutionScheduler                                  │
│  - Executes 68 engines sequentially via manual loop            │
│  - Calls ExecutionScheduler.createGroups() (not used)         │
│  - ArtifactBus.flush() — writes all artifacts at end          │
│  - RuntimeMetricsEngine.collect()                              │
│  - HistoryEngine.save()                                        │
└────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              (Engine #1) (Engine #2) (Engine #42: DoctorOrchestrator)
                    │         │         │
                    │         │         ▼
                    │         │    ┌─────────────────────────────┐
                    │         │    │ LAYER 3: DoctorOrchestrator │
                    │         │    │                             │
                    │         │    │ - Creates 55 NEW engines    │
                    │         │    │ - Runs all sequentially     │
                    │         │    │ - HistoryEngine.save()      │
                    │         │    │ - CertificationEngine.run() │
                    │         │    └─────────────────────────────┘
                    │         │         │
                    └─────────┴─────────┘
                              │
                              ▼
               ┌──────────────────────────────────────┐
               │ LAYER 4: Benchmark Phase             │
               │ (if !skipBenchmark)                  │
               │                                      │
               │ - BenchmarkEngine                    │
               │ - ProjectEvaluator                   │
               │ - CompileEvaluator (may recompile)   │
               │ - QualityScoreEngine                 │
               │ - RegressionAnalyzer                 │
               │ - ReleaseEvaluator                   │
               │ - TrendAnalyzer                      │
               │ - ProductionValidator                │
               │ - DashboardRuntime                   │
               │                                      │
               │ - HistoryEngine.save()               │
               └──────────────────────────────────────┘
```

## 1.2 Current Engine Count

| Layer | Location | Count | Role |
|-------|----------|-------|------|
| **Layer 1** | Doctor.constructor | 68 | Main pipeline orchestration |
| **Layer 2** | FactoryRuntime | 0 | Runtime wrapper (uses Layer 1 engines) |
| **Layer 3** | DoctorOrchestrator | 55 | Secondary pipeline (within Layer 1 #42) |
| **Layer 4** | Benchmark phase | 9 | Performance evaluation |
| **TOTAL** | All sources | 101 | 68 unique + 55 nested + 21 duplicates |

## 1.3 Key Architectural Issues

### Issue 1.3.1: Triple-Layer Orchestration
- **Problem:** Doctor → FactoryRuntime → DoctorOrchestrator creates 3 levels of indirection
- **Impact:** Execution flow unclear, hard to reason about
- **Symptom:** New developers confused about where engine actually runs

### Issue 1.3.2: Duplicate Engine Registry Implementations
- **Problem:** `doctor/EngineRegistry` and `runtime/EngineRegistry` with different structures
- **Impact:** 5+ registry instances created at startup
- **Symptom:** Registry lookups fragmented, state not synchronized

### Issue 1.3.3: Redundant Compilation
- **Problem:** CompileEngine runs in 3-4 places:
  1. RepairCoordinator loop (1-5 iterations)
  2. RepairLoopEngine loop (up to 3 times)
  3. DoctorOrchestrator directly
  4. CompileEvaluator benchmark
- **Impact:** Compilation (slowest operation) runs 2-4× per Doctor.run()
- **Symptom:** Pipeline takes 35-40 seconds when it could be 10-15 seconds

### Issue 1.3.4: Redundant Topological Sorting
- **Problem:** resolve() called twice, createGroups() called twice:
  1. Doctor.constructor: `pipelineResolver.resolve([68 engines])`
  2. FactoryRuntime.run(): `this.pipelineResolver.resolve(this.engines)`
- **Impact:** O(n²) algorithm runs unnecessarily
- **Symptom:** Startup delay even on no-op runs

### Issue 1.3.5: Sequential Execution Despite Groups
- **Problem:** ExecutionScheduler.createGroups() creates groups but:
  - All groups have `parallel: false`
  - ExecutionScheduler.run() never called (manual loop used instead)
  - No parallelization despite modern multi-core
- **Impact:** Single-threaded execution of 68 potentially independent engines
- **Symptom:** CPU utilization ~10% (one core busy)

### Issue 1.3.6: Repository Bloat
- **Problem:** 30+ build output files tracked in git
  - 4 backup folders committed
  - Temp scripts in root directory
  - .gitignore patterns incomplete
- **Impact:** Repository size 40%+ larger than necessary
- **Symptom:** Clone slow, history large, unclear intent

---

# 2. TARGET RUNTIME ARCHITECTURE

## 2.1 V6 Vision: Unified Single-Layer Orchestration

```
┌────────────────────────────────────────────────────────────────┐
│ V6 Doctor (Single Orchestration Layer)                          │
│                                                                 │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ STAGE 1: PRE-EXECUTION (New)                             │   │
│ │ - Load Plugins                                           │   │
│ │ - Initialize Context                                     │   │
│ │ - Validate Pipeline Configuration ← NEW                 │   │
│ │ - Load/Restore Checkpoints (if resuming)                │   │
│ └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ STAGE 2: UNIFIED EXECUTION                               │   │
│ │                                                           │   │
│ │ Engines organized into logical STAGES (not layers):       │   │
│ │                                                           │   │
│ │ STAGE 2A: Analysis (sequential)                           │   │
│ │  - Scanner → Analyzer → Diagnostic → RootCause           │   │
│ │                                                           │   │
│ │ STAGE 2B: Planning (sequential)                           │   │
│ │  - Planner → ArchitectureEngine → ExecutionGraphEngine  │   │
│ │                                                           │   │
│ │ STAGE 2C: Generation (can parallelize)                   │   │
│ │  - DatabaseGenerator ║ BackendGenerator ║ FrontendGen.  │   │
│ │  - AuthGen ║ OpenAPIGen ║ DockerGen ║ DeploymentGen     │   │
│ │  - DocumentationGen (parallel stage)                     │   │
│ │                                                           │   │
│ │ STAGE 2D: Build (sequential)                             │   │
│ │  - Compile (once with cache)                             │   │
│ │  - Test (on generated code)                              │   │
│ │                                                           │   │
│ │ STAGE 2E: Repair Loop (conditional)                      │   │
│ │  - Unified RepairPipeline (consolidates 4 engines)       │   │
│ │  - Loops up to MAX_REPAIR_ATTEMPTS                       │   │
│ │  - Uses CompileCache (no redundant compiles)             │   │
│ │  - Conditional TestEngine (only if tests failed)         │   │
│ │                                                           │   │
│ │ STAGE 2F: Validation (enhanced)                          │   │
│ │  - Quality checks                                         │   │
│ │  - Artifact validation                                   │   │
│ │  - Cross-stage consistency checks ← NEW                  │   │
│ │                                                           │   │
│ │ STAGE 2G: Release (unified)                              │   │
│ │  - Single release coordinator (not 7 separate)           │   │
│ │  - Version management                                    │   │
│ │  - Publishing                                            │   │
│ │                                                           │   │
│ │ STAGE 2H: Benchmark & Analysis (post-execution)          │   │
│ │  - Performance evaluation                                │   │
│ │  - Quality scoring                                       │   │
│ │  - Regression analysis                                   │   │
│ └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ STAGE 3: POST-EXECUTION (Enhanced)                       │   │
│ │ - ArtifactBus.flush() (with deduplication)              │   │
│ │ - Metrics collection                                     │   │
│ │ - Final validation ← NEW                                 │   │
│ │ - History save (final checkpoint)                        │   │
│ │ - Dashboard update                                       │   │
│ └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

## 2.2 V6 Engine Count & Organization

| Category | Engine Count | Organization |
|----------|--------------|---------------|
| **Analysis Stage** | 7 | Sequential, no parallelization needed |
| **Planning Stage** | 5 | Sequential, builds on analysis output |
| **Generation Stage** | 9 | Parallel-capable (7 generators + 2 supporting) |
| **Build Stage** | 2 | Sequential (compile → test with cache) |
| **Repair Stage** | 1 | Unified RepairPipeline (was 4 separate) |
| **Validation Stage** | 3 | Enhanced (new cross-stage validators) |
| **Release Stage** | 2 | Unified (was 7+ separate) |
| **Benchmark Stage** | 3 | Sequential, post-execution |
| **Infrastructure** | 3 | Registry, metrics, history |
| **TOTAL** | ~38 | Lean, organized, no duplicates |

**Reduction:** 101 → 38 total engines (62% reduction via consolidation)

---

# 3. EXECUTION FLOW

## 3.1 V5 Current Execution (Before V6)

```
Entry: Doctor.run()
  ├─ Constructor instantiates 68 engines
  ├─ PipelineResolver.resolve(68 engines) → O(n²) sort
  ├─ Store in this.pipeline
  │
  ├─ runWithMetrics()
  │   ├─ Load plugins
  │   ├─ Create FactoryRuntime
  │   │   ├─ Create NEW EngineRegistry
  │   │   ├─ Create NEW PipelineResolver
  │   │   ├─ resolve(68) AGAIN → O(n²) sort duplicate
  │   │   │
  │   │   ├─ Execute engines 1-68 sequentially
  │   │   │   ├─ Engine 1: ScannerEngine
  │   │   │   ├─ Engine 2: PluginEngine (already loaded)
  │   │   │   ├─ ...
  │   │   │   ├─ Engine 42: DoctorOrchestrator
  │   │   │   │    └─ Create 55 engines
  │   │   │   │    └─ Run all 55 sequentially
  │   │   │   │    └─ HistoryEngine.save()
  │   │   │   │    └─ CertificationEngine.run()
  │   │   │   └─ Engine 68: ReporterEngine
  │   │   │
  │   │   ├─ ArtifactBus.flush() (write 50+ artifacts)
  │   │   ├─ RuntimeMetricsEngine.collect()
  │   │   └─ HistoryEngine.save() (2nd save)
  │   │
  │   ├─ Benchmark phase (if !skipBenchmark)
  │   │   ├─ CompileEvaluator (may recompile)
  │   │   ├─ QualityScoreEngine
  │   │   └─ ReleaseEvaluator
  │   │
  │   └─ HistoryEngine.save() (3rd save)
  │
  └─ Return context

Problems:
  ✗ Registry created 2+ times
  ✗ PipelineResolver.resolve() called 2+ times
  ✗ Topological sort redundant
  ✗ ExecutionScheduler.createGroups() called but result unused
  ✗ DoctorOrchestrator runs 55 engines in isolation within Layer 1
  ✗ CompileEngine runs in 3-4 places
  ✗ TestEngine runs in 2-3 places
  ✗ HistoryEngine.save() called 3 times
```

## 3.2 V6 Target Execution (After V6)

```
Entry: Doctor.run()
  ├─ Constructor instantiates ~38 engines (unified, no duplicates)
  ├─ Create single PipelineResolver with unified registry
  ├─ resolve(38 engines) → O(n²) sort once
  ├─ Store in this.pipeline
  │
  ├─ Run()
  │   ├─ STAGE 1: PRE-EXECUTION
  │   │   ├─ Load plugins (once)
  │   │   ├─ Initialize context
  │   │   ├─ PipelineValidator.validate()
  │   │   │   ├─ Verify all engines have manifests
  │   │   │   ├─ Check all dependencies exist
  │   │   │   ├─ Detect circular dependencies
  │   │   │   └─ Validate timeout values
  │   │   └─ Load checkpoint (if resuming)
  │   │
  │   ├─ STAGE 2: UNIFIED EXECUTION (single pass)
  │   │   │
  │   │   ├─ STAGE 2A: Analysis (7 engines, sequential)
  │   │   │   ├─ Engine 1: ScannerEngine
  │   │   │   ├─ Engine 2: AnalyzerEngine
  │   │   │   ├─ Engine 3: DiagnosticEngine
  │   │   │   └─ ... (4 more sequential analysis engines)
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   ├─ STAGE 2B: Planning (5 engines, sequential)
  │   │   │   ├─ Engine 1: PlannerEngine
  │   │   │   ├─ Engine 2: ArchitectureEngine
  │   │   │   └─ ... (3 more planning engines)
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   ├─ STAGE 2C: Generation (9 engines, parallel)
  │   │   │   ├─ [PARALLEL] DatabaseGenerator
  │   │   │   ├─ [PARALLEL] BackendGenerator
  │   │   │   ├─ [PARALLEL] FrontendGenerator
  │   │   │   ├─ [PARALLEL] AuthenticationGenerator
  │   │   │   ├─ [PARALLEL] OpenApiGenerator
  │   │   │   ├─ [PARALLEL] DockerGenerator
  │   │   │   ├─ [PARALLEL] DeploymentGenerator
  │   │   │   ├─ [PARALLEL] DocumentationGenerator
  │   │   │   └─ Checkpoint save (waits for all)
  │   │   │
  │   │   ├─ STAGE 2D: Build (2 engines, sequential)
  │   │   │   ├─ Engine 1: CompileEngine (ONCE with cache)
  │   │   │   ├─ Engine 2: TestEngine
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   ├─ STAGE 2E: Repair Loop (conditional, max 3 iterations)
  │   │   │   ├─ RepairPipeline.run()
  │   │   │   │   ├─ Classify errors
  │   │   │   │   ├─ Generate patches
  │   │   │   │   ├─ Apply patches
  │   │   │   │   ├─ Test (recompile only if patches changed code)
  │   │   │   │   ├─ Verify
  │   │   │   │   ├─ If passed, break loop
  │   │   │   │   └─ If failed, retry
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   ├─ STAGE 2F: Validation (3 engines, sequential)
  │   │   │   ├─ Engine 1: ArtifactValidator
  │   │   │   ├─ Engine 2: CrossStageValidator (NEW)
  │   │   │   ├─ Engine 3: QualityValidator
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   ├─ STAGE 2G: Release (2 engines, sequential)
  │   │   │   ├─ Engine 1: UnifiedReleaseCoordinator
  │   │   │   ├─ Engine 2: PublishingEngine
  │   │   │   └─ Checkpoint save
  │   │   │
  │   │   └─ STAGE 2H: Benchmark (3 engines, sequential)
  │   │       ├─ Engine 1: PerformanceAnalyzer (reads-only, no recompile)
  │   │       ├─ Engine 2: QualityScoreEngine
  │   │       └─ Engine 3: RegressionAnalyzer
  │   │
  │   ├─ STAGE 3: POST-EXECUTION
  │   │   ├─ ArtifactBus.flush() (with deduplication)
  │   │   ├─ FinalValidator.validate() (NEW)
  │   │   ├─ RuntimeMetricsEngine.collect()
  │   │   ├─ HistoryEngine.save() (final checkpoint)
  │   │   └─ DashboardEngine.update()
  │   │
  │   └─ Return context

Improvements:
  ✓ Single registry instance
  ✓ Single topological sort (one PipelineResolver)
  ✓ ExecutionScheduler used for actual execution (not manual loop)
  ✓ No duplicate DoctorOrchestrator layer (engines integrated)
  ✓ CompileEngine runs once with caching
  ✓ TestEngine runs 1-2 times (not 2-3)
  ✓ HistoryEngine.save() called max 2 times (not 3)
  ✓ Parallel generation stage (7-9 generators can run together)
  ✓ Clear pipeline stages with checkpoints between
  ✓ Artifact deduplication prevents collisions
```

---

# 4. ENGINE LAYERS

## 4.1 V5 Current Layers

```
LAYER 1: Doctor Pipeline
  ├─ 68 engines instantiated in Doctor.constructor
  ├─ Engines include core analysis, repair, generation
  ├─ INCLUDES Engine #42: DoctorOrchestrator (nests Layer 3)
  └─ Resolved with 2nd PipelineResolver in FactoryRuntime

LAYER 2: FactoryRuntime (Runtime Wrapper)
  ├─ Executes the 68 Layer 1 engines
  ├─ Creates NEW registry + resolver (redundant)
  ├─ Calls ExecutionScheduler.createGroups() (result unused)
  └─ Manually loops engines sequentially

LAYER 3: DoctorOrchestrator (Nested within Layer 1 #42)
  ├─ 55 engines created and instantiated at runtime
  ├─ Includes 21 duplicates from Layer 1
  ├─ Runs in isolation within Layer 1 execution
  ├─ Has separate HistoryEngine.save() call
  └─ Runs CertificationEngine

LAYER 4: Benchmark Phase
  ├─ 9 engines for performance evaluation
  ├─ Runs after FactoryRuntime (conditional)
  ├─ Includes CompileEvaluator (may recompile)
  └─ Runs after main pipeline completes
```

## 4.2 V6 Target Layers (Actually Stages)

Rename from "layers" to "stages" to clarify they are sequential phases, not concurrent layers:

```
STAGE 1: Pre-Execution
  ├─ Plugin loading
  ├─ Context initialization
  ├─ Pipeline validation (NEW)
  └─ Checkpoint restoration (if resuming)

STAGE 2: Core Execution (8 sub-stages)
  ├─ 2A: Analysis (7 engines, sequential)
  ├─ 2B: Planning (5 engines, sequential)
  ├─ 2C: Generation (9 engines, parallel-capable)
  ├─ 2D: Build (2 engines, sequential)
  ├─ 2E: Repair (unified, not 4 separate engines)
  ├─ 2F: Validation (3 engines, enhanced, NEW)
  ├─ 2G: Release (unified, not 7 separate engines)
  └─ 2H: Benchmark (3 engines, read-only)

STAGE 3: Post-Execution
  ├─ Artifact finalization
  ├─ Final validation
  ├─ Metrics collection
  └─ History checkpoint
```

## 4.3 Engine Distribution

### V5 Distribution (101 total engines)

```
Analysis:        7 engines
Planning:        8 engines
Generation:      9 generators + 3 support = 12 engines
Build:           2 engines (but runs 3-4 times due to redundancy)
Repair:          4 separate engines (RepairEngine, RepairCoordinator, RepairLoopEngine, AutoRepairEngine)
Validation:      5 engines (but scattered, not coordinated)
Release:         7+ engines (scattered across layers)
Quality:         4 engines (duplicate quality checks)
Benchmark:       9 engines
Infrastructure:  4 engines (registries, schedulers, bus, metrics)
Unknown/Monitor: 30+ engines (compile monitors, test monitors, etc.)

TOTAL: 101 engines = 68 in Doctor + 55 in Orchestrator - 21 duplicates + 9 benchmark
```

### V6 Distribution (38 target engines)

```
Analysis:        7 engines (unified)
Planning:        5 engines (reduced, consolidated)
Generation:      9 engines (unified, no duplicates)
Build:           2 engines (unified, cached)
Repair:          1 engine (consolidated from 4)
Validation:      3 engines (enhanced with cross-stage checks)
Release:         2 engines (consolidated from 7+)
Benchmark:       3 engines (read-only, no recompilation)
Infrastructure:  3 engines (unified registry, metrics, history)

TOTAL: 38 engines = ~62% reduction
```

---

# 5. DEPENDENCY LAYERS

## 5.1 V5 Dependency Graph Issues

### Issue 5.1.1: Empty Dependency Arrays
```
Current State:
  - 93 of 101 engines use default manifest
  - Default manifest has: dependencies: []
  - Circular dependency detection runs but finds no cycles
  - Topological sort produces arbitrary order (all with no deps)

Problem:
  - Actual dependencies not tracked
  - Implicit code dependencies (e.g., BuildLoopEngine needs CompileEngine)
  - Not in manifests, code-only
  - Fragile to refactoring
```

### Issue 5.1.2: Implicit Dependencies
```
Current:
  RepairCoordinator depends on (embedded fields):
    - CompileEngine (private field)
    - TestEngine (private field)
    - ErrorClassifier
    - PatchPlanner
    - PatchGenerator
    - PatchApplier
    - BuildVerifier
    - HistoryEngine
    - CheckpointManager
  
  But manifest says: dependencies: []
  
  Result: Topological sort doesn't know about these, could order wrong
```

### Issue 5.1.3: Multiple Registry Instances
```
Current Registries:
  1. doctor/EngineRegistry (simple Map<name, engine>)
  2. runtime/EngineRegistry (complex with manifests)
  3. PipelineResolver default registry
  4. FactoryRuntime registry
  5. AutonomousOrchestrator registry
  6. AgentMeshEngine registry
  
  Total: 6 registry instances at startup
  
  Problem: No synchronization between them
```

## 5.2 V6 Dependency Model

### Strategy 5.2.1: Unified Dependency Declaration

```
All engines implement getManifest() returning:

interface EngineManifest {
  id: string;
  name: string;
  version: string;
  dependencies: string[];  // ← ALL required
  timeout: number;
  retryPolicy: { retries: number; backoff: number };
  category: 'analysis' | 'planning' | 'generation' | 'build' | 'repair' | 'validation' | 'release' | 'benchmark';
  parallelizable: boolean;  // Can run in parallel?
  checkpointable: boolean;  // Can save checkpoint after?
}

Examples:
  {
    id: "compile-engine",
    name: "CompileEngine",
    dependencies: ["artifact-generator"],  // Must run after
    category: "build",
    parallelizable: false,
    checkpointable: true
  }
  
  {
    id: "backend-generator",
    name: "BackendGenerator",
    dependencies: ["planner-engine"],
    category: "generation",
    parallelizable: true,  // Can run with other generators
    checkpointable: true
  }
```

### Strategy 5.2.2: Single Unified Registry

```
V6 Registry (unified):
  - Located: runtime/EngineRegistry (single implementation)
  - Tracks: engines + manifests + health + validation state
  - Used by: All components (Doctor, FactoryRuntime, ExecutionScheduler)
  - Instance count: 1 (created once in Doctor, passed everywhere)

Methods:
  register(engine, manifest): void
  get(id): Engine | null
  getManifest(id): EngineManifest
  validateAll(): ValidationError[]
  getHealth(id): 'healthy' | 'degraded' | 'failing'
```

### Strategy 5.2.3: Explicit Dependency Validation

```
PipelineValidator (NEW):
  
  validate(registry, engines):
    ├─ For each engine:
    │   ├─ Check has manifest
    │   ├─ Check timeout 100ms < timeout < 3600000ms
    │   ├─ Check for cycles
    │   └─ Check dependencies exist in registry
    │
    ├─ For each dependency:
    │   ├─ Verify dependency engine exists
    │   ├─ Verify dependency before dependent
    │   └─ Check for circular chains
    │
    └─ Return ValidationError[] (empty = valid)

Timing:
  - Called in Doctor.run() before FactoryRuntime
  - Catches configuration errors early
  - Provides clear error messages to operators
```

---

# 6. ARTIFACT FLOW

## 6.1 V5 Current Artifact Flow

```
Execution:
  ├─ Engine 1 runs, publishes artifacts
  │   └─ artifactBus.publish(message)
  │       └─ message stored in this.messages array
  │
  ├─ Engine 2 runs, publishes artifacts
  │   └─ artifactBus.publish(message)
  │       └─ message added to array
  │
  ├─ Engine 3-68 run...
  │
  └─ [END OF PIPELINE]
         
Post-Execution (ALL at once):
  ├─ FactoryRuntime.run() → ArtifactBus.flush()
  │   ├─ Get all messages from artifactBus
  │   ├─ For each message:
  │   │   ├─ Create spec from template (HARDCODED: repair-plan.md.tpl)
  │   │   ├─ Render template with message variables
  │   │   └─ Write to file
  │   │
  │   └─ If ANY write fails, entire flush fails
  │
  └─ All 50+ artifacts written in 1-2 second burst

Problems:
  ✗ Collisions: If 2 engines publish same artifact ID, 2nd overwrites
  ✗ Template hardcoded: All use repair-plan.md.tpl regardless of type
  ✗ End-of-pipeline flush: If crash before flush, all artifacts lost
  ✗ No deduplication: No tracking of duplicate IDs
  ✗ Atomic failure: If 1 artifact fails, all lost
```

## 6.2 V6 Target Artifact Flow

### Strategy 6.2.1: Streamed Artifact Publishing

```
Enhanced Artifact Model:

interface ArtifactMessage {
  id: string;                    // Unique ID per artifact
  engineName: string;            // Which engine published
  type: 'plan' | 'progress' | 'output' | 'report' | 'metadata';
  priority: 'critical' | 'important' | 'info';
  templatePath: string;          // Path to template (engine-specific)
  variables: Record<string, any>;
  timestamp: Date;
}
```

### Strategy 6.2.2: Real-Time Publishing with Deduplication

```
V6 ArtifactBus (enhanced):

publish(message: ArtifactMessage):
  ├─ Check if message.id already published
  ├─ If yes:
  │   ├─ Log warning (duplicate artifact)
  │   ├─ Options: skip, overwrite, merge
  │   └─ Store in duplicates tracking
  │
  ├─ Add message to queue
  │ └─ Stream to disk immediately (not batch at end)
  │
  └─ Update metrics

flush():
  ├─ Drain remaining queued messages
  ├─ Verify all artifacts written
  ├─ Report summary: total written, duplicates, errors
  └─ Raise if critical artifacts missing

Timing: 
  - Stream while pipeline running (not batch at end)
  - Better for long pipelines (visibility into progress)
  - If crash, already have partial artifacts
```

### Strategy 6.2.3: Per-Engine Template Selection

```
Engine responsibility (on publish):
  ├─ Specify artifact type
  ├─ Specify template path for that type
  └─ Pass variables matching template

Example - DatabaseGenerator:

  // Publishes database design artifact
  artifactBus.publish({
    id: "database-design-v1",
    engineName: "DatabaseGenerator",
    type: "output",
    templatePath: path.join(this.projectRoot, "templates", "database-schema.sql.tpl"),
    variables: {
      schema: this.generatedSchema,
      tables: this.tables,
      indexes: this.indexes
    }
  })

ArtifactBus ensures templatePath exists before flush
```

---

# 7. COMPILE FLOW

## 7.1 V5 Current Compile Flow (Problematic)

```
Doctor.run()
  │
  ├─ Engine #51 in Layer 1 (may compile, unclear)
  │
  ├─ FactoryRuntime executes engines...
  │   │
  │   └─ Engine #45: RepairCoordinator.run()
  │       ├─ for attempt 1 to 5:
  │       │   ├─ await this.compileEngine.run(context)
  │       │   └─ Compile happens here (#1)
  │       │
  │       └─ (RepairCoordinator has embedded CompileEngine)
  │
  │   └─ Engine #42: DoctorOrchestrator (Layer 3)
  │       └─ new CompileEngine() ← NEW INSTANCE
  │           └─ Compile happens here (#2)
  │
  │   └─ Engine #29 within Orchestrator: RepairLoopEngine
  │       ├─ for index 0 to 2:
  │       │   ├─ const compileEngine = new CompileEngine()
  │       │   └─ await compileEngine.run(context)
  │       │       └─ Compile happens here (#3)
  │
  └─ Benchmark phase (if !skipBenchmark)
      └─ Engine: CompileEvaluator
          ├─ // Reads from context.metadata
          ├─ // Currently: No recompilation
          └─ // Was speculated to recompile

Total Compile Executions: 2-3 typical, could be 4 under conditions

Problems:
  ✗ Multiple CompileEngine instantiations
  ✗ Each instance recompiles entire project
  ✗ No compile result sharing
  ✗ Compile time: ~5-10 seconds each
  ✗ Total wasted: 5-20 seconds per Doctor.run()
  ✗ Represents 30-50% of total pipeline time
```

## 7.2 V6 Target Compile Flow (Optimized)

```
STAGE 2D: Build

CompileManager (NEW - centralized):
  private compileCache: {
    sourceHash: string;
    output: CompileOutput;
    timestamp: Date;
  }

Doctor.run()
  │
  ├─ STAGE 2D: Build
  │   │
  │   ├─ CompileManager.compile(context)
  │   │   ├─ Compute sourceHash from all source files
  │   │   ├─ Check compileCache[sourceHash]
  │   │   ├─ If cache hit:
  │   │   │   ├─ Return cached output
  │   │   │   └─ Mark as "cached-compile"
  │   │   │
  │   │   ├─ If cache miss:
  │   │   │   ├─ Run actual pnpm compilation
  │   │   │   ├─ Store output in cache
  │   │   │   ├─ Mark as "fresh-compile"
  │   │   │   └─ COMPILE HAPPENS HERE (only time)
  │   │   │
  │   │   └─ Store in context.compileResult (not in metadata)
  │   │
  │   └─ Compile: 5-10 seconds (ONCE)
  │
  ├─ STAGE 2E: Repair (if needed)
  │   │
  │   ├─ RepairPipeline.run()
  │   │   ├─ Classify errors (from compileResult)
  │   │   ├─ Generate patches
  │   │   ├─ Apply patches
  │   │   │
  │   │   ├─ Check: did patches change source?
  │   │   ├─ If yes:
  │   │   │   ├─ Invalidate compileCache
  │   │   │   ├─ CompileManager.compile() → cache miss
  │   │   │   └─ RECOMPILE HAPPENS (only if patches changed code)
  │   │   │
  │   │   ├─ If no patches or compilation passed:
  │   │   │   ├─ CompileManager.compile() → cache hit
  │   │   │   └─ NO RECOMPILATION
  │   │   │
  │   │   └─ Test (if compile succeeded)
  │   │
  │   ├─ Loop up to 3 times if needed
  │   │
  │   └─ CompileManager can run compile 1-2 times total
  │
  └─ STAGE 2H: Benchmark
      │
      └─ PerformanceAnalyzer
          ├─ Read from context.compileResult
          ├─ Read from context.compileMetrics
          └─ NO RECOMPILATION - READS ONLY

Total Compile Executions: 1-2 (not 2-4)
Time saved: 5-20 seconds per Doctor.run()
Improvement: 50-80% faster compile phase
```

---

# 8. TEST FLOW

## 8.1 V5 Current Test Flow (Suboptimal)

```
Current Test Executions:

In RepairCoordinator (#45):
  ├─ for attempt 1 to 5:
  │   └─ await this.testEngine.run(context)
  │       └─ Test happens here (#1)

In DoctorOrchestrator (#42):
  ├─ new TestEngine()
  │   └─ Test happens here (#2)

In BuildLoopEngine (#46):
  ├─ await this.runTests(context)
  │   └─ Calls executor.pnpm() directly
  │   └─ Test happens here (#3)

Total Test Executions: 2-3 times

Problems:
  ✗ Tests run even if compile failed
  ✗ Each TestEngine instance is separate
  ✗ No test result caching
  ✗ No optimization: if tests pass, shouldn't retest after minor repairs
  ✗ Test time: ~3-5 seconds each
  ✗ Total time: 6-15 seconds wasted on redundant tests
```

## 8.2 V6 Target Test Flow (Optimized)

```
STAGE 2E: Repair Loop

TestManager (NEW - centralized):
  private testCache: {
    sourceHash: string;
    testResults: TestOutput;
    timestamp: Date;
  }

Doctor.run()
  │
  ├─ STAGE 2D: Build
  │   ├─ CompileManager.compile()  → compileResult stored
  │   ├─ If compile failed: mark as "compile-failed"
  │   └─ Stop before tests (no point testing broken code)
  │
  ├─ STAGE 2E: Repair (only if compile initially succeeded or fixed)
  │   │
  │   ├─ RepairPipeline.run()
  │   │   ├─ Loop up to 3 times:
  │   │   │
  │   │   │ ├─ Iteration 1:
  │   │   │ │   ├─ If compile failed: Repair.generatePatches()
  │   │   │ │   ├─ Apply patches
  │   │   │ │   ├─ CompileManager.compile()  → try compile again
  │   │   │ │   ├─ If compile passed:
  │   │   │ │   │   └─ TestManager.test()    → TEST HAPPENS (#1, if needed)
  │   │   │ │   ├─ If tests passed:
  │   │   │ │   │   └─ Break (success)
  │   │   │ │   └─ Store test result in testCache
  │   │   │ │
  │   │   │ ├─ Iteration 2 (if tests failed):
  │   │   │ │   ├─ Repair.generateNewPatches()
  │   │   │ │   ├─ Check: patches affect test code?
  │   │   │ │   ├─ If no:
  │   │   │ │   │   └─ TestManager.test() → testCache hit (reuse results)
  │   │   │ │   ├─ If yes:
  │   │   │ │   │   ├─ Invalidate testCache
  │   │   │ │   │   └─ TestManager.test() → TEST HAPPENS (#2)
  │   │   │ │
  │   │   │ └─ Iteration 3 (if still failing):
  │   │   │     └─ Similar logic
  │   │   │
  │   │   └─ End with last test result in context
  │
  └─ STAGE 2H: Benchmark
      └─ PerformanceAnalyzer
          └─ Read test results from context (no retest)

Total Test Executions: 1-2 (not 2-3)
Time saved: 3-10 seconds per Doctor.run()
Improvement: 40-70% faster test phase
```

---

# 9. REPAIR FLOW

## 9.1 V5 Current Repair Flow (4 Separate Engines)

```
Current Repair Engines:

1. RepairEngine (ai/engines/RepairEngine.ts)
   └─ Plans repairs from root causes

2. RepairCoordinator (doctor/RepairCoordinator.ts)
   ├─ Runs compile + error classification
   ├─ Plans patches
   ├─ Generates patches
   ├─ Applies patches
   ├─ Runs tests (embedded TestEngine)
   └─ Verifies with BuildVerifier

3. RepairLoopEngine (ai/engines/RepairLoopEngine.ts)
   ├─ Loops compile + repair
   ├─ Creates new CompileEngine() each iteration
   └─ Verifies until passes or max attempts

4. AutoRepairEngine (autofix/AutoRepairEngine.ts)
   └─ Automatic repair execution

Problems:
  ✗ 4 separate engines doing similar work
  ✗ Unclear which runs first
  ✗ Unclear how they interact
  ✗ Possible duplicate repairs
  ✗ Different error handling strategies
  ✗ Different retry logic in different engines
  ✗ Confusing for developers
```

## 9.2 V6 Target Repair Flow (Unified Pipeline)

```
STAGE 2E: Repair (NEW unified stage)

RepairPipeline (NEW - consolidates 4 engines):

public async run(context, maxAttempts = 3): Promise<void>
  ├─ for attempt = 1 to maxAttempts:
  │   │
  │   ├─ PHASE 1: Analyze
  │   │   ├─ Classify errors from compileResult
  │   │   └─ Identify root causes
  │   │
  │   ├─ PHASE 2: Plan
  │   │   ├─ Generate patch plans
  │   │   └─ Prioritize patches
  │   │
  │   ├─ PHASE 3: Execute
  │   │   ├─ Generate code patches
  │   │   ├─ Apply patches to files
  │   │   └─ Track what changed
  │   │
  │   ├─ PHASE 4: Verify
  │   │   ├─ Compile (via CompileManager cache)
  │   │   ├─ If compile passed:
  │   │   │   └─ Test (via TestManager cache)
  │   │   ├─ If both passed:
  │   │   │   ├─ Mark as "repaired"
  │   │   │   └─ Break (success)
  │   │   └─ If failed:
  │   │       └─ Continue to next iteration
  │   │
  │   └─ Checkpoint save
  │
  └─ If still failing after maxAttempts:
      ├─ Mark as "repair-failed"
      └─ Store repair attempts in context

Structure (NEW):
  ├─ Inherits from IEngine interface
  ├─ Consolidates logic from 4 engines
  ├─ Single state management
  ├─ Single error handling
  ├─ Single retry policy
  └─ Clear phases (Analyze → Plan → Execute → Verify)

Removes:
  ✗ RepairEngine (planning logic absorbed)
  ✗ RepairCoordinator (coordination logic absorbed)
  ✗ RepairLoopEngine (loop logic absorbed)
  ✗ AutoRepairEngine (auto logic absorbed)
```

---

# 10. VALIDATION FLOW

## 10.1 V5 Current Validation (Scattered)

```
Current Validation Points:

Pre-Execution:
  ✗ No validation (engines instantiated, no checks)

Mid-Pipeline:
  ├─ CompileMonitorEngine (monitors, doesn't validate structure)
  ├─ TestMonitorEngine (monitors, doesn't validate)
  └─ (Scattered, not centralized)

Post-Execution:
  ├─ VerificationEngine (verifies repair success)
  └─ Benchmark engines (evaluate quality)

Problems:
  ✗ No pre-flight validation
  ✗ No cross-stage validation (does output of stage A meet input of stage B?)
  ✗ No artifact structure validation
  ✗ No consistency checks between related outputs
```

## 10.2 V6 Target Validation (Comprehensive)

```
STAGE 1: Pre-Execution Validation

PipelineValidator:
  ├─ Verify all engines have valid manifests
  ├─ Check all dependencies exist in registry
  ├─ Detect circular dependencies
  ├─ Validate timeout values (100ms < timeout < 1hr)
  ├─ Check context has required initial state
  └─ Return ValidationError[] (throws if any found)

Timing: Before FactoryRuntime.run()

STAGE 2F: Mid-Pipeline Validation (NEW stage)

ArtifactValidator:
  ├─ Verify generated code files have valid syntax
  ├─ Check all required files were generated
  └─ Validate file structure matches expectations

CrossStageValidator (NEW):
  ├─ Verify analysis stage output
  ├─ Verify planning stage builds on analysis
  ├─ Verify generation stage builds on planning
  ├─ Check consistency between related artifacts
  └─ Flag inconsistencies early

QualityValidator:
  ├─ Check code quality metrics
  ├─ Verify test coverage
  └─ Check against quality gates

Timing: Between STAGE 2E (Repair) and STAGE 2G (Release)

STAGE 3: Post-Execution Validation

FinalValidator (NEW):
  ├─ Verify all expected artifacts exist
  ├─ Verify artifact deduplication (no collisions)
  ├─ Verify final state is valid
  ├─ Check metrics are complete
  └─ Generate validation report

Timing: Before history save
```

---

# 11. RELEASE FLOW

## 11.1 V5 Current Release Flow (7 Separate Engines)

```
Current Release Engines:

1. ReleaseEngine (#41 in Orchestrator)
   └─ Release logic

2. DeploymentPreparationEngine (#42 in Orchestrator)
   └─ Prepare for deployment

3. PackageEngine (#40 in Orchestrator)
   └─ Packaging

4. ReleaseBuilderEngine (#49 in Orchestrator)
   └─ Build release artifacts

5. VersionManagerEngine (#50 in Orchestrator)
   └─ Version management

6. PackagePublisherEngine (#51 in Orchestrator)
   └─ Publishing

7. ReleaseIntelligenceEngine (#29 in Layer 1)
   └─ Release intelligence

Problems:
  ✗ 7 engines scattered across layers
  ✗ Unclear execution order
  ✗ Unclear dependencies between them
  ✗ Different state management per engine
  ✗ Difficult to understand full release flow
```

## 11.2 V6 Target Release Flow (Unified)

```
STAGE 2G: Release (NEW unified stage)

ReleasePipeline (NEW - consolidates 7 engines):

public async run(context): Promise<void>
  ├─ PHASE 1: Prepare
  │   ├─ Verify all artifacts are valid
  │   ├─ Prepare deployment files
  │   └─ Stage release files
  │
  ├─ PHASE 2: Version
  │   ├─ Determine new version
  │   ├─ Update version files
  │   └─ Generate changelog
  │
  ├─ PHASE 3: Build
  │   ├─ Build release artifacts
  │   ├─ Package all components
  │   └─ Create distribution packages
  │
  ├─ PHASE 4: Publish
  │   ├─ Publish to package repositories
  │   ├─ Update documentation
  │   └─ Update deployment configs
  │
  └─ PHASE 5: Verify
      ├─ Verify published artifacts
      └─ Generate release report

Structure:
  ├─ Inherits from IEngine
  ├─ Consolidates 7 engines into 5 phases
  ├─ Clear dependencies: Prepare → Version → Build → Publish → Verify
  └─ Single state management

Removes:
  ✗ ReleaseEngine (planning absorbed)
  ✗ DeploymentPreparationEngine (phase 1 absorbed)
  ✗ PackageEngine (phase 3 absorbed)
  ✗ ReleaseBuilderEngine (phase 3 absorbed)
  ✗ VersionManagerEngine (phase 2 absorbed)
  ✗ PackagePublisherEngine (phase 4 absorbed)
  ✗ ReleaseIntelligenceEngine (intelligence absorbed)

Result: 1 unified ReleasePipeline instead of 7 scattered engines
```

---

# 12. RUNTIME LIFECYCLE

## 12.1 V5 Current Lifecycle

```
Doctor Instance Lifecycle:

1. Construction
   ├─ Instantiate 68 engines
   ├─ Create PipelineResolver
   ├─ Resolve dependencies (O(n²))
   └─ Store this.pipeline

2. Initialization
   ├─ Load plugins
   ├─ Initialize context
   └─ No validation

3. Execution
   ├─ Create FactoryRuntime
   ├─ Create NEW registry + resolver
   ├─ resolve() again (O(n²) duplicate)
   ├─ Execute 68 engines
   │   └─ Including Engine #42: DoctorOrchestrator (runs 55 more)
   └─ Execute benchmark engines

4. Completion
   ├─ Flush artifacts
   ├─ Collect metrics
   ├─ Save history (3 times total!)
   └─ Return context

Memory Profile:
  ├─ Engines: 68 + 55 nested = 123 instances
  ├─ Registries: 5+ instances
  ├─ Resolvers: 2 instances
  ├─ Artifacts: 50+ in memory until flush
  └─ Total: High memory overhead

Issues:
  ✗ Redundant initialization
  ✗ Multiple resolvers
  ✗ All artifacts in memory
  ✗ History saved 3 times
```

## 12.2 V6 Target Lifecycle

```
Doctor Instance Lifecycle (V6):

1. Construction
   ├─ Create unified EngineRegistry (single instance)
   ├─ Register ~38 engines
   ├─ Create single PipelineResolver
   ├─ resolve() once (O(n²), single time)
   └─ Store this.pipeline

2. Pre-Execution Stage
   ├─ Load plugins (once)
   ├─ Initialize context
   ├─ PipelineValidator.validate()
   │   ├─ Check all manifests valid
   │   ├─ Check no circular deps
   │   └─ Throw if invalid
   └─ Load checkpoint (if resuming)

3. Execution Stage
   ├─ Execute STAGE 2A: Analysis (7 engines, sequential)
   ├─ Execute STAGE 2B: Planning (5 engines, sequential)
   ├─ Execute STAGE 2C: Generation (9 engines, parallelizable)
   ├─ Checkpoint between stages
   ├─ Execute STAGE 2D: Build (2 engines, cached)
   ├─ Checkpoint
   ├─ Execute STAGE 2E: Repair (unified pipeline, max 3 iterations)
   ├─ Checkpoint
   ├─ Execute STAGE 2F: Validation (3 engines, enhanced)
   ├─ Checkpoint
   ├─ Execute STAGE 2G: Release (unified pipeline)
   ├─ Checkpoint
   └─ Execute STAGE 2H: Benchmark (3 engines, read-only)

4. Post-Execution Stage
   ├─ ArtifactBus.flush() (streamed, not batch)
   ├─ FinalValidator.validate()
   ├─ RuntimeMetricsEngine.collect()
   ├─ HistoryEngine.save() (final checkpoint)
   └─ Return context

Memory Profile (V6):
  ├─ Engines: 38 instances (no duplicates)
  ├─ Registries: 1 instance
  ├─ Resolvers: 1 instance
  ├─ Artifacts: Streamed (not all in memory)
  └─ Total: ~60% less memory

Improvements:
  ✓ Single registry
  ✓ Single resolver (called once)
  ✓ Clear stage boundaries
  ✓ Checkpoints between stages
  ✓ Streaming artifacts
  ✓ History saved once (or twice if resuming)
  ✓ Easier to reason about
```

---

# 13. ENGINE RESPONSIBILITIES

## 13.1 V6 Engine Categories & Responsibilities

### STAGE 1: Pre-Execution

**PluginEngine**
- Load plugins from plugins/ directory
- Initialize plugins with context
- Responsibility: Plugin lifecycle management

**PipelineValidator** (NEW)
- Verify all engines have valid manifests
- Check dependencies exist
- Detect circular dependencies
- Validate timeout ranges
- Responsibility: Configuration validation, fail-fast

### STAGE 2A: Analysis (7 engines)

**ScannerEngine**
- Scan project structure
- Identify files and modules
- Build initial project map
- Responsibility: Project introspection

**AnalyzerEngine**
- Analyze code for patterns
- Identify code quality issues
- Extract metrics
- Responsibility: Code analysis

**DiagnosticEngine**
- Diagnose errors and issues
- Identify problem areas
- Root cause analysis start
- Responsibility: Issue diagnosis

**RootCauseEngine**
- Deep root cause analysis
- Understand why issues exist
- Trace dependencies
- Responsibility: Root cause determination

**DomainAnalyzerEngine**
- Analyze domain model
- Extract business rules
- Understand domain structure
- Responsibility: Domain knowledge extraction

**ConstraintAnalyzerEngine**
- Identify project constraints
- Analyze requirements constraints
- Check against quality gates
- Responsibility: Constraint tracking

**IntentAnalyzerEngine**
- Analyze project intent
- Understand goals
- Map requirements
- Responsibility: Requirement understanding

### STAGE 2B: Planning (5 engines)

**PlannerEngine**
- Plan fixes based on analysis
- Prioritize fixes
- Create action plan
- Responsibility: Planning and prioritization

**ArchitectureEngine**
- Design system architecture
- Plan architectural changes
- Create architecture diagrams
- Responsibility: Architecture design

**ExecutionGraphEngine**
- Create execution dependency graph
- Plan execution order
- Identify parallelizable work
- Responsibility: Execution planning

**FeaturePlannerEngine**
- Plan features
- Decompose features
- Create feature specs
- Responsibility: Feature decomposition

**MultiAgentCoordinatorEngine**
- Coordinate multiple agents
- Distribute work
- Merge results
- Responsibility: Multi-agent coordination

### STAGE 2C: Generation (9 engines)

**DatabaseGenerator**
- Generate database schema
- Create migration scripts
- Generate ORM configs
- Responsibility: Database generation (parallelizable)

**BackendGenerator**
- Generate backend code
- Create API endpoints
- Generate server logic
- Responsibility: Backend generation (parallelizable)

**FrontendGenerator**
- Generate frontend code
- Create UI components
- Generate client logic
- Responsibility: Frontend generation (parallelizable)

**AuthenticationGenerator**
- Generate auth logic
- Create security configs
- Generate auth flows
- Responsibility: Authentication generation (parallelizable)

**OpenApiGenerator**
- Generate OpenAPI specs
- Create API documentation
- Generate API contracts
- Responsibility: API documentation (parallelizable)

**DockerGenerator**
- Generate Dockerfile
- Create docker-compose
- Generate container configs
- Responsibility: Containerization (parallelizable)

**DeploymentGenerator**
- Generate deployment configs
- Create CI/CD scripts
- Generate infrastructure-as-code
- Responsibility: Deployment generation (parallelizable)

**DocumentationGenerator**
- Generate project documentation
- Create README files
- Generate API docs
- Responsibility: Documentation (parallelizable)

**TestingGenerator**
- Generate test files
- Create test specs
- Generate test fixtures
- Responsibility: Test generation (supports build stage)

### STAGE 2D: Build (2 engines)

**CompileEngine** (via CompileManager)
- Compile TypeScript to JavaScript
- Type check
- Report compilation errors
- Cache results
- Responsibility: Compilation with caching

**TestEngine** (via TestManager)
- Run unit tests
- Run integration tests
- Report test results
- Cache results
- Responsibility: Testing with caching

### STAGE 2E: Repair (1 unified pipeline)

**RepairPipeline** (consolidates 4)
- Classify compile errors
- Generate patches
- Apply patches to code
- Recompile (if patches changed code)
- Retest (if code changed)
- Verify success
- Loop up to 3 times
- Responsibility: Error repair orchestration

### STAGE 2F: Validation (3 engines)

**ArtifactValidator** (NEW)
- Verify generated code syntax
- Check required files exist
- Validate file structure
- Responsibility: Artifact structure validation

**CrossStageValidator** (NEW)
- Verify outputs from one stage meet inputs of next
- Check consistency between artifacts
- Validate data flow
- Responsibility: Cross-stage consistency

**QualityValidator** (NEW or enhanced)
- Verify quality metrics
- Check against quality gates
- Flag quality issues
- Responsibility: Quality assurance

### STAGE 2G: Release (1 unified pipeline)

**ReleasePipeline** (consolidates 7)
- Prepare release
- Manage version
- Build release artifacts
- Publish artifacts
- Verify published
- Responsibility: Release orchestration

### STAGE 2H: Benchmark (3 engines)

**PerformanceAnalyzer**
- Analyze performance metrics
- Compare with baselines
- Identify bottlenecks
- Reads from context (no recompilation)
- Responsibility: Performance analysis

**QualityScoreEngine**
- Calculate quality scores
- Compare with standards
- Generate quality report
- Responsibility: Quality scoring

**RegressionAnalyzer**
- Compare against historical data
- Detect regressions
- Alert if metrics declined
- Responsibility: Regression detection

### STAGE 3: Post-Execution

**FinalValidator** (NEW)
- Verify all expected artifacts exist
- Check no duplicates
- Verify final state
- Responsibility: Final validation

**RuntimeMetricsEngine**
- Collect runtime metrics
- Calculate execution times
- Gather resource usage
- Responsibility: Metrics collection

**HistoryEngine**
- Save execution history
- Create checkpoints
- Enable resume
- Responsibility: History and checkpoints

---

# 14. FILE RESPONSIBILITIES

## 14.1 V6 File Organization (Target)

```
SATSET-BUG/src/

├── core/
│   ├── Context.ts              (Execution context, immutable params)
│   ├── IEngine.ts              (Engine interface)
│   └── EngineManifest.ts       (Manifest definition)
│
├── runtime/
│   ├── EngineRegistry.ts       (UNIFIED - only implementation)
│   ├── PipelineResolver.ts     (Single instance, resolve() once)
│   ├── ExecutionScheduler.ts   (Actually used for execution)
│   ├── ArtifactBus.ts          (Enhanced with streaming + dedup)
│   ├── RuntimeMetricsEngine.ts (Metrics collection)
│   ├── PipelineValidator.ts    (NEW - pre-execution validation)
│   ├── FinalValidator.ts       (NEW - post-execution validation)
│   └── FactoryRuntime.ts       (Simplified)
│
├── doctor/
│   ├── Doctor.ts               (Entry point, simplified)
│   ├── DoctorOrchestrator.ts   (REMOVED - engines integrated)
│   ├── RepairCoordinator.ts    (REMOVED - logic in RepairPipeline)
│   └── BuildLoopEngine.ts      (REMOVED - logic in build stage)
│
├── pipeline/
│   ├── RepairPipeline.ts       (NEW - consolidates 4 repair engines)
│   ├── ReleasePipeline.ts      (NEW - consolidates 7 release engines)
│   └── ValidationPipeline.ts   (NEW - consolidates validation)
│
├── engines/
│   ├── analysis/
│   │   ├── ScannerEngine.ts
│   │   ├── AnalyzerEngine.ts
│   │   ├── DiagnosticEngine.ts
│   │   ├── RootCauseEngine.ts
│   │   ├── DomainAnalyzerEngine.ts
│   │   ├── ConstraintAnalyzerEngine.ts
│   │   └── IntentAnalyzerEngine.ts
│   │
│   ├── planning/
│   │   ├── PlannerEngine.ts
│   │   ├── ArchitectureEngine.ts
│   │   ├── ExecutionGraphEngine.ts
│   │   ├── FeaturePlannerEngine.ts
│   │   └── MultiAgentCoordinatorEngine.ts
│   │
│   ├── generation/
│   │   ├── DatabaseGenerator.ts
│   │   ├── BackendGenerator.ts
│   │   ├── FrontendGenerator.ts
│   │   ├── AuthenticationGenerator.ts
│   │   ├── OpenApiGenerator.ts
│   │   ├── DockerGenerator.ts
│   │   ├── DeploymentGenerator.ts
│   │   ├── DocumentationGenerator.ts
│   │   └── TestingGenerator.ts
│   │
│   ├── build/
│   │   ├── CompileManager.ts    (NEW - centralized with caching)
│   │   ├── TestManager.ts       (NEW - centralized with caching)
│   │   └── CompileEngine.ts     (Refactored to use manager)
│   │
│   ├── validation/
│   │   ├── ArtifactValidator.ts (NEW)
│   │   ├── CrossStageValidator.ts (NEW)
│   │   └── QualityValidator.ts
│   │
│   └── benchmark/
│       ├── PerformanceAnalyzer.ts
│       ├── QualityScoreEngine.ts
│       └── RegressionAnalyzer.ts
│
├── cache/
│   ├── CompileCache.ts         (NEW - compile result caching)
│   ├── TestCache.ts            (NEW - test result caching)
│   └── FileCache.ts            (NEW - file I/O caching)
│
├── plugins/
│   └── PluginEngine.ts
│
├── agents/
│   └── (Agent-related engines)
│
└── knowledge/
    └── (Knowledge graph, semantic retrieval, etc.)
```

## 14.2 File Deletion Plan (V6)

**REMOVE (architecture replaced):**
- src/doctor/DoctorOrchestrator.ts → Logic merged into Doctor/pipeline stages
- src/doctor/RepairCoordinator.ts → Merged into RepairPipeline
- src/doctor/BuildLoopEngine.ts → Logic integrated into build stage
- src/doctor/EngineRegistry.ts → DEAD CODE, never imported

**MERGE (functionality consolidated):**
- src/ai/engines/RepairEngine.ts → RepairPipeline (logic preserved)
- src/ai/engines/RepairLoopEngine.ts → RepairPipeline (logic preserved)
- src/autofix/AutoRepairEngine.ts → RepairPipeline (logic preserved)
- src/ai/engines/ReleaseEngine.ts → ReleasePipeline
- src/ai/engines/ReleaseBuilderEngine.ts → ReleasePipeline
- (and 5 more release engines) → ReleasePipeline

**REFACTOR (logic enhanced):**
- src/runtime/ExecutionScheduler.ts → Actually used now
- src/runtime/ArtifactBus.ts → Add streaming + deduplication
- src/doctor/Doctor.ts → Simplified (no embedded DoctorOrchestrator)

**CREATE (new for V6):**
- src/runtime/PipelineValidator.ts
- src/runtime/FinalValidator.ts
- src/pipeline/RepairPipeline.ts
- src/pipeline/ReleasePipeline.ts
- src/engines/build/CompileManager.ts
- src/engines/build/TestManager.ts
- src/cache/CompileCache.ts
- src/cache/TestCache.ts
- src/engines/validation/ArtifactValidator.ts
- src/engines/validation/CrossStageValidator.ts

---

# 15. FOLDER RESPONSIBILITIES

## 15.1 V6 Folder Structure (Target)

```
/src/
├── core/              Pipeline/execution core abstractions
├── runtime/           Runtime orchestration, scheduling
├── doctor/            Doctor entry point (simplified)
├── pipeline/          Consolidated pipelines (repair, release, validation)
├── engines/           All individual engines organized by stage
│   ├── analysis/
│   ├── planning/
│   ├── generation/
│   ├── build/
│   ├── validation/
│   ├── benchmark/
│   └── plugin/
├── cache/             Caching layer (compile, test, files)
├── ai/                AI/ML related logic (if separate)
├── agents/            Agent orchestration (if separate)
├── knowledge/         Knowledge graph, retrieval, etc.
└── validation/        Validation utilities (enhanced)

/apps/                 Monorepo apps (not changing)
├── admin/
├── api/
├── mobile/
└── ...

/knowledge/            Generated knowledge artifacts (gitignored)
/generated/            Generated code (gitignored)
/artifacts/            Pipeline artifacts (gitignored)
/reports/              Analysis reports (gitignored)
/release/              Release artifacts (gitignored)

.gitignore            UPDATED (V6)
```

## 15.2 Folder Responsibilities

| Folder | V5 Purpose | V6 Purpose | Change |
|--------|-----------|-----------|--------|
| src/core/ | Abstractions | Abstractions | NO CHANGE |
| src/runtime/ | Execution | Execution (simplified) | REFACTOR |
| src/doctor/ | Orchestration | Entry point only | SIMPLIFY |
| src/pipeline/ | (NONE) | Consolidated pipelines | NEW |
| src/engines/ | All 101 engines flat | 38 engines organized by stage | REORGANIZE |
| src/cache/ | (NONE) | Caching layer | NEW |
| src/ai/ | AI engines | AI engines (reduced count) | SIMPLIFY |
| src/agents/ | Agent logic | Agent logic | NO CHANGE |
| src/knowledge/ | Knowledge logic | Knowledge logic | NO CHANGE |
| /knowledge/ | Git-tracked | Gitignored | REMOVE |
| /generated/ | Root level | Better organized | RESTRUCTURE |
| /artifacts/ | Scattered | Consolidated | ORGANIZE |

---

# 16. MIGRATION PLAN OVERVIEW

## 16.1 Migration Principles

1. **No Source Code Loss:** All functional logic preserved, just reorganized
2. **Backward Compatibility:** Old engines kept (deprecated) for compatibility
3. **Incremental Phases:** 4 phases, each adds value independently
4. **Test-Driven:** Each phase requires all tests passing
5. **Risk Mitigation:** High-risk changes have fallback strategies
6. **Documentation:** Each phase documents changes and rationale

## 16.2 Migration Scope by Phase

| Phase | Effort | Duration | Risk | Value |
|-------|--------|----------|------|-------|
| **Phase 1** | Medium | 2 weeks | **LOW-MEDIUM** | High |
| **Phase 2** | Medium | 2 weeks | **MEDIUM** | High |
| **Phase 3** | High | 3 weeks | **MEDIUM-HIGH** | Very High |
| **Phase 4** | Low | 1 week | **LOW** | Medium |

---

# 17. PHASE 1: FOUNDATION & REPOSITORY CLEANUP

**Duration:** 2 weeks  
**Goal:** Clean repository, unified registry, establish V6 directory structure  
**Risk Level:** LOW-MEDIUM  

## 17.1 Phase 1 Tasks

### P1.1: Repository Cleanup (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (only removes artifacts, no code changes)  

**Tasks:**
1. Update .gitignore
   - Add: `*-build-output.txt`, `*-error*.txt`, `*typecheck*.txt`
   - Add: `*.backup-*`, `backup-*/`, `node_modules_corrupt_*/`, `*_BACKUP/`
   - Add: `tmp_*.ps1`, `satset.v*.ps1`
   - Verify existing patterns work

2. Verify backup folders contain only generated content
   - backup-admin-generator-20260723-192030/
   - backup-generator-20260723-191841/
   - backup-generator-fix-20260723-193944/
   - pos-wisata_BACKUP/

3. Remove from git (after verification)
   - All 4 backup folders
   - All 30+ .txt build outputs
   - package.json.backup-before-json-fix
   - Any temp generated files

4. Create /scripts/ folder
   - Move PowerShell scripts: satset.ps1, install.ps1
   - Organize by purpose

5. Expected outcome
   - Repository size reduced 70%+
   - Git history cleaner
   - Clear .gitignore coverage

### P1.2: Create V6 Folder Structure (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (additive only)  

**Tasks:**
1. Create new folder structure in src/:
   - src/pipeline/ (for RepairPipeline, ReleasePipeline, ValidationPipeline)
   - src/cache/ (for CompileCache, TestCache, FileCache)
   - src/engines/analysis/ (reorganize analysis engines)
   - src/engines/planning/ (reorganize planning engines)
   - src/engines/generation/ (reorganize generation engines)
   - src/engines/build/ (new, for build managers)
   - src/engines/validation/ (new, for validators)
   - src/engines/benchmark/ (reorganize benchmark engines)

2. Create .gitkeep files in each folder

3. Expected outcome
   - Clean folder organization ready for Phase 2

### P1.3: Consolidate Engine Registries (MEDIUM RISK)

**Status:** Medium risk (refactor, needs testing)  
**Risk:** MEDIUM (registry is core, affects all engines)  

**Tasks:**
1. Analyze both implementations
   - Review doctor/EngineRegistry.ts
   - Review runtime/EngineRegistry.ts
   - Identify differences

2. Create unified EngineRegistry in runtime/
   - Preserve advanced features (manifests, health tracking, validation)
   - Add simple lookup by name
   - Support both manifest-aware and simple engines

3. Update Doctor.constructor
   - Create single registry instance
   - Pass to PipelineResolver
   - Pass to FactoryRuntime

4. Update FactoryRuntime
   - Use injected registry (don't create new one)
   - Pass to ExecutionScheduler

5. Update tests
   - Engine lookup tests
   - Manifest retrieval tests
   - Registry instantiation tests

6. Mark old registry as deprecated
   - Keep doctor/EngineRegistry (for compatibility)
   - Add deprecation comment
   - Update imports in tests only

7. Expected outcome
   - Single registry instance throughout
   - Consistent engine lookup
   - All tests passing

### P1.4: Update .gitignore Comprehensively (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (configuration only)  

**Patterns to add:**
```
# Build outputs
*-build-output.txt
*-error*.txt
*-error-*.txt
*typecheck*.txt
full-typecheck.txt
imports.txt
scanner.txt
placeholder-files.txt
pnpm-store-list.txt

# Backup variants
*.backup-*
*.backup-json

# Backup folders
backup-*/
node_modules_corrupt_*/
*_BACKUP/

# Temp scripts (suggest moving to scripts/)
tmp_*.ps1
satset.v*.ps1
*.cmd

# Temp JSON/metadata
tmp-*.json
.satset-*.json
.progress-*.json

# Corrupt/recovery files
*_corrupt*
*_recovery*
```

## 17.2 Phase 1 Validation Criteria

- [ ] All tests passing (no new failures)
- [ ] Repository size reduced by 70%+
- [ ] No tracked build outputs in new commits
- [ ] No tracked backup folders
- [ ] V6 folder structure created
- [ ] Registry unified (single instance at startup)
- [ ] Doctor can run successfully (basic smoke test)
- [ ] .gitignore prevents new artifacts from being tracked

## 17.3 Phase 1 Risk Analysis

| Task | Risk | Mitigation |
|------|------|-----------|
| Repository cleanup | LOW | Verify backups are dead code before deletion |
| Folder creation | LOW | Just organizational, no code changes |
| Registry consolidation | MEDIUM | Comprehensive testing, keep old registry as fallback |
| .gitignore update | LOW | Verify patterns work with test commits |

---

# 18. PHASE 2: PERFORMANCE OPTIMIZATION & CACHING

**Duration:** 2 weeks  
**Goal:** Implement compile/test caching, reduce redundant operations  
**Risk Level:** MEDIUM  

## 18.1 Phase 2 Tasks

### P2.1: Implement Compile Caching (MEDIUM RISK)

**Status:** Medium risk (core logic change)  
**Risk:** MEDIUM (must ensure cache doesn't hide legitimate recompiles)  

**Tasks:**
1. Create CompileManager (src/engines/build/CompileManager.ts)
   - Manages compile caching
   - Tracks source file hash
   - Stores compile results

2. Create CompileCache (src/cache/CompileCache.ts)
   - Cache structure: {sourceHash → {output, timestamp}}
   - Hash algorithm: consistent across runs
   - Expiration: never (valid until source changes)

3. Update CompileEngine
   - Inject CompileManager
   - Call CompileManager.compile() instead of direct execution
   - Respect cache hits/misses

4. Update repair flow (anticipating Phase 3)
   - Invalidate cache if patches applied
   - Reuse cache if no code changes

5. Add metrics
   - Track cache hits vs misses
   - Measure time saved
   - Emit events for observability

6. Testing
   - Test cache hit behavior
   - Test cache invalidation
   - Test compile-then-repair scenario
   - Verify results identical to non-cached

7. Expected outcome
   - Compilation runs 1 time (not 2-4)
   - 30-40% faster pipeline
   - Clear cache behavior

### P2.2: Implement Test Caching (MEDIUM RISK)

**Status:** Medium risk (similar to compile caching)  
**Risk:** MEDIUM (must ensure cache doesn't hide real failures)  

**Tasks:**
1. Create TestManager (src/engines/build/TestManager.ts)
   - Similar structure to CompileManager
   - Manages test result caching

2. Create TestCache (src/cache/TestCache.ts)
   - Cache structure: {sourceHash → {results, timestamp}}
   - Keyed by test source + application source hash

3. Update TestEngine
   - Inject TestManager
   - Call TestManager.test() instead of direct execution
   - Respect cache hits/misses

4. Invalidation strategy
   - Invalidate if test files change
   - Invalidate if application code changes
   - Reuse if both stable

5. Testing
   - Test cache hit behavior
   - Test cache invalidation
   - Verify test results consistent

6. Expected outcome
   - Tests run 1 time (not 2-3)
   - 20-30% faster test phase
   - Clear cache behavior

### P2.3: Reduce JSON Parsing Redundancy (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (caching layer, read-only)  

**Tasks:**
1. Create FileCache (src/cache/FileCache.ts)
   - Simple file content caching
   - Keyed by path + file hash
   - Automatic invalidation

2. Create ProjectMetadataCache
   - Load package.json once
   - Store in context.projectMetadata
   - Scanners read from cache

3. Update scanners
   - PackageJsonScanner: use cache
   - DependencyGraphScanner: use cache
   - TypeScriptScanner: use cache

4. Benchmark
   - Measure startup time before/after
   - Target: 10-15% improvement

5. Expected outcome
   - Fewer disk reads
   - Fewer JSON parse operations
   - Faster startup

### P2.4: Add Artifact Deduplication (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (additive only)  

**Tasks:**
1. Update ArtifactBus
   - Add Set<id> to track published IDs
   - Check for duplicates on publish()
   - Log warnings for duplicates

2. Strategy options
   - SKIP: don't publish duplicate
   - OVERWRITE: replace with new
   - MERGE: combine artifacts (future enhancement)

3. Testing
   - Test duplicate detection
   - Test all strategy options
   - Verify logging

4. Expected outcome
   - Duplicate artifacts detected
   - Clear diagnostics
   - Predictable behavior

## 18.2 Phase 2 Validation Criteria

- [ ] All tests passing
- [ ] Compilation time reduced by 30%+
- [ ] Test time reduced by 20%+
- [ ] Startup time reduced by 10%+
- [ ] Artifact deduplication working
- [ ] Cache behavior documented
- [ ] Metrics tracked for each optimization
- [ ] Doctor.run() still produces valid output

## 18.3 Phase 2 Risk Analysis

| Task | Risk | Mitigation |
|------|------|-----------|
| Compile caching | MEDIUM | Run before/after tests, compare outputs |
| Test caching | MEDIUM | Run tests multiple times, verify consistent |
| JSON parsing | LOW | Caching layer only, read-only |
| Artifact dedup | LOW | Additive, diagnostic only |

---

# 19. PHASE 3: PIPELINE CONSOLIDATION & UNIFICATION

**Duration:** 3 weeks  
**Goal:** Consolidate duplicate engines into unified pipelines  
**Risk Level:** MEDIUM-HIGH  

## 19.1 Phase 3 Tasks

### P3.1: Create RepairPipeline (HIGH RISK)

**Status:** High risk (consolidates core repair logic)  
**Risk:** HIGH (repair is critical functionality)  

**Tasks:**
1. Create RepairPipeline (src/pipeline/RepairPipeline.ts)
   - Consolidates: RepairEngine, RepairCoordinator, RepairLoopEngine, AutoRepairEngine
   - Implements: IEngine interface
   - Phases: Analyze → Plan → Execute → Verify (loops)

2. Implement phase logic
   - Phase 1: Classify errors from compile result
   - Phase 2: Generate patch plans
   - Phase 3: Generate and apply patches
   - Phase 4: Compile (with cache) and test (with cache)
   - Loop: if failed, retry up to maxAttempts

3. State management
   - Single state object tracking iteration progress
   - Checkpoint between iterations
   - Clear error handling per iteration

4. Testing strategy
   - Test with known-broken code
   - Verify repair succeeds
   - Verify iterations work correctly
   - Compare output with V5 (should be equivalent or better)

5. Keep old engines as wrappers (for compatibility)
   - Mark as deprecated
   - Route to RepairPipeline internally
   - Emit deprecation warnings

6. Expected outcome
   - Clearer repair semantics
   - Single state management
   - Consolidated error handling
   - All old tests passing (via wrappers)

### P3.2: Create ReleasePipeline (MEDIUM RISK)

**Status:** Medium risk (consolidates 7 release engines)  
**Risk:** MEDIUM (consolidation, but less critical than repair)  

**Tasks:**
1. Create ReleasePipeline (src/pipeline/ReleasePipeline.ts)
   - Consolidates: ReleaseEngine, DeploymentPreparationEngine, PackageEngine,
                   ReleaseBuilderEngine, VersionManagerEngine, PackagePublisherEngine,
                   ReleaseIntelligenceEngine
   - Implements: IEngine interface
   - Phases: Prepare → Version → Build → Publish → Verify

2. Implement phase logic
   - Phase 1: Prepare (verify artifacts, stage files)
   - Phase 2: Version (determine version, update files)
   - Phase 3: Build (create release packages)
   - Phase 4: Publish (publish to repos, update docs)
   - Phase 5: Verify (verify published)

3. State management
   - Track release state per phase
   - Checkpoint between phases
   - Error recovery strategy

4. Testing
   - Test each phase independently
   - Test full release flow
   - Verify artifacts published correctly

5. Keep old engines as wrappers
   - Mark as deprecated
   - Route to ReleasePipeline internally

6. Expected outcome
   - Unified release logic
   - Clear release phases
   - Single state management

### P3.3: Create ValidationPipeline (LOW RISK)

**Status:** Low risk (new consolidation)  
**Risk:** LOW (additive validation)  

**Tasks:**
1. Create ArtifactValidator (NEW)
   - Verify generated code syntax
   - Check required files exist
   - Validate file structure

2. Create CrossStageValidator (NEW)
   - Verify outputs meet inputs
   - Check consistency
   - Validate data flow

3. Integrate into STAGE 2F
   - Called between repair and release
   - Catches issues early
   - Provides diagnostic output

4. Testing
   - Test each validator
   - Test with various inputs
   - Verify no false positives

5. Expected outcome
   - Enhanced validation
   - Early issue detection
   - Better diagnostics

### P3.4: Integrate Pipelines into Doctor (MEDIUM RISK)

**Status:** Medium risk (restructures Doctor)  
**Risk:** MEDIUM (Doctor is entry point)  

**Tasks:**
1. Update Doctor.run()
   - Call STAGE 1: Pre-execution
   - Call STAGE 2: Unified execution
     - 2A: Analysis
     - 2B: Planning
     - 2C: Generation
     - 2D: Build
     - 2E: RepairPipeline (not individual engines)
     - 2F: Validation
     - 2G: ReleasePipeline (not individual engines)
     - 2H: Benchmark
   - Call STAGE 3: Post-execution

2. Remove old orchestration logic
   - Remove DoctorOrchestrator reference
   - Integrate its 55 engines into Doctor pipeline
   - Remove duplicate engines

3. Update engine manifests
   - All engines declare real dependencies
   - Validate with PipelineValidator

4. Testing
   - Full pipeline execution test
   - Verify all stages run
   - Compare output with V5

5. Expected outcome
   - Single-layer orchestration (Doctor only)
   - No DoctorOrchestrator nesting
   - 38 total engines (was 68+55)

### P3.5: Remove Dead Code (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (removal only, after consolidation)  

**Tasks:**
1. Identify dead code (after consolidation)
   - DoctorOrchestrator.ts (logic moved to Doctor)
   - RepairCoordinator.ts (logic moved to RepairPipeline)
   - BuildLoopEngine.ts (logic moved to build stage)
   - doctor/EngineRegistry.ts (never used)
   - Individual repair engines (4) → RepairPipeline
   - Individual release engines (7) → ReleasePipeline

2. Verify via grep
   - No imports of dead code
   - No references in tests
   - No references in documentation

3. Delete files
   - Mark old files with deprecation if keeping as wrappers
   - Delete truly unused files

4. Update imports
   - Fix any imports of removed classes

5. Expected outcome
   - Codebase cleaner
   - No dead code
   - Clear module boundaries

## 19.2 Phase 3 Validation Criteria

- [ ] All tests passing
- [ ] RepairPipeline: repair logic intact, tests pass
- [ ] ReleasePipeline: release logic intact, tests pass
- [ ] ValidationPipeline: new validation working
- [ ] Doctor simplified (no DoctorOrchestrator)
- [ ] Engine count reduced to ~38
- [ ] All duplicate engines consolidated
- [ ] Output quality equivalent to V5
- [ ] Execution time improved by 30%+

## 19.3 Phase 3 Risk Analysis

| Task | Risk | Mitigation |
|------|------|-----------|
| RepairPipeline | HIGH | Extensive testing with broken code, comparison with V5 |
| ReleasePipeline | MEDIUM | Test each phase, verify artifacts published |
| ValidationPipeline | LOW | Additive validation, no breaking changes |
| Integration | MEDIUM | Staged integration, tests at each step |
| Dead code removal | LOW | Verify no references before deletion |

---

# 20. PHASE 4: ADVANCED FEATURES & POLISH

**Duration:** 1 week  
**Goal:** Add parallel execution, checkpointing, streaming artifacts  
**Risk Level:** LOW  

## 20.1 Phase 4 Tasks

### P4.1: Implement Checkpoint/Resume (LOW RISK)

**Status:** Low risk (optional feature)  
**Risk:** LOW (additive)  

**Tasks:**
1. Define checkpoint format
   - Stage name
   - Engine results
   - Context snapshot
   - Timestamp

2. Implement checkpoint saving
   - After each stage completes
   - Save to knowledge/checkpoints/
   - Include metadata for resume

3. Implement checkpoint loading
   - Resume from checkpoint
   - Skip completed stages
   - Validate checkpoint integrity

4. Testing
   - Save checkpoint
   - Resume from checkpoint
   - Verify same results

5. Expected outcome
   - Can resume interrupted pipelines
   - Faster development iteration

### P4.2: Optimize Artifact Streaming (LOW RISK)

**Status:** Low risk (enhancement)  
**Risk:** LOW (improves implementation)  

**Tasks:**
1. Convert ArtifactBus to streaming
   - Write artifacts while pipeline running
   - Not batch at end
   - Reduce end-of-pipeline spike

2. Testing
   - Verify all artifacts written
   - Compare before/after behavior

3. Expected outcome
   - Better visibility during execution
   - Smoother resource usage

### P4.3: Add Parallel Execution Capability (LOW RISK)

**Status:** Low risk (optional, disabled by default)  
**Risk:** LOW (must be opt-in)  

**Tasks:**
1. Update ExecutionScheduler
   - Actually use group.parallel flag
   - Group by dependencies
   - Execute parallelizable groups in parallel

2. Identify parallelizable stages
   - STAGE 2C: Generation (9 generators)
   - Validation: independent validators
   - Benchmark: independent analyzers

3. Safety measures
   - Parallel disabled by default
   - Opt-in flag: --parallel
   - Dependency validation prevents unsafe parallelization

4. Testing
   - Test parallel execution
   - Verify results same as sequential
   - Measure speedup

5. Expected outcome
   - Option to parallelize independent work
   - 30-50% faster generation stage (potential)
   - Safe by default (sequential)

### P4.4: Documentation & Migration Guide (SAFE)

**Status:** Safe to implement  
**Risk:** LOW (documentation only)  

**Tasks:**
1. Create V6 Architecture Documentation
   - Describe 8-stage pipeline
   - Document each stage
   - Document engine organization

2. Create Migration Guide
   - How to upgrade from V5 to V6
   - What changed
   - What stayed same

3. Create Engine Development Guide
   - How to implement engine in V6
   - Manifest requirements
   - Stage responsibilities

4. Update API documentation
   - New APIs in CompileManager, TestManager, etc.
   - Deprecation notices

5. Expected outcome
   - Clear documentation
   - Easy upgrade path
   - Clear development guidelines

## 20.2 Phase 4 Validation Criteria

- [ ] Checkpointing working (resume from checkpoint)
- [ ] Artifact streaming working
- [ ] Parallel execution option working (and safe)
- [ ] Documentation complete
- [ ] Migration guide clear
- [ ] All tests passing
- [ ] No regressions vs Phase 3

---

# 21. V6 COMPLETION METRICS

## 21.1 Success Criteria

### Performance Metrics

| Metric | V5 | V6 Target | Achievement |
|--------|-----|----------|------------|
| **Compilation time** | 2-4x | 1-2x | 50-75% reduction |
| **Test time** | 2-3x | 1-2x | 40-70% reduction |
| **Total pipeline time** | 35-40s | 15-20s | 50-60% reduction |
| **Memory usage** | High | 40% lower | 60% reduction target |
| **Repository size** | Large | 30% of V5 | 70% reduction target |
| **Startup delay** | High | 90% lower | 90% reduction target |

### Architectural Metrics

| Metric | V5 | V6 | Improvement |
|--------|-----|-----|------------|
| **Engine count** | 101 | 38 | 62% reduction |
| **Registry instances** | 5+ | 1 | Unified |
| **Orchestration layers** | 3 | 1 | Simplified |
| **Duplicate engines** | 21 | 0 | Eliminated |
| **Code organization** | Flat | Staged | Clear |
| **Dead code files** | 8 | 0 | Removed |

### Code Quality Metrics

| Metric | V5 | V6 |
|--------|-----|-----|
| **Circular deps** | 0 (empty manifests) | 0 (validated) |
| **Test coverage** | ~60% | ≥ 60% |
| **Documentation** | Basic | Comprehensive |
| **Type checking** | Full | Full |
| **Linting** | ESLint | ESLint |

---

# 22. CONCLUSION

## 22.1 V6 Vision Achieved

The V6 Master Blueprint transforms SATSET AI Factory from a complex 3-layer architecture with duplicated engines into a clean, single-layer orchestration with unified pipelines.

**Key Achievements:**

✅ **Simplified Architecture:** 3 layers → 1 main orchestration + 8 clear stages  
✅ **Consolidated Engines:** 101 engines → 38 engines (62% reduction)  
✅ **Eliminated Duplication:** 21 duplicate engines consolidated into unified pipelines  
✅ **Performance:** 50-60% faster pipeline execution  
✅ **Cleaner Codebase:** Repository 70% smaller, clear organization  
✅ **Better Maintainability:** Each stage has clear responsibility  
✅ **Enhanced Validation:** Pre-execution, mid-pipeline, post-execution checks  
✅ **Backward Compatible:** Old APIs kept (deprecated) for smooth transition  

## 22.2 Implementation Roadmap

**Phase 1 (2 weeks):** Foundation
- Repository cleanup
- Folder reorganization
- Registry unification

**Phase 2 (2 weeks):** Optimization
- Compile/test caching
- JSON parsing optimization
- Artifact deduplication

**Phase 3 (3 weeks):** Consolidation (Core Transformation)
- RepairPipeline
- ReleasePipeline
- ValidationPipeline
- Dead code removal

**Phase 4 (1 week):** Polish
- Checkpointing/resume
- Artifact streaming
- Parallel execution (opt-in)
- Documentation

**Total:** 8 weeks to V6 complete

## 22.3 Next Steps

1. **Stakeholder Review:** Present blueprint to team
2. **Risk Assessment:** Detailed review of Phase 1 & 3 risks
3. **Resource Planning:** Allocate team for 8-week effort
4. **Phase 1 Kickoff:** Repository cleanup (lowest risk, immediate value)
5. **Iterative Progress:** Monthly reviews between phases

---

**Document Status:** ARCHITECTURE DESIGN COMPLETE  
**Last Updated:** 2026-07-27  
**Next Phase:** Phase 1 Planning & Resource Allocation
