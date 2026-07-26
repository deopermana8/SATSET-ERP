export interface PackageJsonPatchPlan {
  file: string;
  action: "read" | "patch" | "backup" | "restore";
  payload?: Record<string, unknown>;
  description: string;
}

export class PackageJsonAdapter {
  public generatePatchPlan(): PackageJsonPatchPlan[] {
    return [
      {
        file: "package.json",
        action: "read",
        description: "Read the current package.json manifest.",
      },
      {
        file: "package.json",
        action: "patch",
        payload: {
          scripts: {
            build: "pnpm turbo run build",
          },
        },
        description: "Patch package.json scripts for the current build setup.",
      },
      {
        file: "package.json",
        action: "backup",
        description: "Create a backup copy of package.json before patching.",
      },
      {
        file: "package.json",
        action: "restore",
        description: "Restore package.json if the patch fails.",
      },
    ];
  }
}
