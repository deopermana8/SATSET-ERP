import assert from "node:assert/strict";
import { MicroservicePlanner } from "../src/architecture/MicroservicePlanner.js";

describe("microservice planner", () => {
  it("returns services", () => {
    assert.ok(new MicroservicePlanner().plan().length > 0);
  });
});
