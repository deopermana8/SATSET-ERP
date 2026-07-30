import fs from "node:fs";
import path from "node:path";

export interface ProductionStructureResult {
  written: string[];
  errors: string[];
}

export interface ProductionStructureInput {
  projectName: string;
  outputDir: string;
  nodeVersion?: string;
  port?: number;
}

export class ProductionStructureGenerator {
  generate(input: ProductionStructureInput): ProductionStructureResult {
    const written: string[] = [];
    const errors: string[] = [];
    const { projectName, outputDir } = input;
    const nodeVersion = input.nodeVersion ?? "20";
    const port = input.port ?? 3000;

    const files: Record<string, string> = {
      ".env.example": this.envExample(projectName, port),
      "docker-compose.yml": this.dockerCompose(projectName, port),
      "Dockerfile": this.dockerfile(nodeVersion, port),
      "nginx.conf": this.nginx(port),
      ".github/workflows/build.yml": this.githubWorkflow(projectName, nodeVersion),
      ".prettierrc": this.prettier(),
      ".eslintrc.cjs": this.eslint(),
      ".editorconfig": this.editorconfig(),
      ".gitignore": this.gitignore(),
      "LICENSE": this.license(),
      "SECURITY.md": this.security(projectName),
      "CONTRIBUTING.md": this.contributing(projectName),
      "CODE_OF_CONDUCT.md": this.codeOfConduct(),
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

  private envExample(name: string, port: number): string {
    return `# Application
NODE_ENV=development
PORT=${port}

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/${name.toLowerCase().replace(/\s+/g, "_")}

# Authentication
JWT_SECRET=change-me-in-production-min-32-chars
JWT_REFRESH_SECRET=change-me-in-production-min-32-chars

# Optional
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
`;
  }

  private dockerCompose(name: string, port: number): string {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    return `version: "3.9"

services:
  app:
    build: .
    container_name: ${slug}
    ports:
      - "${port}:${port}"
    env_file:
      - .env
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    container_name: ${slug}-db
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: \${POSTGRES_DB:-${slug.replace(/-/g, "_")}}
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  db_data:
`;
  }

  private dockerfile(nodeVersion: string, port: number): string {
    return `# Dependencies
FROM node:${nodeVersion}-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Builder
FROM node:${nodeVersion}-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# Runner
FROM node:${nodeVersion}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE ${port}
CMD ["node", "dist/index.js"]
`;
  }

  private nginx(port: number): string {
    return `upstream app {
    server app:${port};
}

server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        access_log off;
        return 200 "OK\\n";
        add_header Content-Type text/plain;
    }
}
`;
  }

  private githubWorkflow(name: string, nodeVersion: string): string {
    return `name: Build & Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    name: ${name}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '${nodeVersion}'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Test
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
`;
  }

  private prettier(): string {
    return JSON.stringify({
      semi: true,
      singleQuote: false,
      trailingComma: "all",
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      endOfLine: "lf",
    }, null, 2);
  }

  private eslint(): string {
    return `/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "no-console": "off",
  },
  env: { node: true, es2022: true },
};
`;
  }

  private editorconfig(): string {
    return `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false

[Makefile]
indent_style = tab
`;
  }

  private gitignore(): string {
    return `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
.nyc_output/
*.tsbuildinfo
prisma/migrations/
generated/
*.zip
*.tar.gz
`;
  }

  private license(): string {
    const year = new Date().getFullYear();
    return `MIT License

Copyright (c) ${year} SATSET

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
`;
  }

  private security(name: string): string {
    return `# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability in ${name}, please do NOT open a public issue.

Send a private report to: security@example.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

We will acknowledge receipt within 48 hours and provide a fix within 30 days.
`;
  }

  private contributing(name: string): string {
    return `# Contributing to ${name}

Thank you for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone your fork: \`git clone <your-fork-url>\`
3. Install dependencies: \`npm install\`
4. Create a feature branch: \`git checkout -b feature/your-feature\`

## Development

\`\`\`bash
npm run dev        # Start development server
npm run typecheck  # Type check
npm run build      # Build
npm test           # Run tests
\`\`\`

## Pull Request Process

1. Ensure typecheck passes
2. Add tests for new features
3. Update documentation as needed
4. Submit a PR with a clear description

## Code Style

- Use TypeScript strict mode
- Follow existing code conventions
- Run \`npm run lint\` before committing
`;
  }

  private codeOfConduct(): string {
    return `# Code of Conduct

## Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone.

## Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Respecting differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Harassment in any form
- Trolling or insulting comments
- Publishing private information without permission

## Enforcement

Violations may be reported to the project maintainers.
Maintainers will review and investigate complaints and respond appropriately.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org).
`;
  }
}
