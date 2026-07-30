import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TEMPLATES: Record<string, string[]> = {
  next: ["app/layout.tsx", "app/page.tsx", "next.config.ts", "package.json"],
  react: ["App.tsx", "main.tsx", "vite.config.ts", "package.json", "tsconfig.json"],
  prisma: ["schema.prisma", "seed.ts"],
};

function copyDir(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

async function main(): Promise<void> {
  const templatesRoot = path.resolve(process.cwd(), "templates");

  for (const [name, requiredFiles] of Object.entries(TEMPLATES)) {
    const templateDir = path.join(templatesRoot, name);
    assert.ok(fs.existsSync(templateDir), `template directory must exist: ${name}`);

    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), `satset-${name}-`));
    try {
      copyDir(templateDir, outputDir);

      for (const file of requiredFiles) {
        assert.ok(
          fs.existsSync(path.join(outputDir, file)),
          `${file} must exist in generated ${name} project`
        );
      }

      const pkgPath = path.join(outputDir, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as Record<string, unknown>;
        assert.ok(typeof pkg["name"] === "string", `${name}/package.json must have name`);
        assert.ok(typeof pkg["version"] === "string", `${name}/package.json must have version`);
      }
    } finally {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  }

  console.log("PASS");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
