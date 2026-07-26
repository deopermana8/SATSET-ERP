import { Doctor } from "./src/doctor/Doctor.js";
import type { ContextParams } from "./src/core/Context.js";
import { writeFileSync } from "node:fs";

const params: ContextParams = {
  projectRoot: "G:/SATSET AI/POS WISATA",
  projectName: "POS WISATA",
  nodeVersion: process.version,
  pnpmVersion: "unknown",
  typescriptVersion: "unknown",
  prismaVersion: "unknown",
  nextVersion: "unknown",
  issues: [],
  recommendations: [],
  metadata: { root: "G:/SATSET AI/POS WISATA" },
};

const doctor = new Doctor(params);

async function main() {
  const context = await doctor.run();
  const output = {
    issues: context.getIssues().map((issue) => ({
      id: issue.id,
      title: issue.title,
      category: issue.category,
      severity: issue.severity,
      message: issue.message,
      file: issue.file,
      line: issue.line,
      suggestion: issue.suggestion,
      fixes: issue.fixes,
    })),
    metadata: context.metadata,
    diagnosis: context.diagnosis,
    rootCauses: context.rootCauses,
    repairPlans: context.repairPlans,
    verification: context.verification,
    health: context.health,
  };
  writeFileSync("scan-context.json", JSON.stringify(output, null, 2), "utf8");
  console.log("scan-context.json written");
}

void main();
