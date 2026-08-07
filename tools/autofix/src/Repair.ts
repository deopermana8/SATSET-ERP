import { BuildPipelineResult, ProjectInfo } from "./types.js";
import { BuildRunner } from "./BuildRunner.js";
import { Doctor, DoctorResult } from "./Doctor.js";
import { RuleRegistry } from "./RuleRegistry.js";

interface PathModule {
  dirname(filePath: string): string;
  join(...paths: string[]): string;
}

const path = require("node:path") as PathModule;

export interface RepairResult {
  attempts: number;
  build: BuildPipelineResult;
  doctor: DoctorResult;
  ok: boolean;
}

export interface IRepair {
  run(project: ProjectInfo): Promise<RepairResult>;
}

export class Repair implements IRepair {
  private readonly buildRunner = new BuildRunner();
  private readonly doctor = new Doctor();
  private readonly ruleRegistry = new RuleRegistry();

  async run(project: ProjectInfo): Promise<RepairResult> {
    const runtimeRoot = path.dirname(process.argv[1] ?? "");
    const rules = await this.ruleRegistry.discover(path.join(runtimeRoot, "rules"));
    const doctor = this.doctor.run(project, this.ruleRegistry.report(rules));
    let attempts = 0;
    let build = await this.buildRunner.runPipeline(project.rootDir, project.buildLogPath);

    while (!build.success && attempts < 3) {
      attempts += 1;
      build = await this.buildRunner.runPipeline(project.rootDir, project.buildLogPath);
    }

    return {
      attempts,
      build,
      doctor,
      ok: doctor.ok && build.success
    };
  }
}
