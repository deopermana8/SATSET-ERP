import fs from "node:fs/promises";
import path from "node:path";
import { Context } from "../core/Context.js";
import { Doctor } from "../doctor/Doctor.js";
import { BenchmarkEngine } from "../benchmark/BenchmarkEngine.js";
import { ReleaseEvaluator } from "../benchmark/ReleaseEvaluator.js";
import { TrendAnalyzer } from "../benchmark/TrendAnalyzer.js";
import { RegressionAnalyzer } from "../benchmark/RegressionAnalyzer.js";
import { BuildLoopEngine } from "../doctor/BuildLoopEngine.js";
import { RepairLoopEngine } from "../ai/engines/RepairLoopEngine.js";
import { ProjectMatrix } from "./ProjectMatrix.js";
import { ValidationReport } from "./ValidationReport.js";

export interface ProductionValidationResult {
  project: string;
  compileSuccess: boolean;
  testSuccess: boolean;
  repairSuccess: boolean;
  benchmarkScore: number;
  releaseStatus: string;
  executionDurationMs: number;
  artifactsGenerated: string[];
}

export class ProductionValidator {
  public readonly name = "ProductionValidator";

  async run(context: Context): Promise<ProductionValidationResult[]> {
    const benchmarkRoot = path.join(context.projectRoot, "benchmarks");
    let entries;
    try {
      entries = await fs.readdir(benchmarkRoot, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        const reportPath = path.join(context.projectRoot, "knowledge", "production-report.json");
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify([], null, 2), "utf8");
        const productionScorePath = path.join(context.projectRoot, "knowledge", "production-score.json");
        await fs.writeFile(productionScorePath, JSON.stringify({ projects: 0, averageScore: 0 }, null, 2), "utf8");
        const historyPath = path.join(context.projectRoot, "knowledge", "validation-history.json");
        await fs.writeFile(historyPath, JSON.stringify([], null, 2), "utf8");
        context.metadata = {
          ...context.metadata,
          productionValidation: [],
          projectMatrix: [],
          validationReport: ValidationReport.fromPayload({
            compileSuccess: true,
            testSuccess: true,
            repairSuccess: true,
            benchmarkScore: 0,
            releaseStatus: "READY",
            executionDurationMs: 0,
            artifactsGenerated: [],
          }),
        } as typeof context.metadata & { productionValidation?: ProductionValidationResult[]; projectMatrix?: unknown; validationReport?: unknown };
        return [];
      }
      throw error;
    }
    const projects = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    const results: ProductionValidationResult[] = [];
    const matrix = new ProjectMatrix();

