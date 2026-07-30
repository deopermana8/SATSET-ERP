import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { IGenerator } from "./IGenerator.js";

function isIGenerator(value: unknown): value is IGenerator {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as IGenerator).supports === "function" &&
    typeof (value as IGenerator).generate === "function"
  );
}

function collectGenerators(exported: unknown): IGenerator[] {
  const found: IGenerator[] = [];
  if (isIGenerator(exported)) {
    found.push(exported);
  } else if (Array.isArray(exported)) {
    for (const item of exported) {
      if (isIGenerator(item)) found.push(item);
    }
  } else if (typeof exported === "object" && exported !== null) {
    for (const value of Object.values(exported as Record<string, unknown>)) {
      if (isIGenerator(value)) found.push(value);
    }
  }
  return found;
}

export class GeneratorRegistry {
  private generators: IGenerator[] = [];
  private initialized = false;

  /** Used by generators to self-register via their register() method. */
  add(generator: IGenerator): void {
    if (!this.generators.includes(generator)) {
      this.generators.push(generator);
    }
  }

  async init(generatorsDir: string): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    if (!fs.existsSync(generatorsDir)) return;

    const entries = fs.readdirSync(generatorsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".js")) continue;
      if (entry.name.endsWith(".d.ts")) continue;

      const filePath = path.join(generatorsDir, entry.name);
      try {
        const mod = await import(pathToFileURL(filePath).href) as Record<string, unknown>;
        const defaultExport = mod["default"];
        const found = collectGenerators(defaultExport);
        // Call register() if available, otherwise add directly
        for (const g of found) {
          if (typeof g.register === "function") {
            g.register(this);
          } else {
            this.add(g);
          }
        }
      } catch {
        // skip unloadable files
      }
    }
  }

  register(generator: IGenerator): void {
    this.add(generator);
  }

  getAll(): IGenerator[] {
    return this.generators;
  }

  find(projectType: string): IGenerator | undefined {
    return this.generators.find((g) => g.supports(projectType));
  }
}
