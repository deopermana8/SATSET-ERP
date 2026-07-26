import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { ProjectBrainEngine } from "../src/ai/engines/ProjectBrainEngine.js";
import { RequirementRefinementEngine } from "../src/ai/engines/RequirementRefinementEngine.js";
import { BusinessRuleEngine } from "../src/ai/engines/BusinessRuleEngine.js";
import { ArchitectureDecisionEngine } from "../src/ai/engines/ArchitectureDecisionEngine.js";
import { ModulePlannerEngine } from "../src/ai/engines/ModulePlannerEngine.js";
import { DependencyResolverEngine } from "../src/ai/engines/DependencyResolverEngine.js";
import { SourceGeneratorEngine } from "../src/ai/engines/SourceGeneratorEngine.js";
import { CodeAssemblerEngine } from "../src/ai/engines/CodeAssemblerEngine.js";
import { RefactorEngine } from "../src/ai/engines/RefactorEngine.js";
import { CompileMonitorEngine } from "../src/ai/engines/CompileMonitorEngine.js";
import { TestMonitorEngine } from "../src/ai/engines/TestMonitorEngine.js";
import { SelfHealingEngine } from "../src/ai/engines/SelfHealingEngine.js";
import { SecurityScannerEngine } from "../src/ai/engines/SecurityScannerEngine.js";
import { PerformanceAnalyzerEngine } from "../src/ai/engines/PerformanceAnalyzerEngine.js";
import { DocumentationBuilderEngine } from "../src/ai/engines/DocumentationBuilderEngine.js";
import { ReleaseBuilderEngine } from "../src/ai/engines/ReleaseBuilderEngine.js";
import { VersionManagerEngine } from "../src/ai/engines/VersionManagerEngine.js";
import { PackagePublisherEngine } from "../src/ai/engines/PackagePublisherEngine.js";
import { KnowledgeBaseEngine } from "../src/ai/engines/KnowledgeBaseEngine.js";
import { ExperienceEngine } from "../src/ai/engines/ExperienceEngine.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-factory-engines-"));
  const context = new Context({
    projectRoot: root,
    projectName: "factory-demo",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: { root, idea: "Create a software factory" },
  });

  const engineSpecs = [
    { engine: new ProjectBrainEngine(), outputPath: path.join(root, "reports", "project-brain.json") },
    { engine: new RequirementRefinementEngine(), outputPath: path.join(root, "requirements", "refined-requirements.json") },
    { engine: new BusinessRuleEngine(), outputPath: path.join(root, "docs", "business-rules.md") },
    { engine: new ArchitectureDecisionEngine(), outputPath: path.join(root, "docs", "architecture-decisions.md") },
    { engine: new ModulePlannerEngine(), outputPath: path.join(root, "reports", "module-plan.json") },
    { engine: new DependencyResolverEngine(), outputPath: path.join(root, "reports", "dependency-map.json") },
    { engine: new SourceGeneratorEngine(), outputPath: path.join(root, "src", "generated", "source-manifest.json") },
    { engine: new CodeAssemblerEngine(), outputPath: path.join(root, "src", "generated", "assembly-report.md") },
    { engine: new RefactorEngine(), outputPath: path.join(root, "docs", "refactor-plan.md") },
    { engine: new CompileMonitorEngine(), outputPath: path.join(root, "reports", "compile-monitor.json") },
    { engine: new TestMonitorEngine(), outputPath: path.join(root, "reports", "test-monitor.json") },
    { engine: new SelfHealingEngine(), outputPath: path.join(root, "docs", "self-healing.md") },
    { engine: new SecurityScannerEngine(), outputPath: path.join(root, "reports", "security-scan.json") },
    { engine: new PerformanceAnalyzerEngine(), outputPath: path.join(root, "reports", "performance.json") },
    { engine: new DocumentationBuilderEngine(), outputPath: path.join(root, "docs", "factory-documentation.md") },
    { engine: new ReleaseBuilderEngine(), outputPath: path.join(root, "release", "release-notes.md") },
    { engine: new VersionManagerEngine(), outputPath: path.join(root, "release", "version.json") },
    { engine: new PackagePublisherEngine(), outputPath: path.join(root, "release", "package-manifest.json") },
    { engine: new KnowledgeBaseEngine(), outputPath: path.join(root, "knowledge", "knowledge-base.json") },
    { engine: new ExperienceEngine(), outputPath: path.join(root, "knowledge", "experience.json") },
  ];

  for (const spec of engineSpecs) {
    await spec.engine.run(context);
    assert.equal(await fs.access(spec.outputPath).then(() => true).catch(() => false), true, `${spec.outputPath} should be created`);
  }

  console.log("factory engines test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
