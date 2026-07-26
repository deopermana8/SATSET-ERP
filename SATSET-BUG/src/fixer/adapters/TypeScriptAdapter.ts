import { promises as fs } from "node:fs";
import path from "node:path";

export interface PatchOperation {
  file: string;
  action: "read" | "validate" | "patch" | "backup" | "restore";
  payload?: Record<string, unknown>;
  description: string;
}

export class TypeScriptAdapter {
  public async readTsConfig(filePath: string): Promise<PatchOperation[]> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      JSON.parse(content);
      return [
        {
          file: filePath,
          action: "read",
          payload: { content },
          description: `Read tsconfig from ${path.basename(filePath)}`,
        },
      ];
    } catch {
      return [
        {
          file: filePath,
          action: "validate",
          description: `Validation failed for ${path.basename(filePath)}`,
        },
      ];
    }
  }

  public async validate(filePath: string): Promise<PatchOperation[]> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      JSON.parse(content);
      return [
        {
          file: filePath,
          action: "validate",
          description: `Validated ${path.basename(filePath)} successfully`,
        },
      ];
    } catch {
      return [
        {
          file: filePath,
          action: "validate",
          description: `Validation failed for ${path.basename(filePath)}`,
        },
      ];
    }
  }

  public async patchCompilerOptions(filePath: string, options: Record<string, unknown>): Promise<PatchOperation[]> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      const current = JSON.parse(content) as Record<string, unknown>;
      const compilerOptions = current.compilerOptions && typeof current.compilerOptions === "object"
        ? (current.compilerOptions as Record<string, unknown>)
        : {};

      const patchPayload = {
        ...current,
        compilerOptions: {
          ...compilerOptions,
          ...options,
        },
      };

      return [
        {
          file: filePath,
          action: "patch",
          payload: patchPayload,
          description: `Patch compilerOptions with ${Object.keys(options).join(", ")}`,
        },
      ];
    } catch {
      return [
        {
          file: filePath,
          action: "patch",
          description: `Unable to patch ${path.basename(filePath)} because the file is invalid JSON`,
        },
      ];
    }
  }

  public async backup(filePath: string): Promise<PatchOperation[]> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return [
        {
          file: filePath,
          action: "backup",
          payload: { backup: content },
          description: `Create backup for ${path.basename(filePath)}`,
        },
      ];
    } catch {
      return [
        {
          file: filePath,
          action: "backup",
          description: `Unable to backup ${path.basename(filePath)}`,
        },
      ];
    }
  }

  public async restore(filePath: string, backupContent: string): Promise<PatchOperation[]> {
    return [
      {
        file: filePath,
        action: "restore",
        payload: { backup: backupContent },
        description: `Restore ${path.basename(filePath)} from backup`,
      },
    ];
  }
}
