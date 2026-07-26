import assert from "node:assert/strict";
import { DDDPlanner } from "../src/architecture/DDDPlanner.js";

describe("ddd planner", () => {
  it("returns layers", () => {
    assert.ok(new DDDPlanner().plan().length > 0);
  });
});
