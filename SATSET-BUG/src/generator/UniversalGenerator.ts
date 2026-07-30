import os from "node:os";
import path from "node:path";
import { parseRequirement } from "../ai/RequirementParser.js";
import { GeneratorRouter } from "./GeneratorRouter.js";

export type GenerationMode = "application" | "book" | "landing" | "website" | "api" | "documentation";

export interface UniversalGenerateInput {
  requirement: string;
  outputDir?: string;
}

export interface UniversalGenerateResult {
  mode: GenerationMode;
  success: boolean;
  written: string[];
  errors: string[];
  outputDir: string;
  summary: string;
}

function toMode(projectType: string): GenerationMode {
  if (projectType === "book") return "book";
  if (projectType === "landing") return "landing";
  if (projectType === "website") return "website";
  if (projectType === "api") return "api";
  if (projectType === "documentation" || projectType === "cms") return "documentation";
  return "application";
}

export class UniversalGenerator {
  private readonly router = new GeneratorRouter();

  async generate(input: UniversalGenerateInput): Promise<UniversalGenerateResult> {
    const { requirement } = input;
    const outputDir = input.outputDir ?? path.join(os.tmpdir(), `satset-${Date.now()}`);
    const parsed = parseRequirement(requirement);

    const result = await this.router.generate({
      requirement,
      projectType: parsed.projectType,
      modules: parsed.modules,
      outputDir,
    });

    return {
      mode: toMode(parsed.projectType),
      success: result.success,
      written: result.written,
      errors: result.errors,
      outputDir,
      summary: result.summary,
    };
  }
}

