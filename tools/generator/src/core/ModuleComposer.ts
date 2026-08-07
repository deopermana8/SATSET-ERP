import { CommandTarget, GeneratorPlugin } from "../sdk/contracts.js";

export interface IModuleComposer {
  compose(target: Exclude<CommandTarget, "plugin" | "blueprint">, availablePlugins: readonly GeneratorPlugin[]): string[];
}

export class ModuleComposer implements IModuleComposer {
  private readonly commandMap: Record<Exclude<CommandTarget, "plugin" | "blueprint">, string[]> = {
    module: [],
    entity: [
      "CrudPlugin",
      "PrismaPlugin",
      "MigrationPlugin",
      "SeedPlugin",
      "RepositoryPlugin",
      "ServicePlugin",
      "ApiPlugin",
      "ActionPlugin",
      "FormPlugin",
      "TablePlugin",
      "DocumentationPlugin",
      "AutoFixPlugin"
    ],
    dashboard: [
      "DashboardPlugin",
      "ChartPlugin",
      "MenuPlugin",
      "SidebarPlugin",
      "PermissionPlugin",
      "RolePlugin",
      "ReportPlugin",
      "DocumentationPlugin",
      "AutoFixPlugin"
    ],
    report: [
      "ReportPlugin",
      "ChartPlugin",
      "DocumentationPlugin",
      "AutoFixPlugin"
    ],
    mobile: [
      "MobilePlugin",
      "DocumentationPlugin",
      "AutoFixPlugin"
    ],
    scanner: [
      "ScannerPlugin",
      "DocumentationPlugin",
      "AutoFixPlugin"
    ],
    workspace: [
      "WorkspacePlugin"
    ]
  };

  compose(target: Exclude<CommandTarget, "plugin" | "blueprint">, availablePlugins: readonly GeneratorPlugin[]): string[] {
    if (target === "module") {
      return availablePlugins.map((plugin) => plugin.manifest.name);
    }

    return this.commandMap[target].filter((pluginName) => availablePlugins.some((plugin) => plugin.manifest.name === pluginName));
  }
}
