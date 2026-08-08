import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { generate } from "../generators/index.js";
import { parseCustomerSpecYaml } from "../parser/index.js";
import { writeFiles } from "../writer/index.js";

function hasOutput(files: Array<{ path: string }>, marker: string): boolean {
  return files.some((file) => file.path.includes(marker));
}

function printSummary(files: Array<{ path: string }>): void {
  console.log(`Generated ${files.length} files`);
  console.log("");
  console.log(`${hasOutput(files, "prisma/generated") ? "✓" : "-"} Prisma`);
  console.log(`${hasOutput(files, "/routes/") ? "✓" : "-"} Route`);
  console.log(`${hasOutput(files, "/repositories/") ? "✓" : "-"} Repository`);
  console.log(`${hasOutput(files, "/services/") ? "✓" : "-"} Service`);
  console.log(`${hasOutput(files, "/controllers/") ? "✓" : "-"} Controller`);
  console.log(`${hasOutput(files, "/dto/") ? "✓" : "-"} DTO`);
  console.log(`${hasOutput(files, "/validators/") ? "✓" : "-"} Validator`);
  console.log("");
  console.log("Generated file paths:");
  for (const file of files) {
    console.log(`- ${file.path}`);
  }
}

export async function executeSpecCommand(specPathArg: string): Promise<void> {
  const specPath = resolve(process.cwd(), specPathArg);
  const yamlSource = await readFile(specPath, "utf8");

  const spec = parseCustomerSpecYaml(yamlSource);
  const files = generate(spec);

  await writeFiles(files);
  printSummary(files);
}
