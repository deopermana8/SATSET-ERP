import { validateSpec } from "../parser/index.js";
import type { DstSpecification } from "../types/index.js";

import { loadBuiltinGenerators } from "./discovery/index.js";
import type { GeneratedFile } from "./generatedFile.js";
import { GeneratorRegistry } from "./generatorRegistry.js";
import { setLatestGeneratedFileProducers } from "../manifest/index.js";

export interface Generator {
  id: string;
  name: string;
  dependencies: string[];
  generate(spec: DstSpecification): GeneratedFile[];
}

function collectSeedGeneratorIds(spec: DstSpecification, generators: Generator[]): Set<string> {
  const config = spec.generators;
  if (!config) {
    return new Set(generators.map((generator) => generator.id));
  }

  const seeds = new Set<string>();
  for (const generator of generators) {
    const key = generator.name as keyof NonNullable<DstSpecification["generators"]>;
    if (config[key] === true) {
      seeds.add(generator.id);
    }
  }
  return seeds;
}

function resolveActiveGeneratorIds(seedIds: Set<string>, generatorsById: Map<string, Generator>): Set<string> {
  const activeIds = new Set<string>();

  function activate(generatorId: string): void {
    if (activeIds.has(generatorId)) {
      return;
    }

    const generator = generatorsById.get(generatorId);
    if (!generator) {
      throw new Error(`Unknown generator dependency: "${generatorId}"`);
    }

    activeIds.add(generatorId);
    for (const dependencyId of generator.dependencies) {
      activate(dependencyId);
    }
  }

  for (const seedId of seedIds) {
    activate(seedId);
  }

  return activeIds;
}

function sortGeneratorsByDependencies(activeIds: Set<string>, generatorsById: Map<string, Generator>): Generator[] {
  const ordered: Generator[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(generatorId: string): void {
    if (visited.has(generatorId)) {
      return;
    }

    if (visiting.has(generatorId)) {
      throw new Error(`Cyclic generator dependency detected at "${generatorId}"`);
    }

    const generator = generatorsById.get(generatorId);
    if (!generator) {
      throw new Error(`Unknown generator dependency: "${generatorId}"`);
    }

    visiting.add(generatorId);
    for (const dependencyId of generator.dependencies) {
      if (activeIds.has(dependencyId)) {
        visit(dependencyId);
      }
    }
    visiting.delete(generatorId);
    visited.add(generatorId);
    ordered.push(generator);
  }

  for (const generatorId of activeIds) {
    visit(generatorId);
  }

  return ordered;
}

function validateUniquePaths(producersByPath: Map<string, string[]>): void {
  for (const [path, producers] of producersByPath.entries()) {
    const uniqueProducers = [...new Set(producers)];
    if (uniqueProducers.length > 1) {
      const [first, second] = uniqueProducers;
      throw new Error(
        `Duplicate generated file path:\n\n${path}\n\nProduced by:\n- ${first}\n- ${second}`
      );
    }
  }
}

export function generate(spec: DstSpecification): GeneratedFile[] {
  const validation = validateSpec(spec);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new Error(`Registry generation aborted: invalid specification. ${details}`);
  }

  const registry = new GeneratorRegistry();
  const discoveredGenerators = loadBuiltinGenerators();
  const generatorsById = new Map<string, Generator>();

  for (const generator of discoveredGenerators) {
    generatorsById.set(generator.id, generator);
  }

  const seedIds = collectSeedGeneratorIds(spec, discoveredGenerators);
  const activeIds = resolveActiveGeneratorIds(seedIds, generatorsById);
  const orderedGenerators = sortGeneratorsByDependencies(activeIds, generatorsById);
  const producersByPath = new Map<string, string[]>();

  for (const generator of orderedGenerators) {
    registry.register({
      ...generator,
      generate: (currentSpec) => {
        const files = generator.generate(currentSpec);
        for (const file of files) {
          const existing = producersByPath.get(file.path) ?? [];
          existing.push(generator.name);
          producersByPath.set(file.path, existing);
        }
        return files;
      }
    });
  }

  const files = registry.generate(spec);
  validateUniquePaths(producersByPath);
  setLatestGeneratedFileProducers(producersByPath);
  return files;
}
