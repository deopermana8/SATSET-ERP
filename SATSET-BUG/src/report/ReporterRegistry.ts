import type { ReporterManager } from "./ReporterManager.js";
import { ConsoleReporter } from "./ConsoleReporter.js";

export class ReporterRegistry {
  registerDefaults(manager: ReporterManager): void {
    manager.register(new ConsoleReporter());
  }
}
