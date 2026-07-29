import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function run(command: string, args: string[]): void {
  execFileSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: process.env,
  });
}

async function main(): Promise<void> {
  const version = process.env.npm_package_version ?? "0.0.0";
  await mkdir(path.join(rootDir, "release"), { recursive: true });

  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "typecheck"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "test"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "test:regression"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "coverage"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "benchmark"]);

  const changelog = [
    "# Changelog",
    "",
    `- Production hardening release ${version}`,
    "- Added CI workflow for install, build, typecheck, tests, regression, coverage, and artifacts",
    "- Added benchmark and memory-leak reporting",
  ].join("\n");

  await writeFile(path.join(rootDir, "CHANGELOG.md"), changelog, "utf8");

  const summary = [
    "# Release Summary",
    "",
    `- Version: ${version}`,
    "- Build: completed",
    "- Typecheck: completed",
    "- Tests: completed",
    "- Regression: completed",
    "- Coverage: completed",
    "- Benchmark: completed",
    "- Changelog: updated",
  ].join("\n");

  await writeFile(path.join(rootDir, "RELEASE_SUMMARY.md"), summary, "utf8");
  run(process.platform === "win32" ? "git.cmd" : "git", ["tag", `v${version}`]);
  console.log(`Release prepared for v${version}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
