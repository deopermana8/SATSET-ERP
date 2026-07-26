

# Architecture

## Project Structure
- Engine-based pipeline
- Context-driven state
- Deterministic repair

## Module Boundaries
- Scanner owns discovery
- Analyzer owns rules
- Repair owns file mutations

## Dependency Graph
- Scanner -> Analyzer -> Diagnostic -> Root Cause -> Repair -> Verification
