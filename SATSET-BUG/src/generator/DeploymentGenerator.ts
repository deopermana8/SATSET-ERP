import fs from "node:fs";
import path from "node:path";

export interface DeploymentGenerateResult {
  written: string[];
  errors: string[];
}

export interface DeploymentInput {
  projectName: string;
  outputDir: string;
  port?: number;
  nodeVersion?: string;
}

export class DeploymentGenerator {
  generate(input: DeploymentInput): DeploymentGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];
    const { projectName, outputDir } = input;
    const port = input.port ?? 3000;
    const nodeVersion = input.nodeVersion ?? "20";
    const slug = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);

    const files: Record<string, string> = {
      "railway.toml": this.railway(slug, port),
      "render.yaml": this.render(slug, port),
      "vercel.json": this.vercel(port),
      "fly.toml": this.fly(slug, port, nodeVersion),
      "coolify.json": this.coolify(slug, port),
      "DEPLOYMENT.md": this.deploymentMd(projectName, slug, port, nodeVersion),
    };

    for (const [filePath, content] of Object.entries(files)) {
      const target = path.join(outputDir, filePath);
      try {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content, "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`${filePath}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }

  private railway(slug: string, port: number): string {
    return `[build]
builder = "NIXPACKS"

[deploy]
startCommand = "node dist/index.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[[services]]
name = "${slug}"
internalPort = ${port}

[services.env]
PORT = "${port}"
NODE_ENV = "production"
`;
  }

  private render(slug: string, port: number): string {
    return `services:
  - type: web
    name: ${slug}
    env: node
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "${port}"
      - key: DATABASE_URL
        fromDatabase:
          name: ${slug}-db
          property: connectionString

databases:
  - name: ${slug}-db
    databaseName: ${slug.replace(/-/g, "_")}
    user: postgres
`;
  }

  private vercel(port: number): string {
    return JSON.stringify({
      version: 2,
      builds: [{ src: "dist/index.js", use: "@vercel/node" }],
      routes: [{ src: "/(.*)", dest: "dist/index.js" }],
      env: { NODE_ENV: "production", PORT: String(port) },
      functions: { "dist/index.js": { maxDuration: 30 } },
    }, null, 2);
  }

  private fly(slug: string, port: number, nodeVersion: string): string {
    return `app = "${slug}"
primary_region = "sin"

[build]
  image = "node:${nodeVersion}-alpine"

[http_service]
  internal_port = ${port}
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256

[env]
  NODE_ENV = "production"
  PORT = "${port}"
`;
  }

  private coolify(slug: string, port: number): string {
    return JSON.stringify({
      name: slug,
      type: "application",
      build: { command: "npm install && npm run build", dockerfile: "Dockerfile" },
      start: { command: "node dist/index.js" },
      port,
      healthCheck: { path: "/health", interval: 30, timeout: 5 },
      env: { NODE_ENV: "production", PORT: String(port) },
    }, null, 2);
  }

  private deploymentMd(name: string, slug: string, port: number, nodeVersion: string): string {
    return `# Deployment Guide — ${name}

## Prerequisites
- Node.js >= ${nodeVersion}
- PostgreSQL database
- Environment variables configured (see \`.env.example\`)

---

## Docker

\`\`\`bash
# Build
docker build -t ${slug} .

# Run
docker run -p ${port}:${port} --env-file .env ${slug}

# Docker Compose (includes DB)
docker compose up -d
\`\`\`

---

## Railway

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add PostgreSQL plugin
4. Set environment variables from \`.env.example\`
5. Deploy — Railway uses \`railway.toml\` automatically

---

## Render

1. Push to GitHub
2. Create New Web Service on [Render](https://render.com)
3. Select repo — \`render.yaml\` is detected automatically
4. Add environment variables
5. Deploy

---

## Vercel

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

Configure environment variables in Vercel dashboard.
\`vercel.json\` is pre-configured.

---

## Fly.io

\`\`\`bash
fly auth login
fly launch --name ${slug} --no-deploy
fly secrets set DATABASE_URL="..." JWT_SECRET="..."
fly deploy
\`\`\`

---

## Coolify

1. Add application in Coolify dashboard
2. Point to this repository
3. Coolify reads \`coolify.json\` for configuration
4. Set environment variables
5. Deploy

---

## Health Check

All platforms check \`GET /health\` — ensure your app exposes this endpoint.

## Environment Variables

See \`.env.example\` for the full list of required variables.
`;
  }
}
