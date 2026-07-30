import type { IGenerator, GenerationContext, GenerationResult, GeneratorCapability } from "../IGenerator.js";
import { runFullPipeline } from "../FullPipeline.js";

export class ApplicationGenerator implements IGenerator {
  static readonly id = "application";
  static readonly generatorName = "Application Generator";
  static readonly staticCapabilities: GeneratorCapability[] = ["app", "mobile", "desktop"];
  static supports(type: string): boolean {
    return !["book", "landing", "website", "documentation", "api", "library", "cli", "plugin"].includes(type);
  }
  readonly capabilities: GeneratorCapability[] = ApplicationGenerator.staticCapabilities;
  supports(type: string): boolean { return ApplicationGenerator.supports(type); }
  register(registry: { add(g: IGenerator): void }): void { registry.add(this); }
  async generate(ctx: GenerationContext): Promise<GenerationResult> {
    const report = await runFullPipeline(ctx.requirement, ctx.outputDir);
    return { success: report.success, written: report.written, errors: report.errors, summary: `Generated ${report.projectType} application with modules: ${report.modules.join(", ")}` };
  }
}

export default new ApplicationGenerator();
