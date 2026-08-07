import { BackupManager } from "./BackupManager.js";
import { BuildRunner } from "./BuildRunner.js";
import { Doctor } from "./Doctor.js";
import { ErrorParser } from "./ErrorParser.js";
import { IdentityManualDetector } from "./IdentityManualDetector.js";
import { ImportResolver } from "./ImportResolver.js";
import { Logger } from "./Logger.js";
import { PatchEngine } from "./PatchEngine.js";
import { PrismaAnalyzer } from "./PrismaAnalyzer.js";
import { ProjectScanner } from "./ProjectScanner.js";
import { Repair } from "./Repair.js";
import { RuleRegistry } from "./RuleRegistry.js";
import { RuleEngine } from "./RuleEngine.js";
import { BuildPipelineResult, BuildResult, PatchPlan, ProjectInfo, RuleContext } from "./types.js";

interface PathModule {
  dirname(filePath: string): string;
  join(...paths: string[]): string;
  resolve(...paths: string[]): string;
}

const path = require("node:path") as PathModule;

function getProjectRoot(): string {
  const projectRootArgument = getArgumentValue("--project-root");
  if (projectRootArgument) {
    return path.resolve(projectRootArgument);
  }

  const currentDirectory = path.dirname(process.argv[1] ?? "");
  return path.resolve(currentDirectory, "../../..");
}

function getArgumentValue(name: string): string | undefined {
  const index = process.argv.findIndex((value) => value === name);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

function getCommand(): string {
  const argumentsList = process.argv.slice(2);

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (!argument.startsWith("--")) {
      return argument;
    }

    index += 1;
  }

  return "start";
}

async function createProjectInfo(rootDir: string): Promise<ProjectInfo> {
  const toolsDir = path.join(rootDir, "tools", "autofix");
  const scanner = new ProjectScanner(rootDir, toolsDir);
  const prismaAnalyzer = new PrismaAnalyzer(rootDir);
  const scannedProject = await scanner.scan(true);
  return prismaAnalyzer.analyze(scannedProject);
}

async function runBuild(project: ProjectInfo): Promise<BuildResult> {
  const buildRunner = new BuildRunner();
  return buildRunner.run(project.rootDir, project.buildLogPath);
}

async function runBuildPipeline(project: ProjectInfo): Promise<BuildPipelineResult> {
  const buildRunner = new BuildRunner();
  return buildRunner.runPipeline(project.rootDir, project.buildLogPath);
}

async function runStart(project: ProjectInfo): Promise<number> {
  const importResolver = new ImportResolver();
  const backupManager = new BackupManager(project.rootDir, project.backupRootDir);
  const logger = new Logger(project.logDir);
  const ruleEngine = new RuleEngine();
  const ruleRegistry = new RuleRegistry();
  const identityManualDetector = new IdentityManualDetector();
  const rules = await ruleRegistry.discover(path.join(path.dirname(process.argv[1] ?? ""), "rules"));
  ruleEngine.registerMany(rules);
  const patchEngine = new PatchEngine(project);

  for (let iteration = 1; iteration <= 10; iteration += 1) {
    const refreshedProject = await createProjectInfo(project.rootDir);
    const buildPipeline = await runBuildPipeline(refreshedProject);
    const identityDiagnostics = identityManualDetector.scan(refreshedProject);
    const diagnostics = [...buildPipeline.diagnostics, ...identityDiagnostics];
    const context: RuleContext = {
      diagnostics,
      project: refreshedProject,
      importResolver
    };
    const buildResult = buildPipeline.logs[0] ?? await runBuild(refreshedProject);
    logger.log({
      timestamp: new Date().toISOString(),
      rule: "BUILD",
      file: refreshedProject.buildLogPath,
      status: buildResult.success ? `success(iteration=${iteration})` : `failed(iteration=${iteration})`,
      durationMs: buildResult.durationMs
    });

    if (buildPipeline.success && identityDiagnostics.length === 0) {
      console.log(JSON.stringify({
        status: "success",
        iteration,
        build: buildPipeline
      }, null, 2));
      return 0;
    }

    const errors = diagnostics.map((diagnostic) => ({
      category: diagnostic.category,
      code: diagnostic.code,
      column: diagnostic.column,
      file: diagnostic.file,
      importSpecifier: undefined,
      line: diagnostic.line,
      message: diagnostic.message,
      raw: diagnostic.raw,
      source: diagnostic.source
    }));
    const patchPlan = await ruleEngine.dispatch(errors, context);
    if (!patchPlan) {
      logger.log({
        timestamp: new Date().toISOString(),
        rule: "NO_RULE",
        file: refreshedProject.buildLogPath,
        status: `stopped(iteration=${iteration})`,
        durationMs: 0
      });
      console.log(JSON.stringify({
        status: "no-rule",
        iteration,
        errors
      }, null, 2));
      return 1;
    }

    const filesToBackup = collectPatchFiles(patchPlan);
    const backupResult = backupManager.backupFiles(filesToBackup);
    const patchResult = patchEngine.apply(refreshedProject, patchPlan);
    logger.log({
      timestamp: new Date().toISOString(),
      rule: patchPlan.ruleName,
      file: filesToBackup.join(","),
      status: patchResult.applied ? `patched(iteration=${iteration})` : `skipped(iteration=${iteration})`,
      durationMs: patchResult.durationMs
    });

    if (!patchResult.applied) {
      console.log(JSON.stringify({
        status: "patch-not-applied",
        iteration,
        backup: backupResult,
        patch: patchResult
      }, null, 2));
      return 1;
    }

    if (buildPipeline.success && identityDiagnostics.length > 0) {
      console.log(JSON.stringify({
        status: "identity-migration-advice",
        iteration,
        findings: identityDiagnostics.length,
        patch: patchResult
      }, null, 2));
      return 0;
    }
  }

  console.log(JSON.stringify({
    status: "max-iterations",
    maxIterations: 10
  }, null, 2));
  return 1;
}

async function runDoctor(project: ProjectInfo): Promise<number> {
  const ruleRegistry = new RuleRegistry();
  const rules = await ruleRegistry.discover(path.join(path.dirname(process.argv[1] ?? ""), "rules"));
  const identityFindings = new IdentityManualDetector().scan(project);
  const doctor = new Doctor().run(project, ruleRegistry.report(rules), identityFindings);
  console.log(JSON.stringify(doctor, null, 2));
  return doctor.ok ? 0 : 1;
}

async function runRepair(project: ProjectInfo): Promise<number> {
  const repair = await new Repair().run(project);
  console.log(JSON.stringify(repair, null, 2));
  return repair.ok ? 0 : 1;
}

function collectPatchFiles(patchPlan: PatchPlan): string[] {
  return Array.from(new Set(patchPlan.operations.map((operation) => operation.file)));
}

async function main(): Promise<void> {
  const rootDir = getProjectRoot();
  const project = await createProjectInfo(rootDir);
  const command = getCommand();

  switch (command) {
    case "scan":
      console.log(JSON.stringify(project, null, 2));
      process.exitCode = 0;
      return;
    case "build": {
      const buildResult = await runBuild(project);
      console.log(JSON.stringify(buildResult, null, 2));
      process.exitCode = buildResult.success ? 0 : 1;
      return;
    }
    case "doctor":
      process.exitCode = await runDoctor(project);
      return;
    case "repair":
      process.exitCode = await runRepair(project);
      return;
    case "autofix":
    case "start":
    default:
      process.exitCode = await runStart(project);
      return;
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exitCode = 1;
});
