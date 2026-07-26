export interface TurboPatchPlan {
  file: string;
  action: "read" | "patch" | "backup" | "restore";
  payload?: Record<string, unknown>;
  description: string;
}

export class TurboAdapter {
  public generatePatchPlan(): TurboPatchPlan[] {
    return [
      {
        file: "turbo.json",
        action: "read",
        description: "Read the current turbo configuration.",
      },
      {
        file: "turbo.json",
        action: "patch",
        payload: {
          pipeline: {
            build: {
              dependsOn: ["^build"],
              outputs: ["dist/**", ".next/**"],
            },
          },
        },
        description: "Patch turbo.json to define a build pipeline and outputs.",
      },
      {
        file: "turbo.json",
        action: "backup",
        description: "Create a backup copy of turbo.json before patching.",
      },
      {
        file: "turbo.json",
        action: "restore",
        description: "Restore turbo.json if the patch fails.",
      },
    ];
  }
}
