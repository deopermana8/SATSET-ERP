import type { Context } from "../core/Context.js";
import { ArtifactGenerator, type ArtifactSpec } from "./ArtifactGenerator.js";
import { TaskQueue } from "./TaskQueue.js";

export class ArtifactPipeline {
  constructor(private readonly workspaceRoot: string) {}

  async run(context: Context, specs: ArtifactSpec[]): Promise<void> {
    const generator = new ArtifactGenerator(this.workspaceRoot);
    const queue = new TaskQueue<ArtifactSpec>();
    const shouldSkipWrites = context.repairOptions?.dryRun === true;

    for (const spec of specs) {
      queue.enqueue(spec.id, spec);
    }

    await queue.run(async (spec) => {
      if (shouldSkipWrites) {
        const metadata = context.metadata as typeof context.metadata & { artifacts?: ArtifactSpec[] };
        metadata.artifacts = [...(metadata.artifacts ?? []), spec];
        return;
      }

      await generator.generate(spec, context);
      const metadata = context.metadata as typeof context.metadata & { artifacts?: ArtifactSpec[] };
      metadata.artifacts = [...(metadata.artifacts ?? []), spec];
    });

    context.metadata = {
      ...context.metadata,
      artifacts: specs,
      taskQueue: {
        progress: queue.getProgress(),
        logs: queue.getLogs(),
      },
    } as typeof context.metadata & { artifacts?: ArtifactSpec[]; taskQueue?: unknown };
  }
}
