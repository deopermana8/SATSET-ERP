import type { IPlugin } from "../../src/plugins/IPlugin.js";
import { NextJsScanner } from "../../src/scanner/NextJsScanner.js";
import { NextAdapter, type NextPatchPlan } from "../../src/fixer/adapters/NextAdapter.js";

export interface NextPluginBindings {
  registerScanner?: (scanner: NextJsScanner) => void;
  registerAdapter?: (adapter: NextAdapter) => void;
  registerFixes?: (plans: NextPatchPlan[]) => void;
}

export class NextPlugin implements IPlugin {
  public readonly id = "next";
  public readonly name = "Next Plugin";

  constructor(private readonly bindings: NextPluginBindings = {}) {}

  register(): void {
    const scanner = new NextJsScanner();
    const adapter = new NextAdapter();
    const fixes = adapter.generatePatchPlan();

    this.bindings.registerScanner?.(scanner);
    this.bindings.registerAdapter?.(adapter);
    this.bindings.registerFixes?.(fixes);
  }
}

export default NextPlugin;
