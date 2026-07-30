import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

async function main(): Promise<void> {
  // Locate template source
  const templateDir = path.resolve(process.cwd(), "templates", "react");
  assert.ok(fs.existsSync(templateDir), "react template directory must exist");

  // Copy template to a temp output dir
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "satset-react-"));
  const copyDir = (src: string, dest: string): void => {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
      const s = path.join(src, entry.name);
      const d = path.join(dest, entry.name);
      if (entry.isDirectory()) copyDir(s, d);
      else fs.copyFileSync(s, d);
    }
  };
  copyDir(templateDir, outputDir);

  // Verify required files exist
  const required = ["package.json", "tsconfig.json", "vite.config.ts", "App.tsx", "main.tsx"];
  for (const file of required) {
    assert.ok(fs.existsSync(path.join(outputDir, file)), `${file} must exist in generated React app`);
  }

  // Verify package.json structure
  const pkg = JSON.parse(fs.readFileSync(path.join(outputDir, "package.json"), "utf8")) as Record<string, unknown>;
  assert.ok(typeof pkg["name"] === "string", "package.json must have name");
  assert.ok(typeof pkg["version"] === "string", "package.json must have version");
  assert.ok(pkg["dependencies"] && typeof pkg["dependencies"] === "object", "package.json must have dependencies");
  assert.ok("react" in (pkg["dependencies"] as Record<string, unknown>), "react must be a dependency");
  assert.ok(pkg["scripts"] && typeof pkg["scripts"] === "object", "package.json must have scripts");
  assert.ok("build" in (pkg["scripts"] as Record<string, unknown>), "package.json must have build script");

  // Verify tsconfig.json structure
  const tsconfig = JSON.parse(fs.readFileSync(path.join(outputDir, "tsconfig.json"), "utf8")) as Record<string, unknown>;
  assert.ok(tsconfig["compilerOptions"] && typeof tsconfig["compilerOptions"] === "object", "tsconfig must have compilerOptions");
  const co = tsconfig["compilerOptions"] as Record<string, unknown>;
  assert.ok(co["strict"] === true, "tsconfig must have strict mode enabled");
  assert.ok(co["jsx"] !== undefined, "tsconfig must configure jsx");

  // Cleanup
  fs.rmSync(outputDir, { recursive: true, force: true });

  console.log("react app generation test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
