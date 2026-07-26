import assert from "node:assert/strict";
import { FrontendGenerator } from "../src/generator/FrontendGenerator.js";

describe("frontend generator", () => {
  it("returns frontend files", () => {
    assert.ok(new FrontendGenerator().generate().length > 0);
  });
});
