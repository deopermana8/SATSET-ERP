export interface NextPatchPlan {
  file: string;
  action: "read" | "patch" | "backup" | "restore";
  payload?: Record<string, unknown>;
  description: string;
}

export class NextAdapter {
  public generatePatchPlan(): NextPatchPlan[] {
    return [
      {
        file: "next.config.js",
        action: "read",
        description: "Read the current Next.js configuration file.",
      },
      {
        file: "next.config.js",
        action: "patch",
        payload: {
          reactStrictMode: true,
          experimental: {
            appOnly: true,
          },
        },
        description: "Patch Next.js config for strict mode and experimental settings.",
      },
      {
        file: "next.config.js",
        action: "backup",
        description: "Create a backup copy of the existing Next.js config before patching.",
      },
      {
        file: "next.config.js",
        action: "restore",
        description: "Restore the previous Next.js config if the patch fails.",
      },
    ];
  }
}
