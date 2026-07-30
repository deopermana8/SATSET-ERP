import type { IPlugin } from "../../src/plugins/IPlugin.js";
import { PrismaScanner } from "../../src/scanner/PrismaScanner.js";
import { PrismaIntegrityRule } from "../../src/analyzer/rules/PrismaIntegrityRule.js";
import { PrismaAdapter } from "../../src/fixer/adapters/PrismaAdapter.js";
import { PrismaFixer } from "../../src/fixer/prisma/PrismaFixer.js";

export interface PrismaPluginBindings {
  registerScanner?: (scanner: PrismaScanner) => void;
  registerRule?: (rule: PrismaIntegrityRule) => void;
  registerAdapter?: (adapter: PrismaAdapter) => void;
  registerFixer?: (fixer: PrismaFixer) => void;
}

export class PrismaPlugin implements IPlugin {
  public readonly id = "prisma";
  public readonly name = "Prisma Plugin";

  constructor(private readonly bindings: PrismaPluginBindings = {}) {}

  register(): void {
    const scanner = new PrismaScanner();
    const rule = new PrismaIntegrityRule();
    const adapter = new PrismaAdapter();
    const fixer = new PrismaFixer();

    this.bindings.registerScanner?.(scanner);
    this.bindings.registerRule?.(rule);
    this.bindings.registerAdapter?.(adapter);
    this.bindings.registerFixer?.(fixer);
  }
}

export default PrismaPlugin;
