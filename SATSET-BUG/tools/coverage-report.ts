import { spawnSync } from "node:child_process";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function run(command: string, args: string[], env?: NodeJS.ProcessEnv): number {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    env: env ?? process.env,
  });

  if (result.error) {
    throw result.error;
  }

  return result.status ?? 1;
}

function getC8EntryPoint(): string {
  return path.join(rootDir, "node_modules", "c8", "bin", "c8.js");
}

interface CoverageSummary {
  total: {
    statements: { total: number; covered: number; pct: number };
    branches: { total: number; covered: number; pct: number };
    functions: { total: number; covered: number; pct: number };
    lines: { total: number; covered: number; pct: number };
  };
}

async function main(): Promise<void> {
  const coverageDir = path.join(rootDir, "coverage");
  const coverageTmpDir = path.join(rootDir, ".c8-tmp");
  const registerGlobalsImport = pathToFileURL(path.join(rootDir, "tests", "register-globals.js")).href;
  await rm(coverageDir, { recursive: true, force: true });
  await rm(coverageTmpDir, { recursive: true, force: true });
  await mkdir(coverageTmpDir, { recursive: true });
  const reportPath = path.join(rootDir, "COVERAGE_REPORT.md");

  let exitCode = 1;
  let totals: CoverageSummary["total"] | undefined;

  try {
    const coverageEnv: NodeJS.ProcessEnv = {
      ...process.env,
      NODE_OPTIONS: [process.env.NODE_OPTIONS, "--max-old-space-size=8192"].filter(Boolean).join(" "),
    };

    const testsDir = path.join(rootDir, "tests");
    const entries = await readdir(testsDir);
    const testFiles = entries
      .filter((entry) => entry.endsWith(".test.ts") && entry !== "run-all.ts")
      .sort();

    exitCode = 0;

    for (const testFile of testFiles) {
      const perTestExitCode = run(process.execPath, [
        getC8EntryPoint(),
        `--temp-directory=${coverageTmpDir}`,
        "--clean=false",
        "--exclude=tests/**",
        "--exclude=dist/**",
        "--exclude=node_modules/**",
        "node",
        "--import",
        "tsx",
        "--import",
        registerGlobalsImport,
        path.join("tests", testFile),
      ], coverageEnv);

      if (perTestExitCode !== 0) {
        exitCode = perTestExitCode;
        break;
      }
    }

    if (exitCode === 0) {
      exitCode = run(process.execPath, [
        getC8EntryPoint(),
        "report",
        `--temp-directory=${coverageTmpDir}`,
        "--reporter=text",
        "--reporter=json-summary",
        "--reporter=lcov",
        "--reporter=html",
        "--report-dir=coverage",
        "--check-coverage",
        "--branches=90",
        "--functions=95",
        "--lines=95",
        "--statements=95",
      ], coverageEnv);
    }

    const summaryPath = path.join(rootDir, "coverage", "coverage-summary.json");
    const summaryRaw = await readFile(summaryPath, "utf8");
    const summary = JSON.parse(summaryRaw) as Record<string, CoverageSummary["total"] | CoverageSummary>;
    if ("total" in summary) {
      totals = summary.total as CoverageSummary["total"];
    } else {
      const entry = summary[Object.keys(summary)[0]] as CoverageSummary;
      totals = entry?.total;
    }
  } catch {
    totals = undefined;
  }

  const lines = [
    "# Coverage Report",
    "",
    "## Summary",
    "",
  ];

  if (totals) {
    lines.push(
      `- Statements: ${totals.statements.pct.toFixed(2)}% (${totals.statements.covered}/${totals.statements.total})`,
      `- Branches: ${totals.branches.pct.toFixed(2)}% (${totals.branches.covered}/${totals.branches.total})`,
      `- Functions: ${totals.functions.pct.toFixed(2)}% (${totals.functions.covered}/${totals.functions.total})`,
      `- Lines: ${totals.lines.pct.toFixed(2)}% (${totals.lines.covered}/${totals.lines.total})`,
    );
  } else {
    lines.push("- Coverage summary unavailable; c8 generated no summary artifact.");
  }

  lines.push(
    "",
    "## Thresholds",
    "",
    "- Statements: >= 95%",
    "- Branches: >= 90%",
    "- Functions: >= 95%",
    "- Lines: >= 95%",
    "",
    "## Status",
    "",
    `- ${exitCode === 0 ? "Coverage gate passed" : "Coverage gate failed"}`,
    "",
    "Artifacts are stored in the coverage directory.",
  );

  await writeFile(reportPath, lines.join("\n"), "utf8");

  if (!totals || exitCode !== 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
