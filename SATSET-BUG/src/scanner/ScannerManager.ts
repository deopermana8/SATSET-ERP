import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

export class ScannerManager {
  private readonly scanners: IScanner[] = [];

  register(scanner: IScanner): void {
    this.scanners.push(scanner);
  }

  getScanners(): IScanner[] {
    return [...this.scanners];
  }

  async scanAll(context: Context): Promise<void> {
    for (const scanner of this.scanners) {
      await Promise.resolve(scanner.scan(context));
    }
  }
}
