import "./utils/runtime.js";
import { GeneratorCore } from "./core/GeneratorCore.js";
import { SATSET_PRESET_TARGETS } from "./core/PresetCatalog.js";
import { CommandTarget, GenerateCommand, SatsetCommandName, SatsetPresetTarget } from "./sdk/contracts.js";
import { path } from "./utils/Node.js";

function parseCommand(argumentsList: string[]): GenerateCommand {
  const verb = (argumentsList[0] ?? "generate") as SatsetCommandName | SatsetPresetTarget;
  const options = parseOptions(argumentsList.slice(1));

  if (verb === "make") {
    const makeTarget = (argumentsList[1] ?? "module") as CommandTarget;
    const makeName = argumentsList[2];
    if (!makeName) {
      throw new Error("Usage: make <module|plugin|blueprint|entity|dashboard|report|mobile|scanner|workspace> <Name> [--blueprint path] [--output path] [--type module]");
    }

    return {
      arguments: argumentsList.slice(3),
      blueprintPath: parseOptions(argumentsList.slice(3)).blueprint,
      blueprintType: parseOptions(argumentsList.slice(3)).type as GenerateCommand["blueprintType"],
      name: makeName,
      outputDir: parseOptions(argumentsList.slice(3)).output,
      target: makeTarget,
      verb: "generate"
    };
  }

  if (["autofix", "doctor", "repair", "build", "deploy"].includes(verb)) {
    return {
      arguments: argumentsList.slice(1),
      name: argumentsList[1] ?? verb,
      target: "module",
      verb: verb as SatsetCommandName
    };
  }

  if (verb === "solution") {
    const solutionName = argumentsList[1];
    if (!solutionName) {
      throw new Error("Usage: solution <Name> --blueprint path");
    }

    return {
      arguments: argumentsList.slice(2),
      blueprintPath: parseOptions(argumentsList.slice(2)).blueprint,
      name: solutionName,
      target: "module",
      verb: "solution"
    };
  }

  if (SATSET_PRESET_TARGETS.includes(verb as SatsetPresetTarget)) {
    return {
      arguments: argumentsList.slice(1),
      name: verb,
      target: verb as SatsetPresetTarget,
      verb: "generate"
    };
  }

  if (["create", "architect", "compose", "workflow", "blueprint"].includes(verb)) {
    return {
      arguments: argumentsList.slice(1),
      blueprintPath: options.blueprint,
      blueprintType: options.type as GenerateCommand["blueprintType"],
      name: argumentsList[1] ?? "Factory",
      outputDir: options.output,
      target: verb === "blueprint" ? "blueprint" : "module",
      verb: verb as SatsetCommandName
    };
  }

  if (verb !== "generate") {
    throw new Error("Unsupported command.");
  }

  const target = argumentsList[1] as CommandTarget | undefined;
  const name = argumentsList[2];
  if (!target) {
    throw new Error("Usage: generate <module|plugin|blueprint|entity|dashboard|report|mobile|scanner|workspace> <Name> [--blueprint path] [--output path] [--type module]");
  }

  if (target === "workspace" && !name) {
    return {
      arguments: argumentsList.slice(2),
      blueprintPath: parseOptions(argumentsList.slice(2)).blueprint,
      blueprintType: parseOptions(argumentsList.slice(2)).type as GenerateCommand["blueprintType"],
      name: "Workspace",
      outputDir: parseOptions(argumentsList.slice(2)).output,
      target,
      verb: "generate"
    };
  }

  if (!name) {
    throw new Error("Usage: generate <module|plugin|blueprint|entity|dashboard|report|mobile|scanner|workspace> <Name> [--blueprint path] [--output path] [--type module]");
  }

  return {
    arguments: argumentsList.slice(3),
    blueprintPath: parseOptions(argumentsList.slice(3)).blueprint,
    blueprintType: parseOptions(argumentsList.slice(3)).type as GenerateCommand["blueprintType"],
    name,
    outputDir: parseOptions(argumentsList.slice(3)).output,
    target,
    verb: "generate"
  };
}

function parseOptions(argumentsList: string[]): Record<string, string> {
  const options: Record<string, string> = {};

  for (let index = 0; index < argumentsList.length; index += 1) {
    const current = argumentsList[index];
    if (!current.startsWith("--")) {
      continue;
    }

    const optionName = current.slice(2);
    const optionValue = argumentsList[index + 1];
    if (!optionValue || optionValue.startsWith("--")) {
      throw new Error(`Option requires a value: ${current}`);
    }

    options[optionName] = optionValue;
    index += 1;
  }

  return options;
}

async function main(): Promise<void> {
  const command = parseCommand(process.argv.slice(2));
  const runtimeRoot = path.dirname(process.argv[1] ?? "");
  const generatorRoot = path.resolve(runtimeRoot, "..");
  const projectRoot = path.resolve(generatorRoot, "..", "..");
  const generator = new GeneratorCore(projectRoot, generatorRoot);
  const result = await generator.run(command);
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
  console.error(message);
  process.exitCode = 1;
});
