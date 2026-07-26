import assert from "node:assert/strict";
import { CIGenerator } from "../src/generator/CIGenerator.js";

describe("ci generator", () => {
  it("returns workflow files", () => {
    assert.ok(new CIGenerator().generate().length > 0);
  });
});
