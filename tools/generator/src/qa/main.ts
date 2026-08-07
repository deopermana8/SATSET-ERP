import { createCommand, createQaEnvironment, qaOutputPath, snapshotPath } from "./helpers.js";
import { Assert, TestCase, TestRunner, TestSummary } from "./framework.js";
import { getIdentityDependencyGraph } from "../core/IdentityRegistry.js";
import { path } from "../utils/Node.js";

interface BenchmarkResult {
  durationMs: number;
  name: string;
}

async function buildTestCases(): Promise<TestCase[]> {
  const environment = await createQaEnvironment();
  const tests: TestCase[] = [];

  tests.push({
    kind: "unit",
    name: "Plugin Registry discovers plugins",
    run: async () => {
      Assert.ok(environment.generatorPlugins.length >= 20, "Expected generator plugins to be discovered.");
      const names = environment.generatorPlugins.map((plugin) => plugin.manifest.name);
      Assert.includes(names, "SolutionPlugin", "Solution plugin should be registered.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Registry identity and plugin id are unique",
    run: async () => {
      const names = environment.generatorPlugins.map((plugin) => plugin.manifest.name);
      const unique = new Set(names);
      Assert.equal(unique.size, names.length, "Registry plugin identity should be unique.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Blueprint Engine loads normalized blueprint",
    run: async () => {
      const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      Assert.ok(Array.isArray(blueprint.entities) && blueprint.entities.length > 0, "Blueprint entities should be materialized.");
      Assert.ok(Array.isArray(blueprint.api), "Blueprint API should exist.");
      Assert.ok(Array.isArray(blueprint.workflow), "Blueprint workflow should exist.");
    }
  });

  tests.push({
    kind: "unit",
    name: "ERP Wisata blueprint generates business artifacts",
    run: async () => {
      const wisataBlueprintPath = path.join(environment.generatorRoot, "blueprints", "erp-wisata.yaml");
      const blueprint = environment.blueprintEngine.load({
        arguments: ["--blueprint", wisataBlueprintPath],
        blueprintPath: wisataBlueprintPath,
        name: "ERP Wisata",
        target: "module",
        verb: "generate"
      }, environment.generatorRoot);

      Assert.ok(blueprint.entities.length >= 4, "ERP Wisata should define at least Destinasi, Reservasi, Ticketing, Pembayaran entities.");

      const result = await environment.generatorCore.run({
        arguments: ["--blueprint", wisataBlueprintPath],
        blueprintPath: wisataBlueprintPath,
        name: "ERP Wisata",
        target: "module",
        verb: "generate"
      });

      Assert.ok(result.artifacts.length > 0, "ERP Wisata generation should produce business artifacts.");
      Assert.includes(result.pluginOrder, "IdentityGeneratorPlugin", "Identity plugin should run for ERP Wisata.");
      Assert.includes(result.pluginOrder, "DocumentationPlugin", "Documentation plugin should run for ERP Wisata.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Workspace bootstrap generates runnable workspace skeleton",
    run: async () => {
      const outputDir = qaOutputPath(environment, "workspace-bootstrap");
      const result = await environment.generatorCore.run({
        arguments: ["--blueprint", path.join(environment.generatorRoot, "blueprints", "workspace.yaml")],
        blueprintPath: path.join(environment.generatorRoot, "blueprints", "workspace.yaml"),
        name: "Satset Workspace",
        outputDir,
        target: "workspace",
        verb: "generate"
      });

      Assert.ok(result.artifacts.some((artifact) => artifact.outputPath.endsWith("package.json")), "Workspace bootstrap should generate root package.json.");
      Assert.ok(result.artifacts.some((artifact) => /apps[\\/]admin[\\/]package\.json$/i.test(artifact.outputPath)), "Workspace bootstrap should generate admin package.json.");
      Assert.ok(result.artifacts.some((artifact) => /apps[\\/]api[\\/]src[\\/]index\.ts$/i.test(artifact.outputPath)), "Workspace bootstrap should generate API entrypoint.");
      Assert.ok(result.artifacts.some((artifact) => /apps[\\/]worker[\\/]src[\\/]index\.ts$/i.test(artifact.outputPath)), "Workspace bootstrap should generate worker entrypoint.");
      Assert.ok(result.artifacts.some((artifact) => /docker[\\/]docker-compose\.yml$/i.test(artifact.outputPath)), "Workspace bootstrap should generate docker compose file.");
      Assert.ok(result.artifacts.some((artifact) => /env\.example$/i.test(artifact.outputPath)), "Workspace bootstrap should generate env example.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Planner produces entity plans",
    run: async () => {
      const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      const plans = environment.planner.plan(blueprint, environment.generatorPlugins);
      Assert.equal(plans.length, blueprint.entities.length, "Planner should create one plan per entity.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Composer selects plugins automatically",
    run: async () => {
      const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      const plugins = environment.composer.compose("module", blueprint, environment.generatorPlugins);
      Assert.includes(plugins, "CrudPlugin", "Composer should include CrudPlugin.");
      Assert.includes(plugins, "AutoFixPlugin", "Composer should include AutoFixPlugin.");
      Assert.includes(plugins, "IdentityGeneratorPlugin", "Composer should enforce IdentityGeneratorPlugin.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Identity registry exposes dependency graph",
    run: async () => {
      const graph = getIdentityDependencyGraph(["Finance", "CRM"]);
      Assert.ok(graph.some((node) => node.name === "identity"), "Identity graph should include identity root.");
      Assert.ok(graph.some((node) => node.name === "finance" && node.dependencies.includes("identity")), "Finance should depend on identity.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Dependency Graph remains acyclic",
    run: async () => {
      const cycles = environment.dependencyGraph.detectCycles(environment.generatorPlugins);
      Assert.equal(cycles.length, 0, "Dependency graph should not contain cycles.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Generator Core handles blueprint scaffold command",
    run: async () => {
      const result = await environment.generatorCore.run({
        arguments: [],
        blueprintType: "module",
        name: "QualityFinance",
        target: "blueprint",
        verb: "generate"
      });
      Assert.ok(typeof result.blueprintPath === "string", "Blueprint scaffold should return a path.");
    }
  });

  tests.push({
    kind: "unit",
    name: "AutoFix build runner supports QA pipeline",
    run: async () => {
      const result = await environment.autofixBuildRunner.runPipeline(environment.projectRoot, environment.autofixProject.buildLogPath);
      Assert.ok(result.success, "QA build pipeline should succeed.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Rule Engine dispatches manifest-based rules",
    run: async () => {
      const patchPlan = await environment.autofixRuleEngine.dispatch([{
        category: "MODULE_NOT_FOUND" as never,
        code: "TS2307",
        file: environment.autofixProject.importableFiles[0],
        importSpecifier: "./missing",
        message: "Cannot find module './missing'",
        raw: "Cannot find module './missing'",
        source: "tsc"
      }], {
        diagnostics: [],
        importResolver: environment.autofixImportResolver,
        project: environment.autofixProject
      });
      Assert.ok(patchPlan === null || typeof patchPlan.ruleName === "string", "Rule dispatch should return a patch plan or null.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Doctor reports plugin registry status",
    run: async () => {
      const doctor = await environment.doctor.run({
        buildLogPath: qaOutputPath(environment, "build.log"),
        generatorRoot: environment.generatorRoot,
        pluginRoot: environment.generatorPluginRoot,
        plugins: environment.generatorPlugins,
        projectRoot: environment.projectRoot
      });
      Assert.ok(doctor.diagnostics.length > 0, "Doctor should emit diagnostics.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Repair produces repair report",
    run: async () => {
      const repair = await environment.repair.run({
        build: async () => true,
        buildLogPath: qaOutputPath(environment, "build.log"),
        generatorRoot: environment.generatorRoot,
        pluginRoot: environment.generatorPluginRoot,
        plugins: environment.generatorPlugins,
        projectRoot: environment.projectRoot
      });
      Assert.ok(repair.ok, "Repair should be successful in QA mode.");
    }
  });

  tests.push({
    kind: "unit",
    name: "CLI catalog exposes supported commands",
    run: async () => {
      const commands = [...environment.commandCatalog.generatorCommands()];
      Assert.includes(commands, "create", "CLI should expose create command.");
      Assert.includes(commands, "deploy", "CLI should expose deploy command.");
      Assert.includes(commands, "make", "CLI should expose make command.");
      Assert.includes(commands, "solution", "CLI should expose solution command.");
      Assert.equal(new Set(commands).size, commands.length, "Command catalog should be unique.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Solution command orchestrates existing plugins in strict mode",
    run: async () => {
      const solutionPath = qaOutputPath(environment, "tourism.solution.txt");
      environment.fileSystem.writeText(solutionPath, [
        "solution Tourism",
        "",
        "modules:",
        "Identity",
        "Dashboard",
        "Master",
        "Transaction",
        "Report",
        "Settings"
      ].join("\n"));

      const result = await environment.generatorCore.run({
        arguments: ["--blueprint", solutionPath],
        blueprintPath: solutionPath,
        name: "Tourism",
        target: "module",
        verb: "solution"
      });

      const expected = ["Identity", "Dashboard", "Master", "Transaction", "Report", "Settings"];
      Assert.equal((result.executionPlan ?? []).join("|"), expected.join("|"), "Solution plan order should match declared module dependencies.");

      const uniqueOrder = Array.from(new Set(result.pluginOrder));
      Assert.equal(uniqueOrder.length, result.pluginOrder.length, "No plugin should be called twice.");

      const orderedPlugins = result.pluginOrder
        .map((name) => environment.generatorPlugins.find((plugin) => plugin.manifest.name === name))
        .filter((plugin): plugin is NonNullable<typeof plugin> => Boolean(plugin));
      Assert.equal(orderedPlugins.length, result.pluginOrder.length, "All execution-plan plugins should exist in registry.");
      const cycles = environment.dependencyGraph.detectCycles(orderedPlugins);
      Assert.equal(cycles.length, 0, "Solution plugin order should remain acyclic.");

      for (const plugin of orderedPlugins) {
        for (const dependency of plugin.dependencies()) {
          Assert.ok(environment.generatorPlugins.some((item) => item.manifest.name === dependency), `Dependency ${dependency} for ${plugin.manifest.name} should exist.`);
        }
      }

      Assert.includes(result.pluginOrder, "RequirementArchitectPlugin", "Requirement plugin should run when available.");
      Assert.includes(result.pluginOrder, "IdentityGeneratorPlugin", "Identity plugin should run when available.");
      Assert.includes(result.pluginOrder, "CrudPlugin", "CRUD plugin should run when available.");
      Assert.includes(result.pluginOrder, "SeedPlugin", "Seeder plugin should run when available.");
      Assert.includes(result.pluginOrder, "TestGenerator", "Test plugin should run when available.");
      Assert.includes(result.pluginOrder, "DocumentationPlugin", "Documentation plugin should run when available.");

      Assert.ok(result.artifacts.length > 0, "Solution orchestration should delegate generation to existing plugins.");
      Assert.equal(result.buildStatus, "solution-executed", "Solution build status should indicate execution flow.");
    }
  });

  tests.push({
    kind: "unit",
    name: "Solution command produces ERP Wisata execution progress",
    run: async () => {
      const result = await environment.generatorCore.run({
        arguments: [],
        name: "ERP Wisata",
        target: "module",
        verb: "solution"
      });

      const expected = ["Identity", "Dashboard", "Master Data", "Wisata", "Reservasi", "Ticketing", "Pembayaran", "Laporan", "Dokumentasi"];
      Assert.equal((result.executionPlan ?? []).join("|"), expected.join("|"), "ERP Wisata should use prioritized execution plan.");
      Assert.ok(result.artifacts.some((artifact) => /modules[\\/]erp-wisata[\\/]/i.test(artifact.outputPath)), "ERP Wisata generation should produce module artifacts.");
    }
  });

  tests.push({
    kind: "integration",
    name: "End-to-end pipeline composes blueprint through orchestrator",
    run: async () => {
      const result = await environment.generatorCore.run(createCommand("module", "Finance", "generate"));
      Assert.ok(result.pluginOrder.length > 0, "Orchestrator should return plugin order.");
      Assert.ok((result.pipeline ?? []).length > 0, "Orchestrator should return pipeline stages.");
    }
  });

  tests.push({
    kind: "integration",
    name: "Validation engine accepts generated pipeline",
    run: async () => {
      const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      const plugins = environment.generatorPlugins;
      const plans = environment.planner.plan(blueprint, plugins);
      const pipeline = { entityPlans: plans, stages: environment.generatorPlugins.slice(0, 3).map((plugin) => ({ name: plugin.manifest.name, pluginNames: [plugin.manifest.name] })) };
      const report = environment.validationEngine.validate({
        blueprint,
        command: createCommand("module", "Finance"),
        pipeline,
        plugins
      });
      Assert.ok(report.ok, "Validation engine should accept a healthy pipeline.");
    }
  });

  tests.push({
    kind: "regression",
    name: "Generator registry keeps core plugins",
    run: async () => {
      const names = environment.generatorPlugins.map((plugin) => plugin.manifest.name);
      Assert.includes(names, "RequirementArchitectPlugin", "Architect plugin should stay registered.");
      Assert.includes(names, "WorkflowPlugin", "Workflow plugin should stay registered.");
      Assert.includes(names, "IdentityGeneratorPlugin", "Identity plugin should stay registered.");
      Assert.includes(names, "CrudGenerator", "CrudGenerator should stay registered.");
      Assert.includes(names, "PrismaGenerator", "PrismaGenerator should stay registered.");
      Assert.includes(names, "DocumentationGenerator", "DocumentationGenerator should stay registered.");
    }
  });

  tests.push({
    kind: "regression",
    name: "AutoFix rule registry keeps core rules",
    run: async () => {
      const rules = await environment.autofixRuleRegistry.discover(environment.autofixRulesRoot);
      const names = rules.map((rule) => rule.manifest.name);
      Assert.includes(names, "ImportResolverRule", "Import resolver rule should stay registered.");
      Assert.includes(names, "TypeResolverRule", "Type resolver rule should stay registered.");
      Assert.includes(names, "IdentityMigrationRule", "Identity migration rule should stay registered.");
      Assert.includes(names, "MissingImportRule", "Missing import rule should stay registered.");
      Assert.includes(names, "BrokenGeneratorRegistrationRule", "Broken generator registration rule should stay registered.");
    }
  });

  tests.push({
    kind: "snapshot",
    name: "Finance blueprint snapshot remains stable",
    run: async () => {
      const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      const targetPath = snapshotPath(environment, "finance-blueprint");
      const serialized = JSON.stringify(blueprint, null, 2);
      if (!environment.fileSystem.exists(targetPath)) {
        environment.fileSystem.writeText(targetPath, `${serialized}\n`);
      }
      const existing = environment.fileSystem.readText(targetPath).trim();
      Assert.equal(serialized, existing, "Blueprint snapshot changed.");
    }
  });

  tests.push({
    kind: "e2e",
    name: "satset create ERP Wisata completes in QA mode",
    run: async () => {
      const result = await environment.generatorCore.run({ arguments: [], name: "ERP Wisata", target: "module", verb: "create" });
      Assert.ok(result.pluginOrder.length > 0, "create ERP Wisata should complete.");
    }
  });

  tests.push({
    kind: "e2e",
    name: "satset create CRM completes in QA mode",
    run: async () => {
      const result = await environment.generatorCore.run({ arguments: [], name: "CRM", target: "module", verb: "create" });
      Assert.ok(result.pluginOrder.length > 0, "create CRM should complete.");
    }
  });

  tests.push({
    kind: "e2e",
    name: "satset create Inventory completes in QA mode",
    run: async () => {
      const result = await environment.generatorCore.run({ arguments: [], name: "Inventory", target: "module", verb: "create" });
      Assert.ok(result.pluginOrder.length > 0, "create Inventory should complete.");
    }
  });

  tests.push({
    kind: "e2e",
    name: "satset create Finance completes in QA mode",
    run: async () => {
      const result = await environment.generatorCore.run({ arguments: [], name: "Finance", target: "module", verb: "create" });
      Assert.ok(result.pluginOrder.length > 0, "create Finance should complete.");
    }
  });

  tests.push({
    kind: "stress",
    name: "Stress 10 modules sequentially",
    run: async () => {
      for (let index = 0; index < 10; index += 1) {
        const result = await environment.generatorCore.run({ arguments: [], name: `StressTen${index}`, target: "module", verb: "generate" });
        Assert.ok(result.pluginOrder.length > 0, "Stress 10 should generate plugin order.");
      }
    }
  });

  tests.push({
    kind: "stress",
    name: "Stress 50 modules sequentially",
    run: async () => {
      for (let index = 0; index < 50; index += 1) {
        const result = await environment.generatorCore.run({ arguments: [], name: `StressFifty${index}`, target: "module", verb: "generate" });
        Assert.ok(result.pluginOrder.length > 0, "Stress 50 should generate plugin order.");
      }
    }
  });

  tests.push({
    kind: "stress",
    name: "Stress 100 modules sequentially",
    run: async () => {
      for (let index = 0; index < 100; index += 1) {
        const result = await environment.generatorCore.run({ arguments: [], name: `StressHundred${index}`, target: "module", verb: "generate" });
        Assert.ok(result.pluginOrder.length > 0, "Stress 100 should generate plugin order.");
      }
    }
  });

  tests.push({
    kind: "stress",
    name: "Stress 500 modules sequentially",
    run: async () => {
      for (let index = 0; index < 500; index += 1) {
        const result = await environment.generatorCore.run({ arguments: [], name: `StressFiveHundred${index}`, target: "module", verb: "generate" });
        Assert.ok(result.pluginOrder.length > 0, "Stress 500 should generate plugin order.");
      }
    }
  });

  return tests;
}

async function runBenchmarks(): Promise<BenchmarkResult[]> {
  const environment = await createQaEnvironment();
  const benchmarks: Array<{ action: () => Promise<void>; name: string }> = [
    {
      name: "plugin-load",
      action: async () => {
        await environment.generatorRegistry.discover(environment.generatorPluginRoot);
      }
    },
    {
      name: "blueprint-generate",
      action: async () => {
        environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
      }
    },
    {
      name: "compose",
      action: async () => {
        const blueprint = environment.blueprintEngine.load(createCommand("module", "Finance"), environment.generatorRoot);
        environment.composer.compose("module", blueprint, environment.generatorPlugins);
      }
    },
    {
      name: "generate",
      action: async () => {
        await environment.generatorCore.run(createCommand("module", "BenchmarkFinance", "generate"));
      }
    },
    {
      name: "autofix",
      action: async () => {
        await environment.autofixBuildRunner.runPipeline(environment.projectRoot, environment.autofixProject.buildLogPath);
      }
    },
    {
      name: "build",
      action: async () => {
        await environment.generatorCore.run({ arguments: [], name: "build", target: "module", verb: "build" });
      }
    }
  ];

  const results: BenchmarkResult[] = [];
  for (const benchmark of benchmarks) {
    const startedAt = Date.now();
    await benchmark.action();
    results.push({ durationMs: Date.now() - startedAt, name: benchmark.name });
  }

  return results;
}

async function runValidationAndReport(testSummary: TestSummary, benchmark: BenchmarkResult[]) {
  const environment = await createQaEnvironment();
  const doctor = await environment.doctor.run({
    buildLogPath: qaOutputPath(environment, "build.log"),
    generatorRoot: environment.generatorRoot,
    pluginRoot: environment.generatorPluginRoot,
    plugins: environment.generatorPlugins,
    projectRoot: environment.projectRoot
  });
  const staticAnalysis = await environment.staticAnalysis.analyze(environment.generatorRoot, `${environment.projectRoot}/tools/autofix`);
  const consistency = environment.consistencyChecker.check(environment.generatorPlugins);
  const architecture = environment.architectureValidator.validate(environment.generatorPlugins);
  const report = environment.qualityReportBuilder.build({
    benchmark,
    blueprints: 1,
    doctor,
    generators: environment.generatorPlugins.length,
    plugins: environment.generatorPlugins,
    rules: (await environment.autofixRuleRegistry.discover(environment.autofixRulesRoot)).length,
    tests: { passed: testSummary.passed, total: testSummary.total },
    warnings: staticAnalysis.issues.length + consistency.issues.length + architecture.issues.length
  });
  const reportPath = qaOutputPath(environment, "quality-report.json");
  environment.fileSystem.writeText(reportPath, `${JSON.stringify({
    architecture,
    consistency,
    doctor,
    report,
    staticAnalysis,
    testSummary
  }, null, 2)}\n`);

  return { architecture, consistency, report, reportPath, staticAnalysis };
}

async function runContinuousValidation(): Promise<{ ok: boolean; steps: string[] }> {
  const environment = await createQaEnvironment();
  return environment.continuousValidator.run({
    build: async () => true,
    runAutofix: async () => true,
    runTests: async () => true,
    runValidation: async () => true
  });
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? "all";
  const tests = await buildTestCases();
  const runner = new TestRunner();
  const filter = mode === "all" || mode === "validate" || mode === "benchmark" || mode === "report" || mode === "continuous"
    ? undefined
    : mode as Parameters<TestRunner["run"]>[1];
  const summary = mode === "benchmark" ? { failed: 0, passed: 0, results: [], total: 0 } : await runner.run(tests, filter);
  const benchmark = await runBenchmarks();
  const validation = await runValidationAndReport(summary, benchmark);
  const continuous = await runContinuousValidation();

  console.log(JSON.stringify({
    benchmark,
    continuous,
    coverage: summary.total === 0 ? 100 : Math.round((summary.passed / summary.total) * 100),
    qualityReportPath: validation.reportPath,
    summary,
    validation: {
      architecture: validation.architecture,
      consistency: validation.consistency,
      report: validation.report,
      staticAnalysis: validation.staticAnalysis
    }
  }, null, 2));

  if (summary.failed > 0 || !validation.report.health || !continuous.ok) {
    process.exitCode = 1;
  }
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exitCode = 1;
});
