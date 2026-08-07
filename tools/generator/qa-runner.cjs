const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');

function findTypeScriptRuntime() {
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) {
    throw new Error('LOCALAPPDATA is not available.');
  }

  const roots = [path.join(localAppData, 'Programs', 'Microsoft VS Code')];
  for (const root of roots) {
    if (!fs.existsSync(root)) {
      continue;
    }

    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }

      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(current, entry.name);
        if (entry.isDirectory()) {
          stack.push(entryPath);
          continue;
        }

        if (entry.isFile() && entry.name === 'typescript.js' && entryPath.includes(`${path.sep}typescript${path.sep}lib${path.sep}`)) {
          return entryPath;
        }
      }
    }
  }

  throw new Error('Bundled TypeScript runtime not found.');
}

const ts = require(findTypeScriptRuntime());
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function patchedResolveFilename(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  }
  catch (error) {
    if (typeof request === 'string' && request.endsWith('.js')) {
      const tsRequest = request.replace(/\.js$/i, '.ts');
      try {
        return originalResolveFilename.call(this, tsRequest, parent, isMain, options);
      }
      catch {
      }
    }

    throw error;
  }
};

function compileTypeScript(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: false,
      resolveJsonModule: false
    },
    fileName: filename,
    reportDiagnostics: false
  });

  module._compile(result.outputText, filename);
}

require.extensions['.ts'] = compileTypeScript;
require.extensions['.tsx'] = compileTypeScript;
process.env.SATSET_QA_MODE = process.env.SATSET_QA_MODE ?? '1';

const entryFile = process.argv[2];
if (!entryFile) {
  throw new Error('Entry TypeScript file is required.');
}

process.argv = ['node', path.resolve(entryFile), ...process.argv.slice(3)];
require(path.resolve(entryFile));
