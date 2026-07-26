import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface ArchitectureOutput {
  folderStructure: string[];
  projectStructure: string[];
  namingConvention: string[];
  moduleBoundaries: string[];
  dependencyGraph: string[];
  validation: string[];
}

export class ArchitectureEngine implements IEngine {
  public readonly name = "ArchitectureEngine";

  async run(context: Context): Promise<void> {
    const architecture: ArchitectureOutput = {
      folderStructure: ["src/core", "src/doctor", "src/planner", "src/autofix", "tests"],
      projectStructure: ["Engine-based pipeline", "Context-driven state", "Deterministic repair"],
      namingConvention: ["PascalCase for engines", "camelCase for helpers", "kebab-case for folders"],
      moduleBoundaries: ["Scanner owns discovery", "Analyzer owns rules", "Repair owns file mutations"],
      dependencyGraph: ["Scanner -> Analyzer -> Diagnostic -> Root Cause -> Repair -> Verification"],
      validation: ["Compile step", "Test step", "History step"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    const architectureTemplate = path.join(context.projectRoot, "templates", "architecture.md.tpl");
    const architectureOutput = path.join(context.projectRoot, "docs", "architecture.md");

    await pipeline.run(context, [{
      id: "architecture-doc",
      name: "architecture-doc",
      templatePath: architectureTemplate,
      outputPath: architectureOutput,
      variables: {
        projectStructure: architecture.projectStructure.map((item) => `- ${item}`).join("\n"),
        moduleBoundaries: architecture.moduleBoundaries.map((item) => `- ${item}`).join("\n"),
        dependencyGraph: architecture.dependencyGraph.map((item) => `- ${item}`).join("\n"),
      },
    }]);

    context.metadata = {
      ...context.metadata,
      architecture,
    } as typeof context.metadata & { architecture?: ArchitectureOutput };
  }
}
