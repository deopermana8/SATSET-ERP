import assert from "node:assert/strict";
import { ScannerRegistry } from "../src/scanner/ScannerRegistry.js";
import { ScannerManager } from "../src/scanner/ScannerManager.js";

async function main(): Promise<void> {
  const registry = new ScannerRegistry();
  const manager = new ScannerManager();
  registry.registerDefaults(manager);

  const scanners = manager.getScanners();
  assert.ok(scanners.length === 11, `expected 11 default scanners, got ${scanners.length}`);

  const names = scanners.map((s) => s.constructor.name);
  const expected = [
    "PackageJsonScanner",
    "PrismaScanner",
    "TypeScriptScanner",
    "NextJsScanner",
    "PnpmWorkspaceScanner",
    "TurboScanner",
    "TailwindScanner",
    "ReactScanner",
    "EnvironmentScanner",
    "GitScanner",
    "DependencyGraphScanner",
  ];
  for (const name of expected) {
    assert.ok(names.includes(name), `missing scanner: ${name}`);
  }

  console.log("scanner registry test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
