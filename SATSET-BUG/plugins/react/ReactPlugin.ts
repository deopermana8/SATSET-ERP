import type { IPlugin } from "../../src/plugins/IPlugin.js";
import { ReactScanner } from "../../src/scanner/ReactScanner.js";
import { ReactAdapter, type ReactPatchPlan } from "../../src/fixer/adapters/ReactAdapter.js";

export interface ReactPluginBindings {
  registerScanner?: (scanner: ReactScanner) => void;
  registerAdapter?: (adapter: ReactAdapter) => void;
  registerFixes?: (plans: ReactPatchPlan[]) => void;
}

export class ReactPlugin implements IPlugin {
  public readonly id = "react";
  public readonly name = "React Plugin";

  constructor(private readonly bindings: ReactPluginBindings = {}) {}

  register(): void {
    const scanner = new ReactScanner();
    const adapter = new ReactAdapter();
    const fixes = adapter.generatePatchPlan();

    this.bindings.registerScanner?.(scanner);
    this.bindings.registerAdapter?.(adapter);
    this.bindings.registerFixes?.(fixes);
  }
}

export default ReactPlugin;
