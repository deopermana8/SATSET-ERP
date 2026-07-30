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
import type { IScanner } from "./IScanner.js";
import { PluginManager } from "../plugins/PluginManager.js";
import type { IPlugin } from "../plugins/IPlugin.js";

class ScannerPlugin implements IPlugin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private readonly registerScanner: () => void
  ) {}

  register(): void {
    this.registerScanner();
  }
}

export class ScannerRegistry {
  registerDefaults(manager: ScannerManager): void {
    const pluginManager = new PluginManager();
    const register = (scanner: IScanner): void => {
      manager.register(scanner);
    };

    pluginManager.register(
      new ScannerPlugin("packagejson-scanner", "PackageJson Scanner", () => {
        register(new PackageJsonScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("prisma-scanner", "Prisma Scanner", () => {
        register(new PrismaScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("typescript-scanner", "TypeScript Scanner", () => {
        register(new TypeScriptScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("next-scanner", "Next Scanner", () => {
        register(new NextJsScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("pnpm-workspace-scanner", "PNPM Workspace Scanner", () => {
        register(new PnpmWorkspaceScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("turbo-scanner", "Turbo Scanner", () => {
        register(new TurboScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("tailwind-scanner", "Tailwind Scanner", () => {
        register(new TailwindScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("react-scanner", "React Scanner", () => {
        register(new ReactScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("environment-scanner", "Environment Scanner", () => {
        register(new EnvironmentScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("git-scanner", "Git Scanner", () => {
        register(new GitScanner());
      })
    );

    pluginManager.register(
      new ScannerPlugin("dependency-graph-scanner", "Dependency Graph Scanner", () => {
        register(new DependencyGraphScanner());
      })
    );

    pluginManager.registerAll();
  }
}
