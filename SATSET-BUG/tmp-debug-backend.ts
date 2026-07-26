import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Context } from './src/core/Context.ts';
import { BackendGenerator } from './src/ai/engines/BackendGenerator.ts';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'satset-debug-'));
const context = new Context({
  projectRoot: root,
  projectName: 'debug',
  nodeVersion: process.version,
  pnpmVersion: '9.0.0',
  typescriptVersion: '5.8.3',
  prismaVersion: '5.0.0',
  nextVersion: '14.0.0',
  issues: [],
  recommendations: [],
  metadata: { root, idea: 'backend' },
});
await new BackendGenerator().run(context);
console.log('root', root);
console.log('files', await fs.readdir(path.join(root, 'src', 'api', 'health')).catch(() => []));
console.log('tree', await fs.readdir(root).catch(() => []));
