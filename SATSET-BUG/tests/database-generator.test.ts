import assert from "node:assert/strict";
import { DatabaseGenerator } from "../src/generator/DatabaseGenerator.js";

describe("database generator", () => {
  it("returns schema files", () => {
    assert.ok(new DatabaseGenerator().generate().length > 0);
  });
});
