import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import type { IGenerator } from "./IGenerator.js";

interface GeneratorClass {
  new(): IGenerator;
  id?: string;
  generatorName?: string;
  supports?(type: string): boolean;
}

function isGeneratorClass(value: unknown): value is GeneratorClass {
  if (typeof value !== "function") return false;
  const proto = (value as GeneratorClass).prototype as unknown;
  return (
    typeof (proto as Record<string, unknown>)["supports"] === "function" &&
    typeof (proto as Record<string, unknown>)["generate"] === "function"
  );
}

function isGeneratorInstance(value: unknown): value is IGenerator {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as IGenerator).supports === "function" &&
    typeof (value as IGenerator).generate === "function"
  );
}

function collectGenerators(exported: unknown): IGenerator[] {
  const found: IGenerator[] = [];
  if (isGeneratorInstance(exported)) {
    found.push(exported);
  } else if (Array.isArray(exported)) {
    for (const item of exported) {
      if (isGeneratorInstance(item)) found.push(item);
    }
  } else if (typeof exported === "object" && exported !== null) {
    for (const value of Object.values(exported as Record<string, unknown>)) {
      if (isGeneratorInstance(value)) found.push(value);
    }
  }
  return found;
}

export class GeneratorLoader {
  private readonly dir: string;

  constructor(dir?: string) {
    this.dir = dir ?? path.resolve(fileURLToPath(import.meta.url), "../generators");
  }

  async load(): Promise<IGenerator[]> {
    const registry = { generators: [] as IGenerator[], add(g: IGenerator) { if (!this.generators.includes(g)) this.generators.push(g); } };

    if (!fs.existsSync(this.dir)) return registry.generators;

    const entries = fs.readdirSync(this.dir)
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .filter((f) => !f.endsWith(".d.ts"))
      .sort();

    for (const file of entries) {
      const filePath = path.join(this.dir, file);
      try {
        const mod = await import(pathToFileURL(filePath).href) as Record<string, unknown>;
        const defaultExport = mod["default"];
        const found = collectGenerators(defaultExport);

        for (const g of found) {
          if (typeof g.register === "function") {
            g.register(registry);
          } else {
            registry.add(g);
          }
        }

        // Also instantiate exported classes with static id (if not already in registry)
        for (const [key, value] of Object.entries(mod)) {
          if (key === "default") continue;
          if (isGeneratorClass(value) && typeof (value as { id?: string }).id === "string") {
            try {
              const instance = new value();
              if (!registry.generators.some((existing) => existing === instance || existing.constructor === value)) {
                if (typeof instance.register === "function") {
                  instance.register(registry);
                } else {
                  registry.add(instance);
                }
              }
            } catch { /* skip */ }
          }
        }
      } catch { /* skip unloadable files */ }
    }

    return registry.generators;
  }
}
