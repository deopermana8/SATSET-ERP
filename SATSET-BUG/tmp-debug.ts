import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from './src/core/Context.ts';
import { BackendGenerator } from './src/ai/engines/BackendGenerator.ts';

async function main() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'satset-debug-'));
  const context = new Context({
    projectRoot: root,
    projectName: 'commerce-suite',
    nodeVersion: process.version,
    pnpmVersion: '9.0.0',
    typescriptVersion: '5.8.3',
    prismaVersion: '5.0.0',
    nextVersion: '14.0.0',
    issues: [],
    recommendations: [],
    metadata: { root, idea: 'commerce platform', backendFramework: 'express', frontendFramework: 'next', databaseType: 'postgresql', authentication: ['jwt','rbac'], openApi: true, docker: true, kubernetes: true },
  });
  await new BackendGenerator().run(context);
  const files: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        files.push(full);
      }
    }
  }
  await walk(root);
  console.log('root', root);
  console.log(files.join('\n'));
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
