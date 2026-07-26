import assert from "node:assert/strict";
import { ApiGenerator } from "../src/generator/ApiGenerator.js";

describe("api generator", () => {
  it("returns api files", () => {
    assert.ok(new ApiGenerator().generate().length > 0);
  });
});
