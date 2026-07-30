import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import { ReporterManager } from "./ReporterManager.js";

export class ReporterEngine implements IEngine {
  public readonly name = "ReporterEngine";
  private readonly manager: ReporterManager;

  constructor(manager?: ReporterManager) {
    this.manager = manager ?? new ReporterManager();
  }

  register(reporter: import("./IReporter.js").IReporter): void {
    this.manager.register(reporter);
  }

  async run(context: Context): Promise<void> {
    this.manager.reportAll(context);
  }
}

/** @alias ReporterEngine — canonical contract alias used in architecture docs */
export { ReporterEngine as ReportEngine };
