import type { IPlugin } from "../../src/plugins/IPlugin.js";
import { TypeScriptScanner } from "../../src/scanner/TypeScriptScanner.js";
import { TypeScriptAdapter } from "../../src/fixer/adapters/TypeScriptAdapter.js";
import { TypeScriptFixer } from "../../src/fixer/typescript/TypeScriptFixer.js";

export interface TypeScriptPluginBindings {
  registerScanner?: (scanner: TypeScriptScanner) => void;
  registerAdapter?: (adapter: TypeScriptAdapter) => void;
  registerFixer?: (fixer: TypeScriptFixer) => void;
  registerFixes?: (fixer: TypeScriptFixer) => void;
}

export class TypeScriptPlugin implements IPlugin {
  public readonly id = "typescript";
  public readonly name = "TypeScript Plugin";

  constructor(private readonly bindings: TypeScriptPluginBindings = {}) {}

  register(): void {
    const scanner = new TypeScriptScanner();
    const adapter = new TypeScriptAdapter();
    const fixer = new TypeScriptFixer();

    this.bindings.registerScanner?.(scanner);
    this.bindings.registerAdapter?.(adapter);
    this.bindings.registerFixer?.(fixer);

    this.bindings.registerFixes?.(fixer);
  }
}

export default TypeScriptPlugin;
