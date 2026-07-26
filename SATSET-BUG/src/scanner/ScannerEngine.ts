import type { Context } from "../core/Context.js";
import type { IEngine } from "../core/IEngine.js";
import type { IScanner } from "./IScanner.js";
import { ScannerManager } from "./ScannerManager.js";

export class ScannerEngine implements IEngine {
  public readonly name = "ScannerEngine";
  private readonly manager: ScannerManager;

  constructor(manager?: ScannerManager) {
    this.manager = manager ?? new ScannerManager();
  }

  register(scanner: IScanner): void {
    this.manager.register(scanner);
  }

  async run(context: Context): Promise<void> {
    await this.manager.scanAll(context);
  }
}
