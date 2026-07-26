import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Context } from "../core/Context.js";

export interface ArtifactSpec {
  id: string;
  name: string;
  templatePath: string;
  outputPath: string;
  variables: Record<string, string>;
}

export interface ArtifactGenerationResult {
  status: "written" | "skipped";
  outputPath: string;
  templatePath: string;
  backupPath?: string;
}

export class ArtifactGenerator {
  constructor(private readonly workspaceRoot: string) {}

  async generate(spec: ArtifactSpec, context?: Context): Promise<ArtifactGenerationResult> {
    const templateContent = await this.readTemplate(spec.templatePath);
    const renderedContent = this.renderTemplate(templateContent, spec.variables);
    const contentWithMetadata = this.embedMetadata(renderedContent, spec.outputPath, context);

    await fs.mkdir(path.dirname(spec.outputPath), { recursive: true });

    try {
      await fs.access(spec.outputPath);
      const existing = await fs.readFile(spec.outputPath, "utf8");
      if (existing === contentWithMetadata) {
        return { status: "skipped", outputPath: spec.outputPath, templatePath: spec.templatePath };
      }

      const backupPath = `${spec.outputPath}.bak`;
      await fs.copyFile(spec.outputPath, backupPath);
      await fs.writeFile(spec.outputPath, contentWithMetadata, "utf8");
      return { status: "written", outputPath: spec.outputPath, templatePath: spec.templatePath, backupPath };
    } catch {
      await fs.writeFile(spec.outputPath, contentWithMetadata, "utf8");
      return { status: "written", outputPath: spec.outputPath, templatePath: spec.templatePath };
    }
  }

  private async readTemplate(templatePath: string): Promise<string> {
    try {
      return await fs.readFile(templatePath, "utf8");
    } catch {
      const currentFile = fileURLToPath(import.meta.url);
      const bundledTemplatePath = path.resolve(path.dirname(currentFile), "../templates", path.basename(templatePath));
      return await fs.readFile(bundledTemplatePath, "utf8");
    }
  }

  private renderTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(.*?)\}\}/g, (_match, key: string) => {
      const trimmed = key.trim();
      return variables[trimmed] ?? "";
    });
  }

  private embedMetadata(content: string, outputPath: string, context?: Context): string {
    if (!context) {
      return content;
    }

    const metadata = this.buildArtifactMetadata(context);
    const extension = path.extname(outputPath).toLowerCase();

    if (extension === ".json") {
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return JSON.stringify({ metadata, entries: parsed }, null, 2);
        }
        return JSON.stringify({ ...parsed, metadata }, null, 2);
      } catch {
        // fall back to a metadata-prefixed text block
      }
    }

    if (extension === ".md" || extension === ".txt") {
      const block = ``;
      return `${block}\n\n${content}`;
    }

    return content;
  }

  private buildArtifactMetadata(context: Context): Record<string, unknown> {
    const metadata = context.metadata as Record<string, unknown>;
    const results = Array.isArray(metadata.benchmarkResult) ? (metadata.benchmarkResult as Array<{ score?: number }> | undefined) ?? [] : [];
    const benchmarkScore = results.length ? results.reduce((sum, item) => sum + (item.score ?? 0), 0) / results.length : Number((metadata.benchmarkScore as number | undefined) ?? 0);
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
      benchmarkScore,
      qualityScore,
      validationScore,
      knowledgeVersion,
    };
  }
}
