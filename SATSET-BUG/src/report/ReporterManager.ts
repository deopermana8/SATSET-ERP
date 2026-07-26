import type { Context } from "../core/Context.js";
import type { IReporter } from "./IReporter.js";

export class ReporterManager {
  private readonly reporters: IReporter[] = [];

  register(reporter: IReporter): void {
    this.reporters.push(reporter);
  }

  getReporters(): IReporter[] {
    return [...this.reporters];
  }

  reportAll(context: Context): void {
    for (const reporter of this.reporters) {
      reporter.report(context);
    }
  }
}
