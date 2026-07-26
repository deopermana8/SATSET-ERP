import fs from "node:fs/promises";
import path from "node:path";
import type { Context } from "../../core/Context.js";
import type { IEngine } from "../../core/IEngine.js";
import { ArtifactPipeline } from "../../artifacts/ArtifactPipeline.js";

export interface DashboardStatus {
  status: string;
  progress: number;
  currentStage: string;
  certificatePath: string;
}

export class DashboardEngine implements IEngine {
  public readonly name = "DashboardEngine";

  async run(context: Context): Promise<void> {
    const status: DashboardStatus = {
      status: "ready",
      progress: 100,
      currentStage: "certified",
      certificatePath: path.join(context.projectRoot, "project-certificate.json"),
    };

    const pipeline = new ArtifactPipeline(context.projectRoot);
    await pipeline.run(context, [{
      id: "dashboard-status",
      name: "dashboard-status",
      templatePath: path.join(context.projectRoot, "templates", "dashboard.json.tpl"),
      outputPath: path.join(context.projectRoot, "dashboard.json"),
      variables: {
        status: status.status,
        progress: String(status.progress),
        currentStage: status.currentStage,
        certificatePath: status.certificatePath,
      },
    }]);

    context.metadata = {
      ...context.metadata,
      dashboard: status,
    } as typeof context.metadata & { dashboard?: DashboardStatus };
  }
}
