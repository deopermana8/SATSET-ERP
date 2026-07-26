import type { ScannerManager } from "./ScannerManager.js";
import { PackageJsonScanner } from "./PackageJsonScanner.js";
import { PrismaScanner } from "./PrismaScanner.js";
import { TypeScriptScanner } from "./TypeScriptScanner.js";
import { NextJsScanner } from "./NextJsScanner.js";
import { PnpmWorkspaceScanner } from "./PnpmWorkspaceScanner.js";
import { TurboScanner } from "./TurboScanner.js";
import { TailwindScanner } from "./TailwindScanner.js";
import { ReactScanner } from "./ReactScanner.js";
import { EnvironmentScanner } from "./EnvironmentScanner.js";
import { GitScanner } from "./GitScanner.js";
import { DependencyGraphScanner } from "./DependencyGraphScanner.js";

export class ScannerRegistry {
  registerDefaults(manager: ScannerManager): void {
    manager.register(new PackageJsonScanner());
    manager.register(new PrismaScanner());
    manager.register(new TypeScriptScanner());
    manager.register(new NextJsScanner());
    manager.register(new PnpmWorkspaceScanner());
    manager.register(new TurboScanner());
    manager.register(new TailwindScanner());
    manager.register(new ReactScanner());
    manager.register(new EnvironmentScanner());
    manager.register(new GitScanner());
    manager.register(new DependencyGraphScanner());
  }
}
