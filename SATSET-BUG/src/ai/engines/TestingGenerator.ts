import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface TestingOutput {
  unit: string[];
  integration: string[];
  regression: string[];
  reliability: string[];
  performance: string[];
}

interface ReasoningMetadata {
  useCases?: string[];
}

export class TestingGenerator implements IEngine {
  public readonly name = "TestingGenerator";

  async run(context: Context): Promise<void> {
    const reasoning = this.getReasoning(context);
    const useCase = reasoning?.useCases?.[0] ?? "primary workflow";
    const testName = this.toTestName(useCase);

    const testing: TestingOutput = {
      unit: ["Core unit tests"],
      integration: ["API integration tests"],
      regression: ["Regression fixtures"],
      reliability: ["Deterministic reliability checks"],
      performance: ["Smoke performance checks"],
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "blueprint-test",
      name: "blueprint-test",
      templatePath: path.join(context.projectRoot, "templates", "blueprint.test.ts.tpl"),
      outputPath: path.join(context.projectRoot, "tests", `${testName}.test.ts`),
      variables: {
        TestName: testName,
        UseCase: useCase,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      testing,
    } as typeof context.metadata & { testing?: TestingOutput };
  }

  private getReasoning(context: Context): ReasoningMetadata | null {
    const metadata = context.metadata as Record<string, unknown> | undefined;
    const reasoning = metadata?.reasoning;
    if (reasoning && typeof reasoning === "object") {
      return reasoning as ReasoningMetadata;
    }
    return null;
  }

  private toTestName(useCase: string): string {
    return useCase
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join("");
  }
}
