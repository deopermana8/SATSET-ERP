import { CommandTarget, GenerateCommand, GeneratorPlugin, NormalizedBlueprint, PipelineDefinition } from "../sdk/contracts.js";
import { CommandCatalog } from "./CommandCatalog.js";

export interface ValidationFinding {
  level: "error" | "warning";
  message: string;
  subject: string;
}

export interface ValidationResult {
  findings: ValidationFinding[];
  ok: boolean;
}

export interface IValidationEngine {
  validate(input: {
    blueprint: NormalizedBlueprint;
    command: GenerateCommand;
    pipeline: PipelineDefinition;
    plugins: readonly GeneratorPlugin[];
  }): ValidationResult;
}

export class ValidationEngine implements IValidationEngine {
  private readonly commandCatalog = new CommandCatalog();

  validate(input: {
    blueprint: NormalizedBlueprint;
    command: GenerateCommand;
    pipeline: PipelineDefinition;
    plugins: readonly GeneratorPlugin[];
  }): ValidationResult {
    const findings: ValidationFinding[] = [];
    const { blueprint, command, pipeline, plugins } = input;

    if (!blueprint.module) {
      findings.push({ level: "error", message: "Blueprint module is required.", subject: "blueprint.module" });
    }
    if (blueprint.entities.length === 0) {
      findings.push({ level: "error", message: "Blueprint entities are required.", subject: "blueprint.entities" });
    }
    if (blueprint.workflow.length === 0) {
      findings.push({ level: "warning", message: "Blueprint workflow is empty.", subject: "blueprint.workflow" });
    }
    if (blueprint.api.length === 0) {
      findings.push({ level: "warning", message: "Blueprint API is empty.", subject: "blueprint.api" });
    }
    if (!this.commandCatalog.generatorCommands().includes(command.verb)) {
      findings.push({ level: "error", message: "CLI command is not registered.", subject: command.verb });
    }
    if (command.verb === "generate" && !this.commandCatalog.generatorTargets().includes(command.target as CommandTarget)) {
      findings.push({ level: "error", message: "CLI target is not registered.", subject: String(command.target) });
    }
    if (pipeline.stages.length === 0) {
      findings.push({ level: "error", message: "Pipeline is empty.", subject: "pipeline" });
    }

    for (const plugin of plugins) {
      if (!plugin.manifest.name || !plugin.manifest.version || plugin.manifest.targets.length === 0) {
        findings.push({ level: "error", message: "Plugin manifest is incomplete.", subject: plugin.manifest.name || "unknown-plugin" });
      }
    }

    return {
      findings,
      ok: findings.every((finding) => finding.level !== "error")
    };
  }
}
