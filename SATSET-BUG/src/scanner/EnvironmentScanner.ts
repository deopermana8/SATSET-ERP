import { promises as fs } from "fs";
import path from "path";
import type { Context } from "../core/Context.js";
import type { IScanner } from "./IScanner.js";

interface EnvironmentMetadata {
  exists: boolean;
  files: string[];
  variables: Record<string, string>;
  duplicateVariables: string[];
  missingVariables: string[];
  hasDatabaseUrl: boolean;
  hasNextAuthSecret: boolean;
  hasNextPublicVariables: boolean;
  hasOpenAIKey: boolean;
  hasGeminiKey: boolean;
  hasAnthropicKey: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseKey: boolean;
}

export class EnvironmentScanner implements IScanner {
  public readonly name = "EnvironmentScanner";

  public scan(context: Context): void {
    void this.scanAsync(context);
  }

  private async scanAsync(context: Context): Promise<void> {
    const root = context.projectRoot;
    const envFiles = [
      ".env",
      ".env.local",
      ".env.development",
      ".env.production",
      ".env.example",
    ];

    const metadata: EnvironmentMetadata = {
      exists: false,
      files: [],
      variables: {},
      duplicateVariables: [],
      missingVariables: [],
      hasDatabaseUrl: false,
      hasNextAuthSecret: false,
      hasNextPublicVariables: false,
      hasOpenAIKey: false,
      hasGeminiKey: false,
      hasAnthropicKey: false,
      hasSupabaseUrl: false,
      hasSupabaseKey: false,
    };

    const encountered: Record<string, number> = {};
    const variables: Record<string, string> = {};

    for (const fileName of envFiles) {
      const absolutePath = path.join(root, fileName);
      if (!(await this.fileExists(absolutePath))) {
        continue;
      }

      metadata.exists = true;
      metadata.files.push(fileName);

      try {
        const content = await fs.readFile(absolutePath, "utf-8");
        const parsed = this.parseEnv(content);

        for (const [key, value] of Object.entries(parsed)) {
          if (encountered[key] === undefined) {
            encountered[key] = 0;
          }

          encountered[key] += 1;
          variables[key] = value;
        }
      } catch {
        continue;
      }
    }

    metadata.variables = variables;
    metadata.duplicateVariables = Object.entries(encountered)
      .filter(([, count]) => count > 1)
      .map(([key]) => key);

    metadata.hasDatabaseUrl = this.hasKey(variables, "DATABASE_URL");
    metadata.hasNextAuthSecret = this.hasKey(variables, "NEXTAUTH_SECRET");
    metadata.hasNextPublicVariables = Object.keys(variables).some((key) => key.startsWith("NEXT_PUBLIC_"));
    metadata.hasOpenAIKey = this.hasKey(variables, "OPENAI_API_KEY") || this.hasKey(variables, "OPENAI_KEY");
    metadata.hasGeminiKey = this.hasKey(variables, "GEMINI_API_KEY") || this.hasKey(variables, "GEMINI_KEY");
    metadata.hasAnthropicKey = this.hasKey(variables, "ANTHROPIC_API_KEY") || this.hasKey(variables, "ANTHROPIC_KEY");
    metadata.hasSupabaseUrl = this.hasKey(variables, "SUPABASE_URL");
    metadata.hasSupabaseKey = this.hasKey(variables, "SUPABASE_KEY");

    metadata.missingVariables = this.detectMissingVariables(metadata);

    (context.metadata as Record<string, unknown>)["environment"] = metadata;
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private parseEnv(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const equalsIndex = trimmed.indexOf("=");
      if (equalsIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      let value = trimmed.slice(equalsIndex + 1).trim();

      if (value.startsWith("\"") && value.endsWith("\"")) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }

      result[key] = value;
    }
    return result;
  }

  private hasKey(variables: Record<string, string>, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(variables, key);
  }

  private detectMissingVariables(metadata: EnvironmentMetadata): string[] {
    const requiredKeys = [
      "DATABASE_URL",
      "NEXTAUTH_SECRET",
      "OPENAI_API_KEY",
      "OPENAI_KEY",
      "GEMINI_API_KEY",
      "GEMINI_KEY",
      "ANTHROPIC_API_KEY",
      "ANTHROPIC_KEY",
      "SUPABASE_URL",
      "SUPABASE_KEY",
    ];

    const existing = new Set(Object.keys(metadata.variables));
    return requiredKeys.filter((key) => !existing.has(key));
  }
}
