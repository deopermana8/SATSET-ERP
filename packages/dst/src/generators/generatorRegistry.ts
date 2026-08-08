import type { DstSpecification } from "../types/index.js";

import type { GeneratedFile } from "./generatedFile.js";
import type { GeneratorResult } from "./generatorResult.js";
import type { Generator } from "./generator.js";

export class GeneratorRegistry {
  private readonly generators = new Map<string, Generator>();

  register(generator: Generator): void {
    const name = generator.name?.trim();
    if (!name) {
      throw new Error("Generator name is required");
    }

    this.generators.set(name, generator);
  }

  generate(spec: DstSpecification): GeneratedFile[] {
    const result: GeneratorResult = { files: [] };

    for (const generator of this.generators.values()) {
      const files = generator.generate(spec);
      if (!Array.isArray(files)) {
        throw new Error(`Generator \"${generator.name}\" must return GeneratedFile[]`);
      }
      result.files.push(...files);
    }

    return result.files;
  }
}
