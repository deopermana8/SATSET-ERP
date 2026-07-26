import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { ArtifactGenerator } from "../src/artifacts/ArtifactGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-template-artifact-"));
  const generator = new ArtifactGenerator(root);

  const spec = {
    id: "planning-doc",
    name: "planning-doc",
    templatePath: path.join(root, "templates", "planning.md.tpl"),
    outputPath: path.join(root, "docs", "planning.md"),
    variables: {
      functionalRequirements: "- Capture core flows\n- Support user management",
      nonFunctionalRequirements: "- Deterministic builds",
      modules: "- API\n- UI",
    },
  };

  await fs.mkdir(path.dirname(spec.templatePath), { recursive: true });
  await fs.writeFile(spec.templatePath, "# Planning\n\n## Functional Requirements\n{{functionalRequirements}}\n\n## Non Functional Requirements\n{{nonFunctionalRequirements}}\n\n## Modules\n{{modules}}\n", "utf8");

  const firstResult = await generator.generate(spec);
  assert.equal(firstResult.status, "written", "first generation should write the artifact");

  const beforeStat = await fs.stat(spec.outputPath);
  const secondResult = await generator.generate(spec);
  assert.equal(secondResult.status, "skipped", "unchanged artifact should be skipped on the second run");

  const afterStat = await fs.stat(spec.outputPath);
  assert.equal(afterStat.mtimeMs, beforeStat.mtimeMs, "unchanged artifact should not be rewritten");

  await fs.writeFile(spec.outputPath, "old content", "utf8");
  const backupResult = await generator.generate({
    ...spec,
    variables: {
      ...spec.variables,
      functionalRequirements: "- Updated flows",
    },
  });
  assert.equal(backupResult.status, "written", "overwritten artifact should still be written");
  const backupPath = `${spec.outputPath}.bak`;
  assert.equal(await fs.access(backupPath).then(() => true).catch(() => false), true, "overwritten artifact should create a backup");

  console.log("template artifact generator test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
