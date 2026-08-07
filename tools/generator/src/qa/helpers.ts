import { GeneratorCore } from "../core/GeneratorCore.js";
import { BlueprintEngine } from "../core/BlueprintEngine.js";
import { CommandCatalog } from "../core/CommandCatalog.js";
import { Composer } from "../core/Composer.js";
import { ConsistencyChecker } from "../core/ConsistencyChecker.js";
import { DependencyGraph } from "../core/DependencyGraph.js";
import { Doctor } from "../core/Doctor.js";
import { GeneratorRegistry } from "../core/GeneratorRegistry.js";
import { HealthScoreCalculator } from "../core/HealthScore.js";
import { Orchestrator } from "../core/Orchestrator.js";
import { Planner } from "../core/Planner.js";
import { ProjectAnalyzer } from "../core/ProjectAnalyzer.js";
import { QualityReportBuilder } from "../core/QualityReport.js";
import { Repair } from "../core/Repair.js";
import { StaticAnalysis } from "../core/StaticAnalysis.js";
import { ValidationEngine } from "../core/ValidationEngine.js";
import { ArchitectureValidator } from "../core/ArchitectureValidator.js";
import { ContinuousValidator } from "../core/ContinuousValidator.js";
import { FileSystem } from "../utils/FileSystem.js";
import { path } from "../utils/Node.js";
import { GenerateCommand } from "../sdk/contracts.js";

interface AutofixProjectInfo {
  backupRootDir: string;
  buildLogPath: string;
  cacheFilePath: string;
  generatedPrismaPaths: string[];
  importableFiles: string[];
  logDir: string;
  nextConfigFiles: string[];
  packageJsonFiles: string[];
  prismaGeneratorOutputs: Record<string, string | undefined>;
  rootDir: string;
  schemaPrismaFiles: string[];
  sourceFiles: string[];
  toolsDir: string;
  tsconfigFiles: string[];
  workspacePackageJsonPath?: string;
}

interface AutofixBuildRunnerLike {
  runPipeline(rootDir: string, logPath: string): Promise<{ success: boolean }>;
}

interface AutofixImportResolverLike {
  resolveImportTarget(fromFile: string, importSpecifier: string, project: AutofixProjectInfo): string | undefined;
  resolveRelativeImport(fromFile: string, toFile: string): string;
}

interface AutofixRuleLike {
  manifest: { name: string };
}

interface AutofixRuleEngineLike {
  dispatch(errors: ReadonlyArray<Record<string, unknown>>, context: { diagnostics: readonly unknown[]; importResolver: AutofixImportResolverLike; project: AutofixProjectInfo }): Promise<{ ruleName: string } | null>;
  registerMany(rules: readonly AutofixRuleLike[]): void;
}

interface AutofixRuleRegistryLike {
  discover(rulesRoot: string): Promise<AutofixRuleLike[]>;
}

export interface QaEnvironment {
  architectureValidator: ArchitectureValidator;
  autofixBuildRunner: AutofixBuildRunnerLike;
  autofixImportResolver: AutofixImportResolverLike;
  autofixProject: AutofixProjectInfo;
  autofixRuleEngine: AutofixRuleEngineLike;
  autofixRuleRegistry: AutofixRuleRegistryLike;
  autofixRulesRoot: string;
  blueprintEngine: BlueprintEngine;
  commandCatalog: CommandCatalog;
  composer: Composer;
  consistencyChecker: ConsistencyChecker;
  continuousValidator: ContinuousValidator;
  dependencyGraph: DependencyGraph;
  doctor: Doctor;
  fileSystem: FileSystem;
  generatorCore: GeneratorCore;
  generatorPlugins: Awaited<ReturnType<GeneratorRegistry["discover"]>>;
  generatorPluginRoot: string;
  generatorRegistry: GeneratorRegistry;
  generatorRoot: string;
  healthScoreCalculator: HealthScoreCalculator;
  orchestrator: Orchestrator;
  planner: Planner;
  projectAnalyzer: ProjectAnalyzer;
  projectRoot: string;
  qualityReportBuilder: QualityReportBuilder;
  repair: Repair;
  staticAnalysis: StaticAnalysis;
  validationEngine: ValidationEngine;
}

