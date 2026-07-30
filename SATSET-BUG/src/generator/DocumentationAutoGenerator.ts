import fs from "node:fs";
import path from "node:path";
import type { ProjectPlan } from "../planner/ProjectPlanner.js";

export interface DocGenerateResult {
  written: string[];
  errors: string[];
}

export class DocumentationAutoGenerator {
  generate(plan: ProjectPlan, outputDir: string): DocGenerateResult {
    const written: string[] = [];
    const errors: string[] = [];

    const docs: Record<string, string> = {
      "README.md": this.readme(plan),
      "ARCHITECTURE.md": this.architecture(plan),
      "DATABASE.md": this.database(plan),
      "API.md": this.api(plan),
      "CHANGELOG.md": this.changelog(plan),
      "INSTALL.md": this.install(plan),
      "PROJECT_STRUCTURE.md": this.structure(plan),
    };

    try { fs.mkdirSync(outputDir, { recursive: true }); } catch { /* exists */ }

    for (const [filename, content] of Object.entries(docs)) {
      const target = path.join(outputDir, filename);
      try {
        fs.writeFileSync(target, content, "utf8");
        written.push(target);
      } catch (err) {
        errors.push(`${filename}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return { written, errors };
  }

  private readme(plan: ProjectPlan): string {
    return `# ${plan.projectType.toUpperCase()} Application

## Overview
${plan.modules.length} modules: ${plan.modules.join(", ")}.

## Features
${plan.modules.map((m) => `- ${m.charAt(0).toUpperCase() + m.slice(1)}`).join("\n")}

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Tech Stack
- **Frontend**: React / Next.js
- **Backend**: Node.js / Express
- **Database**: ${plan.database[0] ?? "PostgreSQL"}
- **ORM**: Prisma

## Authentication
${plan.authentication ? "JWT-based authentication included." : "No authentication required."}
`;
  }

  private architecture(plan: ProjectPlan): string {
    return `# Architecture

## Project Type
${plan.projectType}

## Modules
${plan.modules.map((m) => `- \`${m}\``).join("\n")}

## Entities
${plan.entities.map((e) => `- \`${e}\``).join("\n")}

## Layer Structure
\`\`\`
${plan.structure.frontend.join("\n")}
${plan.structure.backend.join("\n")}
${plan.structure.shared.join("\n")}
\`\`\`

## Navigation
${plan.navigation.map((n) => `- ${n}`).join("\n")}
`;
  }

  private database(plan: ProjectPlan): string {
    return `# Database

## Provider
${plan.database.join(", ")}

## Entities
${plan.entities.map((e) => `### ${e}\n- id (PK)\n- createdAt\n- updatedAt`).join("\n\n")}

## ORM
Prisma — schema located at \`prisma/schema.prisma\`.
`;
  }

  private api(plan: ProjectPlan): string {
    const endpoints = plan.modules
      .filter((m) => !["auth", "dashboard", "report"].includes(m))
      .flatMap((m) => [
        `GET    /api/${m}s`,
        `GET    /api/${m}s/:id`,
        `POST   /api/${m}s`,
        `PUT    /api/${m}s/:id`,
        `DELETE /api/${m}s/:id`,
      ]);

    return `# API Reference

## Base URL
\`/api\`

## Authentication
${plan.authentication ? "Bearer JWT token required in `Authorization` header." : "No authentication required."}

## Endpoints
\`\`\`
${endpoints.join("\n")}
${plan.authentication ? "POST   /api/auth/login\nPOST   /api/auth/logout\nPOST   /api/auth/refresh" : ""}
\`\`\`
`;
  }

  private changelog(plan: ProjectPlan): string {
    const date = new Date().toISOString().slice(0, 10);
    return `# Changelog

## [1.0.0] — ${date}

### Added
- Initial generation of ${plan.projectType} application
- Modules: ${plan.modules.join(", ")}
- Entities: ${plan.entities.join(", ")}
${plan.authentication ? "- JWT authentication" : ""}
- REST API with CRUD endpoints
- Prisma database schema
`;
  }

  private install(plan: ProjectPlan): string {
    return `# Installation Guide

## Prerequisites
- Node.js >= 18
- pnpm or npm
- ${plan.database[0] ?? "PostgreSQL"} running locally

## Steps

\`\`\`bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL

# 3. Initialize database
npx prisma db push
npx prisma generate

# 4. Start development server
npm run dev
\`\`\`

## Environment Variables
| Variable | Description | Required |
|---|---|---|
| DATABASE_URL | Database connection string | Yes |${plan.authentication ? "\n| JWT_SECRET | JWT signing secret | Yes |" : ""}
| PORT | Server port (default 3000) | No |
`;
  }

  private structure(plan: ProjectPlan): string {
    const frontendTree = plan.structure.frontend.map((d) => `  ${d}/`).join("\n");
    const backendTree = plan.structure.backend.map((d) => `  ${d}/`).join("\n");
    const sharedTree = plan.structure.shared.map((d) => `  ${d}/`).join("\n");

    return `# Project Structure

\`\`\`
├── prisma/
│   └── schema.prisma
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
${frontendTree}
${backendTree}
${sharedTree}
├── templates/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
\`\`\`

## Key Directories
${plan.structure.frontend.map((d) => `- \`${d}\` — frontend source`).join("\n")}
${plan.structure.backend.map((d) => `- \`${d}\` — backend source`).join("\n")}
${plan.structure.shared.map((d) => `- \`${d}\` — shared types/utils`).join("\n")}
`;
  }
}
