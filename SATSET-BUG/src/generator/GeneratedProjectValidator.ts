import fs from "node:fs";
import path from "node:path";

export type ValidationStatus = "PASS" | "WARNING" | "FAILED";

export interface ValidationCheck {
  name: string;
  status: ValidationStatus;
  message: string;
  details?: string[];
}

export interface GeneratedProjectValidationResult {
  status: ValidationStatus;
  checks: ValidationCheck[];
  outputDir: string;
}

function chk(name: string, status: ValidationStatus, message: string, details?: string[]): ValidationCheck {
  return { name, status, message, details };
}

function exists(base: string, ...parts: string[]): boolean {
  return fs.existsSync(path.join(base, ...parts));
}

function readText(filePath: string): string {
  try { return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : ""; }
  catch { return ""; }
}

function listFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  try {
    const result: string[] = [];
    const walk = (d: string): void => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else result.push(full);
      }
    };
    walk(dir);
    return result;
  } catch { return []; }
}

export class GeneratedProjectValidator {
  validate(outputDir: string): GeneratedProjectValidationResult {
    const checks: ValidationCheck[] = [];

    // Folder structure
    const reqDirs = ["src", path.join("src", "routes"), path.join("src", "components"), "prisma"];
    const missDirs = reqDirs.filter((d) => !fs.existsSync(path.join(outputDir, d)));
    checks.push(chk("Folder Structure", missDirs.length === 0 ? "PASS" : "WARNING", missDirs.length === 0 ? "All required directories present" : `Missing: ${missDirs.join(", ")}`, missDirs));

    // Critical files
    const critFiles = ["package.json", "README.md", path.join("prisma", "schema.prisma"), path.join("src", "app.ts"), path.join("src", "App.tsx")];
    const missFiles = critFiles.filter((f) => !exists(outputDir, f));
    checks.push(chk("Critical Files", missFiles.length === 0 ? "PASS" : "FAILED", missFiles.length === 0 ? "All critical files present" : `Missing: ${missFiles.join(", ")}`, missFiles));

    // Prisma schema
    const schema = readText(path.join(outputDir, "prisma", "schema.prisma"));
    const modelCount = (schema.match(/^model\s+\w+/gm) ?? []).length;
    const prismaOk = schema && schema.includes("generator client") && schema.includes("datasource db");
    checks.push(chk("Prisma Schema", !schema ? "FAILED" : prismaOk && modelCount > 0 ? "PASS" : "WARNING", schema ? `${modelCount} model(s), generator=${schema.includes("generator client")}, datasource=${schema.includes("datasource db")}` : "schema.prisma missing"));

    // REST endpoints
    const routeFiles = listFiles(path.join(outputDir, "src", "routes")).filter((f) => f.endsWith(".ts"));
    checks.push(chk("REST Endpoints", routeFiles.length > 0 ? "PASS" : "WARNING", `${routeFiles.length} route file(s)`));

    // Authentication
    const hasJwt = exists(outputDir, "src", "lib", "jwt.ts");
    const hasAuth = exists(outputDir, "src", "routes", "auth.ts");
    checks.push(chk("Authentication", hasJwt && hasAuth ? "PASS" : "WARNING", `jwt.ts=${hasJwt}, auth.ts=${hasAuth}`));

    // DTO consistency
    const dtoCount = listFiles(path.join(outputDir, "src", "dto")).filter((f) => f.endsWith(".ts")).length;
    const ctrlCount = listFiles(path.join(outputDir, "src", "controllers")).filter((f) => f.endsWith(".ts")).length;
    checks.push(chk("DTO Consistency", ctrlCount === 0 ? "WARNING" : dtoCount >= ctrlCount ? "PASS" : "WARNING", `${dtoCount} DTOs / ${ctrlCount} controllers`));

    // React routing
    const appTsx = readText(path.join(outputDir, "src", "App.tsx"));
    checks.push(chk("React Routing", appTsx.includes("Routes") ? "PASS" : appTsx ? "WARNING" : "WARNING", appTsx.includes("Routes") ? "BrowserRouter + Routes configured" : "App.tsx missing router"));

    // Circular dependencies (self-import check)
    const tsFiles = listFiles(path.join(outputDir, "src")).filter((f) => /\.[tj]sx?$/.test(f));
    const selfImports = tsFiles.slice(0, 50).filter((f) => {
      const base = path.basename(f).replace(/\.[tj]sx?$/, "");
      return new RegExp(`from ["'].*/${base}["']`).test(readText(f));
    }).map((f) => path.relative(outputDir, f));
    checks.push(chk("Circular Dependencies", selfImports.length === 0 ? "PASS" : "WARNING", selfImports.length === 0 ? "No self-imports detected" : `${selfImports.length} potential issue(s)`, selfImports));

    // Documentation
    const docFiles = ["README.md", "API.md", "INSTALL.md", "DATABASE.md", "DEPLOYMENT.md"];
    const missDocs = docFiles.filter((f) => !exists(outputDir, f));
    checks.push(chk("Documentation", missDocs.length === 0 ? "PASS" : missDocs.length <= 2 ? "WARNING" : "FAILED", missDocs.length === 0 ? "All docs present" : `Missing: ${missDocs.join(", ")}`, missDocs));

    // Naming conventions
    const badNames = tsFiles.filter((f) => {
      const b = path.basename(f);
      return /^[A-Z]/.test(b) && !/\.(test|spec)\.[tj]sx?$/.test(b) && !/(Page|Form|Table|Layout|Generator|Engine|Adapter|Controller|Service|Repository|Guard|Middleware|Provider|Store|Hook)\.tsx?$/.test(b);
    }).map((f) => path.relative(outputDir, f)).slice(0, 5);
    checks.push(chk("Naming Conventions", badNames.length === 0 ? "PASS" : "WARNING", badNames.length === 0 ? "Consistent naming" : `${badNames.length} possibly non-standard file(s)`, badNames));

    // Package scripts
    const pkg = JSON.parse(readText(path.join(outputDir, "package.json")) || "{}") as { scripts?: Record<string, string> };
    const missScripts = ["build", "typecheck", "db:migrate", "db:seed"].filter((s) => !(pkg.scripts ?? {})[s]);
    checks.push(chk("Package Scripts", missScripts.length === 0 ? "PASS" : "WARNING", missScripts.length === 0 ? "All scripts present" : `Missing: ${missScripts.join(", ")}`, missScripts));

    const failCount = checks.filter((c) => c.status === "FAILED").length;
    const warnCount = checks.filter((c) => c.status === "WARNING").length;
    const status: ValidationStatus = failCount > 0 ? "FAILED" : warnCount > 0 ? "WARNING" : "PASS";

    return { status, checks, outputDir };
  }

  writeReport(result: GeneratedProjectValidationResult): string {
    const icon = { PASS: "✅", WARNING: "⚠️", FAILED: "❌" } as const;
    const date = new Date().toISOString().slice(0, 19).replace("T", " ");
    const lines: string[] = [
      "# Production Validation Report", "",
      `**Date:** ${date}`,
      `**Status:** ${icon[result.status]} ${result.status}`,
      "", "## Checks", "",
      "| Check | Status | Message |",
      "|-------|--------|---------|",
      ...result.checks.map((c) => `| ${c.name} | ${icon[c.status]} ${c.status} | ${c.message} |`),
      "", "## Summary", "",
      `- ✅ PASS: ${result.checks.filter((c) => c.status === "PASS").length}`,
      `- ⚠️ WARNING: ${result.checks.filter((c) => c.status === "WARNING").length}`,
      `- ❌ FAILED: ${result.checks.filter((c) => c.status === "FAILED").length}`,
      "", `## Verdict: ${icon[result.status]} **${result.status}**`,
    ];
    const reportPath = path.join(result.outputDir, "PRODUCTION_REPORT.md");
    try { fs.writeFileSync(reportPath, lines.join("\n"), "utf8"); } catch { /* ignore */ }
    return reportPath;
  }
}