export async function createQaEnvironment(): Promise<QaEnvironment> {
  process.env.SATSET_QA_MODE = "1";
  const fileSystem = new FileSystem();
  const generatorRoot = path.resolve(path.dirname(process.argv[1] ?? ""), "..", "..");
  const projectRoot = path.resolve(generatorRoot, "..", "..");
  const generatorPluginRoot = path.join(generatorRoot, "src", "plugins");
  const generatorRegistry = new GeneratorRegistry({ log: () => undefined } as never);
  const generatorPlugins = await generatorRegistry.discover(generatorPluginRoot);
  const autofixRulesRoot = path.join(projectRoot, "tools", "autofix", "src", "rules");
  const autofixRuntimeRoot = path.join(projectRoot, "tools", "autofix", "src");
  const { RuleRegistry } = require(path.join(autofixRuntimeRoot, "RuleRegistry.ts")) as { RuleRegistry: new () => AutofixRuleRegistryLike };
  const { RuleEngine } = require(path.join(autofixRuntimeRoot, "RuleEngine.ts")) as { RuleEngine: new () => AutofixRuleEngineLike };
  const { BuildRunner } = require(path.join(autofixRuntimeRoot, "BuildRunner.ts")) as { BuildRunner: new () => AutofixBuildRunnerLike };
  const { ImportResolver } = require(path.join(autofixRuntimeRoot, "ImportResolver.ts")) as { ImportResolver: new () => AutofixImportResolverLike };
  const { ProjectScanner } = require(path.join(autofixRuntimeRoot, "ProjectScanner.ts")) as { ProjectScanner: new (rootDir: string, toolsDir: string) => { scan(forceRefresh?: boolean): Promise<AutofixProjectInfo> } };
  const { PrismaAnalyzer } = require(path.join(autofixRuntimeRoot, "PrismaAnalyzer.ts")) as { PrismaAnalyzer: new (rootDir: string) => { analyze(project: AutofixProjectInfo): AutofixProjectInfo } };
  const autofixRuleRegistry = new RuleRegistry();
  const autofixRuleEngine = new RuleEngine();
  autofixRuleEngine.registerMany(await autofixRuleRegistry.discover(autofixRulesRoot));
  const autofixProject = await createAutofixProject(projectRoot, ProjectScanner, PrismaAnalyzer);

  return {
    architectureValidator: new ArchitectureValidator(),
    autofixBuildRunner: new BuildRunner(),
    autofixImportResolver: new ImportResolver(),
    autofixProject,
    autofixRuleEngine,
    autofixRuleRegistry,
    autofixRulesRoot,
    blueprintEngine: new BlueprintEngine(),
    commandCatalog: new CommandCatalog(),
    composer: new Composer(),
    consistencyChecker: new ConsistencyChecker(),
    continuousValidator: new ContinuousValidator(),
    dependencyGraph: new DependencyGraph(),
    doctor: new Doctor(),
    fileSystem,
    generatorCore: new GeneratorCore(projectRoot, generatorRoot),
    generatorPlugins,
    generatorPluginRoot,
    generatorRegistry,
    generatorRoot,
    healthScoreCalculator: new HealthScoreCalculator(),
    orchestrator: new Orchestrator(),
    planner: new Planner(),
    projectAnalyzer: new ProjectAnalyzer(),
    projectRoot,
    qualityReportBuilder: new QualityReportBuilder(),
    repair: new Repair(),
    staticAnalysis: new StaticAnalysis(),
    validationEngine: new ValidationEngine()
  };
}

export function createCommand(target: GenerateCommand["target"], name: string, verb: GenerateCommand["verb"] = "generate"): GenerateCommand {
  return {
    arguments: [],
    name,
    target,
    verb
  };
}

export function qaOutputPath(environment: QaEnvironment, name: string): string {
  return path.join(environment.generatorRoot, "test-artifacts", name);
}

export function snapshotPath(environment: QaEnvironment, name: string): string {
  return path.join(environment.generatorRoot, "test-artifacts", "snapshots", `${name}.json`);
}

async function createAutofixProject(
  projectRoot: string,
  ProjectScanner: new (rootDir: string, toolsDir: string) => { scan(forceRefresh?: boolean): Promise<AutofixProjectInfo> },
  PrismaAnalyzer: new (rootDir: string) => { analyze(project: AutofixProjectInfo): AutofixProjectInfo }
): Promise<AutofixProjectInfo> {
  const toolsDir = path.join(projectRoot, "tools", "autofix");
  const scanner = new ProjectScanner(projectRoot, toolsDir);
  const prismaAnalyzer = new PrismaAnalyzer(projectRoot);
  const scanned = await scanner.scan(true);
  return prismaAnalyzer.analyze(scanned);
}
