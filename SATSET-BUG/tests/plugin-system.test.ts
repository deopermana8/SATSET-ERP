import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { PluginLoader } from "../src/plugins/PluginLoader.js";
import { PluginRegistry } from "../src/plugins/PluginRegistry.js";
import { PluginSandbox } from "../src/plugins/PluginSandbox.js";
import { PluginEngine } from "../src/plugins/PluginEngine.js";

async function main(): Promise<void> {
  const dir = join(tmpdir(), `satset-plugin-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "plugin.json"), JSON.stringify({
    id: "demo-plugin",
    name: "Demo Plugin",
    version: "1.0.0",
    author: "SATSET",
    description: "test plugin",
    category: "test",
    enabled: true,
    engines: ["DemoEngine"],
    dependencies: [],
    permissions: ["filesystem.read"]
  }, null, 2));
  writeFileSync(join(dir, "index.js"), `export default {
    manifest: {
      id: 'demo-plugin',
      name: 'Demo Plugin',
      version: '1.0.0',
      author: 'SATSET',
      description: 'test plugin',
      category: 'test',
      enabled: true,
      engines: ['DemoEngine'],
      dependencies: [],
      permissions: ['filesystem.read']
    },
    register(engine) {
      engine.register({
        name: 'demo',
        version: '1.0.0',
        manifest: {
          id: 'demo-plugin',
          name: 'Demo Plugin',
          version: '1.0.0',
          author: 'SATSET',
          description: 'test plugin',
          category: 'test',
          enabled: true,
          engines: ['DemoEngine'],
          dependencies: [],
          permissions: ['filesystem.read']
        },
        register() {}
      });
    }
  };`);

  const loader = new PluginLoader(dir);
  const plugin = await loader.loadPlugin(".");
  const registry = new PluginRegistry();
  registry.register(plugin.manifest, plugin, true);

  const engine = new PluginEngine();
  await registry.load(plugin.manifest.id, engine as unknown as any);

  assert.equal(registry.get(plugin.manifest.id)?.manifest.id, "demo-plugin");

  const sandbox = new PluginSandbox(["filesystem.read", "knowledge.read"]);
  assert.equal(sandbox.canAccess("filesystem.read"), true);
  assert.equal(sandbox.canAccess("dashboard.update"), false);
  assert.throws(() => sandbox.assert("dashboard.update"), /Permission denied/);

  console.log("plugin-system test passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
