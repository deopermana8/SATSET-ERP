import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { runFullPipeline } from "../src/generator/FullPipeline.js";

async function main(): Promise<void> {
  const requirement =
    "Buat aplikasi inventori dengan login dashboard produk kategori supplier transaksi laporan";

  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), "satset-inv-system-"));

  try {
    const report = await runFullPipeline(requirement, outputDir);

    assert.equal(report.errors.length, 0, `pipeline errors: ${report.errors.join("; ")}`);
    assert.ok(report.modules.length > 0, "modules must be planned");
    assert.ok(report.entities.length > 0, "entities must be generated");

    const required = [
      "package.json",
      "tsconfig.json",
      "README.md",
      ".gitignore",
      path.join("prisma", "schema.prisma"),
      path.join("src", "App.tsx"),
      path.join("src", "Layout.tsx"),
      path.join("src", "app.ts"),
      path.join("src", "components", "Navbar.tsx"),
      path.join("src", "components", "Sidebar.tsx"),
      path.join("src", "lib", "jwt.ts"),
      path.join("src", "middleware", "requireAuth.ts"),
      path.join("src", "routes", "auth.ts"),
    ];

    for (const file of required) {
      assert.ok(
        fs.existsSync(path.join(outputDir, file)),
        `required file must exist: ${file}`
      );
    }

    // Verify prisma schema references at least one model
    const schema = fs.readFileSync(path.join(outputDir, "prisma", "schema.prisma"), "utf8");
    assert.ok(schema.includes("model "), "prisma schema must contain at least one model");

    // Verify auth route has register and login
    const authRoute = fs.readFileSync(path.join(outputDir, "src", "routes", "auth.ts"), "utf8");
    assert.ok(authRoute.includes("/register"), "auth route must have /register");
    assert.ok(authRoute.includes("/login"), "auth route must have /login");
  } finally {
    fs.rmSync(outputDir, { recursive: true, force: true });
  }

  console.log("PASS");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
