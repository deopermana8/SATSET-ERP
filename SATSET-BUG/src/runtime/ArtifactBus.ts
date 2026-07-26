import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../core/Context.js";
import { ArtifactPipeline } from "../artifacts/ArtifactPipeline.js";
import type { ArtifactSpec } from "../artifacts/ArtifactGenerator.js";

export interface ArtifactMessage {
  id: string;
  engine: string;
  kind: string;
  payload: Record<string, unknown> | unknown;
  outputPath: string;
  timestamp: string;
}

export class ArtifactBus {
  private readonly messages: ArtifactMessage[] = [];

  publish(message: ArtifactMessage): void {
    this.messages.push(message);
  }

  drain(): ArtifactMessage[] {
    const current = [...this.messages];
    this.messages.length = 0;
    return current;
  }

  async flush(context: Context): Promise<void> {
    const messages = this.drain();
    const specs: ArtifactSpec[] = messages.map((message) => ({
      id: message.id,
      name: message.kind,
      templatePath: path.join(context.projectRoot, "templates", "repair-plan.md.tpl"),
      outputPath: message.outputPath,
      variables: { strategy: message.kind, priority: "high", category: message.engine },
    }));
    if (specs.length === 0) {
      return;
    }
    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, specs);
  }
}
