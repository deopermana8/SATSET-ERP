import fs from "node:fs/promises";
import path from "node:path";
import { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { Doctor } from "../doctor/Doctor.js";

export interface BenchmarkProjectSpec {
  name: string;
  root: string;
  expectedArtifacts: string[];
  expectedApi: string[];
  expectedDatabase: string[];
  expectedUi: string[];
  expectedTests: string[];
}

export interface BenchmarkResult {
  project: string;
  score: number;
  summary: Record<string, number | string>;
  artifacts: string[];
}

export class BenchmarkEngine implements IEngine {
  public readonly name = "BenchmarkEngine";

  async run(context: Context): Promise<void> {
    const benchmarkRoot = path.join(context.projectRoot, "benchmarks");
    const resolvedBenchmarkRoot = await this.resolveBenchmarkRoot(context.projectRoot);
    let entries;
    try {
      entries = await fs.readdir(resolvedBenchmarkRoot, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === "ENOENT") {
        await fs.mkdir(path.join(context.projectRoot, "knowledge"), { recursive: true });
        await fs.writeFile(path.join(context.projectRoot, "knowledge", "benchmark-result.json"), JSON.stringify([], null, 2), "utf8");
        context.metadata = {
          ...context.metadata,
          benchmarkResult: [],
        } as typeof context.metadata & { benchmarkResult?: BenchmarkResult[] };
        return;
      }
      throw error;
    }
    const projects = [] as string[];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const isBenchmark = await this.isBenchmarkProject(entry.name, resolvedBenchmarkRoot);
        if (isBenchmark) {
          projects.push(entry.name);
        }
      }
    }
    const results: BenchmarkResult[] = [];

    for (const project of projects) {
      const projectRoot = path.join(resolvedBenchmarkRoot, project);
      const spec = await this.loadSpec(projectRoot);
      const projectContext = new Context({
        projectRoot: projectRoot,
        projectName: spec.name,
        nodeVersion: context.nodeVersion,
        pnpmVersion: context.pnpmVersion,
        typescriptVersion: context.typescriptVersion,
        prismaVersion: context.prismaVersion,
        nextVersion: context.nextVersion,
        issues: [],
        recommendations: [],
        metadata: { root: projectRoot },
      });

      const doctor = new Doctor({
        projectRoot: projectRoot,
        projectName: spec.name,
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

      const artifacts = await this.collectArtifacts(projectRoot);
      const score = this.scoreArtifacts(spec, artifacts);
      results.push({ project: spec.name, score, summary: { artifactsFound: artifacts.length }, artifacts });
    }

    await this.writeBenchmarkArtifacts(context, results);

    context.metadata = {
      ...context.metadata,
      benchmarkResult: results,
    } as typeof context.metadata & { benchmarkResult?: BenchmarkResult[] };
  }

  private async writeBenchmarkArtifacts(context: Context, results: BenchmarkResult[]): Promise<void> {
    const knowledgeDir = path.join(context.projectRoot, "knowledge");
    await fs.mkdir(knowledgeDir, { recursive: true });

    const baseMetadata = this.buildBenchmarkMetadata(context, results);
    const resultPayload = results.map((result) => ({
      ...result,
      ...baseMetadata,
      projectId: result.project,
      projectName: result.project,
      benchmarkScore: result.score,
      qualityScore: baseMetadata.qualityScore,
      validationScore: baseMetadata.validationScore,
      knowledgeVersion: baseMetadata.knowledgeVersion,
    }));

    const summaryPayload = {
      ...baseMetadata,
      totalProjects: resultPayload.length,
      averageBenchmarkScore: resultPayload.length ? resultPayload.reduce((sum, item) => sum + Number((item as { benchmarkScore?: number }).benchmarkScore ?? 0), 0) / resultPayload.length : 0,
      averageQualityScore: baseMetadata.qualityScore,
      averageValidationScore: baseMetadata.validationScore,
      projects: resultPayload,
    };

    const historyPayload = this.loadHistory(knowledgeDir, resultPayload);

    await fs.writeFile(path.join(knowledgeDir, "benchmark-result.json"), JSON.stringify(resultPayload, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgeDir, "benchmark-history.json"), JSON.stringify(historyPayload, null, 2), "utf8");
    await fs.writeFile(path.join(knowledgeDir, "benchmark-summary.json"), JSON.stringify(summaryPayload, null, 2), "utf8");

    context.metadata = {
      ...context.metadata,
      benchmarkResult: resultPayload,
      benchmarkHistory: historyPayload,
      benchmarkSummary: summaryPayload,
      benchmarkScore: summaryPayload.averageBenchmarkScore,
      qualityScore: baseMetadata.qualityScore,
      validationScore: baseMetadata.validationScore,
      knowledgeVersion: baseMetadata.knowledgeVersion,
    } as typeof context.metadata & { benchmarkResult?: BenchmarkResult[]; benchmarkHistory?: unknown; benchmarkSummary?: unknown; benchmarkScore?: number; qualityScore?: number; validationScore?: number; knowledgeVersion?: string };
  }

  private buildBenchmarkMetadata(context: Context, results: BenchmarkResult[]): Record<string, unknown> {
    const metadata = context.metadata as Record<string, unknown>;
    const qualityScore = typeof metadata.qualityScore === "object" && metadata.qualityScore && "overallScore" in metadata.qualityScore
      ? Number((metadata.qualityScore as { overallScore?: number }).overallScore ?? 0)
      : Number((metadata.qualityScore as number | undefined) ?? 0);
    const validationScore = typeof metadata.validationReport === "object" && metadata.validationReport && "benchmarkScore" in metadata.validationReport
      ? Number((metadata.validationReport as { benchmarkScore?: number }).benchmarkScore ?? 0)
      : Number((metadata.validationScore as number | undefined) ?? 0);
    const knowledgeVersion = String((metadata.knowledgeVersion as string | undefined) ?? "1.0.0");

    return {
      projectId: String((metadata.projectId as string | undefined) ?? context.projectName),
      projectName: context.projectName,
      runtimeId: String((metadata.runtimeId as string | undefined) ?? "satset-doctor"),
      timestamp: new Date().toISOString(),
      benchmarkScore: results.length ? results.reduce((sum, item) => sum + (item.score ?? 0), 0) / results.length : 0,
      qualityScore,
      validationScore,
      knowledgeVersion,
    };
  }

  private async loadHistory(knowledgeDir: string, resultPayload: Array<Record<string, unknown>>): Promise<Array<Record<string, unknown>>> {
    const historyPath = path.join(knowledgeDir, "benchmark-history.json");
    try {
      const existing = await fs.readFile(historyPath, "utf8");
      const parsed = JSON.parse(existing) as Array<Record<string, unknown>>;
      return [...parsed, ...resultPayload];
    } catch {
      return [...resultPayload];
    }
  }

  private async resolveBenchmarkRoot(projectRoot: string): Promise<string> {
    const candidate = path.join(projectRoot, "benchmarks");
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      return projectRoot;
    }
  }

  private async isBenchmarkProject(name: string, root: string): Promise<boolean> {
    const projectRoot = path.join(root, name);
    try {
      await fs.access(path.join(projectRoot, "expected-artifacts.json"));
      return true;
    } catch {
      return false;
    }
  }

  private async loadSpec(projectRoot: string): Promise<BenchmarkProjectSpec> {
    const expectedArtifacts = JSON.parse(await fs.readFile(path.join(projectRoot, "expected-artifacts.json"), "utf8")) as string[];
    const expectedApi = JSON.parse(await fs.readFile(path.join(projectRoot, "expected-api.json"), "utf8")) as string[];
    const expectedDatabase = JSON.parse(await fs.readFile(path.join(projectRoot, "expected-database.json"), "utf8")) as string[];
    const expectedUi = JSON.parse(await fs.readFile(path.join(projectRoot, "expected-ui.json"), "utf8")) as string[];
    const expectedTests = JSON.parse(await fs.readFile(path.join(projectRoot, "expected-tests.json"), "utf8")) as string[];

    return {
      name: path.basename(projectRoot),
      root: projectRoot,
      expectedArtifacts,
      expectedApi,
      expectedDatabase,
      expectedUi,
      expectedTests,
    };
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

  private scoreArtifacts(spec: BenchmarkProjectSpec, artifacts: string[]): number {
    const expected = new Set([...spec.expectedArtifacts, ...spec.expectedApi, ...spec.expectedDatabase, ...spec.expectedUi, ...spec.expectedTests]);
    const matched = artifacts.filter((artifact) => expected.has(artifact));
    return Math.round((matched.length / Math.max(1, expected.size)) * 100);
  }
}
