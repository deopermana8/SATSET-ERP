import path from "node:path";
import { Command } from "commander";
import { Doctor } from "../doctor/Doctor.js";
import { Context } from "../core/Context.js";
import { AIRequirementEngine } from "../ai/engines/AIRequirementEngine.js";
import { ArchitectureBuilder } from "../ai/engines/ArchitectureBuilder.js";
import { ProjectScaffolder } from "../ai/engines/ProjectScaffolder.js";
import { CertificationEngine } from "../ai/engines/CertificationEngine.js";

const program = new Command();

program.name("satset-bug");
program.version("0.1");

program
  .command("doctor [projectPath]")
  .description("Run diagnostics for project path (bootstrap only)")
  .action(async (projectPath?: string) => {
    try {
      const projectRoot = projectPath ? path.resolve(projectPath) : process.cwd();

      console.log("==================================");
      console.log("SATSET BUG");
      console.log("Version 0.1");
      console.log("==================================\\n");

      console.log("Project:\\n");
      console.log(projectRoot + "\\n");

      console.log("Scanning...");

      const params = {
        projectRoot,
        projectName: path.basename(projectRoot),
        nodeVersion: process.version,
        pnpmVersion: "unknown",
        typescriptVersion: "unknown",
        prismaVersion: "unknown",
        nextVersion: "unknown",
        issues: [],
        recommendations: [],
        metadata: { root: projectRoot },
      };

      const doctor = new Doctor(params);

      await doctor.run();

      console.log("Done.");
      process.exitCode = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
      process.exitCode = 1;
    }
  });

program
  .command("create <idea>")
  .description("Create a deterministic project scaffold from an idea")
  .action(async (idea: string) => {
    try {
      const projectRoot = process.cwd();
      const params = {
        projectRoot,
        projectName: idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        nodeVersion: process.version,
        pnpmVersion: "unknown",
        typescriptVersion: "unknown",
        prismaVersion: "unknown",
        nextVersion: "unknown",
        issues: [],
        recommendations: [],
        metadata: { root: projectRoot, idea },
      };

      const context = new Context(params);
      await new AIRequirementEngine().run(context);
      await new ArchitectureBuilder().run(context);
      await new ProjectScaffolder().run(context);
      await new CertificationEngine().run(context);

      console.log("Project scaffold generated.");
      process.exitCode = 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(message);
      process.exitCode = 1;
    }
  });

void (async () => {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  }
})();
