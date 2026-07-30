import assert from "node:assert/strict";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { TemplateEngine, renderTemplate } from "../src/template/TemplateEngine.js";

async function main(): Promise<void> {
  const engine = new TemplateEngine();

  // Variable replacement
  assert.equal(engine.render("Hello {{name}}!", { name: "World" }), "Hello World!");
  assert.equal(engine.render("{{a}} + {{b}}", { a: "1", b: "2" }), "1 + 2");

  // Nested variable
  assert.equal(engine.render("{{user.name}}", { user: { name: "Alice" } }), "Alice");

  // {{#if}}
  assert.equal(engine.render("{{#if show}}yes{{/if}}", { show: true }), "yes");
  assert.equal(engine.render("{{#if show}}yes{{/if}}", { show: false }), "");
  assert.equal(engine.render("{{#if show}}yes{{else}}no{{/if}}", { show: false }), "no");
  assert.equal(engine.render("{{#if !hide}}visible{{/if}}", { hide: false }), "visible");

  // {{#each}}
  const list = engine.render("{{#each items}}{{this}}{{/each}}", { items: ["a", "b", "c"] });
  assert.equal(list, "abc");
  const objList = engine.render("{{#each rows}}{{this.x}}{{/each}}", { rows: [{ x: "1" }, { x: "2" }] });
  assert.equal(objList, "12");

  // stripUnresolved option
  const stripped = new TemplateEngine({ stripUnresolved: true }).render("{{known}} {{unknown}}", { known: "ok" });
  assert.equal(stripped, "ok ");

  // registerTemplate + partial
  engine.registerTemplate("greeting", "Hello {{name}}!");
  assert.equal(engine.partial("greeting", { name: "Bob" }), "Hello Bob!");

  // partial — not found
  const missing = engine.partial("nonexistent");
  assert.ok(missing.includes("not found"), "missing partial must return not-found message");

  // registerDirectory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tpl-test-"));
  try {
    fs.writeFileSync(path.join(tmpDir, "hello.tpl"), "Hi {{who}}!", "utf8");
    engine.registerDirectory(tmpDir);
    assert.equal(engine.partial("hello", { who: "SATSET" }), "Hi SATSET!");
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  // layout
  engine.layout("main", "<html><body>{{content}}</body></html>");
  const page = engine.renderWithLayout("main", "<h1>Title</h1>", {});
  assert.equal(page, "<html><body><h1>Title</h1></body></html>");

  // renderTemplate convenience function
  assert.equal(renderTemplate("Value: {{v}}", { v: 42 }), "Value: 42");

  console.log("template-engine test passed");
}

void main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
