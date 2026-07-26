export interface PackageCommand {
  manager: "pnpm" | "npm" | "yarn" | "bun";
  action: "install" | "remove" | "update" | "run";
  command: string;
  description: string;
}

export class PackageManagerAdapter {
  public install(manager: "pnpm" | "npm" | "yarn" | "bun", packageName?: string): PackageCommand[] {
    return [this.createCommand(manager, "install", this.getInstallCommand(manager, packageName), "Install dependencies.")];
  }

  public remove(manager: "pnpm" | "npm" | "yarn" | "bun", packageName: string): PackageCommand[] {
    return [this.createCommand(manager, "remove", this.getRemoveCommand(manager, packageName), `Remove dependency ${packageName}.`)];
  }

  public update(manager: "pnpm" | "npm" | "yarn" | "bun", packageName?: string): PackageCommand[] {
    return [this.createCommand(manager, "update", this.getUpdateCommand(manager, packageName), "Update dependencies or a specific package.")];
  }

  public run(manager: "pnpm" | "npm" | "yarn" | "bun", script: string): PackageCommand[] {
    return [this.createCommand(manager, "run", this.getRunCommand(manager, script), `Run script ${script}.`)];
  }

  private createCommand(
    manager: "pnpm" | "npm" | "yarn" | "bun",
    action: PackageCommand["action"],
    command: string,
    description: string,
  ): PackageCommand {
    return { manager, action, command, description };
  }

  private getInstallCommand(manager: "pnpm" | "npm" | "yarn" | "bun", packageName?: string): string {
    if (packageName) {
      switch (manager) {
        case "pnpm":
          return `pnpm add ${packageName}`;
        case "npm":
          return `npm install ${packageName}`;
        case "yarn":
          return `yarn add ${packageName}`;
        case "bun":
          return `bun add ${packageName}`;
      }
    }

    switch (manager) {
      case "pnpm":
        return "pnpm install";
      case "npm":
        return "npm install";
      case "yarn":
        return "yarn install";
      case "bun":
        return "bun install";
    }
  }

  private getRemoveCommand(manager: "pnpm" | "npm" | "yarn" | "bun", packageName: string): string {
    switch (manager) {
      case "pnpm":
        return `pnpm remove ${packageName}`;
      case "npm":
        return `npm uninstall ${packageName}`;
      case "yarn":
        return `yarn remove ${packageName}`;
      case "bun":
        return `bun remove ${packageName}`;
    }
  }

  private getUpdateCommand(manager: "pnpm" | "npm" | "yarn" | "bun", packageName?: string): string {
    if (packageName) {
      switch (manager) {
        case "pnpm":
          return `pnpm update ${packageName}`;
        case "npm":
          return `npm update ${packageName}`;
        case "yarn":
          return `yarn upgrade ${packageName}`;
        case "bun":
          return `bun update ${packageName}`;
      }
    }

    switch (manager) {
      case "pnpm":
        return "pnpm update";
      case "npm":
        return "npm update";
      case "yarn":
        return "yarn upgrade";
      case "bun":
        return "bun update";
    }
  }

  private getRunCommand(manager: "pnpm" | "npm" | "yarn" | "bun", script: string): string {
    switch (manager) {
      case "pnpm":
        return `pnpm run ${script}`;
      case "npm":
        return `npm run ${script}`;
      case "yarn":
        return `yarn ${script}`;
      case "bun":
        return `bun run ${script}`;
    }
  }
}