    for (const project of projects) {
      const projectRoot = path.join(benchmarkRoot, project);
      const startedAt = Date.now();
      const projectContext = new Context({
        projectRoot,
        projectName: project,
        nodeVersion: context.nodeVersion,
        pnpmVersion: context.pnpmVersion,
        typescriptVersion: context.typescriptVersion,
        prismaVersion: context.prismaVersion,
        nextVersion: context.nextVersion,
        issues: [],
        recommendations: [],
        metadata: { root: projectRoot },
      });

      try {
        const doctor = new Doctor({
          projectRoot,
          projectName: project,
          nodeVersion: context.nodeVersion,
          pnpmVersion: context.pnpmVersion,
          typescriptVersion: context.typescriptVersion,
          prismaVersion: context.prismaVersion,
          nextVersion: context.nextVersion,
          issues: [],
          recommendations: [],
          metadata: { root: projectRoot },
        }, { skipBenchmark: true });

        await doctor.run();

        const buildLoop = new BuildLoopEngine();
        await buildLoop.run(projectContext);
        const repairLoop = new RepairLoopEngine();
        await repairLoop.run(projectContext);

        const benchmarkEngine = new BenchmarkEngine();
        await benchmarkEngine.run(projectContext);

        const releaseEvaluator = new ReleaseEvaluator();
        const releaseResult = await releaseEvaluator.run(projectContext);
        const trendAnalyzer = new TrendAnalyzer();
        await trendAnalyzer.run(projectContext);
        const regressionAnalyzer = new RegressionAnalyzer();
        await regressionAnalyzer.run(projectContext);

        const artifacts = await this.collectArtifacts(projectRoot);
        const benchmarkScore = (projectContext.metadata as Record<string, unknown>).benchmarkResult as Array<{ score?: number }> | undefined;
        const compileSuccess = (projectContext.metadata as Record<string, unknown>).buildLoop as { report?: { compilerResult?: { succeeded?: boolean } } } | undefined;
        const testSuccess = (projectContext.metadata as Record<string, unknown>).buildLoop as { report?: { testResults?: Array<{ passed?: boolean }> } } | undefined;
        const repairSuccess = projectContext.repairLoop;

        const result: ProductionValidationResult = {
          project,
          compileSuccess: compileSuccess?.report?.compilerResult?.succeeded ?? false,
          testSuccess: (testSuccess?.report?.testResults ?? []).every((test) => test.passed ?? false),
          repairSuccess: repairSuccess?.completed ?? false,
          benchmarkScore: benchmarkScore?.[0]?.score ?? 0,
          releaseStatus: releaseResult.status,
          executionDurationMs: Date.now() - startedAt,
          artifactsGenerated: artifacts,
        };

        results.push(result);
        matrix.markValidated(project, result.benchmarkScore);
      } catch (error) {
        results.push({
          project,
          compileSuccess: false,
          testSuccess: false,
          repairSuccess: false,
          benchmarkScore: 0,
          releaseStatus: "BLOCKED",
          executionDurationMs: Date.now() - startedAt,
          artifactsGenerated: [],
        });
        matrix.markFailed(project);
        context.metadata = {
          ...context.metadata,
          validationError: error instanceof Error ? error.message : String(error),
        } as typeof context.metadata & { validationError?: string };
      }
    }

    const reportPath = path.join(context.projectRoot, "knowledge", "production-report.json");
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2), "utf8");

    const productionScorePath = path.join(context.projectRoot, "knowledge", "production-score.json");
    await fs.writeFile(productionScorePath, JSON.stringify({ projects: results.length, averageScore: results.reduce((sum, item) => sum + item.benchmarkScore, 0) / Math.max(1, results.length) }, null, 2), "utf8");

    const historyPath = path.join(context.projectRoot, "knowledge", "validation-history.json");
    await fs.writeFile(historyPath, JSON.stringify(results, null, 2), "utf8");

    const reportPayload = ValidationReport.fromPayload({
      compileSuccess: results.every((item) => item.compileSuccess),
      testSuccess: results.every((item) => item.testSuccess),
      repairSuccess: results.every((item) => item.repairSuccess),
      benchmarkScore: results.reduce((sum, item) => sum + item.benchmarkScore, 0) / Math.max(1, results.length),
      releaseStatus: results.every((item) => item.releaseStatus === "READY") ? "READY" : "NEEDS REPAIR",
      executionDurationMs: results.reduce((sum, item) => sum + item.executionDurationMs, 0),
      artifactsGenerated: results.flatMap((item) => item.artifactsGenerated),
    });

    context.metadata = {
      ...context.metadata,
      productionValidation: results,
      projectMatrix: matrix.getEntries(),
      validationReport: reportPayload,
    } as typeof context.metadata & { productionValidation?: ProductionValidationResult[]; projectMatrix?: unknown; validationReport?: unknown };

    return results;
  }

  private async collectArtifacts(root: string): Promise<string[]> {
    const collected: string[] = [];
    const walk = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          collected.push(path.relative(root, fullPath));
        }
      }
    };
    await walk(root);
    return collected.filter((entry) => entry !== "" && !entry.startsWith("node_modules") && !entry.startsWith(".git"));
  }
}
