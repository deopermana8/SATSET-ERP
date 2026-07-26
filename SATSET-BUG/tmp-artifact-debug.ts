import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { ArtifactGenerator } from './src/artifacts/ArtifactGenerator.ts';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'satset-artifact-debug-'));
const spec = {
  id: 'x',
  name: 'x',
  templatePath: path.join(root, 'templates', 'resource.controller.ts.tpl'),
  outputPath: path.join(root, 'src', 'api', 'health', 'health.controller.ts'),
  variables: {
    ControllerName: 'HealthController',
    ServiceName: 'HealthService',
    resourceName: 'health',
    resourceLabel: 'Health',
    useCasesList: '[]',
    routesList: '[]',
  },
};

const generator = new ArtifactGenerator(root);
try {
  const result = await generator.generate(spec);
  console.log('result', result);
} catch (error) {
  console.error('artifact generator error', error);
}

console.log('exists', await fs.access(path.join(root, 'src', 'api', 'health', 'health.controller.ts')).then(()=>true).catch(()=>false));
