import assert from "node:assert/strict";
import { DocumentationGenerator } from "../src/generator/DocumentationGenerator.js";

describe("documentation generator", () => {
  it("returns docs files", () => {
    assert.ok(new DocumentationGenerator().generate().length > 0);
  });
});
