import path from "node:path";
import type { Context } from "../../core/Context.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export async function emitReasoningArtifact(context: Context, outputFileName: string, templateName: string, variables: Record<string, string>): Promise<void> {
  const pipeline = new ArtifactPipeline(context.projectRoot);
  await pipeline.run(context, [{
    id: outputFileName,
    name: outputFileName,
    templatePath: path.join(context.projectRoot, "templates", templateName),
    outputPath: path.join(context.projectRoot, outputFileName),
    variables,
  }]);
}

export function getBrainIdea(context: Context): string {
  const metadataIdea = typeof context.metadata?.idea === "string" ? context.metadata.idea : undefined;
  return metadataIdea?.trim() || context.projectName;
}
