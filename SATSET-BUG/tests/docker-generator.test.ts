import assert from "node:assert/strict";
import { DockerGenerator } from "../src/generator/DockerGenerator.js";

describe("docker generator", () => {
  it("returns docker files", () => {
    assert.ok(new DockerGenerator().generate().length > 0);
  });
});
