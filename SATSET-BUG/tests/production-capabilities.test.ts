import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { Context } from "../src/core/Context.js";
import { BackendGenerator } from "../src/ai/engines/BackendGenerator.js";
import { FrontendGenerator } from "../src/ai/engines/FrontendGenerator.js";
import { DatabaseGenerator } from "../src/ai/engines/DatabaseGenerator.js";
import { AuthenticationGenerator } from "../src/ai/engines/AuthenticationGenerator.js";
import { DockerGenerator } from "../src/ai/engines/DockerGenerator.js";
import { DeploymentGenerator } from "../src/ai/engines/DeploymentGenerator.js";
import { DocumentationGenerator } from "../src/ai/engines/DocumentationGenerator.js";
import { OpenApiGenerator } from "../src/ai/engines/OpenApiGenerator.js";

async function main(): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "satset-production-"));
  const context = new Context({
    projectRoot: root,
    projectName: "commerce-suite",
    nodeVersion: process.version,
    pnpmVersion: "9.0.0",
    typescriptVersion: "5.8.3",
    prismaVersion: "5.0.0",
    nextVersion: "14.0.0",
    issues: [],
    recommendations: [],
    metadata: {
      root,
      idea: "commerce platform",
      backendFramework: "express",
      frontendFramework: "next",
      databaseType: "postgresql",
      authentication: ["jwt", "rbac"],
      openApi: true,
      docker: true,
      kubernetes: true,
    },
  });

  await new BackendGenerator().run(context);
  await new FrontendGenerator().run(context);
  await new DatabaseGenerator().run(context);
  await new AuthenticationGenerator().run(context);
  await new DockerGenerator().run(context);
  await new DeploymentGenerator().run(context);
  await new DocumentationGenerator().run(context);
  await new OpenApiGenerator().run(context);

  const artifactPaths = [
    path.join(root, "src", "api", "products", "products.router.ts"),
    path.join(root, "src", "app", "(marketing)", "page.tsx"),
    path.join(root, "prisma", "schema.prisma"),
    path.join(root, "src", "auth", "jwt.ts"),
    path.join(root, "Dockerfile"),
    path.join(root, "docker-compose.yml"),
    path.join(root, "kubernetes", "deployment.yaml"),
    path.join(root, "docs", "openapi.yaml"),
  ];

  for (const artifactPath of artifactPaths) {
    const exists = await fs.access(artifactPath).then(() => true).catch(() => false);
    assert.equal(exists, true, `${artifactPath} should be created`);
  }

  console.log("production capabilities test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
