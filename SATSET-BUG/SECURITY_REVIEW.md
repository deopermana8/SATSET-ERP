# Security Review

Date: 2026-07-29
Scope: `SATSET-BUG/src/**/*.ts`
Method: static pattern scan + targeted source inspection

## Findings

### 1) Command execution with shell enabled
- Severity: High
- File: `src/commands/CommandExecutor.ts:19`
- Evidence: `spawn(command, args, { shell: true, ... })`
- Risk: command/argument concatenation under shell mode increases command injection surface.

### 2) Unbounded write path resolution in patch apply flow
- Severity: Medium
- File: `src/doctor/PatchApplier.ts:25`
- Evidence: `path.resolve(projectRoot, patch.filePath)` then direct `fs.writeFile`.
- Risk: if patch path input is untrusted, write target can escape expected workspace boundary.

### 3) Unbounded write path resolution in planner repair flow
- Severity: Medium
- File: `src/planner/RepairEngine.ts:49`
- Evidence: `path.resolve(context.projectRoot, action.filePath)` then write.
- Risk: same traversal class if action file path becomes untrusted.

### 4) Unbounded write path resolution in auto-repair flow
- Severity: Medium
- File: `src/autofix/AutoRepairEngine.ts:296`
- Evidence: `path.resolve(context.projectRoot, action.filePath)` then write.
- Risk: same traversal class if action file path becomes untrusted.

## Non-findings

- No child-process `exec()` API usage found; match in `GitScanner` is regex `.exec()`.

## Action Policy

- No code fix applied in this phase by design.
- Findings are recorded for post-RC remediation planning.