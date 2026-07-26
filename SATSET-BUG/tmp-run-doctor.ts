import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { Doctor } from './src/doctor/Doctor.ts';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'satset-doctor-run-'));
console.log('projectRoot', root);
const doctor = new Doctor({
  projectRoot: root,
  projectName: 'pos-wisata-lontar-sewu',
  nodeVersion: process.version,
  pnpmVersion: '9.0.0',
  typescriptVersion: '5.8.3',
  prismaVersion: '5.0.0',
  nextVersion: '14.0.0',
  issues: [],
  recommendations: [],
  metadata: { root, idea: 'POS Wisata Lontar Sewu', backendFramework: 'express', frontendFramework: 'next', databaseType: 'postgresql', authentication: ['jwt', 'rbac'], openApi: true, docker: true, kubernetes: true },
});

try {
  const context = await doctor.run();
  console.log('issues', context.getIssues().length);
  console.log('repairLog', (context.repairLog ?? []).length);
  console.log('historyEvents', (context.metadata as any)?.historyEvents?.length ?? 0);
  const entries = await fs.readdir(root, { withFileTypes: true });
  console.log('root entries', entries.map(e => e.name));
} catch (error) {
  console.error('doctor failed', error);
}
